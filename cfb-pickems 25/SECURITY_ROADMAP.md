# CFB Pickems — Security Roadmap

---

## ⚠️ PHASE III — SECURITY ROADMAP (Internal Tracking — DO NOT BUILD YET)

This section is the authoritative tracker of all security work to be done when the league outgrows the Phase I "casual friend group" posture. **No implementation should happen here until the league has triggered one of the conditions in "When to upgrade" below.** This is intentionally just a tracker.

### Current state (Phase I — acceptable for casual league)
- **Site PIN** — single shared PIN for casual outsider protection. Stored as `btoa`-encoded string in `localStorage` as `cfbp_site_unlocked` after first entry on a device.
- **Player PINs** — per-player 4-digit PINs for identity selection. Stored as `btoa`-encoded `pinHash` per player.
- **Commissioner password** — `btoa`-encoded password for admin controls.
- **Backend access token** — single shared token for write authorization to the Google Sheet. Baked into `config.json` as of v0.15.1 Option A bootstrap.

**This is acceptable for a small, private, known-participant league with bragging-rights-only stakes.** It is NOT acceptable for any of the trigger conditions below.

### Trigger conditions for upgrading to Phase III
Move to Phase III as soon as ANY of these become true:
1. League is opening up to unknown participants (e.g. wider work group, public sign-up)
2. Real money is exchanged through the app (vs. settled outside it)
3. Multiple unrelated leagues need to share one deployment
4. Audit accountability becomes required ("who deleted that game?")
5. Any sensitive personal data is collected beyond email + display name
6. League grows past ~15 known-trusted people

### Known security gaps to address in Phase III

**Cross-device data exposure**
- Backend token now ships in `config.json` (Option A). Anyone who finds the URL can read & write the Sheet. Acceptable for closed league; not for public.
- Picks visible to anyone with the site PIN + any player PIN.
- No row-level access control — players can technically read other players' picks if they probe the storage seam directly via DevTools.
- **Phase III fix:** server-side ACLs per row, scoped reads, no client-side token.

**PIN-based auth limitations**
- `btoa` is encoding, not hashing — PINs are recoverable from storage. Intentional in Phase I (so commissioner can show/share), unacceptable in Phase III.
- No rate limiting on PIN entry — 4-digit space brute-forces in ~5,000 tries.
- No session expiry — sessions last until cleared.
- No 2FA on commissioner login.
- Single commissioner role — no granular permissions (e.g. "co-commissioner can edit games but not delete weeks").
- **Phase III fix:** real password hashing (bcrypt/argon2), server-validated, rate-limited, session-expiring, optional 2FA.

### Recommended auth providers to evaluate (in order of preference)

| Provider | Complexity | Cost | Best for |
|----------|-----------|------|----------|
| **Supabase Auth** | Medium | Free tier 50k MAUs | First choice. Integrated with Supabase Postgres, easy Row-Level Security, real password hashing, email reset, OAuth. |
| **Firebase Auth** | Medium | Free tier generous | Strong if you ever build a native mobile app. NoSQL trade-offs. |
| **Auth0 / Clerk** | Low-Medium | Free tier limited (7.5k–10k users) | Enterprise-polish drop-in UI, best-looking 2FA. Pricier if league grows. |
| **Google Sign-In** | Low | Free | Easiest UX upgrade — replace player PINs with "Sign in with Google". Players need Google accounts. |

### Features to scope for Phase III implementation

| Feature | Notes |
|---------|-------|
| Account creation + password-based login | Self-serve, not commissioner-mediated. Email confirmation. |
| Role-based access control | At minimum: Player, Commissioner. Consider Co-Commissioner, Read-Only Viewer. |
| Two-factor authentication | TOTP (Google Authenticator) at minimum; SMS optional. Mandatory for Commissioner role. |
| Password recovery flow | Email-based reset link, time-boxed (15-minute expiry). |
| Audit logs | Append-only log of: pick submissions, game adds/edits/deletes, score updates, role changes, login attempts (success + failure). Retained at least one season. |
| Session management | Tokens with refresh, sliding expiry, force-logout-all-devices for commissioner. |
| Secure token handling | No tokens in `config.json`. No tokens in client localStorage. Use httpOnly cookies or short-lived signed bearer tokens. |
| Rate limiting | Server-side on auth endpoints AND on data writes. |
| Privacy posture | Document what's collected, who can see it, retention policy. |

### Estimated effort
- **Supabase migration (recommended path):** 1–2 weekends to migrate storage + add auth. Another weekend for RBAC + audit logging. Total: ~30–50 hours.
- **Google Sign-In only (minimum viable upgrade):** 4–6 hours, but doesn't address the other gaps.
- **Full custom backend:** 60+ hours. Not recommended.

### Migration considerations
- Existing localStorage data must export cleanly so users don't lose history.
- Existing `cfbp_*` keys map to relational tables: players → users, picks → picks (FK to user + game), games → games, weeks → weeks, results → weekly_scores.
- Commissioner password becomes Commissioner role flag on user record.
- Site PIN becomes optional "join code" for first-time users to associate with a league.

---

## Phase I overview (current state)

A practical, plain-English guide to the current security model and what it would take to harden it. **This is documentation only — no auth changes are being implemented here unless you explicitly request them.**

---

## Current security model (Phase I — appropriate for casual private league)

Three layers, all client-side, all in localStorage (or in the shared Google Sheet when cloud sync is enabled):

| Layer | What it protects | How it works | Strength |
|-------|------------------|--------------|----------|
| **Site PIN** | Casual outsiders stumbling on the URL | One PIN per league, entered once per device, stored in `localStorage` as `cfbp_site_unlocked` | Low — blocks crawlers and unintentional visitors; trivial to bypass for anyone who really wants in |
| **Player PIN** | Friends accidentally (or "jokingly") picking under each other's names | 4-digit PIN per player, `btoa`-encoded in `pinHash` | Low — encoding is not encryption; anyone with browser DevTools can read PINs in storage |
| **Commissioner password** | Casual access to admin controls | `btoa`-encoded password compared on submit | Low — same as above |

**What this is good enough for:** a 6–10-person friend group, private URL, low stakes (bragging rights, free dinner). Nobody serious is trying to break in. The PINs prevent friends from being annoying, not from being adversarial.

**What this is NOT good enough for:** anything public, anything with money on the line, anything beyond a single trusted group of friends, anything where you legally need to verify identity (e.g. age verification for sports betting).

### Known limitations (be honest about them)
- PINs are recoverable from `pinHash` via `atob()` — *intentional* so the Commissioner can show/share them, but it means anyone with access to your Google Sheet token or a player's unlocked browser can read every PIN.
- No rate limiting on the PIN entry form — someone could brute-force a 4-digit PIN in ~5,000 tries on average.
- No session expiry — a logged-in player stays logged in until they clear browser data or hit Logout.
- No audit log of who did what when.
- The Commissioner password is shared by every Commissioner (there's only one role).

---

## When to upgrade

If any of the following are true, it's time to move past Phase I:

1. The site is going public or semi-public (linked from social media, listed somewhere)
2. Real money is being exchanged through the app (vs. settled outside it)
3. You're running multiple leagues with users who don't all know each other
4. You need accountability — "who deleted that game?" "who changed the spread?"
5. You're collecting any sensitive personal data beyond email + display name
6. Your league has grown past ~15 people

---

## Upgrade options (do NOT build unless you explicitly request)

### Option A — Supabase Auth + Postgres
**Complexity: Medium** · **Cost: Free tier covers small leagues** · **Recommendation: ⭐ Best default for "going semi-public"**

What you get:
- Email + password login OR magic-link OR OAuth (Google/Apple/GitHub) — your choice
- Real password hashing (bcrypt), not `btoa`
- Password recovery via email reset link, out of the box
- Row-Level Security on a Postgres database, so each player can only edit their own picks server-side
- Server-side rate limiting on login attempts
- Free dashboard with audit logs of every auth event

What it costs you:
- Replace `js/storage.js` and `js/backend.js` with a Supabase client (~1-2 days of work)
- Rewrite the data model to be relational instead of JSON blobs (~2-3 days)
- Build a sign-up flow + account-management UI (~1 day)
- Free tier: 50,000 monthly active users, 500MB database — fine forever for a private league

Trade-offs:
- Requires an internet connection for every action (no more offline mode)
- Your data lives on Supabase's servers, not in your Google Drive — pick the trust model you prefer
- 2FA / TOTP not in the free tier last I checked; available via paid plan or by integrating Authy/Twilio separately

### Option B — Firebase Auth + Firestore
**Complexity: Medium** · **Cost: Free tier generous** · **Trade-off: vendor lock-in to Google**

Very similar to Supabase, but:
- Strong on mobile-app integration (you'd want this if you ever build a native iOS/Android app)
- Slightly weaker on relational queries (Firestore is NoSQL)
- Google's product roadmap is unpredictable (Firebase has been "in maintenance" for years)

Choose Supabase over Firebase unless you have a specific reason to want Google's ecosystem.

### Option C — Auth0 or Clerk (managed auth-as-a-service)
**Complexity: Medium-High** · **Cost: Free tier limited (Auth0: 7,500 active users; Clerk: 10,000)**

What you get:
- Drop-in login UI, password reset, OAuth, magic links
- 2FA built in (TOTP, SMS)
- Audit log dashboards
- Better-looking out-of-the-box than Supabase Auth

What it costs:
- Still need your own backend for the actual app data (combine with Supabase, or build one)
- More configuration overhead than Supabase Auth
- Pricier if the league grows

Use this if you want auth handled by professionals and you don't mind paying for it eventually.

### Option D — Google Sign-In only (one OAuth provider)
**Complexity: Low** · **Cost: Free** · **Trade-off: Everyone needs a Google account**

What you get:
- Replace player PINs with "Sign in with Google" — the player's Google identity becomes their league identity
- Zero password management for you or them
- Email-on-file is automatic (it's their Google email)

What it costs:
- A few hours of integration (Google Identity Services client-side library)
- Your data still needs to live somewhere — you still need Option A/B/E for storage

Realistically the easiest auth upgrade. Combines well with the existing Google Sheets backend (Apps Script already understands Google identity).

### Option E — Full custom backend (Node/Express + Postgres + your own auth)
**Complexity: High** · **Cost: $5–20/mo VPS**

You build the whole thing. Don't, unless you have specific reasons the managed options don't fit. The hours involved are not worth it for a private league.

---

## Feature comparison

| Feature | Phase I (current) | Supabase | Firebase | Auth0/Clerk | Google SSO | Full custom |
|---------|-------------------|----------|----------|-------------|------------|-------------|
| Account creation | manual via Commissioner | self-serve | self-serve | self-serve | self-serve (Google) | self-serve |
| Password login | "PIN-style" | ✅ bcrypt | ✅ bcrypt | ✅ | n/a (OAuth) | ✅ |
| 2FA | ❌ | paid tier | ✅ | ✅ | ✅ (via Google) | DIY |
| Password recovery | manual reset by Commissioner | ✅ email | ✅ email | ✅ email | n/a (Google handles) | DIY |
| Role-based access | binary (player / commissioner) | ✅ via RLS | ✅ via custom claims | ✅ | DIY | DIY |
| Audit logs | ❌ | ✅ auth events | ✅ auth events | ✅ | basic via Google | DIY |
| Server-side rate limit | ❌ | ✅ | ✅ | ✅ | n/a | DIY |
| Works offline | ✅ | partial | partial | ❌ | ❌ | depends |
| Setup hours | 0 | 8–16 | 8–16 | 8–20 | 2–4 | 40+ |

---

## My recommendation

**For your current Phase I situation: stay where you are.** The site PIN + player PINs + Commissioner password is the right level of protection for a private friend group playing for bragging rights. Spending a weekend rewriting the auth layer when nobody is attacking it is wasted effort.

**Triggers that would change that:**
- Going public → Supabase Auth (Option A)
- Money flowing through the app → Supabase Auth + Stripe + real legal/age verification
- Multiple unrelated leagues → Supabase Auth with leagueId scoping
- Just want easier login UX → Google Sign-In (Option D), the minimum viable upgrade

**A reasonable middle step before any of that:** harden Phase I cheaply
- Rotate the site PIN every season (already supported via Commissioner panel)
- Add rate limiting on the PIN entry form (10 attempts → 60-second lockout) — about 1 hour of work
- Add session expiry (12 hours of inactivity → re-enter PIN) — about 2 hours of work
- Move the Google Sheets token into a per-device passphrase-encrypted store — about 4 hours of work, modest gain

None of those require a backend rewrite. Tell me which (if any) you'd like to ship as polishing.
