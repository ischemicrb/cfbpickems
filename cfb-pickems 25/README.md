# 🏈 CFB Pickems

A private college football pick'em league web app. Mobile-first PWA. Free to host.

**Current revision: Phase II v0.15.1 (2026-06-01)**

> **Cross-device data persistence:** as of v0.15.1, the commissioner sets up the Google Sheet backend ONCE (in `config.json`), and every device that opens the deployed site auto-connects. Players never see the configuration. See `CROSS_DEVICE_SETUP.md`.
>
> **Loud-fail on sync errors:** if the connection breaks, a persistent red banner appears on every screen and players are warned before submitting. No silent fallback.

## What's New in v0.15.1
- ✅ **Spread bug fixed (Priority 1)** — comprehensive audit (13 tests passed); root cause was data-entry sign confusion. Spread input redesigned as Favorite picker + positive Margin field (sign error now impossible). `calculateAtsWinner` falls back to `game.spread` when `lockedSpread` is null. Score edits in the game modal now recompute `atsWinner` so stale data can't persist.
- ✅ **Option A backend bootstrap** — `config.json` at repo root; commissioner sets URL+token once, every device auto-connects. No per-device setup.
- ✅ **Loud-fail sync errors** — persistent red banner + submit-confirm warning when sync is broken
- ✅ **Stark FINAL colors** (Priority 2) — solid saturated green/red with white text, overrides alternating-row grey via `!important`
- ✅ **😅 added** + **bigger emoji picker** (Priority 3) — 44px grid cells on desktop, 42px on mobile
- ✅ **Game date + time always visible** (Priority 4) — kickoff line + LIVE/FINAL pill on every row
- ✅ **Phase III security roadmap** documented (Priority 5) — `SECURITY_ROADMAP.md` extended with explicit Phase III tracker

## What's New in v0.12
- ✅ **PHASE II — Google Sheets backend**: shared data across all players' devices via Apps Script; in-memory mirror keeps the rest of the app synchronous
- ✅ See `backend/SETUP.md` for setup and `PUBLISHING.md` for publishing

See `REQUIREMENTS_TEST_MATRIX.md` for the full design-control record.

---

## Phase 1 Features

- ✅ Player pick submission (blind picks — can't see others until you submit)
- ✅ Admin slate management (suggest games from ESPN or add manually)
- ✅ Week lifecycle: Draft → Open → Locked → Live → Final
- ✅ Weekly blurb editor
- ✅ Admin login (shared password)
- ✅ Local demo mode (localStorage — works immediately, no backend needed)
- ✅ PWA / Add to Home Screen ready
- ✅ CSV export
- ✅ ATS scoring engine (Phase 2 activates full dashboard)

---

## Quick Start (Local Testing)

1. Download or clone this folder
2. You need a local server (browsers block ES modules from `file://`)

**Option A — Python (easiest, built into Mac/Linux):**
```bash
cd cfb-pickems
python3 -m http.server 8080
```
Then open: http://localhost:8080

**Option B — VS Code:**
Install the "Live Server" extension → right-click `index.html` → Open with Live Server

**Option C — Node (if installed):**
```bash
npx serve .
```

3. The app loads with demo data automatically. No setup required.

---

## Default Credentials — ⚠️ **DEVELOPMENT ONLY**

> **Production note:** Change all of these before you publish the site. The default PINs and password below are for first-run testing only. The app intentionally **does NOT display these defaults anywhere in the UI** to keep them out of casual outside viewers' eyes — but they're trivial to look up here, so don't ship the defaults to your league.
>
> Change site PIN and Commissioner password from inside the app: **Commissioner → 🔐 Security & Settings**. Change player PINs from **Commissioner → Players, PINs & Contact**.

| Role  | How to access (development defaults) |
|-------|--------------|
| Site PIN  | `6969` — required once per device (front gate) |
| Commissioner | Commissioner tab → password: `admin123` |
| Players | Pick name from grid → enter 4-digit PIN |

### Default Demo Players (development only)
| Name | Initials | Alma Mater | PIN |
|------|----------|------------|-----|
| Drew Hall | DH | Texas A&M | 1111 |
| Brayden | BR | Oklahoma | 2222 |
| Kevin Conrad | KC | Purdue | 3333 |
| Koby Ramirez | KR | USC | 4444 |
| Jacob Perry | JP | Arkansas | 5555 |
| Kihoon Bae | KB | Texas A&M | 6666 |

**Change the admin password:** open the app → Commissioner → 🔐 Security & Settings → Change Password. The old developer workflow (edit `data-model.js`) is no longer required.

---

## Deploying to GitHub Pages (Free)

### Step 1 — Create a GitHub account
Go to github.com and sign up (free).

### Step 2 — Create a new repository
- Click the **+** icon → New repository
- Name it `cfb-pickems` (or anything you like)
- Set it to **Public**
- Click **Create repository**

### Step 3 — Upload your files
- Click **Add file** → **Upload files**
- Drag your entire `cfb-pickems` folder contents into the upload area
- Make sure `index.html` is at the root level (not inside a subfolder)
- Click **Commit changes**

### Step 4 — Enable GitHub Pages
- Go to your repo → **Settings** → **Pages** (left sidebar)
- Under "Source", select **Deploy from a branch**
- Branch: `main`, Folder: `/ (root)`
- Click **Save**
- Wait ~60 seconds, then your app is live at:
  `https://yourusername.github.io/cfb-pickems/`

### Step 5 — Connect your custom domain (optional)
- In GitHub Pages settings, enter your domain (e.g. `ourpickems.com`)
- Go to your domain registrar (Namecheap, etc.)
- Add a CNAME record: `www` → `yourusername.github.io`
- Add four A records pointing to GitHub's IPs:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- Wait up to 24 hours for DNS to propagate

---

## ⚠️ Important: localStorage Limitation

**Phase 1 uses localStorage** — this means:
- Each browser/device has its own separate data
- If Jake submits picks on his phone and Sarah submits on hers, they won't see each other's picks
- This is fine for testing and demo, but not suitable for real league use

**Phase 2 adds Google Sheets mode** — a free backend where all players share the same data across devices. That's when the app becomes fully functional for your league.

---

## File Structure

```
cfb-pickems/
├── index.html              # App shell
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline caching
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── app.js              # Main controller (navigation, UI)
│   ├── data-model.js       # Data structures + demo data
│   ├── storage.js          # localStorage read/write
│   ├── data-provider.js    # ESPN API integration
│   └── scoring.js          # ATS calculation engine
└── icons/
    ├── icon-192.png        # PWA icon (replace with your logo)
    └── icon-512.png        # PWA icon large
```

---

## Phase 1 Testing Checklist

### Admin Flow
- [ ] Open Admin tab → login with `admin123`
- [ ] Click "Suggest Games from ESPN" → games appear (or demo data if offline)
- [ ] Add a game using "Add Game Manually"
- [ ] Edit a game's spread
- [ ] Write a blurb and save it
- [ ] Transition week: Draft → Open
- [ ] Transition week: Open → Locked (spreads get locked in)

### Picks Flow
- [ ] Go to Picks tab → select your name from the player grid
- [ ] See the weekly blurb displayed
- [ ] Pick a team for every game
- [ ] Submit picks → see confirmation
- [ ] Switch to a different player → make different picks
- [ ] Try Dashboard tab before submitting as second player → should be blocked

### Dashboard
- [ ] After both players submit, Dashboard shows both side by side
- [ ] Week status badge shows correctly in header

### Leaderboard
- [ ] Leaderboard tab loads without errors
- [ ] Season standings show all active players

### PWA (iPhone)
- [ ] Open in Safari on iPhone
- [ ] Tap Share → Add to Home Screen → app installs
- [ ] App opens full screen with no browser chrome

### Data & Export
- [ ] Admin → Export CSV → file downloads
- [ ] Admin → Reset to Demo → data resets cleanly

---

## Replacing the App Icon

The current icons are placeholder green/gold circles. To use your own:
1. Create a square image (your league logo, etc.) at 512×512px
2. Save it as `icons/icon-512.png`
3. Resize to 192×192 and save as `icons/icon-192.png`
4. Re-upload to GitHub

Free icon resizer: squoosh.app

---

## Known Limitations (Phase 1)

| Limitation | Resolution |
|---|---|
| localStorage is per-device | Fixed in Phase 2 (Google Sheets mode) |
| ESPN API may be blocked by CORS in some browsers | Demo data fallback works; Phase 2 adds Apps Script proxy |
| No real-time score updates across devices | Fixed in Phase 2 |
| No email summaries | Phase 3 |
| No season obligations ledger UI | Phase 3 |

---

## Coming in Phase 2

- Google Sheets backend (shared data across all players' devices)
- Live score auto-refresh on the dashboard
- Full ATS result display with win/loss/push per pick
- Season standings that persist across weeks
- Obligations ledger
- Weekly recap generator
