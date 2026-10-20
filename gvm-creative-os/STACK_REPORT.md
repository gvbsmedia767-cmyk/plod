# GVM Creative OS — отчёт (20.10.2026)

## 1. Диагностика (проверено в этой сессии — Claude Code в облаке)
| Возможность | Статус |
|---|---|
| Веб-поиск, WebFetch | работает (huggingface.co и api.github.com из песочницы недоступны) |
| Создание файлов, выполнение кода | работает (Node 22, Python 3.13, ffmpeg 6.1, Chromium) |
| Рендер видео кодом | **проверено** (Remotion 4.0.537 → H.264 1920×1080/30) |
| Браузерное UI-тестирование | **проверено** (Playwright + Chromium) |
| GitHub | через MCP, только репозиторий `gvbsmedia767-cmyk/plod` |
| Connectors | подключённых нет (список пуст) |
| Skills GVM в аккаунте | **не установлены** — в списке только встроенные (docs, pdf, xlsx и др.) |
| GPU / DaVinci / Windows | недоступны из облака |

**Важно:** я не могу изменить настройки приложения Claude на вашем телефоне. Подготовлено всё, что можно, остальное — ваши нажатия (раздел 5).

## 2. Проверенные технологии (npm/PyPI реестры, 20.10.2026)
| Инструмент | Версия | Лицензия | Применение / риск |
|---|---|---|---|
| Remotion | 4.0.537 | собственная: бесплатно для частных лиц, компаний до 3 человек, НКО; иначе платная Company License (цена на remotion.pro) | React-видео; **проверено рендером**. Для GVM, если >3 сотрудников — купить лицензию |
| @remotion/captions | 4.0.537 | MIT | субтитры |
| HyperFrames (heygen-com) | pypi/npm `hyperframes` 0.8.181 | Apache-2.0 | HTML→MP4 через headless Chrome+FFmpeg; Node 22+; alpha не задокументирован |
| Motion Canvas | 3.17.2 | MIT | 2D-анимации под озвучку |
| Playwright / @playwright/mcp | 1.64.1 / 0.0.83 | Apache-2.0 | UI-тесты, браузерный MCP |
| three / react-three-fiber | 0.186.1 / 9.8.2 | MIT | 3D для веба |
| GSAP | 3.15.0 | «no charge» (gsap.com/standard-license) | веб-анимация; прочитать условия |
| lottie-web | 5.13.0 | MIT | Lottie |
| WhisperX | 3.8.6 | BSD-2 | транскрипция со словами; CUDA; diarization требует HF-доступ |
| faster-whisper | 1.2.1 | MIT | быстрая транскрипция на RTX 4060 Ti |
| silero-vad | 6.2.3 | MIT (по README, не проверено в реестре) | VAD |
| demucs | 4.1.0 | MIT | разделение стемов |
| pyloudnorm | 0.2.0 | MIT | замер LUFS |
| OpenTimelineIO | 0.18.1 | Apache-2.0 | обмен таймлайнами (EDL/AAF/XML) — мост к Resolve |
| SAM 2 | 1.1.0 | Apache-2.0 | маски/ротоскопия |
| rembg | 2.0.85 | MIT (код; веса моделей проверять отдельно) | вырезка фона |
| comfy-cli | 1.22.0 | GPL-3.0 | управление ComfyUI |
| blender-mcp (PyPI) | 2.0.0 | MIT | MCP для Blender; исполняет код — только по разрешению |
| DaVinci Resolve MCP | [lordhoell](https://github.com/lordhoell/davinci-resolve-mcp), [Tooflex](https://glama.ai/mcp/servers/Tooflex/davinci-resolve-mcp) | [не проверено] | сообщество, 5★; скриптинг API Resolve **требует Studio** — уточните, Studio ли у вас |
| Comfy-Org/comfy-mcp | beta (анонс 11.08.2026) | [не проверено] | официальный локальный MCP для ComfyUI |

Не подтверждено (HF недоступен из сессии, поиск вторичный): лицензии весов Wan/LTX/MatAnyone/SAM 3 — **проверять на карточках моделей перед клиентской работой**. RMBG-2.0 по вашей шорт-листе — некоммерческий. Для рото с чистой лицензией запасной вариант — Mocha Pro (платный). Каталог skills.sh напрямую не проверен; счётчики установок из сторонних каталогов ненадёжны.

## 3. Skills
8 Skills (video-director, motion-engineer, design-director, fullstack-engineer, ai-pipeline, audio-director, tool-scout, release-qa) лежат в `skills/`, ZIP в `dist/`. `python3 validate_skills.py` — все 8 PASS (структура, имя=папка, front matter). Загрузка и срабатывание в Claude **не проверены** (это возможно только в вашем аккаунте).

## 4. Реальные тесты
- `tests/remotion-lowerthird/` — анимированная плашка. `tsc` OK; рендер: H.264, 1920×1080, 30 fps, 150 кадров, 5.0 с, 198 КБ (`out/lowerthird.mp4`), контрольный кадр `out/frame.png` просмотрен — типографика, safe margin ок. Звука нет, alpha нет. Запуск: `npm i && npm run render`. Путь браузера в package.json — для этой песочницы, на Windows уберите `--browser-executable`.
- `tests/ui-prototype/` — адаптивный прототип без зависимостей. Playwright на 390/820/1440 px: 21/21 проверка (нет горизонтального скролла, цели ≥44 px, состояния, нет ошибок консоли); скриншоты `shot-*.png`.
- HyperFrames и Motion Canvas **не запускались** — только проверка пакетов.

## 5. Что нужно от вас
1. Claude app → Projects → создать проект, вставить `PROJECT_INSTRUCTIONS.md` в Project instructions.
2. Settings → Capabilities: включить code execution; Customize → Skills → загрузить ZIP из `dist/` по одному (если с телефона нельзя — в браузере).
3. Решить, Studio ли у вас DaVinci Resolve (нужно для скриптинга) и сколько человек в GVM (лицензия Remotion).
4. Для работы с ПК: настроить Claude Code локально по `CLAUDE_CODE_SETUP.md` — сейчас доступа к Windows нет.
5. Подтвердить, что `CLAUDE.md` в корне репозитория можно оставить (он копия project instructions).
