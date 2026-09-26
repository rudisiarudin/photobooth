/**
 * Verification harness for lib/captureStore.ts.
 *
 * The bug this guards against: the old save path appended a photo and sliced
 * to 50, which assumed ~12 MB. Chromium caps an origin at ~5 MB, so past ~20
 * A6000-sized photos the write threw, the catch swallowed it, and the UI still
 * reported "saved". Photos vanished in front of guests with no warning.
 *
 * These tests run against a fake localStorage with a real byte ceiling, so the
 * quota behaviour is exercised for real rather than asserted in the abstract.
 *
 * Usage: node scripts/verify-capture-store.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import ts from 'typescript'

const here = dirname(fileURLToPath(import.meta.url))

function load(rel) {
  const file = join(here, '..', rel)
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  })
  const e = {}
  const m = { exports: e }
  new Function('exports', 'module', 'require', outputText)(e, m, () => ({}))
  return m.exports
}

/** localStorage stand-in with a hard byte ceiling, as browsers have. */
class FakeStorage {
  constructor(limitBytes) {
    this.limit = limitBytes
    this.map = new Map()
  }
  #bytes() {
    let n = 0
    for (const [k, v] of this.map) n += (k.length + v.length) * 2
    return n
  }
  getItem(k) {
    return this.map.has(k) ? this.map.get(k) : null
  }
  setItem(k, v) {
    const prev = this.map.get(k)
    this.map.set(k, String(v))
    if (this.#bytes() > this.limit) {
      if (prev === undefined) this.map.delete(k)
      else this.map.set(k, prev)
      const err = new Error('QuotaExceededError')
      err.name = 'QuotaExceededError'
      err.code = 22
      throw err
    }
  }
  removeItem(k) {
    this.map.delete(k)
  }
  clear() {
    this.map.clear()
  }
}

let failures = 0
const check = (name, ok, detail) => {
  if (!ok) failures++
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`)
}

const AVG_PHOTO_BYTES = 188 * 1024 // measured mean of the real A6000 captures

/** A photo as it is actually stored: a base64 data URL. */
function makeCapture(i) {
  const b64 = 'x'.repeat(Math.round((AVG_PHOTO_BYTES * 4) / 3))
  return {
    name: `photo-${i}.jpg`,
    url: `data:image/jpeg;base64,${b64}`,
    size: AVG_PHOTO_BYTES,
    createdAt: new Date(2026, 0, 1, 0, i).toISOString(),
  }
}

function withStorage(limitBytes, fn) {
  globalThis.localStorage = new FakeStorage(limitBytes)
  // The module reads localStorage at call time, so a fresh import per limit is
  // not needed — but the module is loaded once, so just swap the global.
  return fn(globalThis.localStorage)
}

const { saveCapture, loadCaptures, deleteCapture, STORAGE_KEY } = load(
  join('src', 'lib', 'captureStore.ts')
)

console.log('\n=== 1. Fills up gracefully instead of failing silently ===')
{
  // 5 MB is the real Chromium per-origin ceiling.
  const LIMIT = 5 * 1024 * 1024
  withStorage(LIMIT, () => {
    let saved = 0
    let failed = 0
    let evictionEvents = 0
    let lastEvicted = 0

    for (let i = 1; i <= 60; i++) {
      const out = saveCapture(makeCapture(i))
      if (out.status === 'saved') {
        saved++
        if (out.evicted.length > 0) {
          evictionEvents++
          lastEvicted = out.evicted.length
        }
      } else {
        failed++
      }
    }

    const stored = loadCaptures()
    // Note the real ceiling: localStorage stores the *base64 string* as UTF-16,
    // so a 188 KB JPEG costs ~0.49 MB of quota, not 0.19 MB. On a 5 MB origin
    // that is only ~10 photos, not ~20.
    const perPhotoMB = (AVG_PHOTO_BYTES * 4) / 3 * 2 / 1048576
    const expected = Math.floor((5 * 1048576) / (perPhotoMB * 1048576))
    console.log(`    stored after 60 photos: ${stored.length} (quota cost ${perPhotoMB.toFixed(2)} MB/photo → ~${expected} fit)`)

    check('never claims a save it did not perform', failed === 0, `${failed} failures`)
    check('storage fills to the physical limit, not less', stored.length >= expected - 2 && stored.length <= expected + 2,
      `${stored.length} photos vs ~${expected} expected`)
    check('reports eviction when it drops old photos', evictionEvents > 0,
      `${evictionEvents} eviction events, last dropped ${lastEvicted}`)

    // The newest photo must always be present — that is the guest's photo.
    check('the newest photo is always kept', stored.some((c) => c.name === 'photo-60.jpg'),
      `newest = ${stored[0]?.name}`)

    // Oldest-first eviction: the survivors must be a contiguous recent window.
    const names = stored.map((c) => Number(c.name.match(/(\d+)\.jpg/)[1]))
    const sorted = [...names].sort((a, b) => b - a)
    check('survivors are the most recent photos, oldest evicted first',
      names.every((n, idx) => n === sorted[idx]),
      `range ${Math.min(...names)}–${Math.max(...names)}`)
  })
}

console.log('\n=== 2. Never evicts the photo being saved ===')
{
  withStorage(5 * 1024 * 1024, () => {
    for (let i = 1; i <= 25; i++) saveCapture(makeCapture(i))
    const out = saveCapture(makeCapture(999))
    const stored = loadCaptures()
    check('new photo survives an eviction round', stored.some((c) => c.name === 'photo-999.jpg'),
      `evicted ${out.evicted.length} to make room`)
    check('evicted list never includes the new photo',
      !out.evicted.includes('photo-999.jpg'), out.evicted.join(', ').slice(0, 60) || 'none')
  })
}

console.log('\n=== 3. A single oversized photo fails honestly ===')
{
  // Room for roughly two photos only.
  withStorage(AVG_PHOTO_BYTES * 3, () => {
    const huge = { ...makeCapture(1), name: 'huge.jpg', url: `data:image/jpeg;base64,${'x'.repeat(AVG_PHOTO_BYTES * 20)}` }
    const out = saveCapture(huge)
    check('reports failure instead of pretending success', out.status === 'failed',
      `status=${out.status} reason="${out.reason ?? ''}"`)
    check('failure reason is human-readable', /penuh|full/i.test(out.reason ?? ''), out.reason)
  })
}

console.log('\n=== 4. Corrupt stored data does not break the gallery ===')
{
  withStorage(5 * 1024 * 1024, () => {
    globalThis.localStorage.setItem(STORAGE_KEY, '{not valid json')
    check('corrupt JSON reads as empty', loadCaptures().length === 0)
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ nope: true }, 'string', 42]))
    check('malformed entries are filtered out', loadCaptures().length === 0)
    const out = saveCapture(makeCapture(1))
    check('can still save after recovering from corruption', out.status === 'saved')
  })
}

console.log('\n=== 5. Delete frees a specific photo ===')
{
  withStorage(5 * 1024 * 1024, () => {
    saveCapture(makeCapture(1))
    saveCapture(makeCapture(2))
    const before = loadCaptures().length
    const ok = deleteCapture('photo-1.jpg')
    check('deletes the named capture', ok && loadCaptures().length === before - 1)
    check('deleting a missing name is a no-op', deleteCapture('nope.jpg') === false)
  })
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`)
process.exit(failures === 0 ? 0 : 1)
