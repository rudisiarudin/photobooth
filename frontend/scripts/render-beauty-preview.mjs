/**
 * Visual diagnostic for lib/beauty.ts.
 *
 * verify-beauty.mjs proves the numbers move in the right direction, but it
 * cannot show a halo. This renders contact sheets (original vs. a sweep of
 * smoothing strengths, plus zoomed eye crops) to PNG so the artifact can
 * actually be looked at.
 *
 * Usage: node scripts/render-beauty-preview.mjs
 * Output: $TMPDIR/beauty-preview/{sheet,eyes}.png
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import ts from 'typescript'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(tmpdir(), 'beauty-preview')

function loadModule(relPath) {
  const file = join(here, '..', relPath)
  const source = readFileSync(file, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  })
  const exports = {}
  const moduleObj = { exports }
  new Function('exports', 'module', 'require', outputText)(exports, moduleObj, () => ({}))
  return moduleObj.exports
}

const beauty = loadModule(join('src', 'lib', 'beauty.ts'))
const render = loadModule(join('src', 'lib', 'render.ts'))
const { smoothSkin, processImageData } = beauty
const { FILTER_GRADES, FILTER_SMOOTHING } = render

/* ----------------------------- PNG encoder ----------------------------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePNG(width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  // Copy row by row from the Uint8ClampedArray itself. Reading via
  // rgba.buffer + byteOffset is unsafe here: a typed array can be a view onto a
  // larger pooled ArrayBuffer, so the offset/stride math does not line up and
  // the image comes out as a black strip.
  for (let y = 0; y < height; y++) {
    const o = y * (stride + 1)
    raw[o] = 0 // filter: none
    for (let x = 0; x < stride; x++) {
      raw[o + 1 + x] = rgba[y * stride + x]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* --------------------------- Synthetic portrait --------------------------- */

const W = 420
const H = 520
const CX = W / 2
const CY = H * 0.52
const FACE_RX = 118
const FACE_RY = 162

let seed = 987654321
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v)

/**
 * A portrait that reproduces the hard cases:
 *  - warm wood-grain background (chroma close to skin -> mask bleed risk)
 *  - fine skin texture/pores (what plastic smoothing destroys)
 *  - two dark eyes against light skin (halo risk around the socket)
 *  - brows, lips, hairline (strong edges that must survive)
 */
function makeFace() {
  const d = new Uint8ClampedArray(W * H * 4)
  const eyes = [
    [CX - 46, CY - 30],
    [CX + 46, CY - 30],
  ]
  const eyeR = 16
  const irisR = 8
  const pupilR = 4

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 4
      const dx = (x - CX) / FACE_RX
      const dy = (y - CY) / FACE_RY
      const rr = dx * dx + dy * dy

      let r, g, b

      if (rr < 1) {
        /* ---- skin ---- */
        const fall = Math.sqrt(rr)                    // 0 centre -> 1 edge
        const shade = 1 - fall * 0.30                 // centre brighter
        r = 236 * shade
        g = 190 * shade
        b = 166 * shade

        // cheek warmth + forehead highlight
        const cheek = Math.hypot(x - (CX - 52), y - (CY + 26)) / 60
        r += Math.max(0, 1 - cheek) * 10
        g -= Math.max(0, 1 - cheek) * 4
        const fore = Math.hypot(x - CX, y - (CY - 95)) / 70
        r += Math.max(0, 1 - fore) * 8
        g += Math.max(0, 1 - fore) * 6
        b += Math.max(0, 1 - fore) * 4

        // low-frequency blotches (uneven skin tone)
        const blot =
          Math.sin(x * 0.031 + y * 0.017) * 3.2 +
          Math.sin(x * 0.011 - y * 0.023) * 2.4
        r += blot; g += blot * 0.8; b += blot * 0.6

        // fine pores / texture — the detail real beauty filters must keep
        const pore = (rnd() - 0.5) * 13 + Math.sin(x * 1.7) * 1.6 + Math.cos(y * 1.9) * 1.4
        r += pore; g += pore * 0.9; b += pore * 0.8

        // nose shadow
        const nose = Math.abs(x - CX - Math.sin((y - CY + 40) * 0.06) * 7)
        if (y > CY - 10 && y < CY + 62 && nose < 13) {
          const k = 1 - nose / 13
          r -= k * 26; g -= k * 22; b -= k * 18
        }

        /* ---- eyes ---- */
        for (const [ex, ey] of eyes) {
          const ed = Math.hypot(x - ex, y - ey)
          if (ed < eyeR) {
            // socket shadow
            const k = 1 - ed / eyeR
            r -= k * 14; g -= k * 12; b -= k * 10
            // sclera
            r = 236; g = 232; b = 226
            // iris
            const id = Math.hypot(x - ex, y - ey)
            if (id < irisR) {
              r = 96; g = 68; b = 44
              if (id < pupilR) { r = 22; g = 18; b = 16 }
              else if (id > irisR - 1.5) { r = 58; g = 40; b = 26 } // limbal ring
            }
            // upper lash line — hard edge
            if (y < ey - eyeR * 0.45 && y > ey - eyeR - 2) {
              const k = 1 - Math.abs(y - (ey - eyeR * 0.75)) / 2.4
              if (k > 0) { r -= k * 190; g -= k * 190; b -= k * 190 }
            }
          }
          // brow
          const by = ey - 30 - Math.abs(x - ex) * 0.06
          if (Math.abs(y - by) < 3.4 && Math.abs(x - ex) < 26) {
            const k = 1 - Math.abs(y - by) / 3.4
            r -= k * 120; g -= k * 112; b -= k * 104
          }
        }

        /* ---- lips ---- */
        const lipY = CY + 108
        const lipW = 34 - Math.abs(y - lipY) * 0.10
        if (Math.abs(y - lipY) < 9 && Math.abs(x - CX) < lipW) {
          const k = 1 - Math.abs(y - lipY) / 9
          r = 186 - k * 26; g = 108 - k * 30; b = 104 - k * 26
        }

        // hairline across the top of the face
        if (y < CY - 108 + Math.abs(x - CX) * 0.10) {
          r = 44; g = 34; b = 30
        }
      } else {
        /* ---- warm wood background (chroma overlaps skin) ---- */
        const grain = Math.sin(x * 0.55 + Math.sin(y * 0.05) * 2) * 9
        const vign = 1 - Math.hypot(x - CX, y - CY) / 900
        r = (168 + grain) * vign
        g = (112 + grain * 0.7) * vign
        b = (66 + grain * 0.4) * vign
      }

      d[p] = clamp(r)
      d[p + 1] = clamp(g)
      d[p + 2] = clamp(b)
      d[p + 3] = 255
    }
  }
  return { data: d, width: W, height: H }
}

const clone = (img) => ({ data: new Uint8ClampedArray(img.data), width: img.width, height: img.height })

/* ------------------------------ Compositing ------------------------------ */

function hstack(tiles, gap = 6) {
  const tw = tiles[0].width
  const th = tiles[0].height
  const total = tiles.length * tw + (tiles.length - 1) * gap
  const out = new Uint8ClampedArray(total * th * 4)
  tiles.forEach((t, i) => {
    const ox = i * (tw + gap)
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const sp = (y * tw + x) * 4
        const dp = (y * total + ox + x) * 4
        out[dp] = t.data[sp]
        out[dp + 1] = t.data[sp + 1]
        out[dp + 2] = t.data[sp + 2]
        out[dp + 3] = 255
      }
    }
  })
  return { data: out, width: total, height: th }
}

/** Nearest-neighbour crop+zoom so pixel-level artifacts are unmistakable. */
function cropZoom(img, sx, sy, sw, sh, zoom) {
  const ox0 = Math.round(sx)
  const oy0 = Math.round(sy)
  const zw = sw * zoom
  const zh = sh * zoom
  const out = new Uint8ClampedArray(zw * zh * 4)
  for (let y = 0; y < zh; y++) {
    // Round the source coordinate explicitly. Writing (sy + ((y / zoom) | 0))
    // lets the `|` bind looser than `+`, so the truncation lands on the wrong
    // sub-expression and the row index goes out of bounds — the crop comes out
    // solid black.
    const srcY = oy0 + Math.round(y / zoom)
    const rowBase = srcY * img.width
    for (let x = 0; x < zw; x++) {
      const srcX = ox0 + Math.round(x / zoom)
      const sp = (rowBase + srcX) * 4
      const dp = (y * zw + x) * 4
      out[dp] = img.data[sp]
      out[dp + 1] = img.data[sp + 1]
      out[dp + 2] = img.data[sp + 2]
      out[dp + 3] = 255
    }
  }
  return { data: out, width: zw, height: zh }
}

/* --------------------------------- Run --------------------------------- */

mkdirSync(OUT, { recursive: true })

const original = makeFace()

const variants = []
const labels = []

// Panel 1 is the untouched original; the rest are the presets that actually ship.
for (const key of ['normal', 'bw', 'kodak', 'fuji', 'glow']) {
  const img = clone(original)
  const amt = FILTER_SMOOTHING[key]
  if (amt > 0) smoothSkin(img, amt)
  variants.push(img)
  labels.push(`${key} ${amt}`)
}

const graded = clone(original)
processImageData(graded, { smoothing: FILTER_SMOOTHING.fuji, grade: FILTER_GRADES.fuji })
variants.push(graded)
labels.push('fuji full')

const sheet = hstack(variants)
writeFileSync(join(OUT, 'sheet.png'), encodePNG(sheet.width, sheet.height, sheet.data))

// Eye region: left eye + brow, tight crop.
const CROP = { sx: CX - 96, sy: CY - 96, sw: 130, sh: 96 }
const zoom = ['normal', 'kodak', 'fuji', 'glow'].map((k) => {
  const img = clone(original)
  const amt = FILTER_SMOOTHING[k]
  if (amt > 0) smoothSkin(img, amt)
  return cropZoom(img, CROP.sx, CROP.sy, CROP.sw, CROP.sh, 3)
})
const eyes = hstack(zoom, 8)
writeFileSync(join(OUT, 'eyes.png'), encodePNG(eyes.width, eyes.height, eyes.data))

console.log('sheet panels (left→right):', labels.join(' | '))
console.log('eyes panels (left→right): normal | kodak | fuji | glow')
console.log('written:', join(OUT, 'sheet.png'))
console.log('written:', join(OUT, 'eyes.png'))


