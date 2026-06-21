# Cross-Device Data Persistence — Option A (One-Time Setup)

Players should never have to configure anything. They open the URL, enter the site PIN + their player PIN, and start picking. This doc is for **you, the commissioner**, to do the one-time setup so that just works.

After this is done, every device that opens your published site automatically syncs with the same Google Sheet. No tokens to share, no Commissioner panel visits, no per-device setup.

---

## Two-step summary

1. Set up the Google Sheet + Apps Script (15 minutes, once)
2. Paste the two resulting strings into `config.json` in your GitHub repo, redeploy (1 minute)

That's it. Every device from then on auto-connects.

---

## Step 1 — Stand up the Google Sheet backend

(Skip this if you've already done it from an earlier version.)

### 1a. Create the Sheet
1. Go to <https://sheets.google.com> → **Blank spreadsheet**
2. Name it **CFB Pickems DB**

### 1b. Paste in the script
1. Extensions → Apps Script
2. Delete the placeholder code
3. Open `backend/Code.gs` from this project's zip, copy ALL of it, paste in
4. Save (Cmd-S / Ctrl-S), name the project **"CFBP Backend"**

### 1c. Run setup() once
1. Function dropdown → `setup` → ▶ Run
2. Authorize: pick your Google account → Advanced → Go to CFBP Backend (unsafe) → Allow
3. Execution log prints: `Setup complete. Token: a1b2c3...` — **copy the token**

### 1d. Deploy as Web App
1. **Deploy → New deployment**
2. Gear ⚙ → **Web app**
3. **Execute as: Me** · **Who has access: Anyone** (required so player browsers can hit it; writes are gated by the token)
4. Deploy → **copy the `/exec` URL**

You now have:
- **Web App URL** (ends in `/exec`)
- **Token** (from step 1c)

---

## Step 2 — Bake them into your deployed site

This is what makes every device auto-connect.

### 2a. Open `config.json` in your repo
At the root of your `cfb-pickems` folder you'll see `config.json`:

```json
{
  "_comment": "Cross-device data sync config. ...",
  "backendUrl": "",
  "backendToken": ""
}
```

### 2b. Paste in your two values
```json
{
  "_comment": "Cross-device data sync config. ...",
  "backendUrl": "https://script.google.com/macros/s/AKfyc.../exec",
  "backendToken": "a1b2c3d4e5f6..."
}
```

### 2c. Commit + redeploy
- **GitHub web UI:** open `config.json` in the repo → pencil to edit → paste your values → "Commit changes" — GitHub Pages auto-redeploys within ~1 minute
- **Local + git:** `git add config.json && git commit -m "Connect backend" && git push`

### 2d. Verify (1 minute)
1. Open your site
2. Wait for it to fully load past the PIN screen
3. Tap **Comm** → log in → scroll to **Cloud Sync**
4. Status should show **Connected** and "Last successful sync: just now"

If you see a **red banner at the top** ("Cross-device sync is OFF"), open it, click Retry. If it still fails, the most likely cause is the `/exec` URL or the token was pasted wrong — re-check `config.json` and verify both strings match exactly what Apps Script gave you.

### 2e. First-time-only: seed the Sheet
Still in Comm → Cloud Sync, click **Push local data to Sheet (seed)** ONCE. This uploads whatever players/weeks/games you've already created on this device as the starting shared dataset.

(Skip this if your Sheet already has data from a previous setup.)

---

## What happens for players now

A player opens the site for the first time:
1. Site loads → enters site PIN → enters their player PIN
2. Auto-connect happens silently in the background — the app fetches `config.json`, writes the URL + token to their browser's localStorage, hydrates from the Sheet
3. They make picks normally. Every submit auto-syncs within ~1 second.
4. They never see the URL, the token, the Commissioner panel, or any of this setup.

A player opens the site for the second time:
1. Site loads → enters site PIN (if their device unlock expired)
2. Auto-connect uses cached config from previous visit; hydrates fresh data
3. Picks made on other players' devices appear after a pull (auto on each tab open)

Add to home screen on iOS/Android AFTER first-time setup. Launches like a real app.

---

## What happens when something breaks (you'll see it LOUDLY)

The app has explicit loud-failure behavior — if the connection is broken, nobody pretends everything is fine.

### What you'll see when sync is broken
- **Persistent red banner across the top** of every screen: "Cross-device sync is OFF on this device. Picks made on THIS device may NOT reach other players' devices until this is fixed."
- The banner has a **Retry** button and an X to dismiss
- Submitting picks pops a **confirm dialog**: "Cross-device sync is currently OFF. Your picks will be saved on THIS device but may not reach other players. Submit anyway?"
- The submitted-picks toast says "Sync still off — picks not yet shared" instead of the normal happy message
- The Cloud Sync panel in Commissioner shows the **last error message** with timestamp

### Common causes of breakage
1. **Token rotated** — you ran `rotateToken` in Apps Script but forgot to update `config.json`. Fix: paste the new token in, commit, push.
2. **Apps Script deployment edited as a new version** — by default the `/exec` URL stays the same. If you accidentally created a **new** deployment instead of editing the existing one, the URL changes. Fix: go to Manage Deployments in Apps Script, find the URL, update `config.json`.
3. **Apps Script quota hit** — Google's free tier allows thousands of calls/day. Very unlikely for a small league.
4. **Network down** — phone is offline. Sync resumes automatically when the network returns. App keeps working in local-only mode in the meantime.

### What does NOT cause breakage
- A new player joining (just have them open the URL)
- A player switching between phone and laptop (config auto-loads on every device)
- A new browser (same)
- A reinstall after deleting the home-screen icon (same)

---

## Editing config.json later

Change `backendUrl` or `backendToken` anytime. Edit the file in the repo and push — every device picks up the new values on its next page load. **No player has to do anything.**
