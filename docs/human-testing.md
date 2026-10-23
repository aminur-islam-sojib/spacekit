# Human Testing Guide

This guide describes how to run and test Spacekit (SiteKit) locally and on a real Squarespace site during development.

---

## 1. Local Development Server (`npm run dev`)

Starts the esbuild watch process and spins up a local HTTP server at `http://localhost:5173` serving the `dist/` directory.

- **CORS:** Enabled (`Access-Control-Allow-Origin: *`) so Squarespace pages can fetch the script and assets.
- **Caching:** Disabled (`Cache-Control: no-store, no-cache, must-revalidate`) so every page refresh loads the latest build immediately.
- **Console Output:** Prints the exact `<script>` tag to paste into Squarespace Code Injection.

### To Run:
```bash
npm run dev
```

### Exact Code Injection Snippet (Local Dev):
```html
<script src="http://localhost:5173/sitekit.core.js" defer></script>
```

> [!NOTE]
> Modern browsers may block `http://` scripts on `https://` Squarespace sites due to mixed content restrictions. Use Chrome Local Overrides, a userscript extension, or the quick tunnel below.

---

## 2. Public HTTPS Tunnel (`npm run tunnel`)

When testing on mobile devices (e.g. iPhone Safari), remote browsers, or avoiding mixed-content warnings without local SSL certificates, you can create a temporary Cloudflare Quick Tunnel pointing to port 5173.

### To Run:
```bash
npm run tunnel
```

> [!WARNING]
> The quick tunnel generates a public `https://*.trycloudflare.com` URL. Anyone with this URL can access your local `dist/` build while the tunnel is active. Never expose production credentials or secrets through the tunnel.

### Code Injection Snippet (Tunnel):
Replace `YOUR-TUNNEL-URL` with the URL printed in the terminal:
```html
<script src="https://YOUR-TUNNEL-URL/sitekit.core.js" defer></script>
```

---

## 3. Minimal Boot Behavior (M0)

When `sitekit.core.js` loads in a visitor's browser:
1. It verifies that `?sitekit=off` is NOT present in the URL query string.
2. It sets `window.__SITEKIT__ = { version: "0.1.0" }`.
3. It emits a console log: `[SiteKit] core v0.1.0 loaded`.

If `?sitekit=off` is passed:
- Execution terminates immediately.
- No `window.__SITEKIT__` object is created.
- No console logs or DOM modifications are made.

---

## 4. Emergency Kill Switches

If injected code ever conflicts with the page or editor:
1. **URL Kill Switch:** Append `?sitekit=off` to the URL. This completely skips execution.
2. **Squarespace Safe Mode:** Append `/safe` after `/config` in the editor URL (e.g. `https://yoursite.squarespace.com/config/safe`) or toggle **"Disable Scripts in Preview"** in Settings. This halts all injected code entirely at the platform level.

