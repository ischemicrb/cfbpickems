# CFB Pickems — Phase I Requirements & Test Matrix
Revision: Phase II v0.15.1
Date/Time: 2026-06-01 12:00

This document is the design-control / acceptance record for Phase I (single-device localStorage build). Every user need (UN-) maps to a design input / required feature (DI-), an implementation, and a verification test (VT-) with an expected result. Phase II is tracked separately.

---

## Requirements Traceability Matrix

| UN-ID | User Need | DI-ID | Design Input / Required Feature | Implemented Feature | VT-ID | Verification Test Procedure | Expected Result | Status | Notes | Rev Introduced | Last Verified |
|-------|-----------|-------|---------------------------------|---------------------|-------|-----------------------------|-----------------|--------|-------|----------------|---------------|
| UN-01 | Players can submit weekly picks | DI-01 | Pick submission form with all slate games | Picks page with game cards and team buttons | VT-01 | Log in as Drew (PIN 1111), make picks for all 10 games, click Submit | All picks saved, confirmation shown | ✅ | Blind until submitted | v0.1 | v0.10 |
| UN-02 | Picks are blind until submitted | DI-02 | Dashboard gated until player submits | Dashboard shows "submit first" if open/locked and player hasn't submitted | VT-02 | Open dashboard before submitting picks — verify pick matrix hidden | Login/submit prompt shown instead of pick data | ✅ | Live/final weeks always public | v0.1 | v0.10 |
| UN-03 | Live/final dashboard public | DI-03 | Dashboard visible without login when week is live/final | Pick matrix shows without login when status=live or final | VT-03 | Set week to Live; open app without logging in; view dashboard | Pick matrix visible, no login required | ✅ | | v0.9 | v0.10 |
| UN-04 | Commissioner can manage slate | DI-04 | ESPN fetch + manual game add + 3-layer slate | Available pool, suggested 10, selected slate in Commissioner panel | VT-04 | Fetch ESPN data for a date, review suggested slate, add games individually | Games appear in correct pools | ✅ | | v0.3 | v0.10 |
| UN-05 | Correct ATS scoring | DI-05 | Locked spread + home-perspective signed spread formula | calculateAtsWinner(), evaluatePick(), calculateWeeklyResults() | VT-05 | Lock a game with spread -7; set final score home 14 away 10 | adjustedHome = 14 + (-7) = 7 < 10 → away covers | ✅ | Home perspective | v0.2 | v0.10 |
| UN-06 | No push scoring | DI-06 | Exact spread = No Decision (0 pts) | PICK_RESULT.NO_DECISION | VT-06 | Set final score that hits spread exactly | "— No Decision" shown, 0 pts | ✅ | | v0.4 | v0.10 |
| UN-07 | Tiebreaker resolves ties | DI-07 | Numeric tiebreaker guess per player, closest-to-actual wins | tiebreakerGuess stored; calculateWeeklyResults uses delta | VT-07 | Two players tied; one guesses TB=50, actual=47; other guesses 60 | Player with guess=50 wins (delta 3 < 13) | ✅ | | v0.4 | v0.10 |
| UN-08 | Site access PIN | DI-08 | Site-level PIN gate before any league data shown | showSitePinGate(), isSiteUnlocked(), verifySitePin() | VT-08 | Open app in fresh browser; wrong PIN, then 6969 | Wrong: error. Correct: app loads | ✅ | PIN: 6969 | v0.9 | v0.10 |
| UN-09 | Player PIN authentication | DI-09 | Per-player 4-8 digit PIN; commissioner can reset | verifyPlayerPin(), setPlayerPin() | VT-09 | Log in as Drew with PIN 1111; try wrong PIN; commissioner reset | Correct: login. Wrong: error. Reset: new PIN works | ✅ | | v0.3 | v0.10 |
| UN-10 | Commissioner can open/lock/finalize/reopen week | DI-10 | Week status machine with all transitions and corrections | renderWeekStatusButtons() shows all transitions | VT-10 | Draft → Open → Locked → Live → Final. Then reopen from Final to Live / Open | Each status change reflects in header; reopening from final works | ✅ | Required for mistake corrections | v0.9 | v0.10 |
| UN-11 | Alma mater games prioritized — precise matching | DI-11 | Precise alma mater matching prevents Arkansas/Arkansas State false positives | getAlmaMaterMatch() with ALMA_MATER_EXACT_PATTERNS + EXCLUDE_PATTERNS; used in Picks, Alma Mater Watch, and Game Modal | VT-11 | Import slate with Arkansas State and Arkansas; manually add a game w/ Arkansas State | Arkansas: ⭐. Arkansas State: no badge. Game modal: Arkansas State NOT flagged as alma mater | ✅ | Bug fix: showGameModal now uses getAlmaMaterMatch not raw includes | v0.9 / v0.10 | v0.10 |
| UN-12 | Game times show TBD when not confirmed | DI-12 | kickoffConfirmed/kickoffDateOnly flags on game | formatGameTime() shows "Sat 8/29 · Time TBD" when not confirmed | VT-12 | Import game where ESPN returns midnight placeholder | "Sat 8/29 · Time TBD" shown | ✅ | | v0.8 | v0.10 |
| UN-13 | Venue shows city/state not stadium | DI-13 | venueDisplay from ESPN address fields | formatVenueDisplay() returns "Dublin, Ireland" over "Aviva Stadium" | VT-13 | Import TCU vs North Carolina | "Dublin, Ireland 🌍" shown | ✅ | | v0.8 | v0.10 |
| UN-14 | Live tentative ATS coloring | DI-14 | Live game shows pulsing covering/trailing per pick | getBtnClass() with live-covering/live-trailing, badge-live-covering | VT-14 | Set game to Live with home 14 / away 10, spread -7. Player picked home. | Home pick shows pulsing green ⚡ Covering | ✅ | Not final; updates on refresh | v0.8 | v0.10 |
| UN-15 | Custom week/round labels | DI-15 | roundLabel field on week; shown in formatWeekLabel | roundLabel in createWeek, week settings UI, create-week modal | VT-15 | Create week with roundLabel "1.1"; verify header shows "Week 1.1 — Aug 29" | Custom label shown throughout app | ✅ | | v0.7 | v0.10 |
| UN-16 | Scoped reset (week only) | DI-16 | resetCurrentWeekData(weekId) leaves other data intact | "Reset This Week" button in Commissioner → Danger Zone | VT-16 | Finalize week 1. Then reset current week 2 data. Verify week 1 results preserved. | Week 2 cleared; week 1 results and standings intact | ✅ | Full reset still available but requires admin password | v0.9 | v0.10 |
| UN-17 | Demo mode for presentations | DI-17 | Commissioner can set games to live/final with manual scores | Demo Simulation section in Commissioner panel | VT-17 | Load demo week; submit picks for all players; set games to live with scores; finalize | Dashboard shows tentative then final results with winner/loser | ✅ | | v0.9 | v0.10 |
| UN-18 | Weekly history visibility | DI-18 | showInHistory flag on week; standings filter by it | Week settings checkbox; standings/history filter hidden weeks | VT-18 | Uncheck "Show in Standings" for demo week | Demo week absent from weekly history and season standings | ✅ | | v0.9 | v0.10 |
| UN-19 | Timezone toggle | DI-19 | PT/MT/CT/ET toggle in header | renderTzToggle(), formatGameTime() with timezone | VT-19 | Switch PT to ET; verify all game times update | Times shift +3 hours | ✅ | | v0.7 | v0.10 |
| UN-20 | Spread shows favored team | DI-20 | formatSpread() always shows "Team -N.N" format | formatSpread(spread, favorite, game) — derives favorite from spread sign + game when missing | VT-20 | Game card with TCU -6.5; game card where favorite is null and spread=-6.5 | "TCU -6.5" shown in both cases (derived from home team when null) | ✅ | Bug fix in v0.10: fall-through derivation | v0.9 / v0.10 | v0.10 |
| UN-21 | Team display "School (Mascot)" everywhere | DI-21 | getTeamDisplay(game,side) returns "Texas A&M (Aggies)" — explicit homeMascot/awayMascot fields or TEAM_MASCOT_LOOKUP fallback | Used in Picks game cards, Dashboard All-Picks matrix, Commissioner slate list, Available Games list, Suggested Slate preview, Demo Sim dropdown, Alma Mater Watch | VT-21 | Open Picks tab → game card shows "Texas A&M (Aggies)" and "Notre Dame (Fighting Irish)". Open Dashboard → matrix shows same format. Commissioner → slate game lists show School (Mascot). | School (Mascot) format displayed everywhere a team appears | ✅ | NEW v0.10 | v0.10 | v0.10 |
| UN-22 | "All Picks by Game" dashboard section (FIRST) | DI-22 | Dashboard renders pick matrix card placed FIRST, before Alma Mater Watch and This Week Score Summary | renderDashboard() calls renderDashboardTable() in card #1; section order locked | VT-22 | Open Dashboard for any week with submitted picks. Scroll from top. | Section order top-to-bottom: 1) 📋 All Picks by Game, 2) ⭐ Alma Mater Watch, 3) This Week Score Summary | ✅ | NEW v0.10 — CRITICAL BUG FIX (was missing in v0.9) | v0.10 | v0.10 |
| UN-23 | Spread shows team in commissioner panel + picks + dashboard | DI-23 | spread display uses game-aware formatSpread everywhere | renderAdminGamesList, renderGameCard, renderDashboardTable, renderAvailableGamesList, renderSuggestedSlatePreview all pass game to formatSpread | VT-23 | Add a manually-entered game with spread -6.5 and blank favorite. Verify all three views show "<HomeTeam> -6.5". | "<HomeTeam> -6.5" everywhere; never bare "-6.5" or "+6.5" | ✅ | NEW v0.10 — companion to UN-20 | v0.10 | v0.10 |
| UN-24 | Final game without spread shows "Final" (not "—" or "TBD") | DI-24 | renderGameCard shows "Final" label; renderAdminGamesList shows "Final" | Spread cell shows "Final" when status=final and spread is null | VT-24 | Manually add a finalized game with no spread; verify display | "Final" label shown (greyed) instead of "—" or "TBD" | ✅ | NEW v0.10 | v0.10 | v0.10 |
| UN-25 | Comprehensive export of all data | DI-25 | Multiple CSV exports + JSON full backup | Commissioner → Export Data section with: Week Picks CSV, Week Slate CSV, Week Results CSV, Week Dashboard Matrix CSV, Week Bundle (4 CSVs), Players CSV, Season Standings CSV, All Weekly Results CSV, Obligations CSV, Full Backup JSON, Full CSV Bundle | VT-25 | Click each export button in Commissioner. Verify each CSV opens in Excel and contains correct headers and rows. Open the JSON backup and verify it contains all weeks, players, picks, results. | All 11 export options download files; CSV cells properly escape commas/quotes/newlines; JSON contains complete state for restore | ✅ | NEW v0.10 — replaces single legacy CSV export | v0.10 | v0.10 |
| UN-26 | Commissioner game-add modal supports mascot | DI-26 | showGameModal includes Home Mascot / Away Mascot inputs; auto-derives favorite from spread sign when blank | Mascot input fields in game modal; favorite auto-fill from spread sign | VT-26 | Commissioner → Add Manual Game. Enter Home=Oklahoma, Away=Texas, Spread=-3, leave Favorite blank. Save. Open the game card. | Spread shows "Oklahoma -3"; favorite was auto-derived | ✅ | NEW v0.10 | v0.10 | v0.10 |
| UN-27 | Default landing page = Dashboard | DI-27 | App opens to Dashboard tab by default | Initial navigateTo('dashboard') on app load | VT-27 | Clear session cookies; open app; verify Dashboard tab is active and visible | Dashboard is the default tab on app open | ✅ | | v0.9 | v0.10 |
| UN-28 | Default demo players with alma maters and initials | DI-28 | DEMO_PLAYERS has 6 players w/ alma maters and 2-letter initials | Drew(DH/Texas A&M/1111), Brayden(BR/Oklahoma/2222), Kevin(KC/Purdue/3333), Koby(KR/USC/4444), Jacob(JP/Arkansas/5555), Kihoon(KB/Texas A&M/6666) | VT-28 | Fresh reset to demo data; verify 6 players appear in player grid with initials and alma maters | All 6 default players shown with correct initials and alma maters | ✅ | | v0.9 | v0.10 |
| UN-29 | App updates show without manual cache clear | DI-29 | Service worker: network-first for app shell + CACHE_NAME bump + auto-reload on controller change | service-worker.js v10: CACHE_NAME='cfb-pickems-v10', networkFirst for all GET; index.html cache-bust `?v=10` on JS/CSS + skipWaiting+controllerchange handler | VT-29 | Load v9 build, then redeploy v10 over it. Open the app in the same browser tab without manual cache clear. | App reloads once (controllerchange) and immediately shows v10 content | ✅ | NEW v0.10 | v0.10 | v0.10 |
| UN-30 | Live picks read as soft, directional, distinct from final | DI-30 | Dashboard live cells use covering(amber▲)/trailing(slate▽)/even tints with gentle pulse; finalized cells keep solid green/red ✓/✗ | livePickStatus() + pick-live CSS classes; prefers-reduced-motion respected | VT-30 | Set a game live with a score that has the home pick covering and the away pick trailing. Open Dashboard. | Covering pick = warm amber ▲ pulsing; trailing = cool slate ▽; neither is red; finalized games still show green/red ✓/✗ boxes | ✅ | NEW v0.11 — replaces dual-red 🔴 | v0.11 | v0.11 |
| UN-31 | Unset date/time never shows filler to players | DI-31 | gameDataReadiness() classifies ok/warn/incomplete; incomplete games held back from Picks behind a pending notice; Commissioner sees per-game warning banners; modal warns on dateless save | gameDataReadiness() in data-model; renderGamesList split; admin card banners | VT-31 | Add a game with no kickoff date. Check Picks tab (should NOT show the game; shows "pending confirmation" notice). Check Commissioner (shows ⛔ incomplete banner). | Players never see a fake time; Commissioner sees a clear pending/incomplete state | ✅ | NEW v0.11 | v0.11 | v0.11 |
| UN-32 | USC recognized as alma mater (watch + suggestions) | DI-32 | getAlmaMaterMatch always treats the alma key itself as a pattern; 'USC' added to USC patterns; word-boundary matching | data-model.js getAlmaMaterMatch hardened | VT-32 | Import/add a game with team "USC". Verify ⭐ on game card, USC row updates in Alma Mater Watch, and USC games score higher in Suggested slate. | USC matches everywhere; "USC Upstate"/"South Carolina" still excluded | ✅ | NEW v0.11 — root cause: USC key absent from its own pattern list | v0.11 | v0.11 |
| UN-33 | Player column shows clear W–L record (not "0W") | DI-33 | Dashboard player header shows "W–L" (e.g. 3–2), hidden until ≥1 game decided | renderDashboardTable header | VT-33 | Open Dashboard before any game final → no record under names. After 3 wins / 2 losses → "3–2" under that player. | No confusing "0W"/"ow" string; explicit record once meaningful | ✅ | NEW v0.11 | v0.11 | v0.11 |
| UN-34 | Remove games from slate + decline suggestions | DI-34 | One-click remove (with confirm + pick-cascade warning) from slate list AND available list; dismiss/restore suggested games (persisted per week) | deleteGame cascade (picks+lock); rejectSuggestion/clearRejectedSuggestions; reject ✕ on suggested rows; Remove on on-slate avail rows | VT-34 | (a) Remove an on-slate game that has picks → confirm dialog warns N picks will be deleted; after remove, picks gone. (b) Dismiss a suggested game → it disappears and does not return on re-render; "Restore N dismissed" brings it back. | Removal cascades cleanly; rejected suggestions stay hidden until restored | ✅ | NEW v0.11 | v0.11 | v0.11 |
| UN-35 | Batch demo score/status updates | DI-35 | Demo Simulation batch grid: every game's home/away score + status editable; Apply All in one click; Randomize Scores helper | renderDemoBatchGrid() + demo-batch-apply/demo-batch-randomize handlers | VT-35 | Open Commissioner → Demo Simulation. In the batch grid set 3 games' scores and statuses, click Apply All. | All edited games update at once; statuses/scores/ATS computed; single render | ✅ | NEW v0.11 | v0.11 | v0.11 |
| UN-36 | Codebase prepared for future SMS/email updates | DI-36 | Notification fields on player (phone, phoneVerified, notifyPrefs); js/notifications.js seam (channels, events, builders, dispatch no-op, provider registration) behind a disabled feature flag | createPlayer schema + notifications.js | VT-36 | Inspect a freshly created player object: has phone, phoneVerified=false, notifyPrefs.sms/email. Import notifications.js builders in a test → produce message text with no network. | Schema + module present and inert; no sends occur; ready to wire a provider later | ✅ | NEW v0.11 — Phase III prep only | v0.11 | v0.11 |

---

## Verification Test Procedures (Detailed)

### VT-01: Pick Submission
1. Open app; enter site PIN 6969
2. Go to Picks tab
3. Select player Drew; enter PIN 1111
4. Make picks for all 10 games
5. Enter tiebreaker guess
6. Click Submit
**Expected:** Confirmation shown; picks saved; tiebreaker saved

### VT-05: ATS Scoring Formula
1. Commissioner: add a game, set spread -7 (home favored)
2. Lock the week (spread is now lockedSpread = -7)
3. Set game to Final, home score 14, away score 10
4. Click Calculate ATS
**Formula:** adjustedHome = 14 + (-7) = 7. 7 < 10 (away score) → away team covers
**Expected:** Away team shown as ATS winner

### VT-08: Site PIN Gate
1. Open DevTools → Application → Clear site data
2. Navigate to localhost:8080
3. Site gate should appear (black screen, typewriter font)
4. Enter wrong PIN → error
5. Enter 6969 → app loads
6. Refresh → app loads without gate (PIN remembered)

### VT-11: Alma Mater Precision
1. Commissioner: fetch ESPN data for a date with Arkansas State playing
2. Verify Arkansas State does NOT get ⭐ Alma mater badge
3. Fetch a date with Arkansas Razorbacks playing
4. Verify Arkansas DOES get ⭐ Alma mater badge
5. Commissioner → Add Manual Game with home=Arkansas State, away=Anyone
6. Verify the new game does NOT have an alma mater badge (this fix is new in v0.10)

### VT-17: Demo Mode Full Run
1. Commissioner: load Historical Demo Week (or any week with picks submitted)
2. Submit picks for all 6 players via Commissioner impersonation
3. Commissioner → Demo Simulation: select Oklahoma vs Houston
4. Set to Live with score Oklahoma 12, Houston 10
5. Go to Dashboard: verify ⚡ Covering / ⚡ Trailing badges
6. Return to Commissioner: set Oklahoma vs Houston to Final (same score)
7. Repeat for all games; set varied scores to create winner/loser
8. Click Finalize All & Calculate Results
9. Go to Dashboard: verify correct/incorrect picks, tiebreaker deltas, winner, loser

### VT-21: Team Display "School (Mascot)"
1. Open Picks tab. Verify game cards show:
   - "Texas A&M (Aggies)" (full school + mascot)
   - "Notre Dame (Fighting Irish)"
   - "Oklahoma (Sooners)"
   - Mascot subtitle rendered in lighter color (.team-mascot class)
2. Open Dashboard. Verify the All-Picks matrix shows the same format in both the matchup column and each pick cell.
3. Open Commissioner. Verify Selected Slate list and Available Games pool both show School (Mascot).
4. Open Alma Mater Watch on Dashboard. Verify "Texas A&M (Aggies)" appears at left.

### VT-22: Dashboard Section Order
1. Open Dashboard for any week with at least one submitted pick.
2. Confirm scroll order from top to bottom:
   1. Section header + week selector + refresh bar
   2. **📋 All Picks by Game** (full matrix of games × players)
   3. **⭐ Alma Mater Watch**
   4. Tiebreaker card (if tiebreaker question exists)
   5. **This Week Score Summary** (ranked results table)
3. Confirm the All Picks by Game card is the very first content card.

### VT-23: Spread Display Fall-Through
1. Commissioner: Add Manual Game with Home=Oklahoma, Away=Temple, Spread=-28.5, Favorite=Oklahoma (explicit)
2. Add another with Home=Texas, Away=OSU, Spread=-3, Favorite=BLANK (test fall-through)
3. Verify both games in Commissioner panel show "Oklahoma -28.5" and "Texas -3"
4. Open Picks. Verify same display.
5. Move week to Open and submit a pick for each game. Open Dashboard.
6. Verify the All Picks by Game matrix shows the same favored-team spread format.

### VT-24: Final Game Without Spread
1. Commissioner: Add Manual Game without setting a spread.
2. Edit it: set Status=Final, Home Score=21, Away Score=14.
3. Verify the slate card shows spread as "Final" (greyed) — not "—" or "TBD".

### VT-25: Comprehensive Export
1. Commissioner → Export Data section
2. Click "📋 Week Picks CSV". File downloads. Open in Excel.
3. Verify columns: Week, Player, Initials, Alma Mater, Tiebreaker Guess, Game (Home), Game (Away), Kickoff, Locked Spread, Favorite, Picked, Result, ATS Winner, Home Score, Away Score
4. Click "🏈 Week Slate CSV". File downloads with: Game ID, ESPN ID, Home, Home Mascot, Away, Away Mascot, conferences, ranks, kickoff, time window, spread, favorite, locked spread, status, scores, actual winner, ATS winner, alma-mater flag, spread source, venue
5. Click "🏆 Week Results CSV". Verify Rank, Player, Correct, Incorrect, No Decisions, Tiebreaker Guess, Actual Tiebreaker, Delta, Winner, Loser, Won by Tiebreaker columns
6. Click "📊 Week Dashboard Matrix CSV". Verify rows are games and columns are players, cells contain picked team + WIN/LOSS/ND tag
7. Click "📦 Week Bundle". Four files download sequentially.
8. Click "👥 Players CSV". Verify Player ID, Display Name, Initials, Alma Mater, Email, Active, Created
9. Click "🏆 Season Standings CSV". Verify Rank, Player, Correct, Incorrect, ND, Weekly Wins/Losses, Win %
10. Click "📅 All Weekly Results CSV". Verify each week's rankings included with Show-in-History flag
11. Click "💵 Obligations CSV". Verify obligations list with player names resolved
12. Click "💾 Full Backup (JSON)". Open with text editor. Verify it contains: settings, players, weeks, games, picks, weeklyResults, obligations, tiebreakerGuesses
13. Click "📦 Full CSV Bundle". Verify many files download (4 league CSVs + 4 per week)

### VT-26: Game Modal Mascot + Auto-Favorite
1. Commissioner → Add Manual Game
2. Home Team (School): Oklahoma
3. Home Mascot: Sooners
4. Away Team (School): Texas
5. Away Mascot: Longhorns
6. Spread: -3.5
7. Leave Favorite BLANK
8. Save.
9. Open the game card. Verify spread shows "Oklahoma -3.5" (favorite auto-derived from negative sign = home favored)
10. Edit the game; change spread to +7. Save.
11. Verify spread now shows "Texas -7" (favorite re-derived: positive sign = away favored)

### VT-27: Default Dashboard
1. Clear browser session storage (sessionStorage)
2. Reload app
3. Verify Dashboard tab is highlighted as active in nav
4. Verify Dashboard content is rendered (no flash of Picks/Standings/Commissioner)

### VT-29: Service Worker Cache Invalidation
1. With an old v9 build deployed and previously loaded, replace files with v10 build.
2. In the SAME browser tab (don't clear cache), reload the page.
3. Open DevTools Console. Verify no `Request scheme 'chrome-extension' is unsupported` errors from service-worker.js (extension fetches now skipped).
4. Wait for the auto-reload triggered by `controllerchange` (should fire within ~1 second of new SW activating).
5. After the auto-reload, confirm:
   - Dashboard shows "📋 All Picks by Game" card first
   - Game cards show "School (Mascot)" format (e.g. "Texas A&M (Aggies)")
   - Spreads show favored team (e.g. "Oklahoma -28.5")
6. Open DevTools → Application → Service Workers. Verify the active SW is registered with `service-worker.js?v=10`.
7. Open DevTools → Application → Cache Storage. Verify only `cfb-pickems-v10` exists; `cfb-pickems-v9c` is gone (deleted on activate).

---

## Phase II Backlog (NOT Phase I scope)

These are deferred to Phase II and not verified here:

- B2-01: Google Sheets backend (shared state across devices)
- B2-02: Real-time score auto-refresh on live games (cross-device)
- B2-03: Season obligations ledger with payment tracking
- B2-04: Email weekly recap generator
- B2-05: Configurable scoring rules (confidence pool, survivor, etc.)
- B2-06: Mobile push notifications on lock / live / final transitions
- B2-07: Photo evidence upload for cigar payment obligation
- B2-08: Pick edits before lock with history audit log
- B2-09: Multi-league support (one app instance, multiple leagues)
- B2-10: Performance: pagination/lazy-load of historical weeks

---

## Revision History

| Revision | Date | Summary | Features Affected | Issues/Regressions |
|----------|------|---------|-------------------|-------------------|
| v0.15.1 | 2026-06-01 | **Priority 1 — Spread bug**: audit confirmed math correct in all 13 test cases (`calculateAtsWinner`, `livePickStatus`, batch handlers). Real root cause = data entry sign error + stale `atsWinner` not recomputed on score edits. **Fixes**: (a) `calculateAtsWinner` now falls back to `game.spread` when `lockedSpread === null` so finalized games with unlocked weeks don't show as PENDING forever; (b) game modal spread input redesigned — drops the signed-spread number field, replaces with "Favorite" dropdown (Home/Away/PK) + positive Margin field; saves the signed home-perspective spread internally so mis-signing is impossible; (c) modal save now recomputes `atsWinner` from the just-entered spread+score so stale values can't persist. **Option A backend bootstrap**: `config.json` at site root carries `backendUrl` + `backendToken`. `loadDeployedConfig()` fetches it on boot, auto-writes to localStorage, hydrates. No per-device setup. Commissioner panel keeps URL/token fields as an emergency override. **Loud-fail sync errors** (user-requested override of v0.15's silent fallback): persistent red `.backend-error-banner` sticky-top on every screen when hydrate fails; `submitPicks` shows `confirm()` warning when sync is broken before accepting submit; "Sync still off — picks not yet shared" toast instead of cheery success. Banner has Retry (re-hydrates) and dismiss (×) buttons. Auto-hidden when `onBackendStatus('synced')` fires. **Priority 2 — Stark FINAL colors**: `.pick-cell.result-win/loss` now use saturated `var(--win)/var(--loss)` with white text and `!important` to override `tr:nth-child(even) td` zebra grey; same treatment for `.dc-chip-win/loss` in compact view. **Priority 3 — Emoji picker**: 😅 added to palette between 😭 and 😬; picker becomes a CSS grid (5×3 desktop, 7×3 mobile) with 42–44px tap targets — old flex layout was effectively ~22×22. **Priority 4 — Game time always visible**: every dashboard row now shows kickoff date+time as a base line plus a state pill (FINAL X-Y in saturated green / LIVE X-Y pulsing) when applicable. Format: "Sat 9/7 14:30 PT · FINAL 35-28". **Priority 5 — Phase III security roadmap**: SECURITY_ROADMAP.md gets a prominent top section labeled "PHASE III — SECURITY ROADMAP (Internal Tracking — DO NOT BUILD YET)" listing trigger conditions, gaps, provider comparison table, features to scope, and estimated effort. Phase I overview preserved below it. | app.js, scoring.js, backend.js, css/styles.css, config.json (NEW), CROSS_DEVICE_SETUP.md (rewritten), SECURITY_ROADMAP.md, service-worker.js (v15-1), README.md | The spread input redesign is the most consequential change — it converts a class of bugs (sign errors at data entry) into an impossible state. If Commissioner edits an existing game from v0.15 with a manually-entered spread, the modal correctly back-fills the Favorite + Margin from the stored sign. Loud-fail banner ONLY shows for real connection errors — fork-friendly silent local-mode still applies when config.json is missing or has empty values. |
| v0.15 | 2026-05-31 | **Demo mode fix (real root cause)**: batch-randomize was leaving status=scheduled while filling scores; batch-apply then nullified those scores per the `status==='scheduled'?null:hs` rule. Fixed: randomize now bumps status to `final`; apply auto-promotes scheduled→live when scores are present. **Mobile margins**: bumped `--page-pad` to 14px on phones + explicit `.main-content` padding guard. **No-flash boot**: `cfbp-booting` class on `<body>` hides `.page-wrapper` until JS calls `revealApp()` in `requestAnimationFrame` after first render. **Editable welcome text**: `settings.welcomeTitle`/`welcomeSubtitle`, editable from Commissioner → Security & Settings. **Version display**: `APP_VERSION`/`APP_VERSION_DATE` exported constants; subtle footer on Rules tab. **Tiebreaker reorder**: moved below This Week Score Summary. **Unique abbreviations**: `TEAM_ABBR` table covers ~145 FBS schools + `buildAbbrMap` dedup pass for unknown collisions; tested with State-suffix corner cases. **Compact view blinding**: `•••` chip with muted styling for unsubmitted viewers + new `dc-chip-blind` CSS class. **Reactions polish**: empty strips collapse to zero height (logged-in players still see a tiny `+`); palette expanded to 14 emojis (👍👎🔥😂😁😭😬🤡🫡🤘🤙☝️🚀🖕); fixed emoji baseline centering. **Randomize My Picks**: button on picks page, only randomizes still-pickable games, writes to draft state. **Reorderable player columns**: native HTML5 drag on desktop, 350ms long-press gate on touch (page scroll preserved via 8px movement threshold); viewer's column always defaults leftmost; `settings.dashboardColumnOrder` per-device persistence. **Feedback form** on Rules tab: pre-fills name/version/timestamp, writes to new `cfbp_feedback` key (auto-syncs), opens mailto to `settings.commissionerEmail`. **Weekly summary email**: appears in Commissioner only when all games are final; plain-text recap with picks table, winner/loser, obligations, season standings; preview + BCC mailto. **Commissioner email field** added to Security & Settings. **CROSS_DEVICE_SETUP.md** — explicit walkthrough since user hadn't set up the Sheet yet. | app.js, storage.js, css/styles.css, index.html, service-worker.js (v15), README.md, REQUIREMENTS_TEST_MATRIX.md, CROSS_DEVICE_SETUP.md (new) | Welcome message stays in default English until Commissioner edits it. Reorder uses long-press gesture on touch — discoverable enough but documented. Weekly summary uses mailto (no SMTP backend), so the message body is plain-text only. |
| v0.14 | 2026-05-30 | **UX cleanup**: bottom-nav reordered (Picks/Dashboard/Standings/Rules/Comm); default PIN/password hints removed from login screens (README defaults marked DEVELOPMENT ONLY); monkey emoji (🙈/🙉) for PIN toggle; `H` badge removed from picks page; team names centered in pick cards. **Score summary**: no-decision (`—`) column dropped; tiebreaker cells show `***` to viewers who haven't earned the right (privacy via `canViewOtherPicks` helper). **Demo persistence fix**: ESPN auto-refresh was overwriting demo scores every 60s — now skipped for `dataSourceMode: 'demo'|'manual'` weeks AND for any per-game `dataSource: 'manual'`; all Demo Sim handlers now stamp `dataSource:'manual'`. **Conferences fix**: ESPN's scoreboard payload only carries `conferenceId` (numeric) — added `ESPN_CONFERENCE_BY_ID` map + `extractConf()` helper. **Live colors reworked**: light green tint covering + light red tint trailing (same colour family as final win/loss but low-opacity + pulsing = obviously tentative); live dot/pill now maroon-themed instead of clashing amber. **ESPN gamecast link** on every dashboard row with an event ID. **Mobile pass**: `box-sizing:border-box` global; `.page-wrapper`/`.main-content` overflow-x:hidden guards; tightened `--page-pad` to 12px under 480px and 10px under 360px; header right-side wraps; player-admin row stacks to single column on phones. **Compact dashboard view**: alt renderer (`renderDashboardCompact`) with stacked per-game cards + initial chips; auto-on for phone widths; Standard/Compact toggle persisted in settings. **Emoji reactions** (😀 😭 🤡 🔥 😬 🫡): new `cfbp_reactions` storage key; `toggleReaction()` / `getReactionsForGame()` / `clearReactionsForWeek()`; chips render in matrix + compact; per-strip refresh on toggle. **Section menu** moved to bottom of Commissioner panel, collapsed by default. **TCU vs UNC** no longer auto-proposed (`REAL_WEEK_1_2026_KNOWN_GAMES = []`). **Mascot off** in dashboard matrix + Alma Mater Watch (`teamSchool()` + `matchupBare()` helpers). **Cloud sync clarity**: `getSyncStatus()` tracks lastSyncAt + lastError + pendingWrites; new "What syncs & when" panel explains every-write auto-sync, debounce, device-local exclusions, retry behavior; flush-now + pull-now buttons inside panel. **SECURITY_ROADMAP.md**: documentation of current Phase I model + Supabase/Firebase/Auth0/Clerk/Google SSO upgrade paths with complexity/cost trade-offs. | app.js, storage.js, backend.js, data-provider.js, data-model.js, index.html, css/styles.css, service-worker.js (v14), README.md, SECURITY_ROADMAP.md (new) | Demo persistence fix is the most important — it was the cause of "scores walk for a few seconds then reset." Mobile compact view defaults on iPhone-width screens; existing users on desktop keep Standard. |
| v0.13 | 2026-05-28 | **Picks formatting**: Away @ Home order (CFB convention), explicit `H` badge on home team, removed confusing "ESPN · DraftKings" provenance label from picks page (kept in commissioner). **PIN management**: per-player email field, hidden-by-default PIN with 👁 reveal toggle, "Share PIN via email" (opens mail client prefilled), "Broadcast to League" (BCC mass email, addresses stay private). `getPlayerPin()` decoder added (commissioner-only). **Security & Settings panel**: change Commissioner password (current + new + confirm + dialog), change site PIN (settings override, default fallback). **Collapsible commissioner sections**: click section title to collapse, persisted in settings; new 📚 Sections menu at top with show/hide checkboxes per section + Expand/Collapse/Show-all shortcuts. **Themes**: 7 per-device alma-mater color schemes (Aggie default, Sooner, Trojan, Irish, Boilermaker, Razorback, Neutral) — CSS variable overrides on `<body>`, inline pre-app bootstrap to avoid flash, header dropdown toggle. **Available games filters**: search, group-by (date/day/conf/region/rank/none), conference dropdown, ranked-only toggle, alma-only toggle, partial re-render preserves focus + scroll. Cascade-safe handlers via `bindAvailGroupHandlers`. | css/styles.css, data-model.js, storage.js, app.js, index.html, service-worker.js (v13), docs | None known. Filters reset on full Commissioner re-render (intentional — keeps filters in sync with refreshed pool). |
| v0.12 | 2026-05-28 | **PHASE II BACKEND**: pluggable shared storage. storage.js load()/save() now route to either localStorage ('local') or an in-memory mirror hydrated from a Google Sheet ('googleSheets') — zero call-site changes. New `backend/Code.gs` (Apps Script key/value store + snapshots), `js/backend.js` (adapter: hydrate, debounced push, ping, seed, snapshots, status events), Commissioner → ☁️ Cloud Sync panel (URL+token, test, connect, seed, pull, snapshot/restore), header sync badge, async boot with local fallback. Device-local keys (session, site unlock, backend config) never sync. Docs: backend/SETUP.md, PUBLISHING.md. | storage.js, app.js, backend.js (new), backend/Code.gs (new), index.html, css/styles.css, service-worker.js (v12), docs | Apps Script "shared token + private URL" security model — appropriate for a private league, not bank-grade. Last-write-wins concurrency; weekly snapshots are the safety net. |
| v0.11 | 2026-05-28 | **Live viz** (UN-30): dashboard live picks now soft + directional — covering=amber▲, trailing=slate▽ (never red), even=neutral, gentle pulse, reduced-motion safe; finalized keeps solid green/red ✓/✗. **Filler/pending** (UN-31): gameDataReadiness() ok/warn/incomplete; incomplete games hidden from players behind a pending notice; Commissioner warning banners; modal guards dateless saves. **USC fix** (UN-32): getAlmaMaterMatch always treats alma key as a pattern + 'USC' added + word-boundary matching → fixes both watch and suggested feed. **W–L label** (UN-33): replaced confusing "0W" with explicit W–L record shown only once games decided. **Slate mgmt** (UN-34): cascade-safe removal (deletes orphaned picks + lock override, with confirm + warning), remove from available list, dismiss/restore suggested games (persisted per week). **Batch demo** (UN-35): batch grid edits every game's score+status with Apply All + Randomize. **Notifications prep** (UN-36): player schema gains phone/phoneVerified/notifyPrefs; new inert js/notifications.js seam. | data-model.js, storage.js, app.js, css/styles.css, notifications.js (new), docs | None known. notifications.js is inert (no provider, feature-flag off). |
| v0.10 | 2026-05-27 | **CRITICAL FIX**: Service worker no longer serves stale v9 cached files — CACHE_NAME bumped to `cfb-pickems-v10`, app shell switched to network-first, `?v=10` cache-bust on app.js/styles.css/service-worker.js, controllerchange auto-reload. Also silences `chrome-extension://` console error by skipping non-http(s) schemes. **CRITICAL FIX**: Restored "All Picks by Game" matrix to Dashboard (was missing in v0.9). Locked dashboard section order: All Picks → Alma Mater Watch → This Week. **NEW**: Team display "School (Mascot)" everywhere (getTeamDisplay + TEAM_MASCOT_LOOKUP fallback). **NEW**: homeMascot/awayMascot fields on game + ESPN extraction from team.location/team.name. **FIX**: Spread display always shows favored team, even when game.favorite is null (formatSpread derives from spread sign + game). **FIX**: Game-add modal uses precise getAlmaMaterMatch (was raw substring causing Arkansas/Arkansas State confusion). **NEW**: Mascot inputs in showGameModal + auto-favorite from spread sign. **NEW**: Final games without spread show "Final" not "—" or "TBD". **NEW**: Dashboard is default tab on load. **EXPANDED**: Export Data section with 11 options (per-week CSVs, league CSVs, JSON full backup, full CSV bundle). | data-model.js, data-provider.js, app.js, css/styles.css, index.html, service-worker.js, REQUIREMENTS_TEST_MATRIX.md, README.md | Old service worker MAY require a single forced reload (Cmd-Shift-R / Ctrl-Shift-R) on the very first v10 visit if browser already had v9 SW installed; subsequent updates are automatic. |
| v0.9 | 2026-05-18 | Site PIN gate; precise alma mater matching; demo simulation mode; dashboard as default tab; dashboard section reorder (initial — broke matrix); spread display with team name; week status reopen from any state; scoped reset; weekly history visibility; custom week label in create modal; player initials; school (mascot) format | All tabs, data-model, storage, scoring, data-provider | All Picks by Game accidentally removed from Dashboard (fixed in v0.10) |
| v0.8 | 2026-05-17 | Kickoff TBD detection; venue city/state display; date-range filtering; multi-day fetch; live tentative ATS coloring; alma mater removed from picks/standings display | data-provider, data-model, app.js | None known |
| v0.7 | 2026-05-17 | Timezone toggle; real Week 1 2026 as default; demo week relabeled; 3-layer slate (pool/suggested/selected); Commissioner PIN management; standings simplified | All files | None known |
| v0.6 | 2026-05-17 | Removed CORS proxy (ESPN allows direct browser calls); multi-proxy fallback; data proof panel; no silent fallback to demo data | data-provider.js | None known |
| v0.5 | 2026-05-14 | Week manager; data source mode per week; ESPN URL transparency; available games pool; score refresh by event ID | app.js, storage.js | corsproxy.io 403 (fixed in v0.6) |
| v0.4 | 2026-05-14 | Tiebreaker system; No Decision (no push); Historical Demo Week; Commissioner rename | data-model, scoring, app.js | None known |
| v0.3 | 2026-05-14 | PIN login; week lock enforcement; historical ESPN fetch; prior week dashboard | app.js, storage.js | None known |
| v0.2 | 2026-05-11 | ATS scoring engine; dashboard; ESPN API integration; Aggie maroon theme | All files | None known |
| v0.1 | 2026-05-11 | Initial Phase 1: picks submission, admin panel, demo data, PWA shell | All files | None known |
