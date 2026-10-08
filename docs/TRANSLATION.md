# Website language selector

The homepage language selector retrieves Google Cloud Translation's current supported-language catalog and translates visible page text on demand. English is the default. The Google API key is only read by server routes and must never be exposed as a `NEXT_PUBLIC_` variable.

## Configuration

1. Enable the Cloud Translation API in a Google Cloud project and configure billing, quotas, and API-key restrictions.
2. Add `GOOGLE_TRANSLATE_API_KEY` to `.env.local` (the file is ignored by Git). For Netlify, configure it as a server-side environment variable in the site's environment settings.
3. Restart the development server or redeploy the site after adding the key.

The searchable language list and page translation remain unavailable until the key is configured. The API routes enforce request size and batch limits; the key should additionally be restricted to the Cloud Translation API and monitored for quota and billing.

Before a language change is applied, the selector explains that visible page text—including personal details displayed in horoscope charts and reports—is sent to Google Cloud Translation and asks the visitor to confirm. Form fields, code blocks, and scripts are excluded from automatic translation.

Google Cloud Translation may charge for translated text. See Google's current Cloud Translation pricing and data-use terms before enabling the service in production.
