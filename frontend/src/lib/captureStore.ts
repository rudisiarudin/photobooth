/**
 * Client-side capture storage.
 *
 * On a static host (Vercel) there is no backend, so every photo has to live in
 * localStorage as a base64 data URL. That budget is small and hard-capped by
 * the browser:
 *
 *   - Chromium desktop: ~5 MB total per origin (measured on yukpose.vercel.app)
 *   - A single A6000 photo averages 188 KB on disk, ~251 KB once base64-encoded
 *   - 5 MB / 251 KB = about 20 photos
 *
 * The original code appended a new entry and then sliced to 50, which assumed
 * ~12 MB. Past the real quota the write threw, the catch swallowed it, and the
 * UI still reported "saved" — so photos were being lost silently in front of
 * guests. This module makes the limit explicit: it evicts the oldest captures
 * to make room, and it reports honestly when it had to do so.
 */

export interface StoredCapture {
  name: string
  url: string
  size: number
  createdAt: string
}

export const STORAGE_KEY = 'itpalugada_captures'

/** Target number of captures to keep. Not a promise — the quota decides. */
export const MAX_CAPTURES = 50

/**
 * Safety margin below the browser quota. Writes that land within a few percent
 * of the limit can still fail depending on how the browser accounts for the
 * rest of the origin's storage, so we aim below the ceiling.
 */
const QUOTA_MARGIN_BYTES = 512 * 1024

export type SaveOutcome =
  | { status: 'saved'; evicted: string[] }
  | { status: 'evicted'; evicted: string[]; freedBytes: number }
  | { status: 'failed'; reason: string; evicted: string[] }

/** Reads the stored captures, tolerating corrupt or absent data. */
export function loadCaptures(): StoredCapture[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isCapture) : []
  } catch {
    return []
  }
}

function isCapture(v: unknown): v is StoredCapture {
  if (!v || typeof v !== 'object') return false
  const c = v as Record<string, unknown>
  return typeof c.name === 'string' && typeof c.url === 'string'
}

/** Current payload size in bytes (UTF-16 code units for localStorage). */
function payloadSize(captures: StoredCapture[]): number {
  return JSON.stringify(captures).length * 2
}

function isQuotaError(err: unknown): boolean {
  if (!err) return false
  if (typeof DOMException !== 'undefined' && err instanceof DOMException) {
    return err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22
  }
  const msg = String((err as Error)?.message ?? err).toLowerCase()
  return msg.includes('quota') || msg.includes('storage')
}

/**
 * Stores a capture, evicting the oldest entries until it fits.
 *
 * `loadCaptures()` returns newest-first, so the tail of the list is the oldest.
 * We drop from the tail and retry the write; the caller gets back exactly which
 * names were removed so the UI can be honest instead of silently losing a
 * guest's photo.
 */
export function saveCapture(capture: StoredCapture): SaveOutcome {
  const existing = loadCaptures()
  const evicted: string[] = []

  // list[0] is the capture being saved and is never evicted.
  const list: StoredCapture[] = [capture, ...existing].slice(0, MAX_CAPTURES)

  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      return { status: 'saved', evicted }
    } catch (err) {
      if (!isQuotaError(err)) {
        return { status: 'failed', reason: (err as Error)?.message ?? 'unknown error', evicted }
      }
      if (list.length === 1) break
      const dropped = list.pop()
      if (dropped) evicted.push(dropped.name)
    }
  }

  return {
    status: 'failed',
    reason: 'storage full — photo could not be saved',
    evicted,
  }
}

/** Deletes one capture by name. Returns true if something was removed. */
export function deleteCapture(name: string): boolean {
  const list = loadCaptures()
  const next = list.filter((c) => c.name !== name)
  if (next.length === list.length) return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}

/** Best-effort read of how much room is left, or null when unknown. */
export function remainingBytes(): number | null {
  if (typeof localStorage === 'undefined') return null
  // Binary-search the writable ceiling. Only worth doing once per session.
  const probe = (n: number): boolean => {
    try {
      localStorage.setItem('__itpalugada_probe', 'x'.repeat(n))
      localStorage.removeItem('__itpalugada_probe')
      return true
    } catch {
      return false
    }
  }
  let lo = 0
  let hi = 16 * 1024 * 1024
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    if (probe(mid)) lo = mid
    else hi = mid - 1
  }
  return Math.max(0, lo - payloadSize(loadCaptures()) - QUOTA_MARGIN_BYTES)
}

/** Rough count of photos that still fit at the given average size. */
export function estimateRemainingPhotos(avgBytes: number): number | null {
  const left = remainingBytes()
  if (left === null || avgBytes <= 0) return null
  return Math.max(0, Math.floor(left / (avgBytes * 4 / 3)))
}
