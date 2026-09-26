/**
 * Beauty + colour-grading pipeline.
 *
 * Two stages, both operating on raw pixels so the result is baked into the
 * saved photo (CSS filters alone cannot do either of these convincingly):
 *
 *  1. Skin smoothing — a surface blur (repeated box blur ≈ Gaussian) blended
 *     back in through a YCbCr skin mask, so only skin is softened and eyes,
 *     lashes, hair and background stay sharp.
 *  2. Colour grading — lift / gamma / gain, white balance, contrast, vibrance
 *     and split toning. This is the same family of controls a colourist uses in
 *     Lightroom, which is what gives the "Instagram" look rather than a flat
 *     CSS tint.
 *
 * Everything here is allocation-light: the hot loops reuse buffers and index a
 * precomputed gamma LUT instead of calling Math.pow per pixel.
 */

export interface ColorGrade {
  /** Global contrast around mid grey. 0 = neutral. */
  contrast: number
  /** Saturation multiplier. 1 = neutral. */
  saturation: number
  /** Warm/cool white balance. -1 cool … +1 warm. */
  temperature: number
  /** Green/magenta white balance. -1 green … +1 magenta. */
  tint: number
  /** Per-channel lift, applied to shadows. [r, g, b] in 0..1 space. */
  lift: [number, number, number]
  /** Per-channel gamma. 1 = neutral, >1 brightens midtones. */
  gamma: [number, number, number]
  /** Per-channel gain, applied to highlights. 1 = neutral. */
  gain: [number, number, number]
  /** Tint pushed into the shadows — this is what makes teal/orange pop. */
  shadowTint: [number, number, number]
  /** Tint pushed into the highlights. */
  highlightTint: [number, number, number]
  /** How strongly the split toning is applied. 0 = off. */
  splitStrength: number
  /**
   * Re-neutralise the colour after the whole chain runs. Monochrome looks
   * (Noir, Moon) need this: split toning re-introduces a tint *after* the
   * saturation stage, so without it a "black and white" preset still comes out
   * faintly coloured. 1 = fully neutral.
   */
  monochrome?: number
}

export interface BeautyOptions {
  /** 0 = no smoothing, 1 = maximum softening. */
  smoothing: number
  grade: ColorGrade | null
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/* ------------------------------------------------------------------ *
 * Separable box blur (sliding running sum — O(n) regardless of radius)
 * ------------------------------------------------------------------ */

function boxBlurHorizontal(
  src: Float32Array,
  dst: Float32Array,
  width: number,
  height: number,
  radius: number
) {
  const window = radius * 2 + 1
  const lastX = width - 1

  for (let y = 0; y < height; y++) {
    const row = y * width
    let sum = 0

    for (let i = -radius; i <= radius; i++) {
      const x = i < 0 ? 0 : i > lastX ? lastX : i
      sum += src[row + x]
    }
    dst[row] = sum / window

    for (let x = 1; x < width; x++) {
      const addX = x + radius > lastX ? lastX : x + radius
      const subX = x - radius - 1 < 0 ? 0 : x - radius - 1
      sum += src[row + addX] - src[row + subX]
      dst[row + x] = sum / window
    }
  }
}

function boxBlurVertical(
  src: Float32Array,
  dst: Float32Array,
  width: number,
  height: number,
  radius: number
) {
  const window = radius * 2 + 1
  const lastY = height - 1

  for (let x = 0; x < width; x++) {
    let sum = 0

    for (let i = -radius; i <= radius; i++) {
      const y = i < 0 ? 0 : i > lastY ? lastY : i
      sum += src[y * width + x]
    }
    dst[x] = sum / window

    for (let y = 1; y < height; y++) {
      const addY = y + radius > lastY ? lastY : y + radius
      const subY = y - radius - 1 < 0 ? 0 : y - radius - 1
      sum += src[addY * width + x] - src[subY * width + x]
      dst[y * width + x] = sum / window
    }
  }
}

/**
 * Builds a YCbCr skin-confidence mask in 0..1. The classic Cb/Cr chroma box is
 * used for the hard test, then softened so the blend has no visible seam.
 */
function buildSkinMask(rgba: Uint8ClampedArray, width: number, height: number): Float32Array {
  const mask = new Float32Array(width * height)

  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    const r = rgba[p]
    const g = rgba[p + 1]
    const b = rgba[p + 2]

    const y = 0.299 * r + 0.587 * g + 0.114 * b
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b

    // Chroma window: Cr 133..173, Cb 77..127 covers most human skin tones.
    const cbT = smoothstep(70, 82, cb) * (1 - smoothstep(122, 134, cb))
    const crT = smoothstep(126, 138, cr) * (1 - smoothstep(168, 180, cr))
    // Reject very dark noise and blown-out highlights.
    const lumT = smoothstep(28, 48, y) * (1 - smoothstep(238, 252, y))

    mask[i] = cbT * crT * lumT
  }

  // Blur the mask so the smoothing blends gradually instead of showing edges.
  const tmp = new Float32Array(mask.length)
  const radius = Math.max(1, Math.round(Math.min(width, height) * 0.012))
  boxBlurHorizontal(mask, tmp, width, height, radius)
  boxBlurVertical(tmp, mask, width, height, radius)

  return mask
}

/**
 * Surface-blur style skin smoothing. Two box-blur passes approximate a Gaussian
 * closely enough for portrait work and stay fast enough for a live preview.
 */
export function smoothSkin(
  imageData: ImageData,
  strength: number
): void {
  const amount = clamp01(strength)
  if (amount <= 0.001) return

  const { width, height, data } = imageData
  const pixels = width * height

  const mask = buildSkinMask(data, width, height)

  // Three single-channel float planes keep the maths simple and cache-friendly.
  const srcR = new Float32Array(pixels)
  const srcG = new Float32Array(pixels)
  const srcB = new Float32Array(pixels)
  for (let i = 0, p = 0; i < pixels; i++, p += 4) {
    srcR[i] = data[p]
    srcG[i] = data[p + 1]
    srcB[i] = data[p + 2]
  }

  // Radius scales with resolution so the preview and the full-size capture match.
  const minDim = Math.min(width, height)
  const radius = Math.max(2, Math.round(minDim * 0.022 * (0.5 + amount)))
  const passes = amount > 0.6 ? 3 : 2

  const blur = (plane: Float32Array): Float32Array => {
    let a = plane
    let b = new Float32Array(pixels)
    for (let pass = 0; pass < passes; pass++) {
      boxBlurHorizontal(a, b, width, height, radius)
      boxBlurVertical(b, a, width, height, radius)
    }
    // `a` currently holds the last vertical result.
    return a
  }

  const blurR = blur(srcR.slice())
  const blurG = blur(srcG.slice())
  const blurB = blur(srcB.slice())

  for (let i = 0, p = 0; i < pixels; i++, p += 4) {
    // Blend strength = skin confidence × user amount.
    let m = mask[i] * amount
    if (m <= 0.002) continue

    // Detail preservation: high local contrast means an edge (eyelashes, iris,
    // hairline, lip border). Smooth the surrounding skin but keep the edge
    // itself, otherwise the blur mask bleeds across eyes and mushes them out.
    const x = i % width
    const y = (i / width) | 0
    if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
      const dx =
        Math.abs(srcR[i + 1] - srcR[i - 1]) +
        Math.abs(srcG[i + 1] - srcG[i - 1]) +
        Math.abs(srcB[i + 1] - srcB[i - 1])
      const dy =
        Math.abs(srcR[i + width] - srcR[i - width]) +
        Math.abs(srcG[i + width] - srcG[i - width]) +
        Math.abs(srcB[i + width] - srcB[i - width])
      const gradient = Math.max(dx, dy)
      // Only protect genuinely strong edges. The band starts well above film/sensor
      // grain (which sits around 30–60 across a 3-tap span) so skin texture still
      // smooths out, while lashes, iris rims and hairlines are held.
      m *= 1 - smoothstep(70, 190, gradient)
      if (m <= 0.002) continue
    }

    data[p] = lerp(srcR[i], blurR[i], m)
    data[p + 1] = lerp(srcG[i], blurG[i], m)
    data[p + 2] = lerp(srcB[i], blurB[i], m)
  }
}

/* ------------------------------------------------------------------ *
 * Colour grading
 * ------------------------------------------------------------------ */

function buildGammaLut(gamma: number): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256)
  const inv = gamma === 1 ? 1 : 1 / gamma
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round(Math.pow(i / 255, inv) * 255)
  }
  return lut
}

/**
 * Applies a full colour grade in place. Shadows/highlights are separated with a
 * luma-driven mask, so the split toning lands where a colourist would put it.
 */
export function applyColorGrade(imageData: ImageData, grade: ColorGrade): void {
  const { data } = imageData
  const pixels = data.length / 4

  const lutR = buildGammaLut(grade.gamma[0])
  const lutG = buildGammaLut(grade.gamma[1])
  const lutB = buildGammaLut(grade.gamma[2])

  const contrast = 1 + grade.contrast
  const saturation = grade.saturation
  const tempR = grade.temperature * 0.10
  const tempB = -grade.temperature * 0.10
  const tintG = grade.tint * 0.06
  const split = grade.splitStrength
  const mono = grade.monochrome ?? 0

  for (let i = 0, p = 0; i < pixels; i++, p += 4) {
    let r = data[p] / 255
    let g = data[p + 1] / 255
    let b = data[p + 2] / 255

    // 1. White balance.
    r += tempR
    g += tintG
    b += tempB

    // 2. Contrast around mid grey.
    r = (r - 0.5) * contrast + 0.5
    g = (g - 0.5) * contrast + 0.5
    b = (b - 0.5) * contrast + 0.5

    // 3. Saturation, keeping luma intact.
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    r = luma + (r - luma) * saturation
    g = luma + (g - luma) * saturation
    b = luma + (b - luma) * saturation

    // 4. Lift / gamma / gain.
    r = (r + grade.lift[0] * (1 - r)) * grade.gain[0]
    g = (g + grade.lift[1] * (1 - g)) * grade.gain[1]
    b = (b + grade.lift[2] * (1 - b)) * grade.gain[2]

    // 5. Split toning — cool shadows, warm highlights.
    if (split > 0) {
      const shadowMask = 1 - smoothstep(0.0, 0.55, luma)
      const highMask = smoothstep(0.45, 1.0, luma)
      r += (grade.shadowTint[0] * shadowMask + grade.highlightTint[0] * highMask) * split
      g += (grade.shadowTint[1] * shadowMask + grade.highlightTint[1] * highMask) * split
      b += (grade.shadowTint[2] * shadowMask + grade.highlightTint[2] * highMask) * split
    }

    // 6. Monochrome re-neutralisation. This must run BEFORE the per-channel gamma
    //    LUT below: a grade with differing gamma per channel (e.g. Noir's cool
    //    [1.08, 1.08, 1.12]) would otherwise re-introduce a colour cast after we
    //    neutralised it. Neutralising first keeps the look truly black & white.
    if (mono > 0) {
      const y2 = 0.299 * r + 0.587 * g + 0.114 * b
      r = lerp(r, y2, mono)
      g = lerp(g, y2, mono)
      b = lerp(b, y2, mono)
    }

    // 7. Back to 8-bit through the gamma LUT (also clamps for us).
    r = lutR[(r <= 0 ? 0 : r >= 1 ? 255 : r * 255) | 0]
    g = lutG[(g <= 0 ? 0 : g >= 1 ? 255 : g * 255) | 0]
    b = lutB[(b <= 0 ? 0 : b >= 1 ? 255 : b * 255) | 0]

    data[p] = r
    data[p + 1] = g
    data[p + 2] = b
  }
}

/** Runs smoothing then grading, mutating the supplied ImageData. */
export function processImageData(imageData: ImageData, options: BeautyOptions): void {
  if (options.smoothing > 0.001) {
    smoothSkin(imageData, options.smoothing)
  }
  if (options.grade) {
    applyColorGrade(imageData, options.grade)
  }
}
