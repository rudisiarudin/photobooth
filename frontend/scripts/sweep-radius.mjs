/**
 * Radius/strength sweep for smoothSkin().
 *
 * Two numbers decide whether the skin looks right:
 *   effect  — mean |Δ| on flat forehead skin. Too low and the filter does
 *             nothing visible; we want roughly 2–4 levels so pores soften
 *             without the face turning to wax.
 *   haloΔ   — how much the skin next to the eye darkened. Any value beyond
 *             about ±2 levels is a visible grey ring.
 *
 * Usage: node scripts/sweep-radius.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import ts from 'typescript'

const here = dirname(fileURLToPath(import.meta.url))
const SCRATCH = join(tmpdir(), 'beauty-sweep')
mkdirSync(SCRATCH, { recursive: true })

const beautyPath = join(here, '..', 'src', 'lib', 'beauty.ts')
const originalSource = readFileSync(beautyPath, 'utf8')

function load(source, file) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  })
  const e = {}
  const m = { exports: e }
  new Function('exports', 'module', 'require', outputText)(e, m, () => ({}))
  return m.exports
}

/* ------------------------------ test portrait ------------------------------ */

const W = 420, H = 520, CX = 210, CY = 270.4, FX = 118, FY = 162
const EYE = [CX - 46, CY - 30], EYE_R = 16

let seed = 987654321
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v)

function makeFace() {
  const d = new Uint8ClampedArray(W * H * 4)
  const eyes = [[CX - 46, CY - 30], [CX + 46, CY - 30]]
  const eyeR = EYE_R, irisR = 8, pupilR = 4
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4
    const dx = (x - CX) / FX, dy = (y - CY) / FY, rr = dx * dx + dy * dy
    let r, g, b
    if (rr < 1) {
      const shade = 1 - Math.sqrt(rr) * 0.30
      r = 236 * shade; g = 190 * shade; b = 166 * shade
      const cheek = Math.hypot(x - (CX - 52), y - (CY + 26)) / 60
      r += Math.max(0, 1 - cheek) * 10; g -= Math.max(0, 1 - cheek) * 4
      const fore = Math.hypot(x - CX, y - (CY - 95)) / 70
      r += Math.max(0, 1 - fore) * 8; g += Math.max(0, 1 - fore) * 6; b += Math.max(0, 1 - fore) * 4
      const blot = Math.sin(x * 0.031 + y * 0.017) * 3.2 + Math.sin(x * 0.011 - y * 0.023) * 2.4
      r += blot; g += blot * 0.8; b += blot * 0.6
      const pore = (rnd() - 0.5) * 13 + Math.sin(x * 1.7) * 1.6 + Math.cos(y * 1.9) * 1.4
      r += pore; g += pore * 0.9; b += pore * 0.8
      const nose = Math.abs(x - CX - Math.sin((y - CY + 40) * 0.06) * 7)
      if (y > CY - 10 && y < CY + 62 && nose < 13) { const k = 1 - nose / 13; r -= k * 26; g -= k * 22; b -= k * 18 }
      for (const [ex, ey] of eyes) {
        const ed = Math.hypot(x - ex, y - ey)
        if (ed < eyeR) {
          const k = 1 - ed / eyeR; r -= k * 14; g -= k * 12; b -= k * 10
          r = 236; g = 232; b = 226
          const id = Math.hypot(x - ex, y - ey)
          if (id < irisR) { r = 96; g = 68; b = 44; if (id < pupilR) { r = 22; g = 18; b = 16 } else if (id > irisR - 1.5) { r = 58; g = 40; b = 26 } }
          if (y < ey - eyeR * 0.45 && y > ey - eyeR - 2) { const k2 = 1 - Math.abs(y - (ey - eyeR * 0.75)) / 2.4; if (k2 > 0) { r -= k2 * 190; g -= k2 * 190; b -= k2 * 190 } }
        }
        const by = ey - 30 - Math.abs(x - ex) * 0.06
        if (Math.abs(y - by) < 3.4 && Math.abs(x - ex) < 26) { const k = 1 - Math.abs(y - by) / 3.4; r -= k * 120; g -= k * 112; b -= k * 104 }
      }
      const lipY = CY + 108, lipW = 34 - Math.abs(y - lipY) * 0.10
      if (Math.abs(y - lipY) < 9 && Math.abs(x - CX) < lipW) { const k = 1 - Math.abs(y - lipY) / 9; r = 186 - k * 26; g = 108 - k * 30; b = 104 - k * 26 }
      if (y < CY - 108 + Math.abs(x - CX) * 0.10) { r = 44; g = 34; b = 30 }
    } else {
      const grain = Math.sin(x * 0.55 + Math.sin(y * 0.05) * 2) * 9
      const vign = 1 - Math.hypot(x - CX, y - CY) / 900
      r = (168 + grain) * vign; g = (112 + grain * 0.7) * vign; b = (66 + grain * 0.4) * vign
    }
    d[p] = clamp(r); d[p + 1] = clamp(g); d[p + 2] = clamp(b); d[p + 3] = 255
  }
  return { data: d, width: W, height: H }
}

const orig = makeFace()
const clone = (i) => ({ data: new Uint8ClampedArray(i.data), width: i.width, height: i.height })

const inForehead = (x, y) => y > CY - 100 && y < CY - 72 && Math.abs(x - CX) < 60

/** Mean red channel in the ring of skin right outside the eye. */
function nearEye(img) {
  let s = 0, n = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - EYE[0], y - EYE[1])
    if (d < EYE_R || d >= EYE_R + 9) continue
    if (x > CX - 10 && x < CX + 10 && y > CY - 10 && y < CY + 70) continue // nose
    s += img.data[(y * W + x) * 4]; n++
  }
  return s / n
}

function effect(img) {
  let s = 0, n = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inForehead(x, y)) continue
    const p = (y * W + x) * 4
    s += (Math.abs(img.data[p] - orig.data[p]) + Math.abs(img.data[p + 1] - orig.data[p + 1]) + Math.abs(img.data[p + 2] - orig.data[p + 2])) / 3
    n++
  }
  return s / n
}

const baseNear = nearEye(orig)

console.log('coef   amount  effect  haloΔ   verdict')
console.log('─────────────────────────────────────────────')
const COEFS = [0.014, 0.018, 0.022]
const AMOUNTS = [0.30, 0.42, 0.48, 0.55, 0.60]

for (const coef of COEFS) {
  for (const amt of AMOUNTS) {
    const src = originalSource.replace(
      /const radius = Math\.max\(1, Math\.round\(minDim \* [\d.]+ \* \(0\.5 \+ amount\)\)\)/,
      `const radius = Math.max(1, Math.round(minDim * ${coef} * (0.5 + amount)))`
    )
    if (src === originalSource && coef !== 0.006) { console.log('  (pattern miss, stopping)'); process.exit(1) }
    const file = join(SCRATCH, 'beauty-variant.ts')
    writeFileSync(file, src, 'utf8')
    const mod = load(src, file)
    const out = clone(orig)
    mod.smoothSkin(out, amt)
    const eff = effect(out)
    const halo = nearEye(out) - baseNear
    const ok = Math.abs(halo) < 2.0
    const visible = eff > 1.5
    const verdict = ok && visible ? 'GOOD' : ok ? 'too weak' : 'HALO'
    console.log(`${coef.toFixed(3)}  ${amt.toFixed(2)}   ${eff.toFixed(2).padStart(5)}  ${halo.toFixed(2).padStart(6)}   ${verdict}`)
  }
}
