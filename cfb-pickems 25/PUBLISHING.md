# CFB Pickems — Publishing to a Live URL (GitHub Pages)

Goal: turn this folder into a real website at `https://<you>.github.io/cfb-pickems/`
(or a custom domain). Free, no server. ~10 minutes.

This is a **static site** (plain HTML/CSS/JS), so GitHub Pages serves it directly —
no build step, no Node, no framework.

---

## What I need FROM YOU to make this live

You'll do these (they require YOUR accounts/passwords — I can't and shouldn't do
them for you):

1. **A GitHub account** — free at <https://github.com/signup>.
2. **Decide the repo name** — e.g. `cfb-pickems`. Your URL becomes
   `https://<username>.github.io/cfb-pickems/`.
3. **(Optional) A custom domain** — if you want `ourpickems.com` instead of the
   github.io URL, you need to buy it from a registrar (Namecheap, Google Domains,
   Cloudflare, etc.). Tell me the domain and I'll give you the exact DNS records.
4. **The Google Sheet backend** set up (see `backend/SETUP.md`) — needed for shared
   data, but NOT needed just to get the site online. You can publish first, connect
   the backend after.

That's it. Everything else (the code) is done.

---

## Option 1 — Web upload (easiest, no git knowledge)

1. Create the repo: GitHub → **New repository** → name `cfb-pickems` → **Public**
   → **Create repository**.
2. On the empty repo page → **uploading an existing file**.
3. Drag in the **contents** of the `cfb-pickems/` folder so that **`index.html`
   sits at the repo root** (NOT inside a `cfb-pickems/` subfolder).
   - Include the `js/`, `css/`, `icons/` folders, `manifest.json`,
     `service-worker.js`, `favicon.*`.
   - You can skip the `backend/` folder and the `.md` docs if you like — they don't
     affect the site — but it's fine to include them.
4. **Commit changes**.
5. **Settings → Pages** (left sidebar) → under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `/ (root)` → **Save**.
6. Wait ~1 minute, refresh the Pages settings page → it shows your live URL.

## Option 2 — git command line (if you prefer)

```bash
cd cfb-pickems
git init
git add .
git commit -m "CFB Pickems v12"
git branch -M main
git remote add origin https://github.com/<username>/cfb-pickems.git
git push -u origin main
```
Then do step 5 above (Settings → Pages).

---

## Important: folder structure on GitHub

✅ Correct (index.html at root):
```
cfb-pickems/                 ← repo root
├── index.html
├── manifest.json
├── service-worker.js
├── css/styles.css
├── js/app.js …
└── icons/…
```

❌ Wrong (nested) — site will 404:
```
cfb-pickems/                 ← repo root
└── cfb-pickems/
    └── index.html
```

---

## After it's live

- Visit the URL, enter the **site PIN (6969)**.
- Go to **Commissioner → Cloud Sync** and connect your Google Sheet backend.
- **Add to Home Screen** on phones (it's a PWA — installs like an app, full screen).

### Updating the site later
- Web upload: re-upload changed files (or edit in GitHub's web editor).
- git: `git add . && git commit -m "update" && git push`.
- The service worker auto-updates clients on next load (network-first), so players
  get changes without clearing caches.

---

## Custom domain (optional)

If you bought e.g. `ourpickems.com`:
1. GitHub → repo **Settings → Pages → Custom domain** → enter `ourpickems.com` → Save.
2. At your registrar, add DNS records:
   - Four **A** records for the apex (`@`) →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One **CNAME** for `www` → `<username>.github.io`
3. Back in GitHub Pages, tick **Enforce HTTPS** once the cert is issued (can take
   up to 24h for DNS to propagate).

Tell me your exact domain and registrar and I'll give you the precise records to paste.

---

## Security notes for a public URL

- The site itself is public, but it's gated by the **site PIN** and per-player PINs.
  The PIN is light protection (it's checked client-side); it keeps casual visitors
  out, not determined attackers. For a friends league that's appropriate.
- The **Google Sheet token is NOT in the published code** — it's entered in the app
  and stored per-device. Don't paste the token into the repo or share it publicly.
- If a token leaks, run `rotateToken` in Apps Script and re-enter the new one.
