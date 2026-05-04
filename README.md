# Microsoft TTS Worker

这是一个部署在 Cloudflare Workers 上的语音处理 Worker。当前维护目标是提供稳定的 TTS API，并额外支持 TTS 合成时的句子级时间轴，方便播放器做文本高亮。词级时间轴仍然保留为可选能力，但默认和推荐用句子级。

当前能力：

- `POST /v1/audio/speech`: 文本转 MP3，返回 `audio/mpeg`。
- `POST /v1/audio/speech/timeline`: 文本转 MP3，同时返回 timeline；默认句子级，用于播放时高亮文本。
- `POST /v1/audio/transcriptions`: 音频转文字，转发到硅基流动 `FunAudioLLM/SenseVoiceSmall`。
- `GET /`: 内置网页界面，适合手动生成、下载和转写。

实现说明：

- TTS 普通接口使用 Microsoft Edge TTS HTTP synthesis endpoint。
- TTS timeline 接口使用 Microsoft Edge TTS WebSocket metadata，不经过 STT 二次识别。
- STT 不是微软服务，当前走硅基流动 API。
- 项目是单文件 Worker，入口是 [index.js](./index.js)，部署配置在 [wrangler.toml](./wrangler.toml)。

## 接口鉴权

TTS 相关接口需要在请求头传入 `x-api-key`。未配置 Worker 环境变量时默认 key 是 `less11111`。

生产环境建议配置其中一个变量覆盖默认值：

- `LESS_TTS_API_KEY`
- `API_KEY`

示例：

```bash
curl -X POST "https://your-worker.workers.dev/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -H "x-api-key: less11111" \
  -d '{
    "input": "你好，这是一个测试",
    "voice": "zh-CN-XiaoxiaoNeural"
  }' \
  --output speech.mp3
```

鉴权失败会返回 `401`，错误码为 `invalid_api_key`。

## TTS: 返回 MP3

`POST /v1/audio/speech`

请求 JSON：

```json
{
  "input": "你好，这是一个测试",
  "voice": "zh-CN-XiaoxiaoNeural",
  "speed": 1.0,
  "pitch": "0",
  "volume": "0",
  "style": "general"
}
```

响应：

- 成功：`Content-Type: audio/mpeg`
- 失败：JSON error

参数：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `input` | string | 必填 | 要合成的文本 |
| `voice` | string | `zh-CN-XiaoxiaoNeural` | 微软语音 short name |
| `speed` | number/string | `1.0` | 语速，代码会转换成百分比 rate |
| `pitch` | string/number | `"0"` | 音调，代码会转换成 Hz |
| `volume` | string/number | `"0"` | 音量，代码会转换成百分比 |
| `style` | string | `general` | 普通 TTS 接口支持的语音风格 |

## TTS: 返回 MP3 + 时间轴

`POST /v1/audio/speech/timeline`

这个接口用于播放时高亮文本。它直接读取 TTS 合成过程里的 `audio.metadata`，不是先生成音频再做 STT，所以文本不会被二次识别改写。

默认和推荐的粒度是 `sentence`。这不是段落级，也不是词级；它适合“当前播放到哪一句，就高亮哪一句”的场景。`word` 和 `all` 仍然支持，但不是默认用法。

请求 JSON：

```json
{
  "input": "第一句话。第二句话。",
  "voice": "zh-CN-XiaoxiaoNeural",
  "speed": 1.0,
  "pitch": "0",
  "volume": "0",
  "boundary": "sentence"
}
```

`boundary` 默认值是 `sentence`，可选值：

| 值 | 说明 |
| --- | --- |
| `sentence` | 默认值；返回句子级边界，适合整句高亮 |
| `word` | 返回词级边界，适合逐词高亮，通常不需要 |
| `all` | 同时请求句子和词边界，适合调试或特殊前端需求 |

响应 JSON：

```json
{
  "audio": "base64-encoded-mp3",
  "mimeType": "audio/mpeg",
  "format": "mp3",
  "voice": "zh-CN-XiaoxiaoNeural",
  "boundary": "sentence",
  "durationMs": 2904,
  "timeline": [
    {
      "type": "sentence",
      "text": "第一句话。",
      "startMs": 100,
      "endMs": 1438,
      "durationMs": 1338,
      "offsetTicks": 1000000,
      "durationTicks": 13380000,
      "textStart": 0,
      "textEnd": 5
    }
  ]
}
```

前端播放时可以用 `audio.currentTime * 1000` 匹配 `timeline`：

```javascript
const active = result.timeline.find((item) => {
  const currentMs = audio.currentTime * 1000;
  return currentMs >= item.startMs && currentMs < item.endMs;
});
```

限制：

- timeline 接口当前不支持 `style`。实测在 Edge TTS metadata WebSocket 中加入 `mstts:express-as` 会导致连接在 `turn.end` 前关闭。
- timeline 接口返回 JSON，所以音频以 Base64 放在 `audio` 字段里；普通下载场景继续用 `/v1/audio/speech` 更合适。
- 长文本会分块合成，跨块时间偏移基于当前固定输出格式 `audio-24khz-48kbitrate-mono-mp3` 估算。

更多实现记录见 [docs/tts-timeline-notes.md](./docs/tts-timeline-notes.md)。

## STT: 音频转文字

`POST /v1/audio/transcriptions`

请求使用 `multipart/form-data`：

```bash
curl -X POST "https://your-worker.workers.dev/v1/audio/transcriptions" \
  -F "file=@audio.mp3" \
  -F "token=your-siliconflow-token"
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `file` | File | 音频文件，支持 mp3、wav、m4a、flac、aac、ogg、webm、amr、3gp |
| `token` | string | 可选，硅基流动 API token |

限制：

- 文件大小最大 10MB。
- 当前模型固定为 `FunAudioLLM/SenseVoiceSmall`。
- 当前 UI 只使用返回值里的 `text` 字段。

## 常用语音

常用中文女声：

- `zh-CN-XiaoxiaoNeural`
- `zh-CN-XiaoyiNeural`
- `zh-CN-XiaochenNeural`
- `zh-CN-XiaohanNeural`
- `zh-CN-XiaomoNeural`
- `zh-CN-XiaoxuanNeural`
- `zh-CN-XiaoyanNeural`

常用中文男声：

- `zh-CN-YunxiNeural`
- `zh-CN-YunyangNeural`
- `zh-CN-YunjianNeural`
- `zh-CN-YunfengNeural`
- `zh-CN-YunhaoNeural`
- `zh-CN-YunzeNeural`

英文示例：

- `en-US-AriaNeural`
- `en-US-GuyNeural`

## 本地开发

启动本地 Worker：

```bash
npx wrangler dev --local --port 8787
```

验证普通 TTS：

```bash
curl -X POST "http://127.0.0.1:8787/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -H "x-api-key: less11111" \
  -d '{
    "input": "你好，这是旧接口测试。",
    "voice": "zh-CN-XiaoxiaoNeural"
  }' \
  --output speech.mp3
```

验证 timeline：

```bash
curl -X POST "http://127.0.0.1:8787/v1/audio/speech/timeline" \
  -H "Content-Type: application/json" \
  -H "x-api-key: less11111" \
  -d '{
    "input": "第一句话。第二句话。",
    "voice": "zh-CN-XiaoxiaoNeural",
    "boundary": "sentence"
  }'
```

语法检查：

```bash
Get-Content -Path index.js | node --input-type=module --check
```

部署 dry run：

```bash
npx wrangler deploy --dry-run
```

如果只部署生产环境：

```bash
npx wrangler deploy -e production
```

## Cloudflare Builds 配置

本仓库不需要构建步骤。Cloudflare Workers Builds 可以按下面配置：

| 配置项 | 值 |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` |
| Build command | 留空 |
| Deploy command | `npx wrangler deploy` |

如果 Cloudflare 要求明确环境，可以把 Deploy command 改成：

```bash
npx wrangler deploy -e production
```

## 项目结构

```text
.
├── docs/
│   └── tts-timeline-notes.md
├── index.js
├── LICENSE
├── README.md
└── wrangler.toml
```

## 许可证

MIT License
