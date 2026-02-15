# Lyriverse Cloudflare Setup Guide

Follow these steps to activate your autonomous discovery engine and live database.

## 1. Create the Database (KV)
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **KV**.
3. Click **Create a Namespace**.
4. Name it exactly: `LYRI_DATA`.
5. Once created, **copy the ID** shown next to your new namespace.

## 2. Configure the Worker
1. Open [wrangler.toml](file:///c:/Users/ynnel/AntiGravity%20Projects/LyricsPedia/wrangler.toml) in your editor.
2. Replace the placeholder `id` with the actual ID you just copied:
   ```toml
   [[kv_namespaces]]
   binding = "LYRI_DATA"
   id = "YOUR_PASTED_ID_HERE"
   ```

## 3. Deploy the Worker
Open your terminal in the project folder and run:

```bash
# Install the Cloudflare CLI
npm install -g wrangler

# Log in to your account
wrangler login

# Deploy the worker to Cloudflare
wrangler deploy
```

## 4. Final Connection
1. After deployment, Cloudflare will give you a URL (e.g., `https://lyriverse-api.yourname.workers.dev`).
2. Open [songService.js](file:///c:/Users/ynnel/AntiGravity%20Projects/LyricsPedia/src/services/songService.js).
3. Update the `WORKER_URL` at the top with your new URL:
   ```javascript
   const WORKER_URL = 'https://your-new-worker-url.workers.dev';
   ```
4. **Commit and Push** your changes to GitHub:
   ```bash
   git add .
   git commit -m "Update: Connect frontend to live Worker URL"
   git push origin master
   ```

## 5. First Run
1. Go to your live site: `https://lyricpedia.pages.dev`.
2. Go to **Admin** > **Settings**.
3. Log in (`mastermad` / `GuppyFishes@2026`).
4. Click **INVOKE CLOUD INDEX**.
5. Wait 60 seconds and refresh—the "bad" placeholders will be replaced with real lyrics!
