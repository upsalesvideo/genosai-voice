# Genosai Voice

Голосовая диктовка для **macOS** и **Windows** с ИИ-исправлением текста.

Зажмите **Fn + Пробел** (Mac) или **Ctrl + Win** (Windows), скажите, отпустите — через 1–2 секунды готовый текст без ошибок появится там, где стоит курсор, в любой программе.

- **Ваш API-ключ** — Gemini, OpenAI, Groq, ElevenLabs или любой OpenAI-совместимый адрес (прокси, свой сервер). Никакой подписки: платите провайдеру напрямую, обычно это центы в день.
- **ИИ-корректор** — орфография, пунктуация, падежи, слова-паразиты, самоисправления («в среду, нет, в четверг» → «в четверг»), числа цифрами.
- **Офлайн-режим** — локальные модели Whisper / Parakeet без интернета.
- Личный словарь, история диктовок, режимы «держи и говори» и «нажал — нажал».

**Скачать:** [voice.bogatushin.ru](https://voice.bogatushin.ru) · [Releases](https://github.com/upsalesvideo/genosai-voice/releases/latest)

## Сборка

Установщики собирает GitHub Actions (`.github/workflows/genosai-release.yml`) при пуше тега `vX.Y.Z` — версия должна совпадать с `src-tauri/tauri.conf.json`. Локальная разработка — как в Handy: см. [BUILD.md](BUILD.md) и [README.handy.md](README.handy.md).

Главные отличия от Handy:
- `src-tauri/src/cloud_stt.rs` — облачное распознавание (OpenAI-совместимые, ElevenLabs, Gemini).
- `src-tauri/src/commands/cloud.rs` — команды настроек облака.
- `src/components/settings/cloud/`, `src/components/onboarding/CloudOnboarding.tsx` — интерфейс.
- Корректор по умолчанию — `genosai_corrector` в `src-tauri/src/settings.rs`.

## Благодарности и лицензия

Genosai Voice основан на открытом проекте [Handy](https://github.com/cjpais/Handy) (автор — CJ Pais) и распространяется по той же лицензии [MIT](LICENSE). Бренд и логотип Handy не используются.
