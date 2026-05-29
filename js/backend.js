/**
 * CFB Pickems — Backend Adapter (Phase II)
 * =========================================
 * Talks to the Google Apps Script web app and keeps an in-memory mirror of all
 * storage keys so the rest of the app can keep using SYNCHRONOUS load()/save().
 *
 * Why a mirror?
 *   The whole app was built around synchronous localStorage. Rewriting every
 *   call site to be async would be a huge, risky change. Instead:
 *     - At startup we pull the full snapshot ONCE (async) into `_cache`.
 *     - storage.js reads/writes `_cache` synchronously (instant, like before).
 *     - Writes are also queued and pushed to the Sheet (debounced) in the
 *       background. Last-write-wins, which is fine for a small league.
 *
 * Modes (storage.js decides which to use based on settings.storageMode):
 *   - 'local'         : pure localStorage (default; offline; per-device)
 *   - 'googleSheets'  : this adapter (shared across devices)
 *
 * Config lives in localStorage (so it survives reloads and never ships in source):
 *   cfbp_backend_config = { url, token }
 */

const CFG_KEY = 'cfbp_backend_config';

const _cache = new Map();      // key -> parsed value (the synchronous mirror)
let _ready = false;            // true once hydrated from the Sheet
let _config = null;            // { url, token }
let _pushTimer = null;
const _dirty = new Set();      // keys changed since last push
const _listeners = new Set();  // status change subscribers

// ── Config ────────────────────────────────────────────────────────────────────
export function getBackendConfig() {
  if (_config) return _config;
  try { _config = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); }
  catch { _config = null; }
  return _config;
}
export function setBackendConfig(url, token) {
  _config = { url: (url || '').trim().replace(/\/$/, ''), token: (token || '').trim() };
  localStorage.setItem(CFG_KEY, JSON.stringify(_config));
  return _config;
}
export function clearBackendConfig() {
  _config = null;
  localStorage.removeItem(CFG_KEY);
}
export function isBackendConfigured() {
  const c = getBackendConfig();
  return !!(c && c.url && c.token);
}
export function isBackendReady() { return _ready; }

// ── Status events (so the UI can show a sync indicator) ────────────────────────
export function onBackendStatus(fn) { _listeners.add(fn); return () => _listeners.delete(fn); }
function emit(status, detail) { _listeners.forEach(fn => { try { fn(status, detail); } catch {} }); }

// ── Low-level transport ─────────────────────────────────────────────────────
async function call(action, payload = {}) {
  const c = getBackendConfig();
  if (!c || !c.url) throw new Error('Backend not configured');
  const body = JSON.stringify({ action, token: c.token, ...payload });
  // Apps Script web apps accept text/plain without a CORS preflight, which
  // avoids the OPTIONS request that Apps Script does not handle.
  const res = await fetch(c.url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Backend error');
  return data;
}

// ── Connection test ───────────────────────────────────────────────────────────
export async function pingBackend() {
  try {
    const data = await call('ping');
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
}

// ── Hydrate the in-memory mirror from the Sheet ────────────────────────────────
export async function hydrate() {
  emit('syncing');
  const data = await call('getAll');
  _cache.clear();
  Object.entries(data.data || {}).forEach(([k, v]) => _cache.set(k, v));
  _ready = true;
  emit('synced', { keys: _cache.size });
  return _cache.size;
}

/**
 * Seed an EMPTY backend from a local snapshot (first-time migration).
 * Only writes keys the backend doesn't already have, unless force=true.
 */
export async function seedFromLocal(localSnapshot, force = false) {
  const remote = (await call('getAll')).data || {};
  const entries = {};
  Object.entries(localSnapshot).forEach(([k, v]) => {
    if (force || !(k in remote)) entries[k] = v;
  });
  if (Object.keys(entries).length) await call('setMany', { entries });
  return Object.keys(entries).length;
}

// ── Synchronous cache accessors (used by storage.js when in sheets mode) ───────
export function cacheGet(key) {
  return _cache.has(key) ? _cache.get(key) : null;
}
export function cacheSet(key, value) {
  _cache.set(key, value);
  _dirty.add(key);
  schedulePush();
}

// ── Debounced background push to the Sheet ─────────────────────────────────────
function schedulePush() {
  if (_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(flushPush, 800);
}
export async function flushPush() {
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null; }
  if (!_dirty.size) return { pushed: 0 };
  // If the backend isn't configured (e.g. user disconnected mid-session), keep
  // the dirty set for later and bail quietly instead of throwing.
  const c = getBackendConfig();
  if (!c || !c.url) return { pushed: 0, skipped: true };
  const entries = {};
  _dirty.forEach(k => { entries[k] = _cache.has(k) ? _cache.get(k) : null; });
  _dirty.clear();
  emit('syncing');
  try {
    await call('setMany', { entries });
    emit('synced', { pushed: Object.keys(entries).length });
    return { pushed: Object.keys(entries).length };
  } catch (err) {
    // Re-mark dirty so a later push retries
    Object.keys(entries).forEach(k => _dirty.add(k));
    emit('error', { error: String(err.message || err) });
    throw err;
  }
}

// ── Manual full refresh (pull) ─────────────────────────────────────────────────
export async function refreshFromBackend() { return hydrate(); }

// ── Season snapshots / backups ─────────────────────────────────────────────────
export async function createSnapshot(label = '') { return call('snapshot', { label }); }
export async function listSnapshots() { return (await call('listSnapshots')).snapshots || []; }
export async function restoreSnapshot(id) { const r = await call('restoreSnapshot', { id }); await hydrate(); return r; }
