# Cloudflare Pages Deployment Guide

This project is fully configured for zero-configuration deployment to **Cloudflare Pages**, including:
1. **Single Page Application (SPA) routing** via `public/_redirects` (prevents 404s on browser reload).
2. **Native Cloudflare Pages Functions** in `/functions/api/generate-commentary.ts` (executes Gemini API serverless on Cloudflare's Edge without Node.js servers).
3. **Optimized caching & security headers** via `public/_headers`.

---

## Method 1: Deploy via Cloudflare Dashboard (Recommended)

1. Push this repository to **GitHub** or **GitLab**.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set the build configuration:
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)
5. **Environment Variables**:
   Under **Environment variables (advanced)**, add:
   - Variable name: `GEMINI_API_KEY`
   - Value: *(Your Gemini API key)*
   *(Note: Even without this key, the application automatically falls back to its deterministic ground-truth financial narrative engine).*
6. Click **Save and Deploy**.

---

## Method 2: Deploy via Wrangler CLI (Command Line)

If you prefer deploying directly from your terminal:

```bash
# 1. Build the production assets
npm run build

# 2. Deploy directly to Cloudflare Pages
npx wrangler pages deploy dist --project-name=xero-ai-reporting
```

To bind your Gemini API key secret in Wrangler:
```bash
npx wrangler pages secret put GEMINI_API_KEY --project-name=xero-ai-reporting
```

---

## Common Cloudflare Issues & Solutions

- **Issue**: *"404 Not Found"* when refreshing deep links.
  - **Solution**: The `public/_redirects` file (`/* /index.html 200`) has been added. Cloudflare Pages automatically copies this to `dist/_redirects` so all route paths correctly serve the React SPA.
- **Issue**: *"Node.js runtime not supported"* on server routes.
  - **Solution**: We created a native Edge Function in `functions/api/generate-commentary.ts` which uses the standard Web Fetch API, completely compatible with Cloudflare's V8 isolates runtime.
