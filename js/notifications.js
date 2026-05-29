/**
 * CFB Pickems — Notifications Module (Phase III PREP — NOT YET ACTIVE)
 *
 * Purpose: give a stable seam for SMS/email "All Picks by Game" status updates
 * without building the delivery pipeline yet. Nothing here sends anything today;
 * every send funnels through a single `dispatch()` that currently no-ops (logs
 * in dev). When you wire a real provider (Twilio for SMS, Resend/SES/Postmark
 * for email — or a Google Apps Script proxy once the Sheets backend exists),
 * you implement ONE function (`registerProvider`) and the rest works.
 *
 * Design intent:
 *  - Pure functions that BUILD messages are separated from the IMPULSE to send.
 *    This keeps message formatting unit-testable with no network.
 *  - Channels (sms/email) and events (picksOpen, picksReminder, gameFinal,
 *    weeklyRecap) are enumerated so opt-in prefs on the player object line up 1:1.
 *  - An outbox queue is kept in memory (and can later be persisted) so retries
 *    and "what would have been sent" auditing are possible.
 *
 * IMPORTANT: This module is imported lazily by app code behind a feature flag
 * (settings.notificationsEnabled). Today that flag is false, so none of this runs.
 */

export const NOTIFY_CHANNELS = { SMS: 'sms', EMAIL: 'email' };

export const NOTIFY_EVENTS = {
  PICKS_OPEN:      'picksOpen',      // week opened for picks
  PICKS_REMINDER:  'picksReminder',  // X hours before lock, player hasn't submitted
  GAME_FINAL:      'gameFinal',      // a game on the slate went final
  WEEKLY_RECAP:    'weeklyRecap',    // week finalized — standings + winner/loser
};

// ── Provider registration ─────────────────────────────────────────────────────
// A provider implements: async send({ channel, to, subject, body, meta }) -> {ok, id?, error?}
// Until one is registered, dispatch() no-ops (dev: console.log).
let _provider = null;
export function registerProvider(providerImpl) { _provider = providerImpl; }
export function hasProvider() { return !!_provider; }

// ── In-memory outbox (later: persist to storage or push to backend) ────────────
const _outbox = [];
export function getOutbox() { return [..._outbox]; }
export function clearOutbox() { _outbox.length = 0; }

// ── Message builders (PURE — safe to unit test, no side effects) ───────────────

/** Build the per-player "all picks by game" status text for a week. */
export function buildPicksStatusMessage({ playerName, weekLabel, rows }) {
  // rows: [{ matchup, pick, status }] where status in win|loss|live|pending|no_decision
  const icon = { win:'✓', loss:'✗', no_decision:'—', live:'•', pending:'·' };
  const lines = (rows || []).map(r => `${icon[r.status] || '·'} ${r.matchup}: ${r.pick}`);
  const body = `${playerName} — ${weekLabel}\n${lines.join('\n')}`;
  return { subject: `Your picks — ${weekLabel}`, body };
}

/** Build a "picks are open" nudge. */
export function buildPicksOpenMessage({ playerName, weekLabel, lockTimeStr }) {
  return {
    subject: `Picks open — ${weekLabel}`,
    body: `${playerName}, picks for ${weekLabel} are open. Lock${lockTimeStr ? `s ${lockTimeStr}` : 's soon'}. Get 'em in.`,
  };
}

/** Build a weekly recap. */
export function buildWeeklyRecapMessage({ weekLabel, winnerName, loserName, leaderName }) {
  const parts = [`${weekLabel} is final.`];
  if (winnerName) parts.push(`🏆 ${winnerName} took the week.`);
  if (loserName)  parts.push(`💀 ${loserName} is on the hook.`);
  if (leaderName) parts.push(`👑 Season leader: ${leaderName}.`);
  return { subject: `${weekLabel} recap`, body: parts.join(' ') };
}

// ── Eligibility — who should receive a given event on a given channel ──────────

/** Returns true if the player has opted into (channel, event) and is reachable. */
export function isEligible(player, channel, event) {
  if (!player || !player.active) return false;
  const prefs = player.notifyPrefs?.[channel];
  if (!prefs?.enabled || !prefs?.[event]) return false;
  if (channel === NOTIFY_CHANNELS.SMS)   return !!player.phone && !!player.phoneVerified;
  if (channel === NOTIFY_CHANNELS.EMAIL) return !!player.email;
  return false;
}

/** Resolve the destination address for a channel. */
function addressFor(player, channel) {
  return channel === NOTIFY_CHANNELS.SMS ? player.phone : player.email;
}

// ── Dispatch — the ONE place anything is "sent" ────────────────────────────────
// Today: queues to outbox and no-ops (or logs in dev). Later: calls _provider.send.

export async function dispatch({ channel, event, player, message, meta = {} }) {
  const entry = {
    queuedAt: new Date().toISOString(),
    channel, event,
    to: addressFor(player, channel),
    playerId: player?.playerId,
    subject: message?.subject,
    body: message?.body,
    meta,
    status: 'queued',
  };
  _outbox.push(entry);

  if (!_provider) {
    // Phase III not wired yet — record intent only.
    if (typeof console !== 'undefined') console.debug('[notifications] (no provider) would send:', entry);
    entry.status = 'noop';
    return { ok: false, noop: true };
  }

  try {
    const res = await _provider.send({ channel, to: entry.to, subject: entry.subject, body: entry.body, meta });
    entry.status = res?.ok ? 'sent' : 'failed';
    entry.providerId = res?.id || null;
    entry.error = res?.error || null;
    return res;
  } catch (err) {
    entry.status = 'failed';
    entry.error = String(err?.message || err);
    return { ok: false, error: entry.error };
  }
}

/**
 * Fan out one event to all eligible players across all channels.
 * `buildFor(player, channel)` returns the {subject, body} message for that player.
 * Returns a summary { attempted, eligible, results: [...] }.
 */
export async function notifyAll({ players, event, buildFor, meta = {} }) {
  const channels = [NOTIFY_CHANNELS.SMS, NOTIFY_CHANNELS.EMAIL];
  const results = [];
  let eligible = 0;
  for (const player of players || []) {
    for (const channel of channels) {
      if (!isEligible(player, channel, event)) continue;
      eligible++;
      const message = buildFor(player, channel);
      results.push(await dispatch({ channel, event, player, message, meta }));
    }
  }
  return { attempted: results.length, eligible, results };
}
