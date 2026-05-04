const TOKEN_REFRESH_BEFORE_EXPIRY = 3 * 60;
const EDGE_TTS_TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const EDGE_TTS_BASE_URL = "speech.platform.bing.com/consumer/speech/synthesize/readaloud";
const EDGE_TTS_HTTPS_URL = `https://${EDGE_TTS_BASE_URL}/edge/v1?TrustedClientToken=${EDGE_TTS_TRUSTED_CLIENT_TOKEN}`;
const EDGE_TTS_CHROMIUM_FULL_VERSION = "143.0.3650.75";
const EDGE_TTS_CHROMIUM_MAJOR_VERSION = EDGE_TTS_CHROMIUM_FULL_VERSION.split(".")[0];
const EDGE_TTS_SEC_MS_GEC_VERSION = `1-${EDGE_TTS_CHROMIUM_FULL_VERSION}`;
const EDGE_TTS_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
const EDGE_TTS_MAX_ESCAPED_TEXT_BYTES = 3800;
const EDGE_TTS_MAX_CHUNKS = 40;
const EDGE_TTS_TIMEOUT_MS = 45000;
const EDGE_TTS_TICKS_PER_SECOND = 10000000;
const EDGE_TTS_MP3_BITRATE_BPS = 48000;
const WINDOWS_EPOCH_SECONDS = 11644473600;
let tokenInfo = {
    endpoint: null,
    token: null,
    expiredAt: null
};

// HTML 页面模板
const HTML_PAGE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="page.title">VoiceCraft - AI-Powered Voice Processing Platform</title>
    <meta name="description" content="" data-i18n-content="page.description">
    <meta name="keywords" content="" data-i18n-content="page.keywords">
    <style>
        :root {
            --primary-color: #d8aa52;
            --primary-hover: #f3ce78;
            --secondary-color: #aa9874;
            --success-color: #d8aa52;
            --warning-color: #d18a34;
            --error-color: #ff746f;
            --background-color: #050403;
            --surface-color: rgba(18, 15, 10, 0.88);
            --surface-raised: rgba(18, 15, 10, 0.96);
            --surface-deep: rgba(7, 6, 5, 0.72);
            --surface-input: rgba(7, 6, 5, 0.78);
            --text-primary: #fff4d8;
            --text-secondary: #bdae8c;
            --border-color: rgba(222, 179, 91, 0.24);
            --border-focus: #f0c76c;
            --gold-label: #e5bf6a;
            --gold-bright: #f4d184;
            --gold-ink: #120b03;
            --gold-soft: rgba(216, 170, 82, 0.1);
            --gold-hover: rgba(216, 170, 82, 0.18);
            --gold-focus: rgba(216, 170, 82, 0.14);
            --gold-border: rgba(216, 170, 82, 0.34);
            --gold-muted-border: rgba(216, 170, 82, 0.22);
            --gold-glow: rgba(216, 170, 82, 0.24);
            --gold-selection: rgba(216, 170, 82, 0.32);
            --cream-soft: #fff8df;
            --cream-strong: #fff0bd;
            --danger-surface: rgba(255, 116, 111, 0.16);
            --danger-hover: rgba(255, 116, 111, 0.28);
            --danger-border: rgba(255, 116, 111, 0.3);
            --danger-text: #ffd1cf;
            --shadow-sm: 0 8px 22px rgba(0, 0, 0, 0.28);
            --shadow-md: 0 18px 46px rgba(0, 0, 0, 0.36), 0 0 26px rgba(216, 170, 82, 0.08);
            --shadow-lg: 0 30px 90px rgba(0, 0, 0, 0.48), 0 0 80px rgba(216, 170, 82, 0.1);
            --radius-sm: 10px;
            --radius-md: 16px;
            --radius-lg: 24px;
            --radius-xl: 34px;
            --gold-gradient: linear-gradient(135deg, #fff1bd 0%, #dfb35b 44%, #8a5a17 100%);
            --gold-gradient-hover: linear-gradient(135deg, #fff7d2 0%, #e7bd66 48%, #a36d1d 100%);
            --surface-gradient: linear-gradient(145deg, rgba(25, 21, 14, 0.95) 0%, rgba(10, 9, 7, 0.93) 54%, rgba(24, 18, 10, 0.96) 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            background: var(--background-color);
        }

        *::selection {
            background: var(--gold-selection);
            color: var(--cream-soft);
        }

        body {
            position: relative;
            overflow-x: hidden;
            font-family: "Avenir Next", "Noto Serif SC", "Songti SC", "Microsoft YaHei", serif;
            background:
                radial-gradient(circle at 16% 8%, rgba(216, 170, 82, 0.2), transparent 31%),
                linear-gradient(145deg, #050403 0%, #0d0a07 50%, #040302 100%);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .container {
            position: relative;
            z-index: 1;
            width: min(1120px, 100%);
            max-width: none;
            margin: 0 auto;
            padding: clamp(72px, 8vw, 110px) 24px 64px;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        .main-content,
        .transcription-container {
            position: relative;
            overflow: hidden;
            max-width: none;
            margin: 0 auto;
            background: var(--surface-gradient);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
        }

        .main-content::before,
        .transcription-container::before {
            content: '';
            position: absolute;
            inset: 0 0 auto;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 232, 173, 0.8), transparent);
        }

        .main-content::after,
        .transcription-container::after {
            content: '';
            position: absolute;
            right: -120px;
            top: -160px;
            width: 320px;
            height: 320px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(216, 170, 82, 0.15), transparent 62%);
            pointer-events: none;
        }

        .form-container {
            position: relative;
            z-index: 1;
            padding: clamp(30px, 5vw, 58px);
        }

        .form-group {
            margin-bottom: 26px;
        }

        .form-label {
            display: block;
            margin-bottom: 10px;
            color: var(--gold-label);
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .form-input,
        .form-select,
        .form-textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--gold-muted-border);
            border-radius: var(--radius-md);
            background: var(--surface-input);
            color: var(--text-primary);
            box-shadow: inset 0 1px 0 rgba(255, 244, 216, 0.05), 0 12px 30px rgba(0, 0, 0, 0.18);
            caret-color: var(--border-focus);
            font-size: 16px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
            color: rgba(189, 174, 140, 0.58);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
            outline: none;
            border-color: var(--border-focus);
            box-shadow: 0 0 0 4px var(--gold-focus), inset 0 1px 0 rgba(255, 244, 216, 0.08);
        }

        .form-select {
            color-scheme: dark;
        }

        .form-select option {
            background: #100d09;
            color: var(--text-primary);
        }

        .form-hint {
            margin-top: 8px;
            color: var(--text-secondary);
            font-size: 0.8125rem;
            line-height: 1.5;
        }

        .form-textarea {
            min-height: 168px;
            resize: vertical;
            font-family: inherit;
            line-height: 1.85;
        }

        .controls-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(220px, 1fr));
            gap: 22px;
            margin-bottom: 34px;
        }

        .btn-primary {
            width: 100%;
            min-height: 58px;
            padding: 16px 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: var(--gold-gradient);
            color: var(--gold-ink);
            border: 1px solid rgba(255, 241, 189, 0.62);
            border-radius: 999px;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.06em;
            cursor: pointer;
            box-shadow: 0 22px 52px rgba(216, 170, 82, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary:hover:not(:disabled) {
            background: var(--gold-gradient-hover);
            transform: translateY(-2px);
            box-shadow: 0 26px 64px rgba(216, 170, 82, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.42);
        }

        .btn-primary:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
            filter: grayscale(0.35);
        }

        .btn-secondary {
            padding: 12px 24px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--gold-soft);
            color: var(--border-focus);
            border: 1px solid var(--gold-border);
            border-radius: 999px;
            font-weight: 800;
            cursor: pointer;
            text-decoration: none;
            box-shadow: inset 0 1px 0 rgba(255, 244, 216, 0.06);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-secondary:hover {
            background: var(--gold-hover);
            color: var(--cream-strong);
            transform: translateY(-1px);
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.24);
        }

        .result-container {
            display: none;
            margin-top: 34px;
            padding: 24px;
            background: rgba(7, 6, 5, 0.66);
            border: 1px solid var(--gold-muted-border);
            border-radius: var(--radius-lg);
            box-shadow: inset 0 1px 0 rgba(255, 244, 216, 0.04);
        }

        .audio-player {
            width: 100%;
            margin-bottom: 16px;
            border-radius: var(--radius-md);
            filter: sepia(0.18) saturate(1.15);
        }

        .error-message {
            margin-top: 16px;
            padding: 16px;
            color: var(--danger-text);
            background: rgba(92, 24, 24, 0.42);
            border: 1px solid rgba(255, 116, 111, 0.34);
            border-radius: var(--radius-md);
            font-weight: 500;
        }

        .loading-container {
            text-align: center;
            padding: 32px 20px;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 16px;
            border: 3px solid var(--gold-hover);
            border-top-color: var(--border-focus);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            box-shadow: 0 0 24px rgba(216, 170, 82, 0.25);
        }

        .loading-text {
            color: var(--text-secondary);
            font-weight: 500;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .input-method-tabs {
            display: flex;
            gap: 6px;
            margin-bottom: 20px;
            padding: 6px;
            background: var(--surface-deep);
            border: 1px solid var(--gold-muted-border);
            border-radius: 22px;
            box-shadow: inset 0 1px 0 rgba(255, 244, 216, 0.05);
        }

        .tab-btn {
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 20px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            border-radius: 16px;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-btn:hover {
            color: var(--gold-bright);
            background: rgba(216, 170, 82, 0.08);
        }

        .tab-btn.active {
            background: var(--gold-gradient);
            color: var(--gold-ink);
            box-shadow: 0 14px 32px rgba(216, 170, 82, 0.2);
            transform: translateY(-1px);
        }

        .tab-btn .tab-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            background: rgba(216, 170, 82, 0.12);
            font-size: 0.875rem;
        }

        .tab-btn.active .tab-icon {
            background: rgba(0, 0, 0, 0.12);
        }

        .file-upload-container {
            width: 100%;
        }

        .file-drop-zone,
        .audio-upload-zone {
            position: relative;
            overflow: hidden;
            padding: 48px 24px;
            text-align: center;
            cursor: pointer;
            border: 1px dashed rgba(216, 170, 82, 0.42);
            border-radius: 28px;
            background:
                radial-gradient(circle at 50% 0%, var(--gold-focus), transparent 48%),
                rgba(7, 6, 5, 0.58);
            box-shadow: inset 0 1px 0 rgba(255, 244, 216, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .file-drop-zone::before,
        .audio-upload-zone::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(216, 170, 82, 0.08), rgba(255, 241, 189, 0.04));
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .file-drop-zone:hover::before,
        .file-drop-zone.dragover::before,
        .audio-upload-zone:hover::before,
        .audio-upload-zone.dragover::before {
            opacity: 1;
        }

        .file-drop-zone:hover,
        .file-drop-zone.dragover,
        .audio-upload-zone:hover,
        .audio-upload-zone.dragover {
            border-color: var(--border-focus);
            transform: translateY(-2px);
            box-shadow: 0 20px 48px rgba(216, 170, 82, 0.14);
        }

        .file-drop-content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .file-drop-icon {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            background: var(--gold-gradient);
            color: #110b03;
            border-radius: 20px;
            box-shadow: 0 18px 42px rgba(216, 170, 82, 0.24);
        }

        .file-drop-text,
        .file-name {
            color: var(--text-primary);
        }

        .file-drop-text {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            line-height: 1.4;
        }

        .file-drop-hint,
        .file-size {
            color: var(--text-secondary);
            background: var(--gold-soft);
            border: 1px solid rgba(216, 170, 82, 0.12);
        }

        .file-drop-hint {
            margin: 0;
            padding: 8px 16px;
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
        }

        .file-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 16px;
            padding: 20px;
            background: rgba(7, 6, 5, 0.7);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            transition: all 0.2s ease;
        }

        .file-info:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }

        .file-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .file-name {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.95rem;
            font-weight: 600;
        }

        .file-name::before {
            content: '';
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            background: var(--gold-gradient);
            border-radius: 3px;
            opacity: 0.8;
        }

        .file-size {
            display: inline-block;
            width: fit-content;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .file-remove-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--danger-surface);
            color: var(--danger-text);
            border: 1px solid var(--danger-border);
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .file-remove-btn:hover {
            background: var(--danger-hover);
            transform: scale(1.05);
            box-shadow: 0 10px 24px rgba(255, 116, 111, 0.18);
        }

        .mode-switcher {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px;
            max-width: none;
            margin: 0 0 24px;
            padding: 6px;
            background: rgba(255, 238, 190, 0.04);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            box-shadow: inset 0 1px 0 rgba(255, 244, 216, 0.08), var(--shadow-sm);
        }

        .mode-btn {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            max-width: none;
            padding: 16px 24px;
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid transparent;
            border-radius: 999px;
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            cursor: pointer;
            box-shadow: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mode-btn:hover {
            border-color: var(--gold-border);
            color: var(--gold-bright);
            background: rgba(216, 170, 82, 0.08);
            transform: translateY(-1px);
            box-shadow: none;
        }

        .mode-btn.active {
            background: var(--gold-gradient);
            color: var(--gold-ink);
            border-color: rgba(255, 241, 189, 0.72);
            transform: translateY(-1px);
            box-shadow: 0 18px 42px var(--gold-glow), inset 0 1px 0 rgba(255, 255, 255, 0.36);
        }

        .mode-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: currentColor;
        }

        .token-config {
            display: flex;
            gap: 20px;
            margin-bottom: 16px;
            padding: 14px;
            background: rgba(7, 6, 5, 0.52);
            border: 1px solid rgba(216, 170, 82, 0.16);
            border-radius: var(--radius-md);
        }

        .token-option {
            display: flex;
            align-items: center;
        }

        .token-label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
            font-weight: 500;
            cursor: pointer;
            transition: color 0.2s ease;
        }

        .token-label:hover {
            color: var(--gold-bright);
        }

        .token-label input[type="radio"] {
            width: 16px;
            height: 16px;
            margin: 0;
            border: 2px solid var(--border-color);
            border-radius: 50%;
            accent-color: var(--primary-color);
            cursor: pointer;
        }

        .transcription-result {
            margin-top: 20px;
        }

        .result-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 16px;
        }

        .result-actions .btn-secondary {
            flex: 1;
            min-width: 140px;
            justify-content: center;
        }

        .language-switcher {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 5;
        }

        .language-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(18, 15, 10, 0.86);
            color: var(--text-secondary);
            border: 1px solid rgba(216, 170, 82, 0.28);
            border-radius: 999px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            transition: all 0.2s ease;
        }

        .language-btn:hover {
            color: var(--gold-bright);
            border-color: var(--primary-color);
            box-shadow: var(--shadow-md);
        }

        .language-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            display: none;
            min-width: 120px;
            margin-top: 4px;
            background: var(--surface-raised);
            border: 1px solid rgba(216, 170, 82, 0.28);
            border-radius: 18px;
            box-shadow: var(--shadow-lg);
            overflow: hidden;
        }

        .language-dropdown.show {
            display: block;
        }

        .language-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            color: var(--text-secondary);
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .language-option:hover {
            background: var(--gold-soft);
            color: var(--gold-bright);
        }

        .language-option.active {
            background: var(--gold-gradient);
            color: var(--gold-ink);
        }

        @media (max-width: 768px) {
            body {
                background: linear-gradient(145deg, #050403 0%, #0d0a07 100%);
            }

            .container {
                padding: 76px 16px 42px;
            }

            .form-container {
                padding: 24px;
            }

            .controls-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .input-method-tabs {
                flex-direction: column;
            }

            .tab-btn {
                padding: 12px 16px;
                gap: 8px;
                font-size: 0.85rem;
            }

            .tab-btn .tab-icon {
                width: 18px;
                height: 18px;
            }

            .file-drop-zone,
            .audio-upload-zone {
                padding: 32px 16px;
            }

            .file-drop-icon {
                width: 56px;
                height: 56px;
            }

            .file-info {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
            }

            .file-remove-btn {
                align-self: flex-end;
            }

            .mode-switcher {
                grid-template-columns: 1fr;
                margin-bottom: 16px;
                border-radius: 28px;
            }

            .mode-btn {
                gap: 8px;
                max-width: none;
                padding: 14px 20px;
                border-radius: 22px;
                font-size: 0.9rem;
            }

            .mode-icon {
                width: 20px;
                height: 20px;
            }

            .main-content,
            .transcription-container {
                border-radius: 28px;
            }

            .token-config,
            .result-actions {
                flex-direction: column;
            }

            .result-actions .btn-secondary {
                min-width: auto;
            }

            .language-switcher {
                top: 14px;
                right: 14px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                scroll-behavior: auto !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
</head>
<body>
    <!-- 语言切换器 -->
    <div class="language-switcher">
        <div class="language-btn" id="languageBtn">
            <span id="currentLangFlag">🌐</span>
            <span id="currentLangName" data-i18n="lang.current">English</span>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
        </div>
        <div class="language-dropdown" id="languageDropdown">
            <div class="language-option" data-lang="en">
                <span>🇺🇸</span>
                <span data-i18n="lang.en">English</span>
            </div>
            <div class="language-option" data-lang="zh">
                <span>🇨🇳</span>
                <span data-i18n="lang.zh">中文</span>
            </div>
            <div class="language-option" data-lang="ja">
                <span>🇯🇵</span>
                <span data-i18n="lang.ja">日本語</span>
            </div>
            <div class="language-option" data-lang="ko">
                <span>🇰🇷</span>
                <span data-i18n="lang.ko">한국어</span>
            </div>
            <div class="language-option" data-lang="es">
                <span>🇪🇸</span>
                <span data-i18n="lang.es">Español</span>
            </div>
            <div class="language-option" data-lang="fr">
                <span>🇫🇷</span>
                <span data-i18n="lang.fr">Français</span>
            </div>
            <div class="language-option" data-lang="de">
                <span>🇩🇪</span>
                <span data-i18n="lang.de">Deutsch</span>
            </div>
            <div class="language-option" data-lang="ru">
                <span>🇷🇺</span>
                <span data-i18n="lang.ru">Русский</span>
            </div>
        </div>
    </div>

    <div class="container">
        <h1 class="sr-only" data-i18n="page.title">VoiceCraft - AI-Powered Voice Processing Platform</h1>
        <!-- 主功能切换器 -->
        <div class="mode-switcher">
            <button type="button" class="mode-btn active" id="ttsMode">
                <span class="mode-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                    </svg>
                </span>
                <span data-i18n="mode.tts">Text to Speech</span>
            </button>
            <button type="button" class="mode-btn" id="transcriptionMode">
                <span class="mode-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 9m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
                        <path d="M9 17v4"/>
                        <path d="M12 13a3 3 0 0 0 3 -3"/>
                        <path d="M15 9.5v-3a3 3 0 0 0 -3 -3h-1"/>
                        <path d="M19 8v8"/>
                        <path d="M17 9v6"/>
                        <path d="M21 9v6"/>
                    </svg>
                </span>
                <span data-i18n="mode.transcription">Speech to Text</span>
            </button>
        </div>
        
        <div class="main-content">
            <div class="form-container">
                <form id="ttsForm">
                    <!-- 输入方式选择 -->
                    <div class="form-group">
                        <label class="form-label">选择输入方式</label>
                        <div class="input-method-tabs">
                            <button type="button" class="tab-btn active" id="textInputTab">
                                <span class="tab-icon">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                </span>
                                <span>手动输入</span>
                            </button>
                            <button type="button" class="tab-btn" id="fileUploadTab">
                                <span class="tab-icon">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                    </svg>
                                </span>
                                <span>上传文件</span>
                            </button>
                        </div>
                    </div>

                    <!-- 手动输入区域 -->
                    <div class="form-group" id="textInputArea">
                        <label class="form-label" for="text">输入文本</label>
                        <textarea class="form-textarea" id="text" placeholder="请输入要转换为语音的文本内容，支持中文、英文、数字等..." required></textarea>
                    </div>

                    <!-- 文件上传区域 -->
                    <div class="form-group" id="fileUploadArea" style="display: none;">
                        <label class="form-label" for="fileInput">上传txt文件</label>
                        <div class="file-upload-container">
                            <div class="file-drop-zone" id="fileDropZone">
                                <div class="file-drop-content">
                                    <div class="file-drop-icon">
                                        <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L13.09 8.26L19 7L17.74 13.09L24 12L17.74 10.91L19 5L13.09 6.26L12 0L10.91 6.26L5 5L6.26 10.91L0 12L6.26 13.09L5 19L10.91 17.74L12 24L13.09 17.74L19 19L17.74 13.09L24 12Z"/>
                                            <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2M18 20H6V4H13V9H18V20Z"/>
                                        </svg>
                                    </div>
                                    <p class="file-drop-text">拖拽txt文件到此处，或点击选择文件</p>
                                    <p class="file-drop-hint">支持txt格式，最大500KB</p>
                                </div>
                                <input type="file" id="fileInput" accept=".txt,text/plain" style="display: none;">
                            </div>
                            <div class="file-info" id="fileInfo" style="display: none;">
                                <div class="file-details">
                                    <span class="file-name" id="fileName"></span>
                                    <span class="file-size" id="fileSize"></span>
                                </div>
                                <button type="button" class="file-remove-btn" id="fileRemoveBtn">✕</button>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="ttsApiKeyInput" data-i18n="tts.apiKey.label">访问密码</label>
                        <input type="password" class="form-input" id="ttsApiKeyInput"
                               placeholder="输入 less-tts 密码" data-i18n-placeholder="tts.apiKey.placeholder"
                               autocomplete="current-password" spellcheck="false">
                        <p class="form-hint" data-i18n="tts.apiKey.hint">保存在当前浏览器，下次自动填入。</p>
                    </div>

                    <div class="controls-grid">
                        <div class="form-group">
                            <label class="form-label" for="voice">语音选择</label>
                            <select class="form-select" id="voice">
                                <option value="zh-CN-XiaoxiaoNeural">晓晓 (女声·温柔)</option>
                                <option value="zh-CN-YunxiNeural">云希 (男声·清朗)</option>
                                <option value="zh-CN-YunyangNeural">云扬 (男声·阳光)</option>
                                <option value="zh-CN-XiaoyiNeural">晓伊 (女声·甜美)</option>
                                <option value="zh-CN-YunjianNeural">云健 (男声·稳重)</option>
                                <option value="zh-CN-XiaochenNeural">晓辰 (女声·知性)</option>
                                <option value="zh-CN-XiaohanNeural">晓涵 (女声·优雅)</option>
                                <option value="zh-CN-XiaomengNeural">晓梦 (女声·梦幻)</option>
                                <option value="zh-CN-XiaomoNeural">晓墨 (女声·文艺)</option>
                                <option value="zh-CN-XiaoqiuNeural">晓秋 (女声·成熟)</option>
                                <option value="zh-CN-XiaoruiNeural">晓睿 (女声·智慧)</option>
                                <option value="zh-CN-XiaoshuangNeural">晓双 (女声·活泼)</option>
                                <option value="zh-CN-XiaoxuanNeural">晓萱 (女声·清新)</option>
                                <option value="zh-CN-XiaoyanNeural">晓颜 (女声·柔美)</option>
                                <option value="zh-CN-XiaoyouNeural">晓悠 (女声·悠扬)</option>
                                <option value="zh-CN-XiaozhenNeural">晓甄 (女声·端庄)</option>
                                <option value="zh-CN-YunfengNeural">云枫 (男声·磁性)</option>
                                <option value="zh-CN-YunhaoNeural">云皓 (男声·豪迈)</option>
                                <option value="zh-CN-YunxiaNeural">云夏 (男声·热情)</option>
                                <option value="zh-CN-YunyeNeural">云野 (男声·野性)</option>
                                <option value="zh-CN-YunzeNeural">云泽 (男声·深沉)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="speed">语速调节</label>
                            <select class="form-select" id="speed">
                                <option value="0.5">🐌 很慢</option>
                                <option value="0.75">🚶 慢速</option>
                                <option value="1.0" selected>⚡ 正常</option>
                                <option value="1.25">🏃 快速</option>
                                <option value="1.5">🚀 很快</option>
                                <option value="2.0">💨 极速</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="pitch">音调高低</label>
                            <select class="form-select" id="pitch">
                                <option value="-50">📉 很低沉</option>
                                <option value="-25">📊 低沉</option>
                                <option value="0" selected>🎵 标准</option>
                                <option value="25">📈 高亢</option>
                                <option value="50">🎶 很高亢</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="style">语音风格</label>
                            <select class="form-select" id="style">
                                <option value="general" selected>🎭 通用风格</option>
                                <option value="assistant">🤖 智能助手</option>
                                <option value="chat">💬 聊天对话</option>
                                <option value="customerservice">📞 客服专业</option>
                                <option value="newscast">📺 新闻播报</option>
                                <option value="affectionate">💕 亲切温暖</option>
                                <option value="calm">😌 平静舒缓</option>
                                <option value="cheerful">😊 愉快欢乐</option>
                                <option value="gentle">🌸 温和柔美</option>
                                <option value="lyrical">🎼 抒情诗意</option>
                                <option value="serious">🎯 严肃正式</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-primary" id="generateBtn">
                        <span>🎙️</span>
                        <span>开始生成语音</span>
                    </button>
            </form>
            
                <div id="result" class="result-container">
                    <div id="loading" class="loading-container" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p class="loading-text" id="loadingText">正在生成语音，请稍候...</p>
                        <div class="progress-info" id="progressInfo" style="margin-top: 12px; font-size: 0.875rem; color: var(--text-secondary);"></div>
                    </div>
                    
                    <div id="success" style="display: none;">
                        <audio id="audioPlayer" class="audio-player" controls></audio>
                        <a id="downloadBtn" class="btn-secondary" download="speech.mp3">
                            <span>📥</span>
                            <span>下载音频文件</span>
                        </a>
                    </div>
                    
                    <div id="error" class="error-message" style="display: none;"></div>
                </div>
            </div>
        </div>
        
        <!-- 语音转录界面 -->
        <div class="transcription-container" id="transcriptionContainer" style="display: none;">
            <div class="form-container">
                <form id="transcriptionForm">
                    <div class="form-group">
                        <label class="form-label">上传音频文件</label>
                        <div class="audio-upload-zone" id="audioDropZone">
                            <div class="file-drop-content">
                                <div class="file-drop-icon">
                                    <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                        <path d="M14 2v6h6"/>
                                        <path d="M12 18v-6"/>
                                        <path d="M9 15l3-3 3 3"/>
                                    </svg>
                                </div>
                                <p class="file-drop-text">拖拽音频文件到此处，或点击选择文件</p>
                                <p class="file-drop-hint">支持mp3、wav、m4a、flac、aac、ogg、webm、amr、3gp格式，最大10MB</p>
                            </div>
                            <input type="file" id="audioFileInput" accept=".mp3,.wav,.m4a,.flac,.aac,.ogg,.webm,.amr,.3gp,audio/*" style="display: none;">
                        </div>
                        <div class="file-info" id="audioFileInfo" style="display: none;">
                            <div class="file-details">
                                <span class="file-name" id="audioFileName"></span>
                                <span class="file-size" id="audioFileSize"></span>
                            </div>
                            <button type="button" class="file-remove-btn" id="audioFileRemoveBtn">✕</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tokenInput">API Token配置</label>
                        <div class="token-config">
                            <div class="token-option">
                                <label class="token-label">
                                    <input type="radio" name="tokenOption" value="default" checked>
                                    <span>使用默认Token</span>
                                </label>
                            </div>
                            <div class="token-option">
                                <label class="token-label">
                                    <input type="radio" name="tokenOption" value="custom">
                                    <span>使用硅基流动自定义Token</span>
                                </label>
                            </div>
                        </div>
                        <input type="password" class="form-input" id="tokenInput" 
                               placeholder="输入您的API Token（可选）" style="display: none;">
                    </div>

                    <button type="submit" class="btn-primary" id="transcribeBtn">
                        <span>🎧</span>
                        <span>开始语音转录</span>
                    </button>
                </form>

                <div id="transcriptionResult" class="result-container">
                    <div id="transcriptionLoading" class="loading-container" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p class="loading-text" id="transcriptionLoadingText">正在转录音频，请稍候...</p>
                        <div class="progress-info" id="transcriptionProgressInfo" style="margin-top: 12px; font-size: 0.875rem; color: var(--text-secondary);"></div>
                    </div>
                    
                    <div id="transcriptionSuccess" style="display: none;">
                        <div class="transcription-result">
                            <label class="form-label">转录结果</label>
                            <textarea class="form-textarea" id="transcriptionText" 
                                      placeholder="转录结果将在这里显示..." readonly></textarea>
                            <div class="result-actions">
                                <button type="button" class="btn-secondary" id="copyTranscriptionBtn">
                                    <span>📋</span>
                                    <span>复制文本</span>
                                </button>
                                <button type="button" class="btn-secondary" id="editTranscriptionBtn">
                                    <span>✏️</span>
                                    <span>编辑文本</span>
                                </button>
                                <button type="button" class="btn-secondary" id="useForTtsBtn">
                                    <span>🎙️</span>
                                    <span>转为语音</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="transcriptionError" class="error-message" style="display: none;"></div>
                </div>
            </div>
        </div>
        
    </div>

    <script>
        let selectedFile = null;
        let currentInputMethod = 'text'; // 'text' or 'file'
        let currentMode = 'tts'; // 'tts' or 'transcription'
        let selectedAudioFile = null;
        let transcriptionToken = null;
        let currentLanguage = 'en'; // 默认语言

        // 国际化翻译数据
        const translations = {
            en: {
                'page.title': 'VoiceCraft - AI-Powered Voice Processing Platform',
                'page.description': 'VoiceCraft is an AI-powered platform that converts text to speech and speech to text with 20+ voice options, lightning fast processing, completely free to use.',
                'page.keywords': 'text to speech,AI voice synthesis,online TTS,voice generator,free voice tools,speech to text,voice transcription',
                'lang.current': 'English',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': 'Text to Speech',
                'mode.transcription': 'Speech to Text',
                'tts.apiKey.label': 'Access password',
                'tts.apiKey.placeholder': 'Enter less-tts password',
                'tts.apiKey.hint': 'Saved in this browser and filled automatically next time.',
                'tts.apiKey.required': 'Please enter the access password'
            },
            zh: {
                'page.title': 'VoiceCraft - AI驱动的语音处理平台',
                'page.description': 'VoiceCraft是一个AI驱动的平台，支持文字转语音和语音转文字，拥有20+种语音选项，闪电般的处理速度，完全免费使用。',
                'page.keywords': '文字转语音,AI语音合成,在线TTS,语音生成器,免费语音工具,语音转文字,语音转录',
                'lang.current': '中文',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': '文字转语音',
                'mode.transcription': '语音转文字',
                'tts.apiKey.label': '访问密码',
                'tts.apiKey.placeholder': '输入 less-tts 密码',
                'tts.apiKey.hint': '保存在当前浏览器，下次自动填入。',
                'tts.apiKey.required': '请输入访问密码'
            },
            ja: {
                'page.title': 'VoiceCraft - AI音声処理プラットフォーム',
                'page.description': 'VoiceCraftはAI駆動のプラットフォームで、テキスト読み上げと音声テキスト変換に対応。20以上の音声オプション、高速処理、完全無料でご利用いただけます。',
                'page.keywords': 'テキスト読み上げ,AI音声合成,オンラインTTS,音声ジェネレーター,無料音声ツール,音声テキスト変換,音声転写',
                'lang.current': '日本語',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': 'テキスト読み上げ',
                'mode.transcription': '音声テキスト変換',
                'tts.apiKey.label': 'アクセスパスワード',
                'tts.apiKey.placeholder': 'less-tts パスワードを入力',
                'tts.apiKey.hint': 'このブラウザに保存され、次回は自動入力されます。',
                'tts.apiKey.required': 'アクセスパスワードを入力してください'
            },
            ko: {
                'page.title': 'VoiceCraft - AI 음성 처리 플랫폼',
                'page.description': 'VoiceCraft는 AI 기반 플랫폼으로 텍스트 음성 변환과 음성 텍스트 변환을 지원합니다. 20개 이상의 음성 옵션, 빠른 처리 속도, 완전 무료로 이용하실 수 있습니다.',
                'page.keywords': '텍스트 음성 변환,AI 음성 합성,온라인 TTS,음성 생성기,무료 음성 도구,음성 텍스트 변환,음성 전사',
                'lang.current': '한국어',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': '텍스트 음성 변환',
                'mode.transcription': '음성 텍스트 변환',
                'tts.apiKey.label': '접근 비밀번호',
                'tts.apiKey.placeholder': 'less-tts 비밀번호 입력',
                'tts.apiKey.hint': '이 브라우저에 저장되고 다음에 자동으로 입력됩니다.',
                'tts.apiKey.required': '접근 비밀번호를 입력하세요'
            },
            es: {
                'page.title': 'VoiceCraft - Plataforma de Procesamiento de Voz con IA',
                'page.description': 'VoiceCraft es una plataforma impulsada por IA que convierte texto a voz y voz a texto con más de 20 opciones de voz, procesamiento ultrarrápido, completamente gratis.',
                'page.keywords': 'texto a voz,síntesis de voz IA,TTS en línea,generador de voz,herramientas de voz gratis,voz a texto,transcripción de voz',
                'lang.current': 'Español',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': 'Texto a Voz',
                'mode.transcription': 'Voz a Texto',
                'tts.apiKey.label': 'Contraseña de acceso',
                'tts.apiKey.placeholder': 'Introduce la contraseña de less-tts',
                'tts.apiKey.hint': 'Se guarda en este navegador y se completa automáticamente la próxima vez.',
                'tts.apiKey.required': 'Introduce la contraseña de acceso'
            },
            fr: {
                'page.title': 'VoiceCraft - Plateforme de Traitement Vocal IA',
                'page.description': 'VoiceCraft est une plateforme alimentée par IA qui convertit le texte en parole et la parole en texte avec plus de 20 options vocales, traitement ultra-rapide, entièrement gratuit.',
                'page.keywords': 'texte vers parole,synthèse vocale IA,TTS en ligne,générateur vocal,outils vocaux gratuits,parole vers texte,transcription vocale',
                'lang.current': 'Français',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': 'Texte vers Parole',
                'mode.transcription': 'Parole vers Texte',
                'tts.apiKey.label': 'Mot de passe',
                'tts.apiKey.placeholder': 'Saisissez le mot de passe less-tts',
                'tts.apiKey.hint': 'Enregistré dans ce navigateur et rempli automatiquement la prochaine fois.',
                'tts.apiKey.required': 'Saisissez le mot de passe'
            },
            de: {
                'page.title': 'VoiceCraft - KI-gestützte Sprachverarbeitungsplattform',
                'page.description': 'VoiceCraft ist eine KI-gestützte Plattform, die Text in Sprache und Sprache in Text umwandelt, mit über 20 Sprachoptionen, blitzschneller Verarbeitung, völlig kostenlos.',
                'page.keywords': 'Text zu Sprache,KI-Sprachsynthese,Online-TTS,Sprachgenerator,kostenlose Sprachtools,Sprache zu Text,Sprachtranskription',
                'lang.current': 'Deutsch',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': 'Text zu Sprache',
                'mode.transcription': 'Sprache zu Text',
                'tts.apiKey.label': 'Zugangspasswort',
                'tts.apiKey.placeholder': 'less-tts Passwort eingeben',
                'tts.apiKey.hint': 'Wird in diesem Browser gespeichert und beim nächsten Mal automatisch ausgefüllt.',
                'tts.apiKey.required': 'Bitte Zugangspasswort eingeben'
            },
            ru: {
                'page.title': 'VoiceCraft - ИИ-платформа обработки голоса',
                'page.description': 'VoiceCraft - это платформа на базе ИИ, которая преобразует текст в речь и речь в текст с более чем 20 голосовыми опциями, молниеносной обработкой, совершенно бесплатно.',
                'page.keywords': 'текст в речь,ИИ синтез речи,онлайн TTS,генератор голоса,бесплатные голосовые инструменты,речь в текст,транскрипция речи',
                'lang.current': 'Русский',
                'lang.en': 'English',
                'lang.zh': '中文',
                'lang.ja': '日本語',
                'lang.ko': '한국어',
                'lang.es': 'Español',
                'lang.fr': 'Français',
                'lang.de': 'Deutsch',
                'lang.ru': 'Русский',
                'mode.tts': 'Текст в Речь',
                'mode.transcription': 'Речь в Текст',
                'tts.apiKey.label': 'Пароль доступа',
                'tts.apiKey.placeholder': 'Введите пароль less-tts',
                'tts.apiKey.hint': 'Сохраняется в этом браузере и подставляется автоматически в следующий раз.',
                'tts.apiKey.required': 'Введите пароль доступа'
            }
        };

        // 国际化功能
        function detectLanguage() {
            // 检测浏览器语言
            const browserLang = navigator.language || navigator.userLanguage;
            const shortLang = browserLang.split('-')[0];
            
            // 检查是否支持该语言
            if (translations[shortLang]) {
                return shortLang;
            }
            
            // 默认返回英语
            return 'en';
        }

        function setLanguage(lang) {
            currentLanguage = lang;
            localStorage.setItem('voicecraft-language', lang);
            
            // 更新页面语言属性
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
            
            // 应用翻译
            applyTranslations();
            
            // 更新语言切换器
            updateLanguageSwitcher();
        }

        function applyTranslations() {
            const langData = translations[currentLanguage];
            
            // 更新所有带有 data-i18n 属性的元素
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (langData[key]) {
                    element.textContent = langData[key];
                }
            });
            
            // 更新 meta 标签
            document.querySelectorAll('[data-i18n-content]').forEach(element => {
                const key = element.getAttribute('data-i18n-content');
                if (langData[key]) {
                    element.setAttribute('content', langData[key]);
                }
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                if (langData[key]) {
                    element.setAttribute('placeholder', langData[key]);
                }
            });
            
            // 更新页面标题
            if (langData['page.title']) {
                document.title = langData['page.title'];
            }
        }

        function updateLanguageSwitcher() {
            const langFlags = {
                'en': '🇺🇸',
                'zh': '🇨🇳',
                'ja': '🇯🇵',
                'ko': '🇰🇷',
                'es': '🇪🇸',
                'fr': '🇫🇷',
                'de': '🇩🇪',
                'ru': '🇷🇺'
            };
            
            const langData = translations[currentLanguage];
            document.getElementById('currentLangFlag').textContent = langFlags[currentLanguage];
            document.getElementById('currentLangName').textContent = langData['lang.current'];
            
            // 更新选中状态
            document.querySelectorAll('.language-option').forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-lang') === currentLanguage) {
                    option.classList.add('active');
                }
            });
        }

        // 初始化页面
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化国际化
            initializeI18n();
            
            // 初始化其他功能
            initializeInputMethodTabs();
            initializeFileUpload();
            initializeTtsApiKey();
            initializeModeSwitcher();
            initializeAudioUpload();
            initializeTokenConfig();
            initializeLanguageSwitcher();
        });

        // 初始化输入方式切换
        function initializeInputMethodTabs() {
            const textInputTab = document.getElementById('textInputTab');
            const fileUploadTab = document.getElementById('fileUploadTab');
            const textInputArea = document.getElementById('textInputArea');
            const fileUploadArea = document.getElementById('fileUploadArea');

            textInputTab.addEventListener('click', function() {
                currentInputMethod = 'text';
                textInputTab.classList.add('active');
                fileUploadTab.classList.remove('active');
                textInputArea.style.display = 'block';
                fileUploadArea.style.display = 'none';
                document.getElementById('text').required = true;
            });

            fileUploadTab.addEventListener('click', function() {
                currentInputMethod = 'file';
                fileUploadTab.classList.add('active');
                textInputTab.classList.remove('active');
                textInputArea.style.display = 'none';
                fileUploadArea.style.display = 'block';
                document.getElementById('text').required = false;
            });
        }

        // 初始化文件上传功能
        function initializeFileUpload() {
            const fileDropZone = document.getElementById('fileDropZone');
            const fileInput = document.getElementById('fileInput');
            const fileInfo = document.getElementById('fileInfo');
            const fileRemoveBtn = document.getElementById('fileRemoveBtn');

            // 点击上传区域
            fileDropZone.addEventListener('click', function() {
                fileInput.click();
            });

            // 文件选择
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    handleFileSelect(file);
                }
            });

            // 拖拽功能
            fileDropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                fileDropZone.classList.add('dragover');
            });

            fileDropZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                fileDropZone.classList.remove('dragover');
            });

            fileDropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                fileDropZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) {
                    handleFileSelect(file);
                }
            });

            // 移除文件
            fileRemoveBtn.addEventListener('click', function() {
                selectedFile = null;
                fileInput.value = '';
                fileInfo.style.display = 'none';
                fileDropZone.style.display = 'block';
            });
        }

        // 处理文件选择
        function handleFileSelect(file) {
            // 验证文件类型
            if (!file.type.includes('text/') && !file.name.toLowerCase().endsWith('.txt')) {
                alert('请选择txt格式的文本文件');
                return;
            }

            // 验证文件大小
            if (file.size > 500 * 1024) {
                alert('文件大小不能超过500KB');
                return;
            }

            selectedFile = file;
            
            // 显示文件信息
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('fileSize').textContent = formatFileSize(file.size);
            document.getElementById('fileInfo').style.display = 'flex';
            document.getElementById('fileDropZone').style.display = 'none';
        }

        // 格式化文件大小
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function initializeTtsApiKey() {
            const apiKeyInput = document.getElementById('ttsApiKeyInput');
            const savedApiKey = localStorage.getItem('voicecraft-tts-api-key');

            if (savedApiKey) {
                apiKeyInput.value = savedApiKey;
            }

            apiKeyInput.addEventListener('input', function() {
                const apiKey = apiKeyInput.value.trim();
                if (apiKey) {
                    localStorage.setItem('voicecraft-tts-api-key', apiKey);
                } else {
                    localStorage.removeItem('voicecraft-tts-api-key');
                }
            });
        }

        function getTtsApiKey() {
            const apiKey = document.getElementById('ttsApiKeyInput').value.trim();
            if (apiKey) {
                localStorage.setItem('voicecraft-tts-api-key', apiKey);
            }
            return apiKey;
        }

        // 表单提交处理
        document.getElementById('ttsForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const voice = document.getElementById('voice').value;
            const speed = document.getElementById('speed').value;
            const pitch = document.getElementById('pitch').value;
            const style = document.getElementById('style').value;
            
            const generateBtn = document.getElementById('generateBtn');
            const resultContainer = document.getElementById('result');
            const loading = document.getElementById('loading');
            const success = document.getElementById('success');
            const error = document.getElementById('error');
            const apiKey = getTtsApiKey();

            if (!apiKey) {
                alert(translations[currentLanguage]['tts.apiKey.required'] || translations.en['tts.apiKey.required']);
                document.getElementById('ttsApiKeyInput').focus();
                return;
            }
            
            // 验证输入
            if (currentInputMethod === 'text') {
                const text = document.getElementById('text').value;
                if (!text.trim()) {
                    alert('请输入要转换的文本内容');
                    return;
                }
            } else if (currentInputMethod === 'file') {
                if (!selectedFile) {
                    alert('请选择要上传的txt文件');
                    return;
                }
            }
            
            // 重置状态
            resultContainer.style.display = 'block';
            loading.style.display = 'block';
            success.style.display = 'none';
            error.style.display = 'none';
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';
            
            try {
                let response;
                let textLength = 0;
                
                // 更新加载提示
                const loadingText = document.getElementById('loadingText');
                const progressInfo = document.getElementById('progressInfo');
                
                if (currentInputMethod === 'text') {
                    // 手动输入文本
                    const text = document.getElementById('text').value;
                    textLength = text.length;
                    
                    // 根据文本长度显示不同的提示
                    if (textLength > 3000) {
                        loadingText.textContent = '正在处理长文本，请耐心等待...';
                        progressInfo.textContent = '文本长度: ' + textLength + ' 字符，预计需要 ' + (Math.ceil(textLength / 1500) * 2) + ' 秒';
                    } else {
                        loadingText.textContent = '正在生成语音，请稍候...';
                        progressInfo.textContent = '文本长度: ' + textLength + ' 字符';
                    }
                    
                    response = await fetch('/v1/audio/speech', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': apiKey,
                        },
                        body: JSON.stringify({
                            input: text,
                            voice: voice,
                            speed: parseFloat(speed),
                            pitch: pitch,
                            style: style
                        })
                    });
                } else {
                    // 文件上传
                    loadingText.textContent = '正在处理上传的文件...';
                    progressInfo.textContent = '文件: ' + selectedFile.name + ' (' + formatFileSize(selectedFile.size) + ')';
                    
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('voice', voice);
                    formData.append('speed', speed);
                    formData.append('pitch', pitch);
                    formData.append('style', style);
                    
                    response = await fetch('/v1/audio/speech', {
                        method: 'POST',
                        headers: {
                            'x-api-key': apiKey,
                        },
                        body: formData
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || '生成失败');
                }
                
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // 显示音频播放器
                const audioPlayer = document.getElementById('audioPlayer');
                const downloadBtn = document.getElementById('downloadBtn');
                
                audioPlayer.src = audioUrl;
                downloadBtn.href = audioUrl;
                
                loading.style.display = 'none';
                success.style.display = 'block';
                
            } catch (err) {
                loading.style.display = 'none';
                error.style.display = 'block';
                
                // 根据错误类型显示不同的提示
                if (err.message.includes('Too many subrequests')) {
                    error.textContent = '错误: 文本过长导致请求过多，请缩短文本内容或分段处理';
                } else if (err.message.includes('频率限制') || err.message.includes('429')) {
                    error.textContent = '错误: 请求过于频繁，请稍后再试';
                } else if (err.message.includes('分块数量') && err.message.includes('超过限制')) {
                    error.textContent = '错误: ' + err.message;
                } else {
                    error.textContent = '错误: ' + err.message;
                }
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<span>🎙️</span><span>开始生成语音</span>';
            }
        });

        // 初始化模式切换器
        function initializeModeSwitcher() {
            const ttsMode = document.getElementById('ttsMode');
            const transcriptionMode = document.getElementById('transcriptionMode');
            const mainContent = document.querySelector('.main-content');
            const transcriptionContainer = document.getElementById('transcriptionContainer');

            ttsMode.addEventListener('click', function() {
                switchMode('tts');
            });

            transcriptionMode.addEventListener('click', function() {
                switchMode('transcription');
            });
        }

        // 切换功能模式
        function switchMode(mode) {
            const ttsMode = document.getElementById('ttsMode');
            const transcriptionMode = document.getElementById('transcriptionMode');
            const mainContent = document.querySelector('.main-content');
            const transcriptionContainer = document.getElementById('transcriptionContainer');

            currentMode = mode;

            if (mode === 'tts') {
                // 切换到TTS模式
                ttsMode.classList.add('active');
                transcriptionMode.classList.remove('active');
                mainContent.style.display = 'block';
                transcriptionContainer.style.display = 'none';
            } else {
                // 切换到语音转录模式
                transcriptionMode.classList.add('active');
                ttsMode.classList.remove('active');
                mainContent.style.display = 'none';
                transcriptionContainer.style.display = 'block';
            }
        }

        // 初始化音频上传功能
        function initializeAudioUpload() {
            const audioDropZone = document.getElementById('audioDropZone');
            const audioFileInput = document.getElementById('audioFileInput');
            const audioFileInfo = document.getElementById('audioFileInfo');
            const audioFileRemoveBtn = document.getElementById('audioFileRemoveBtn');

            // 点击上传区域
            audioDropZone.addEventListener('click', function() {
                audioFileInput.click();
            });

            // 文件选择
            audioFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    handleAudioFileSelect(file);
                }
            });

            // 拖拽功能
            audioDropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                audioDropZone.classList.add('dragover');
            });

            audioDropZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                audioDropZone.classList.remove('dragover');
            });

            audioDropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                audioDropZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) {
                    handleAudioFileSelect(file);
                }
            });

            // 移除文件
            audioFileRemoveBtn.addEventListener('click', function() {
                selectedAudioFile = null;
                audioFileInput.value = '';
                audioFileInfo.style.display = 'none';
                audioDropZone.style.display = 'block';
            });
        }

        // 处理音频文件选择
        function handleAudioFileSelect(file) {
            // 验证文件类型
            const allowedTypes = [
                'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/aac',
                'audio/ogg', 'audio/webm', 'audio/amr', 'audio/3gpp'
            ];
            
            const isValidType = allowedTypes.some(type => 
                file.type.includes(type) || 
                file.name.toLowerCase().match(/\.(mp3|wav|m4a|flac|aac|ogg|webm|amr|3gp)$/i)
            );

            if (!isValidType) {
                alert('请选择音频格式的文件（mp3、wav、m4a、flac、aac、ogg、webm、amr、3gp）');
                return;
            }

            // 验证文件大小（限制为10MB）
            if (file.size > 10 * 1024 * 1024) {
                alert('音频文件大小不能超过10MB');
                return;
            }

            selectedAudioFile = file;
            
            // 显示文件信息
            document.getElementById('audioFileName').textContent = file.name;
            document.getElementById('audioFileSize').textContent = formatFileSize(file.size);
            document.getElementById('audioFileInfo').style.display = 'flex';
            document.getElementById('audioDropZone').style.display = 'none';
        }

        // 初始化Token配置
        function initializeTokenConfig() {
            const tokenRadios = document.querySelectorAll('input[name="tokenOption"]');
            const tokenInput = document.getElementById('tokenInput');

            tokenRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'custom') {
                        tokenInput.style.display = 'block';
                        tokenInput.required = true;
                    } else {
                        tokenInput.style.display = 'none';
                        tokenInput.required = false;
                        tokenInput.value = '';
                    }
                });
            });
        }

        // 处理语音转录表单提交
        document.getElementById('transcriptionForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const transcribeBtn = document.getElementById('transcribeBtn');
            const transcriptionResult = document.getElementById('transcriptionResult');
            const transcriptionLoading = document.getElementById('transcriptionLoading');
            const transcriptionSuccess = document.getElementById('transcriptionSuccess');
            const transcriptionError = document.getElementById('transcriptionError');
            
            // 验证音频文件
            if (!selectedAudioFile) {
                alert('请选择要转录的音频文件');
                return;
            }
            
            // 获取Token配置
            const tokenOption = document.querySelector('input[name="tokenOption"]:checked').value;
            const customToken = document.getElementById('tokenInput').value;
            
            if (tokenOption === 'custom' && !customToken.trim()) {
                alert('请输入自定义Token');
                return;
            }
            
            // 重置状态
            transcriptionResult.style.display = 'block';
            transcriptionLoading.style.display = 'block';
            transcriptionSuccess.style.display = 'none';
            transcriptionError.style.display = 'none';
            transcribeBtn.disabled = true;
            transcribeBtn.textContent = '转录中...';
            
            // 更新加载提示
            const loadingText = document.getElementById('transcriptionLoadingText');
            const progressInfo = document.getElementById('transcriptionProgressInfo');
            loadingText.textContent = '正在转录音频，请稍候...';
            progressInfo.textContent = '文件: ' + selectedAudioFile.name + ' (' + formatFileSize(selectedAudioFile.size) + ')';
            
            try {
                // 构建FormData
                const formData = new FormData();
                formData.append('file', selectedAudioFile);
                
                if (tokenOption === 'custom') {
                    formData.append('token', customToken);
                }
                
                const response = await fetch('/v1/audio/transcriptions', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || '转录失败');
                }
                
                const result = await response.json();
                
                // 显示转录结果
                document.getElementById('transcriptionText').value = result.text || '';
                transcriptionLoading.style.display = 'none';
                transcriptionSuccess.style.display = 'block';
                
            } catch (err) {
                transcriptionLoading.style.display = 'none';
                transcriptionError.style.display = 'block';
                transcriptionError.textContent = '错误: ' + err.message;
            } finally {
                transcribeBtn.disabled = false;
                transcribeBtn.innerHTML = '<span>🎧</span><span>开始语音转录</span>';
            }
        });

        // 复制转录结果
        document.getElementById('copyTranscriptionBtn').addEventListener('click', function() {
            const transcriptionText = document.getElementById('transcriptionText');
            transcriptionText.select();
            document.execCommand('copy');
            
            // 临时改变按钮文本
            const originalText = this.innerHTML;
            this.innerHTML = '<span>✅</span><span>已复制</span>';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });

        // 编辑转录结果
        document.getElementById('editTranscriptionBtn').addEventListener('click', function() {
            const transcriptionText = document.getElementById('transcriptionText');
            const isReadonly = transcriptionText.readOnly;
            
            if (isReadonly) {
                transcriptionText.readOnly = false;
                transcriptionText.focus();
                this.innerHTML = '<span>💾</span><span>保存编辑</span>';
            } else {
                transcriptionText.readOnly = true;
                this.innerHTML = '<span>✏️</span><span>编辑文本</span>';
            }
        });

        // 转为语音功能
        document.getElementById('useForTtsBtn').addEventListener('click', function() {
            const transcriptionText = document.getElementById('transcriptionText').value;
            
            if (!transcriptionText.trim()) {
                alert('转录结果为空，无法转换为语音');
                return;
            }
            
            // 切换到TTS模式
            switchMode('tts');
            
            // 将转录文本填入TTS文本框
            document.getElementById('text').value = transcriptionText;
            
            // 滚动到TTS区域
            document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
        });

        // 初始化国际化
        function initializeI18n() {
            // 检查本地存储中的语言设置
            const savedLang = localStorage.getItem('voicecraft-language');
            
            if (savedLang && translations[savedLang]) {
                currentLanguage = savedLang;
            } else {
                // 自动检测浏览器语言
                currentLanguage = detectLanguage();
            }
            
            // 应用语言设置
            setLanguage(currentLanguage);
        }

        // 初始化语言切换器
        function initializeLanguageSwitcher() {
            const languageBtn = document.getElementById('languageBtn');
            const languageDropdown = document.getElementById('languageDropdown');

            // 切换下拉菜单显示/隐藏
            languageBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                languageDropdown.classList.toggle('show');
            });

            // 点击页面其他地方时隐藏下拉菜单
            document.addEventListener('click', function() {
                languageDropdown.classList.remove('show');
            });

            // 语言选择
            document.querySelectorAll('.language-option').forEach(option => {
                option.addEventListener('click', function() {
                    const selectedLang = this.getAttribute('data-lang');
                    setLanguage(selectedLang);
                    languageDropdown.classList.remove('show');
                });
            });
        }
    </script>
</body>
</html>
`;

export default {
    async fetch(request, env, ctx) {
        return handleRequest(request, env);
    }
};

const DEFAULT_API_KEY = "less11111";
const API_KEY_ENV_KEYS = ["LESS_TTS_API_KEY", "API_KEY"];

async function handleRequest(request, env = {}) {
    if (request.method === "OPTIONS") {
        return handleOptions(request);
    }




    const requestUrl = new URL(request.url);
    const path = requestUrl.pathname;

    // 返回前端页面
    if (path === "/" || path === "/index.html") {
        return new Response(HTML_PAGE, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                ...makeCORSHeaders()
            }
        });
    }

    if (path === "/v1/audio/transcriptions") {
        try {
            return await handleAudioTranscription(request);
        } catch (error) {
            console.error("Audio transcription error:", error);
            return new Response(JSON.stringify({
                error: {
                    message: error.message,
                    type: "api_error",
                    param: null,
                    code: "transcription_error"
                }
            }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }
    }

    if (path === "/v1/audio/speech/timeline") {
        const authResponse = authenticateSpeechRequest(request, env);
        if (authResponse) {
            return authResponse;
        }

        try {
            return await handleSpeechTimeline(request);
        } catch (error) {
            console.error("Speech timeline error:", error);
            return new Response(JSON.stringify({
                error: {
                    message: error.message,
                    type: "api_error",
                    param: null,
                    code: "speech_timeline_error"
                }
            }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }
    }

    if (path === "/v1/audio/speech") {
        const authResponse = authenticateSpeechRequest(request, env);
        if (authResponse) {
            return authResponse;
        }

        try {
            const contentType = request.headers.get("content-type") || "";
            
            // 处理文件上传
            if (contentType.includes("multipart/form-data")) {
                return await handleFileUpload(request);
            }
            
            // 处理JSON请求（原有功能）
            const requestBody = await request.json();
            const {
                input,
                voice = "zh-CN-XiaoxiaoNeural",
                speed = '1.0',
                volume = '0',
                pitch = '0',
                style = "general"
            } = requestBody;

            let rate = parseInt(String((parseFloat(speed) - 1.0) * 100));
            let numVolume = parseInt(String(parseFloat(volume) * 100));
            let numPitch = parseInt(pitch);
            const response = await getVoice(
                input,
                voice,
                rate >= 0 ? `+${rate}%` : `${rate}%`,
                numPitch >= 0 ? `+${numPitch}Hz` : `${numPitch}Hz`,
                numVolume >= 0 ? `+${numVolume}%` : `${numVolume}%`,
                style,
                "audio-24khz-48kbitrate-mono-mp3"
            );

            return response;

        } catch (error) {
            console.error("Error:", error);
            return new Response(JSON.stringify({
                error: {
                    message: error.message,
                    type: "api_error",
                    param: null,
                    code: "edge_tts_error"
                }
            }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }
    }

    // 默认返回 404
    return new Response("Not Found", { status: 404 });
}

function authenticateSpeechRequest(request, env) {
    const expectedApiKey = getConfiguredApiKey(env);
    const requestApiKey = readApiKey(request);

    if (requestApiKey === expectedApiKey) {
        return null;
    }

    return new Response(JSON.stringify({
        error: {
            message: "Invalid API key",
            type: "invalid_request_error",
            param: "x-api-key",
            code: "invalid_api_key"
        }
    }), {
        status: 401,
        headers: {
            "Content-Type": "application/json",
            ...makeCORSHeaders()
        }
    });
}

function getConfiguredApiKey(env = {}) {
    for (const key of API_KEY_ENV_KEYS) {
        const value = env && env[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return DEFAULT_API_KEY;
}

function readApiKey(request) {
    const headerApiKey = request.headers.get("x-api-key");
    if (headerApiKey && headerApiKey.trim()) {
        return headerApiKey.trim();
    }

    const authorization = request.headers.get("authorization") || "";
    const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
    return bearerMatch ? bearerMatch[1].trim() : "";
}

async function handleOptions(request) {
    return new Response(null, {
        status: 204,
        headers: {
            ...makeCORSHeaders(),
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Content-Type, x-api-key, Authorization"
        }
    });
}

// 添加延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleSpeechTimeline(request) {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return new Response(JSON.stringify({
            error: {
                message: "speech timeline only supports JSON requests",
                type: "invalid_request_error",
                param: "content-type",
                code: "invalid_content_type"
            }
        }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
                ...makeCORSHeaders()
            }
        });
    }

    const requestBody = await request.json();
    const {
        input,
        voice = "zh-CN-XiaoxiaoNeural",
        speed = "1.0",
        volume = "0",
        pitch = "0",
        boundary = "sentence"
    } = requestBody;

    let rate = parseInt(String((parseFloat(speed) - 1.0) * 100));
    let numVolume = parseInt(String(parseFloat(volume) * 100));
    let numPitch = parseInt(pitch);
    const normalizedBoundary = normalizeTimelineBoundary(boundary);

    const result = await getVoiceWithTimeline(
        input,
        voice,
        rate >= 0 ? `+${rate}%` : `${rate}%`,
        numPitch >= 0 ? `+${numPitch}Hz` : `${numPitch}Hz`,
        numVolume >= 0 ? `+${numVolume}%` : `${numVolume}%`,
        EDGE_TTS_OUTPUT_FORMAT,
        normalizedBoundary
    );

    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type": "application/json",
            ...makeCORSHeaders()
        }
    });
}

function normalizeTimelineBoundary(boundary) {
    const value = String(boundary || "sentence").toLowerCase();
    if (value === "sentence" || value === "word" || value === "all") {
        return value;
    }
    throw new Error("boundary must be sentence, word, or all");
}

async function getVoiceWithTimeline(text, voiceName, rate, pitch, volume, outputFormat, boundary) {
    const cleanText = removeIncompatibleCharacters(String(text || "").trim());
    if (!cleanText) {
        throw new Error("文本内容为空");
    }

    const escapedText = escapeXmlText(cleanText);
    const chunks = splitEscapedTextByByteLength(escapedText, EDGE_TTS_MAX_ESCAPED_TEXT_BYTES);
    if (chunks.length > EDGE_TTS_MAX_CHUNKS) {
        throw new Error(`文本过长，分块数量(${chunks.length})超过限制。请缩短文本或分批处理。`);
    }

    const audioChunks = [];
    const timeline = [];
    let offsetTicks = 0;

    for (const chunk of chunks) {
        const result = await getEdgeAudioChunkWithTimeline(
            chunk,
            voiceName,
            rate,
            pitch,
            volume,
            outputFormat,
            boundary
        );

        audioChunks.push(result.audio);
        for (const item of result.timeline) {
            const startTicks = offsetTicks + item.rawOffsetTicks;
            const durationTicks = item.rawDurationTicks;
            timeline.push({
                type: item.type,
                text: item.text,
                startMs: ticksToMs(startTicks),
                endMs: ticksToMs(startTicks + durationTicks),
                durationMs: ticksToMs(durationTicks),
                offsetTicks: startTicks,
                durationTicks
            });
        }

        offsetTicks += estimateCbrMp3DurationTicks(result.audio.byteLength);
    }

    const audioBytes = concatUint8Arrays(audioChunks);
    const rangedTimeline = normalizeTimelineForPlayback(attachTextRanges(timeline, cleanText));

    return {
        audio: await bytesToBase64(audioBytes),
        mimeType: "audio/mpeg",
        format: "mp3",
        voice: voiceName,
        boundary,
        durationMs: ticksToMs(offsetTicks),
        timeline: rangedTimeline
    };
}

async function getEdgeAudioChunkWithTimeline(escapedText, voiceName, rate, pitch, volume, outputFormat, boundary) {
    return new Promise(async (resolve, reject) => {
        let websocket;
        let settled = false;
        const audioChunks = [];
        const timeline = [];

        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                try {
                    websocket && websocket.close();
                } catch (_) {}
                reject(new Error("Edge TTS WebSocket request timed out"));
            }
        }, EDGE_TTS_TIMEOUT_MS);

        const finish = () => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeout);
            try {
                websocket && websocket.close();
            } catch (_) {}
            resolve({
                audio: concatUint8Arrays(audioChunks),
                timeline
            });
        };

        const fail = (error) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeout);
            try {
                websocket && websocket.close();
            } catch (_) {}
            reject(error);
        };

        try {
            const connectionId = uuid();
            websocket = await openEdgeTtsWebSocket(connectionId);

            websocket.addEventListener("message", (event) => {
                handleEdgeTtsMessage(event.data, audioChunks, timeline)
                    .then((path) => {
                        if (path === "turn.end") {
                            finish();
                        }
                    })
                    .catch(fail);
            });

            websocket.addEventListener("error", () => {
                fail(new Error("Edge TTS WebSocket error"));
            });

            websocket.addEventListener("close", () => {
                if (!settled) {
                    fail(new Error("Edge TTS WebSocket closed before turn.end"));
                }
            });

            const requestId = uuid();
            websocket.send(getSpeechConfigMessage(outputFormat, boundary));
            websocket.send(getEdgeSsmlMessage(requestId, escapedText, voiceName, rate, pitch, volume));
        } catch (error) {
            fail(error);
        }
    });
}

async function openEdgeTtsWebSocket(connectionId) {
    const secMsGec = await generateSecMsGec();
    const url = `${EDGE_TTS_HTTPS_URL}&ConnectionId=${connectionId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${EDGE_TTS_SEC_MS_GEC_VERSION}`;
    const response = await fetch(url, {
        headers: {
            "Upgrade": "websocket",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "User-Agent": getEdgeUserAgent(),
            "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
            "Cookie": `muid=${randomHex(16)};`
        }
    });

    if (response.status !== 101 || !response.webSocket) {
        throw new Error(`Edge TTS WebSocket connection failed: ${response.status}`);
    }

    const websocket = response.webSocket;
    websocket.accept();
    return websocket;
}

function getSpeechConfigMessage(outputFormat, boundary) {
    const sentenceBoundaryEnabled = boundary === "sentence" || boundary === "all";
    const wordBoundaryEnabled = boundary === "word" || boundary === "all";
    return [
        `X-Timestamp:${edgeDateString()}`,
        "Content-Type:application/json; charset=utf-8",
        "Path:speech.config",
        "",
        JSON.stringify({
            context: {
                synthesis: {
                    audio: {
                        metadataoptions: {
                            sentenceBoundaryEnabled: String(sentenceBoundaryEnabled),
                            wordBoundaryEnabled: String(wordBoundaryEnabled)
                        },
                        outputFormat
                    }
                }
            }
        })
    ].join("\r\n");
}

function getEdgeSsmlMessage(requestId, escapedText, voiceName, rate, pitch, volume) {
    return [
        `X-RequestId:${requestId}`,
        "Content-Type:application/ssml+xml",
        `X-Timestamp:${edgeDateString()}Z`,
        "Path:ssml",
        "",
        getEdgeSsmlFromEscapedText(escapedText, voiceName, rate, pitch, volume)
    ].join("\r\n");
}

function getEdgeSsmlFromEscapedText(escapedText, voiceName, rate, pitch, volume) {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">` +
        `<voice name="${voiceName}">` +
        `<prosody rate="${rate}" pitch="${pitch}" volume="${volume}">${escapedText}</prosody>` +
        `</voice>` +
        `</speak>`;
}

async function handleEdgeTtsMessage(data, audioChunks, timeline) {
    if (typeof data === "string") {
        const { headers, body } = parseEdgeTextFrame(data);
        const path = headers.Path || "";
        if (path === "audio.metadata") {
            timeline.push(...parseEdgeMetadata(body));
        }
        return path;
    }

    const bytes = await toUint8Array(data);
    const { headers, body } = parseEdgeBinaryFrame(bytes);
    const path = headers.Path || "";
    if (path === "audio" && body.byteLength > 0) {
        audioChunks.push(body);
    }
    return path;
}

function parseEdgeTextFrame(text) {
    const separatorIndex = text.indexOf("\r\n\r\n");
    if (separatorIndex === -1) {
        return { headers: {}, body: "" };
    }

    return {
        headers: parseEdgeHeaders(text.slice(0, separatorIndex)),
        body: text.slice(separatorIndex + 4)
    };
}

function parseEdgeBinaryFrame(bytes) {
    if (bytes.byteLength < 2) {
        return { headers: {}, body: bytes };
    }

    const headerLength = (bytes[0] << 8) + bytes[1];
    const preferredHeaderStart = 2;
    const preferredHeaderEnd = preferredHeaderStart + headerLength;

    if (preferredHeaderEnd <= bytes.byteLength) {
        const headers = parseEdgeHeaders(new TextDecoder().decode(bytes.slice(preferredHeaderStart, preferredHeaderEnd)));
        if (headers.Path) {
            return {
                headers,
                body: bytes.slice(preferredHeaderEnd)
            };
        }
    }

    const fallbackHeaderEnd = Math.min(headerLength, bytes.byteLength);
    return {
        headers: parseEdgeHeaders(new TextDecoder().decode(bytes.slice(0, fallbackHeaderEnd))),
        body: bytes.slice(Math.min(fallbackHeaderEnd + 2, bytes.byteLength))
    };
}

function parseEdgeHeaders(headerText) {
    const headers = {};
    for (const line of headerText.split("\r\n")) {
        const index = line.indexOf(":");
        if (index > 0) {
            headers[line.slice(0, index)] = line.slice(index + 1);
        }
    }
    return headers;
}

function parseEdgeMetadata(body) {
    if (!body) {
        return [];
    }

    const parsed = JSON.parse(body);
    const items = Array.isArray(parsed.Metadata) ? parsed.Metadata : [];
    return items.map((item) => {
        const data = item.Data || {};
        const textInfo = data.text || data.Text || {};
        const rawType = String(item.Type || "").replace(/Boundary$/i, "").toLowerCase();
        return {
            type: rawType || "boundary",
            text: unescapeXmlText(String(textInfo.Text || textInfo.text || data.Text || "")),
            rawOffsetTicks: Number(data.Offset || 0),
            rawDurationTicks: Number(data.Duration || 0)
        };
    }).filter((item) => item.text || item.type === "punctuation");
}

function unescapeXmlText(text) {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
}

function attachTextRanges(timeline, text) {
    let cursor = 0;
    return timeline.map((item) => {
        const value = item.text || "";
        let textStart = -1;
        let textEnd = -1;

        if (value) {
            textStart = text.indexOf(value, cursor);
            if (textStart === -1) {
                textStart = text.indexOf(value.trim(), cursor);
            }

            if (textStart !== -1) {
                textEnd = textStart + value.length;
                cursor = textEnd;
            }
        }

        return {
            ...item,
            textStart,
            textEnd
        };
    });
}

function normalizeTimelineForPlayback(timeline) {
    const result = timeline.map((item) => ({ ...item }));
    const lastIndexByType = {};

    for (let i = 0; i < result.length; i++) {
        const item = result[i];
        const previousIndex = lastIndexByType[item.type];
        if (previousIndex !== undefined) {
            const previous = result[previousIndex];
            if (previous.endMs > item.startMs) {
                previous.endMs = item.startMs;
                previous.durationMs = Math.max(0, previous.endMs - previous.startMs);
                previous.durationTicks = Math.round((previous.durationMs / 1000) * EDGE_TTS_TICKS_PER_SECOND);
            }
        }
        lastIndexByType[item.type] = i;
    }

    return result;
}

function splitEscapedTextByByteLength(text, maxBytes) {
    const chunks = [];
    let current = "";
    let currentBytes = 0;

    for (const token of xmlSafeTokens(text)) {
        const tokenBytes = utf8ByteLength(token);
        if (current && currentBytes + tokenBytes > maxBytes) {
            chunks.push(current);
            current = "";
            currentBytes = 0;
        }
        current += token;
        currentBytes += tokenBytes;
    }

    if (current) {
        chunks.push(current);
    }

    return chunks;
}

function xmlSafeTokens(text) {
    const tokens = [];
    for (let i = 0; i < text.length;) {
        if (text[i] === "&") {
            const entityEnd = text.indexOf(";", i + 1);
            if (entityEnd !== -1 && entityEnd - i <= 10) {
                tokens.push(text.slice(i, entityEnd + 1));
                i = entityEnd + 1;
                continue;
            }
        }

        const codePoint = text.codePointAt(i);
        const token = String.fromCodePoint(codePoint);
        tokens.push(token);
        i += token.length;
    }
    return tokens;
}

function utf8ByteLength(text) {
    return new TextEncoder().encode(text).byteLength;
}

function removeIncompatibleCharacters(text) {
    let result = "";
    for (const char of text) {
        const codePoint = char.codePointAt(0);
        if (
            codePoint === 0x09 ||
            codePoint === 0x0A ||
            codePoint === 0x0D ||
            (codePoint >= 0x20 && codePoint <= 0xD7FF) ||
            (codePoint >= 0xE000 && codePoint <= 0xFFFD) ||
            (codePoint >= 0x10000 && codePoint <= 0x10FFFF)
        ) {
            result += char;
        }
    }
    return result;
}

async function generateSecMsGec() {
    let ticks = Math.floor(Date.now() / 1000) + WINDOWS_EPOCH_SECONDS;
    ticks -= ticks % 300;
    const windowsTicks = Math.floor(ticks * EDGE_TTS_TICKS_PER_SECOND);
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(`${windowsTicks}${EDGE_TTS_TRUSTED_CLIENT_TOKEN}`)
    );
    return bytesToHex(new Uint8Array(digest)).toUpperCase();
}

function randomHex(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes).toUpperCase();
}

function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function edgeDateString() {
    return new Date().toString();
}

function getEdgeUserAgent() {
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${EDGE_TTS_CHROMIUM_FULL_VERSION} Safari/537.36 Edg/${EDGE_TTS_CHROMIUM_MAJOR_VERSION}.0.0.0`;
}

function ticksToMs(ticks) {
    return Math.round((ticks / EDGE_TTS_TICKS_PER_SECOND) * 1000);
}

function estimateCbrMp3DurationTicks(byteLength) {
    return Math.round((byteLength * 8 * EDGE_TTS_TICKS_PER_SECOND) / EDGE_TTS_MP3_BITRATE_BPS);
}

function concatUint8Arrays(chunks) {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return result;
}

async function toUint8Array(data) {
    if (data instanceof Uint8Array) {
        return data;
    }
    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }
    if (data instanceof Blob) {
        return new Uint8Array(await data.arrayBuffer());
    }
    return new Uint8Array(data);
}

// 优化文本分块函数
function optimizedTextSplit(text, maxChunkSize = 1500) {
    const chunks = [];
    const sentences = text.split(/[。！？\n]/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;
        
        // 如果单个句子就超过最大长度，按字符分割
        if (trimmedSentence.length > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            // 按字符分割长句子
            for (let i = 0; i < trimmedSentence.length; i += maxChunkSize) {
                chunks.push(trimmedSentence.slice(i, i + maxChunkSize));
            }
        } else if ((currentChunk + trimmedSentence).length > maxChunkSize) {
            // 当前块加上新句子会超过限制，先保存当前块
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = trimmedSentence;
        } else {
            // 添加到当前块
            currentChunk += (currentChunk ? '。' : '') + trimmedSentence;
        }
    }
    
    // 添加最后一个块
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 0);
}

// 批量处理音频块
async function processBatchedAudioChunks(chunks, voiceName, rate, pitch, volume, style, outputFormat, batchSize = 3, delayMs = 1000) {
    const audioChunks = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchPromises = batch.map(async (chunk, index) => {
            try {
                // 为每个请求添加小延迟，避免同时发送
                if (index > 0) {
                    await delay(index * 200);
                }
                return await getAudioChunk(chunk, voiceName, rate, pitch, volume, style, outputFormat);
            } catch (error) {
                console.error(`处理音频块失败 (批次 ${Math.floor(i/batchSize) + 1}, 块 ${index + 1}):`, error);
                throw error;
            }
        });
        
        try {
            const batchResults = await Promise.all(batchPromises);
            audioChunks.push(...batchResults);
            
            // 批次间延迟
            if (i + batchSize < chunks.length) {
                await delay(delayMs);
            }
        } catch (error) {
            console.error(`批次处理失败:`, error);
            throw error;
        }
    }
    
    return audioChunks;
}

async function getVoice(text, voiceName = "zh-CN-XiaoxiaoNeural", rate = '+0%', pitch = '+0Hz', volume = '+0%', style = "general", outputFormat = "audio-24khz-48kbitrate-mono-mp3") {
    try {
        // 文本预处理
        const cleanText = text.trim();
        if (!cleanText) {
            throw new Error("文本内容为空");
        }
        
        // 如果文本很短，直接处理
        if (cleanText.length <= 1500) {
            const audioBlob = await getAudioChunk(cleanText, voiceName, rate, pitch, volume, style, outputFormat);
            return new Response(audioBlob, {
                headers: {
                    "Content-Type": "audio/mpeg",
                    ...makeCORSHeaders()
                }
            });
        }

        // 优化的文本分块
        const chunks = optimizedTextSplit(cleanText, 1500);
        
        // 检查分块数量，防止超过CloudFlare限制
        if (chunks.length > 40) {
            throw new Error(`文本过长，分块数量(${chunks.length})超过限制。请缩短文本或分批处理。`);
        }
        
        console.log(`文本已分为 ${chunks.length} 个块进行处理`);

        // 批量处理音频块，控制并发数量和频率
        const audioChunks = await processBatchedAudioChunks(
            chunks, 
            voiceName, 
            rate, 
            pitch, 
            volume, 
            style, 
            outputFormat,
            3,  // 每批处理3个
            800 // 批次间延迟800ms
        );

        // 将音频片段拼接起来
        const concatenatedAudio = new Blob(audioChunks, { type: 'audio/mpeg' });
        return new Response(concatenatedAudio, {
            headers: {
                "Content-Type": "audio/mpeg",
                ...makeCORSHeaders()
            }
        });

    } catch (error) {
        console.error("语音合成失败:", error);
        return new Response(JSON.stringify({
            error: {
                message: error.message || String(error),
                type: "api_error",
                param: `${voiceName}, ${rate}, ${pitch}, ${volume}, ${style}, ${outputFormat}`,
                code: "edge_tts_error"
            }
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                ...makeCORSHeaders()
            }
        });
    }
}



//获取单个音频数据（增强错误处理和重试机制）
async function getAudioChunk(text, voiceName, rate, pitch, volume, style, outputFormat = 'audio-24khz-48kbitrate-mono-mp3', maxRetries = 3) {
    const retryDelay = 500; // 重试延迟500ms
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const endpoint = await getEndpoint();
            const url = `https://${endpoint.r}.tts.speech.microsoft.com/cognitiveservices/v1`;
            
            // 处理文本中的延迟标记
            let m = text.match(/\[(\d+)\]\s*?$/);
            let slien = 0;
            if (m && m.length == 2) {
                slien = parseInt(m[1]);
                text = text.replace(m[0], '');
            }
            
            // 验证文本长度
            if (!text.trim()) {
                throw new Error("文本块为空");
            }
            
            if (text.length > 2000) {
                throw new Error(`文本块过长: ${text.length} 字符，最大支持2000字符`);
            }
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": endpoint.t,
                    "Content-Type": "application/ssml+xml",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
                    "X-Microsoft-OutputFormat": outputFormat
                },
                body: getSsml(text, voiceName, rate, pitch, volume, style, slien)
            });

            if (!response.ok) {
                const errorText = await response.text();
                
                // 根据错误类型决定是否重试
                if (response.status === 429) {
                    // 频率限制，需要重试
                    if (attempt < maxRetries) {
                        console.log(`频率限制，第${attempt + 1}次重试，等待${retryDelay * (attempt + 1)}ms`);
                        await delay(retryDelay * (attempt + 1));
                        continue;
                    }
                    throw new Error(`请求频率过高，已重试${maxRetries}次仍失败`);
                } else if (response.status >= 500) {
                    // 服务器错误，可以重试
                    if (attempt < maxRetries) {
                        console.log(`服务器错误，第${attempt + 1}次重试，等待${retryDelay * (attempt + 1)}ms`);
                        await delay(retryDelay * (attempt + 1));
                        continue;
                    }
                    throw new Error(`Edge TTS服务器错误: ${response.status} ${errorText}`);
                } else {
                    // 客户端错误，不重试
                    throw new Error(`Edge TTS API错误: ${response.status} ${errorText}`);
                }
            }

            return await response.blob();
            
        } catch (error) {
            if (attempt === maxRetries) {
                // 最后一次重试失败
                throw new Error(`音频生成失败（已重试${maxRetries}次）: ${error.message}`);
            }
            
            // 如果是网络错误或其他可重试错误
            if (error.message.includes('fetch') || error.message.includes('network')) {
                console.log(`网络错误，第${attempt + 1}次重试，等待${retryDelay * (attempt + 1)}ms`);
                await delay(retryDelay * (attempt + 1));
                continue;
            }
            
            // 其他错误直接抛出
            throw error;
        }
    }
}

// XML文本转义函数
function escapeXmlText(text) {
    return text
        .replace(/&/g, '&amp;')   // 必须首先处理 &
        .replace(/</g, '&lt;')    // 处理 <
        .replace(/>/g, '&gt;')    // 处理 >
        .replace(/"/g, '&quot;')  // 处理 "
        .replace(/'/g, '&apos;'); // 处理 '
}

function getSsml(text, voiceName, rate, pitch, volume, style, slien = 0) {
    // 对文本进行XML转义
    const escapedText = escapeXmlText(text);
    
    let slien_str = '';
    if (slien > 0) {
        slien_str = `<break time="${slien}ms" />`
    }
    return `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0" xml:lang="zh-CN"> 
                <voice name="${voiceName}"> 
                    <mstts:express-as style="${style}"  styledegree="2.0" role="default" > 
                        <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">${escapedText}</prosody> 
                    </mstts:express-as> 
                    ${slien_str}
                </voice> 
            </speak>`;

}

async function getEndpoint() {
    const now = Date.now() / 1000;

    if (tokenInfo.token && tokenInfo.expiredAt && now < tokenInfo.expiredAt - TOKEN_REFRESH_BEFORE_EXPIRY) {
        return tokenInfo.endpoint;
    }

    // 获取新token
    const endpointUrl = "https://dev.microsofttranslator.com/apps/endpoint?api-version=1.0";
    const clientId = crypto.randomUUID().replace(/-/g, "");

    try {
        const response = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                "Accept-Language": "zh-Hans",
                "X-ClientVersion": "4.0.530a 5fe1dc6c",
                "X-UserId": "0f04d16a175c411e",
                "X-HomeGeographicRegion": "zh-Hans-CN",
                "X-ClientTraceId": clientId,
                "X-MT-Signature": await sign(endpointUrl),
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
                "Content-Type": "application/json; charset=utf-8",
                "Content-Length": "0",
                "Accept-Encoding": "gzip"
            }
        });

        if (!response.ok) {
            throw new Error(`获取endpoint失败: ${response.status}`);
        }

        const data = await response.json();
        const jwt = data.t.split(".")[1];
        const decodedJwt = JSON.parse(atob(jwt));

        tokenInfo = {
            endpoint: data,
            token: data.t,
            expiredAt: decodedJwt.exp
        };

        return data;

    } catch (error) {
        console.error("获取endpoint失败:", error);
        // 如果有缓存的token，即使过期也尝试使用
        if (tokenInfo.token) {
            console.log("使用过期的缓存token");
            return tokenInfo.endpoint;
        }
        throw error;
    }
}



function makeCORSHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
        "Access-Control-Max-Age": "86400"
    };
}

async function hmacSha256(key, data) {
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
    return new Uint8Array(signature);
}

async function base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

function uuid() {
    return crypto.randomUUID().replace(/-/g, "");
}

async function sign(urlStr) {
    const url = urlStr.split("://")[1];
    const encodedUrl = encodeURIComponent(url);
    const uuidStr = uuid();
    const formattedDate = dateFormat();
    const bytesToSign = `MSTranslatorAndroidApp${encodedUrl}${formattedDate}${uuidStr}`.toLowerCase();
    const decode = await base64ToBytes("oik6PdDdMnOXemTbwvMn9de/h9lFnfBaCWbGMMZqqoSaQaqUOqjVGm5NqsmjcBI1x+sS9ugjB55HEJWRiFXYFw==");
    const signData = await hmacSha256(decode, bytesToSign);
    const signBase64 = await bytesToBase64(signData);
    return `MSTranslatorAndroidApp::${signBase64}::${formattedDate}::${uuidStr}`;
}

function dateFormat() {
    const formattedDate = (new Date()).toUTCString().replace(/GMT/, "").trim() + " GMT";
    return formattedDate.toLowerCase();
}

// 处理文件上传的函数
async function handleFileUpload(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const voice = formData.get('voice') || 'zh-CN-XiaoxiaoNeural';
        const speed = formData.get('speed') || '1.0';
        const volume = formData.get('volume') || '0';
        const pitch = formData.get('pitch') || '0';
        const style = formData.get('style') || 'general';

        // 验证文件
        if (!file) {
            return new Response(JSON.stringify({
                error: {
                    message: "未找到上传的文件",
                    type: "invalid_request_error",
                    param: "file",
                    code: "missing_file"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 验证文件类型
        if (!file.type.includes('text/') && !file.name.toLowerCase().endsWith('.txt')) {
            return new Response(JSON.stringify({
                error: {
                    message: "不支持的文件类型，请上传txt文件",
                    type: "invalid_request_error",
                    param: "file",
                    code: "invalid_file_type"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 验证文件大小（限制为500KB）
        if (file.size > 500 * 1024) {
            return new Response(JSON.stringify({
                error: {
                    message: "文件大小超过限制（最大500KB）",
                    type: "invalid_request_error",
                    param: "file",
                    code: "file_too_large"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 读取文件内容
        const text = await file.text();
        
        // 验证文本内容
        if (!text.trim()) {
            return new Response(JSON.stringify({
                error: {
                    message: "文件内容为空",
                    type: "invalid_request_error",
                    param: "file",
                    code: "empty_file"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 文本长度限制（10000字符）
        if (text.length > 10000) {
            return new Response(JSON.stringify({
                error: {
                    message: "文本内容过长（最大10000字符）",
                    type: "invalid_request_error",
                    param: "file",
                    code: "text_too_long"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 处理参数格式，与原有逻辑保持一致
        let rate = parseInt(String((parseFloat(speed) - 1.0) * 100));
        let numVolume = parseInt(String(parseFloat(volume) * 100));
        let numPitch = parseInt(pitch);

        // 调用TTS服务
        return await getVoice(
            text,
            voice,
            rate >= 0 ? `+${rate}%` : `${rate}%`,
            numPitch >= 0 ? `+${numPitch}Hz` : `${numPitch}Hz`,
            numVolume >= 0 ? `+${numVolume}%` : `${numVolume}%`,
            style,
            "audio-24khz-48kbitrate-mono-mp3"
        );

    } catch (error) {
        console.error("文件上传处理失败:", error);
        return new Response(JSON.stringify({
            error: {
                message: "文件处理失败",
                type: "api_error",
                param: null,
                code: "file_processing_error"
            }
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                ...makeCORSHeaders()
            }
        });
    }
}

// 处理语音转录的函数
async function handleAudioTranscription(request) {
    try {
        // 验证请求方法
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({
                error: {
                    message: "只支持POST方法",
                    type: "invalid_request_error",
                    param: "method",
                    code: "method_not_allowed"
                }
            }), {
                status: 405,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        const contentType = request.headers.get("content-type") || "";
        
        // 验证Content-Type
        if (!contentType.includes("multipart/form-data")) {
            return new Response(JSON.stringify({
                error: {
                    message: "请求必须使用multipart/form-data格式",
                    type: "invalid_request_error",
                    param: "content-type",
                    code: "invalid_content_type"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 解析FormData
        const formData = await request.formData();
        const audioFile = formData.get('file');
        const customToken = formData.get('token');

        // 验证音频文件
        if (!audioFile) {
            return new Response(JSON.stringify({
                error: {
                    message: "未找到音频文件",
                    type: "invalid_request_error",
                    param: "file",
                    code: "missing_file"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 验证文件大小（限制为10MB）
        if (audioFile.size > 10 * 1024 * 1024) {
            return new Response(JSON.stringify({
                error: {
                    message: "音频文件大小不能超过10MB",
                    type: "invalid_request_error",
                    param: "file",
                    code: "file_too_large"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 验证音频文件格式
        const allowedTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/aac',
            'audio/ogg', 'audio/webm', 'audio/amr', 'audio/3gpp'
        ];
        
        const isValidType = allowedTypes.some(type => 
            audioFile.type.includes(type) || 
            audioFile.name.toLowerCase().match(/\.(mp3|wav|m4a|flac|aac|ogg|webm|amr|3gp)$/i)
        );

        if (!isValidType) {
            return new Response(JSON.stringify({
                error: {
                    message: "不支持的音频文件格式，请上传mp3、wav、m4a、flac、aac、ogg、webm、amr或3gp格式的文件",
                    type: "invalid_request_error",
                    param: "file",
                    code: "invalid_file_type"
                }
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 使用默认token或用户提供的token
        const token = customToken || 'sk-wtldsvuprmwltxpbspbmawtolbacghzawnjhtlzlnujjkfhh';

        // 构建发送到硅基流动API的FormData
        const apiFormData = new FormData();
        apiFormData.append('file', audioFile);
        apiFormData.append('model', 'FunAudioLLM/SenseVoiceSmall');

        // 发送请求到硅基流动API
        const apiResponse = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: apiFormData
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('硅基流动API错误:', apiResponse.status, errorText);
            
            let errorMessage = '语音转录服务暂时不可用';
            
            if (apiResponse.status === 401) {
                errorMessage = 'API Token无效，请检查您的配置';
            } else if (apiResponse.status === 429) {
                errorMessage = '请求过于频繁，请稍后再试';
            } else if (apiResponse.status === 413) {
                errorMessage = '音频文件太大，请选择较小的文件';
            }

            return new Response(JSON.stringify({
                error: {
                    message: errorMessage,
                    type: "api_error",
                    param: null,
                    code: "transcription_api_error"
                }
            }), {
                status: apiResponse.status,
                headers: {
                    "Content-Type": "application/json",
                    ...makeCORSHeaders()
                }
            });
        }

        // 获取转录结果
        const transcriptionResult = await apiResponse.json();

        // 返回转录结果
        return new Response(JSON.stringify(transcriptionResult), {
            headers: {
                "Content-Type": "application/json",
                ...makeCORSHeaders()
            }
        });

    } catch (error) {
        console.error("语音转录处理失败:", error);
        return new Response(JSON.stringify({
            error: {
                message: "语音转录处理失败",
                type: "api_error",
                param: null,
                code: "transcription_processing_error"
            }
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                ...makeCORSHeaders()
            }
        });
    }
}
