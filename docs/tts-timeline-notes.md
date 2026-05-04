# TTS Timeline 实现记录

本文记录本仓库新增 `/v1/audio/speech/timeline` 时确认过的结论、实现路线和踩坑。

## 目标

需求是生成语音时同时拿到文本时间轴，例如“这一句从几秒到几秒”，用于播放器播放时高亮对应文字。

关键约束：

- 不用“先 TTS 生成音频，再 STT 识别音频”的方案。
- 时间轴必须来自 TTS 合成过程本身。
- 旧的 `/v1/audio/speech` 行为不能变，仍然直接返回 MP3。

## 结论

当前实现新增了独立接口：

```text
POST /v1/audio/speech/timeline
```

接口返回 JSON：

- `audio`: MP3 的 Base64。
- `mimeType`: 当前为 `audio/mpeg`。
- `timeline`: 默认是句子边界数组；也可通过 `boundary` 请求词边界。
- `textStart` / `textEnd`: 对应原始输入文本中的字符范围。
- `startMs` / `endMs`: 对应音频播放时间。

旧接口保持不变：

```text
POST /v1/audio/speech
```

它仍然返回 `audio/mpeg`，适合下载或普通播放。

## 为什么不用 STT 反推时间轴

STT 反推看起来简单，但不适合这个场景：

- 原始文本已经已知，没必要再识别一遍。
- STT 可能改写文字、标点、断句和大小写。
- 多一次模型调用会增加延迟、成本和失败点。
- 高亮依赖原文位置，STT 返回文本不一定能稳定映射回原文。

正确方向是 synthesis-time alignment，也就是在 TTS 合成过程中拿边界 metadata。

## 为什么不用普通 REST TTS

仓库原来的普通 TTS 调用是：

```text
https://{region}.tts.speech.microsoft.com/cognitiveservices/v1
```

这条链路适合直接拿音频，但当前代码只读取 `response.blob()`，响应体是音频，不携带句子/词级时间轴。

微软官方 Speech SDK 有 word boundary / sentence boundary event，但本仓库是 Cloudflare Worker 单文件部署，直接引入 SDK 会改变运行方式和依赖形态。最终选择复用 Edge TTS WebSocket metadata 通道，保持 Worker-only。

## WebSocket metadata 方案

Edge TTS WebSocket 会返回两类关键消息：

- binary `Path:audio`: MP3 音频分片。
- text `Path:audio.metadata`: 句子/词边界 metadata。

Worker 收集所有 audio 分片并拼接，同时解析 metadata 生成 timeline。

当前支持：

| boundary | 行为 |
| --- | --- |
| `sentence` | 默认值；请求句子边界，推荐播放器高亮使用 |
| `word` | 请求词边界，粒度更细，当前不是默认场景 |
| `all` | 同时请求句子和词边界 |

当前没有段落级 boundary。微软 metadata 返回的是句子或词；如果以后确实要段落级，可以在 Worker 里基于原始文本的换行范围，把多个 sentence 合并成 paragraph timeline。

时间单位：

- 微软 metadata 使用 tick。
- 代码按 `10,000,000 ticks = 1 second` 转成毫秒。

## Cloudflare Worker 里的 WebSocket 连接坑

本次验证过几种方式：

1. `fetch(wss://...)`

失败。Worker 的 Fetch API 不能直接加载 `wss://` URL。

2. `new WebSocket(wssUrl)`

能走到连接阶段，但 Edge TTS 会拒绝或提前关闭。原因是标准构造器不能传需要的握手 header，例如 `Origin`、`Cookie`、`User-Agent`。

3. `fetch(https://..., { headers: { Upgrade: "websocket", ... } })`

可用。Cloudflare Worker 会返回 `101` 和 `response.webSocket`，代码调用 `accept()` 后收发消息。

这也是当前实现使用的方式。

## style 的限制

普通 `/v1/audio/speech` 接口支持 `style`，因为它走原来的 SSML HTTP synthesis 链路。

timeline 接口当前不支持 `style`。本地实测在 WebSocket metadata 链路里加入 `mstts:express-as` 后，Edge TTS 会在 `turn.end` 前关闭连接，导致无法稳定拿到音频和 metadata。

因此 README 里明确：

- 需要 `style`: 用 `/v1/audio/speech`。
- 需要高亮时间轴: 用 `/v1/audio/speech/timeline`。

## 时间轴归一化

实测 sentence boundary 可能出现轻微 overlap，例如：

```json
[
  { "text": "第一句话。", "startMs": 100, "endMs": 1488 },
  { "text": "第二句话。", "startMs": 1438, "endMs": 2850 }
]
```

播放器高亮时重叠区间会带来歧义，所以接口返回前会做一次归一化：

- 如果同类型上一段的 `endMs` 大于下一段的 `startMs`，把上一段 `endMs` 截到下一段 `startMs`。
- `durationMs` 和 `durationTicks` 同步更新。

归一化后：

```json
[
  { "text": "第一句话。", "startMs": 100, "endMs": 1438 },
  { "text": "第二句话。", "startMs": 1438, "endMs": 2850 }
]
```

## 长文本分块

WebSocket 单次请求不能无限长。当前实现会按转义后的 UTF-8 字节数切块。

跨块偏移使用当前固定输出格式估算：

```text
audio-24khz-48kbitrate-mono-mp3
```

估算公式基于 48kbps CBR：

```text
durationTicks = audioBytes * 8 * 10,000,000 / 48,000
```

这对当前固定 MP3 输出格式可用。如果将来改成非固定码率或其他输出格式，需要重新处理跨块 duration。

## 已验证行为

本地用 Wrangler 验证：

```bash
npx wrangler dev --local --port 8787
```

验证项：

- `/v1/audio/speech/timeline` + `boundary: "sentence"` 返回 `200 OK`，中文测试文本返回 2 条句子 timeline。
- `/v1/audio/speech/timeline` + `boundary: "word"` 返回 `200 OK`，英文测试文本返回词级 timeline。
- `/v1/audio/speech` 仍返回 `200 audio/mpeg`，旧接口行为未变。
- `Get-Content -Path index.js | node --input-type=module --check` 通过。
- `npx wrangler deploy --dry-run` 通过；Wrangler 只提示多环境配置未指定目标环境。

## 后续可选优化

- 给 timeline 接口加前端演示 UI，直接展示播放高亮。
- 对 `all` 返回的 sentence / word 分开分组，减少前端筛选成本。
- 若需要长文本更精确的跨块时间，可以解析 MP3 duration，而不是按 CBR 估算。
- 如果后续迁移到正式 Azure Speech SDK，可以把 WebSocket 协议细节替换成 SDK boundary event。
