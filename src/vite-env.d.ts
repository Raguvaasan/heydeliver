/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MAP_API_KEY: string
  readonly VITE_CAPTCHA_SITE_KEY: string
  readonly VITE_ENV: string
  readonly VITE_CLOUDFLARE_SITE_KEY: string
  readonly VITE_CLOUDFLARE_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
