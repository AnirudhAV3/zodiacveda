# zodiacveda

## Self-hosted page translation

Page translation uses a locally or privately hosted LibreTranslate service; page and report text is sent to that configured service when a non-English language is selected. The searchable picker retains all 131 listed languages. The local Argos catalog currently has English-to-Hindi, Bengali and Urdu models for Indian languages; unsupported choices return an explicit error. Kannada, Telugu, Marathi, Gujarati, Tamil, Malayalam and other Indic targets require the separate IndicTrans model runtime.

1. Install LibreTranslate in Python: `py -m pip install libretranslate`.
2. Install only the translation models needed by the languages you want to support. For each language, the service must have an English-to-language model installed. Use LibreTranslate's Argos package installer and the upstream package index.
3. Start LibreTranslate in a separate terminal: `libretranslate --host 127.0.0.1 --port 5000 --threads 2 --disable-web-ui`.
4. Set `LIBRETRANSLATE_URL=http://127.0.0.1:5000` in the app server environment. In PowerShell, run `$env:LIBRETRANSLATE_URL = "http://127.0.0.1:5000"` before `npm.cmd run dev`.

For a deployment, host LibreTranslate privately and point `LIBRETRANSLATE_URL` at that instance; use `LIBRETRANSLATE_API_KEY` if it requires a key. To add Indian languages missing from Argos, the AI4Bharat IndicTrans2 model repository requires accepting its access conditions and authenticating the model download; then integrate its separate model runtime. Do not advertise unsupported translation as available.