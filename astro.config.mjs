// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://crefolo.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    // /impressum.html instead of /impressum/index.html -> clean URLs without trailing slash
    format: 'file',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  vite: {
    server: {
      // During local development the booking API runs in `npm run api` (wrangler) on port 8787
      proxy: {
        '/api': 'http://127.0.0.1:8787',
      },
    },
  },
});
