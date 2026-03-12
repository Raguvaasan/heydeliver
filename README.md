## installation guide

1. run `npm install --legacy-peer-deps` (Flowbite has a peer dependency issue).
2. **Important:** add a reCAPTCHA site key to `.env` before starting the
   server, otherwise login requests will be rejected.

   ```env
   VITE_ENV=dev
   VITE_API_URL=https://freightrekapi.vercel.app
   VITE_CAPTCHA_SITE_KEY=your_recaptcha_site_key_here
   # optional override for proxy target:
   # VITE_API_PROXY_TARGET=https://freightrekapi.vercel.app
   ```

3. change `GoThreeBars` to import `{ GoDotFill }` in
   `node_modules/flowbite-react/lib/esm/components/Navbar/NavbarToggle.js`.

4. start the dev server with `npm run dev`.

With the key in place the local application will behave the same as the
production build; without it you'll see a toast telling you to add the key.

### Additional Setup

* **CAPTCHA** – the login form now uses Google reCAPTCHA v3.  Create a site
  key and add it to your `.env` as `VITE_CAPTCHA_SITE_KEY`. Without this value
  the login endpoint will reject requests (404/400) and you will see errors in
  DevTools.
* **Dev proxy rewrite** – omit the `/api` prefix when calling the remote API.
  The `vite.config.ts` now rewrites paths automatically; keep
  `VITE_API_PROXY_TARGET` pointed at the backend (e.g. `https://freightrekapi.vercel.app`).
