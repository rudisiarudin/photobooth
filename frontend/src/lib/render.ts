import type { ColorGrade } from '@/lib/beauty'

export type ThemeKey =
  | 'dark'
  | 'cream'
  | 'pink'
  | 'white'
  | 'lavender'
  | 'sage'
  | 'terracotta'
  | 'sky'
  | 'cyber'
  | 'midnight'

export interface ThemeColors {
  bg: string
  border: string
  text: string
  subtext: string
  name: string
}

export const THEMES: Record<ThemeKey, ThemeColors> = {
  dark:       { bg: '#18181b', border: '#27272a', text: '#ffffff', subtext: '#a1a1aa', name: 'Noir Dark' },
  cream:      { bg: '#fbf7ee', border: '#ece3ce', text: '#292524', subtext: '#78716c', name: 'Warm Cream' },
  pink:       { bg: '#fdf2f8', border: '#fbcfe8', text: '#831843', subtext: '#db2777', name: 'Pastel Rose' },
  white:      { bg: '#ffffff', border: '#e4e4e7', text: '#09090b', subtext: '#71717a', name: 'Classic White' },
  lavender:   { bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95', subtext: '#7c3aed', name: 'Dreamy Lavender' },
  sage:       { bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d', subtext: '#16a34a', name: 'Matcha Sage' },
  terracotta: { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12', subtext: '#ea580c', name: 'Sunset Terracotta' },
  sky:        { bg: '#f0f9ff', border: '#bae6fd', text: '#0c4a6e', subtext: '#0284c7', name: 'Baby Blue Y2K' },
  cyber:      { bg: '#09090b', border: '#22c55e', text: '#f4f4f5', subtext: '#22c55e', name: 'Matrix Neon' },
  midnight:   { bg: '#0f172a', border: '#1e293b', text: '#f8fafc', subtext: '#64748b', name: 'Velvet Midnight' },
}

export interface EventConfig {
  title: string
  subtitle: string
  date: string
}

export type LayoutKey =
  | 'strip4'
  | 'strip3'
  | 'strip2'
  | 'strip6'
  | 'grid4'
  | 'grid6'
  | 'polaroid'

export const LAYOUT_INFO: Record<LayoutKey, { label: string; size: string; poses: number; type: 'strip' | 'grid' | 'polaroid' }> = {
  strip4:   { label: 'Strip 4', size: '2 × 6"', poses: 4, type: 'strip' },
  strip3:   { label: 'Strip 3', size: '2 × 6"', poses: 3, type: 'strip' },
  strip2:   { label: 'Duo Wide', size: '2 × 6"', poses: 2, type: 'strip' },
  strip6:   { label: 'Mini 6', size: '2 × 6"', poses: 6, type: 'strip' },
  grid4:    { label: 'Grid 2×2', size: '4 × 6"', poses: 4, type: 'grid' },
  grid6:    { label: 'Grid 2×3', size: '4 × 6"', poses: 6, type: 'grid' },
  polaroid: { label: 'Polaroid', size: '4 × 5"', poses: 1, type: 'polaroid' },
}

export type FilterKey =
  | 'normal'
  | 'bw'
  | 'noir'
  | 'vintage'
  | 'kodak'
  | 'fuji'
  | 'cinematic'
  | 'glow'
  | 'pastel'
  | 'cyber'
  | 'lomo'
  | 'warm'
  | 'cold'
  | 'haze'
  | 'vivid'

/**
 * Skin-smoothing amount baked into the captured frame, per filter.
 * 0 disables smoothing entirely. Portrait-style looks sit around 0.5–0.75;
 * heavy stylised looks (noir, cyber) stay near 0 so they don't look plastic.
 */
export const FILTER_SMOOTHING: Record<FilterKey, number> = {
  normal:    0.00,
  bw:        0.35,
  noir:      0.20,
  vintage:   0.45,
  kodak:     0.55,
  fuji:      0.65,
  cinematic: 0.50,
  glow:      0.70,
  pastel:    0.65,
  cyber:     0.15,
  lomo:      0.40,
  warm:      0.60,
  cold:      0.50,
  haze:      0.55,
  vivid:     0.45,
}

/** Colour-grade look paired with each filter (see lib/beauty.ts). */
export const FILTER_GRADES: Record<FilterKey, ColorGrade | null> = {
  normal:    null,
  // Moon — clean B&W with a gentle S-curve.
  bw: {
    contrast: 0.18, saturation: 0, temperature: 0.05, tint: 0,
    lift: [0.02, 0.02, 0.03], gamma: [1, 1, 1], gain: [1, 1, 1.02],
    shadowTint: [0, 0, 0.01], highlightTint: [0, 0, 0], splitStrength: 0.3,
    monochrome: 1,
  },
  // Noir — crushed blacks, cold steel shadows.
  noir: {
    contrast: 0.42, saturation: 0, temperature: -0.10, tint: 0,
    lift: [-0.02, -0.02, 0], gamma: [1.08, 1.08, 1.12], gain: [0.96, 0.96, 1],
    shadowTint: [-0.01, 0, 0.03], highlightTint: [0, 0, 0.01], splitStrength: 0.6,
    monochrome: 1,
  },
  // Reyes — dusty faded beige, lifted shadows.
  vintage: {
    contrast: -0.10, saturation: 0.72, temperature: 0.16, tint: 0.04,
    lift: [0.07, 0.06, 0.05], gamma: [0.95, 0.97, 1.02], gain: [1.02, 1, 0.96],
    shadowTint: [0.03, 0.02, 0], highlightTint: [0.03, 0.01, -0.01], splitStrength: 0.5,
  },
  // Juno — punchy warm, the classic "rich" Instagram look.
  kodak: {
    contrast: 0.20, saturation: 1.18, temperature: 0.14, tint: -0.02,
    lift: [0.03, 0.02, 0.02], gamma: [1, 1.02, 1.05], gain: [1.04, 1.01, 0.98],
    shadowTint: [0.01, 0, -0.01], highlightTint: [0.03, 0.01, -0.01], splitStrength: 0.45,
  },
  // Aden — soft pastel warmth, hazy blacks.
  fuji: {
    contrast: -0.06, saturation: 0.96, temperature: 0.20, tint: 0.08,
    lift: [0.08, 0.07, 0.07], gamma: [0.98, 1, 1.04], gain: [1.02, 1, 1],
    shadowTint: [0.02, 0.01, 0.02], highlightTint: [0.03, 0.02, 0], splitStrength: 0.35,
  },
  // Clarendon — teal & orange, the most "cinematic" of the set.
  cinematic: {
    contrast: 0.24, saturation: 1.12, temperature: 0.06, tint: 0,
    lift: [-0.01, 0, 0.03], gamma: [1, 1.01, 1.02], gain: [1.03, 1.01, 0.98],
    shadowTint: [-0.02, 0.01, 0.05], highlightTint: [0.05, 0.02, -0.02], splitStrength: 0.85,
  },
  // Lark — bright, airy, slightly cool whites.
  glow: {
    contrast: -0.04, saturation: 1.05, temperature: -0.05, tint: 0.04,
    lift: [0.06, 0.06, 0.07], gamma: [1.01, 1, 0.99], gain: [1, 1.01, 1.02],
    shadowTint: [0, 0.01, 0.02], highlightTint: [0.02, 0.02, 0.02], splitStrength: 0.4,
  },
  // Gingham — faded, low-contrast, gently blue.
  pastel: {
    contrast: -0.14, saturation: 0.85, temperature: -0.02, tint: 0.06,
    lift: [0.09, 0.09, 0.10], gamma: [0.97, 0.99, 1.02], gain: [0.99, 1, 1.02],
    shadowTint: [0, 0.01, 0.03], highlightTint: [0.01, 0.02, 0.03], splitStrength: 0.3,
  },
  // Cyber — magenta/cyan push, heavy stylisation so little smoothing.
  cyber: {
    contrast: 0.30, saturation: 1.45, temperature: -0.10, tint: 0.18,
    lift: [0.04, -0.01, 0.06], gamma: [1.02, 0.98, 1.04], gain: [1.02, 0.98, 1.06],
    shadowTint: [0.02, -0.01, 0.05], highlightTint: [0.03, 0, 0.04], splitStrength: 0.75,
  },
  // X-Pro II — muted greens, slight vignette-ish desaturation at the edges.
  lomo: {
    contrast: 0.16, saturation: 0.88, temperature: 0.04, tint: -0.10,
    lift: [0.04, 0.05, 0.02], gamma: [0.99, 1.01, 0.97], gain: [1, 0.99, 1.01],
    shadowTint: [0, 0.02, -0.01], highlightTint: [0.02, 0.01, 0], splitStrength: 0.4,
  },
  // Golden — warm, glowing skin.
  warm: {
    contrast: 0.10, saturation: 1.15, temperature: 0.24, tint: 0.02,
    lift: [0.06, 0.04, 0.02], gamma: [1, 1.02, 1.06], gain: [1.05, 1.01, 0.95],
    shadowTint: [0.02, 0, -0.01], highlightTint: [0.05, 0.02, -0.01], splitStrength: 0.6,
  },
  // Arctic — cool blue, clean whites.
  cold: {
    contrast: 0.14, saturation: 0.95, temperature: -0.22, tint: -0.04,
    lift: [0.01, 0.03, 0.06], gamma: [1.03, 1.01, 0.98], gain: [0.97, 1, 1.05],
    shadowTint: [-0.01, 0, 0.04], highlightTint: [0, 0.01, 0.03], splitStrength: 0.55,
  },
  // Nashville — soft warm haze, low contrast.
  haze: {
    contrast: -0.16, saturation: 0.80, temperature: 0.18, tint: 0.02,
    lift: [0.10, 0.09, 0.07], gamma: [0.95, 0.98, 1.04], gain: [1.02, 1, 0.97],
    shadowTint: [0.03, 0.02, 0], highlightTint: [0.04, 0.02, -0.01], splitStrength: 0.45,
  },
  // Perpetua — vivid, slightly green life, punchy.
  vivid: {
    contrast: 0.22, saturation: 1.40, temperature: 0.02, tint: -0.06,
    lift: [0.01, 0.02, 0], gamma: [1, 1, 1], gain: [1.04, 1.06, 1.01],
    shadowTint: [-0.01, 0.02, 0], highlightTint: [0.02, 0.03, 0.01], splitStrength: 0.5,
  },
}

export interface FilterPreset {
  /** CSS filter chain applied to the live preview AND baked into the captured frame. */
  css: string
  /** Human-readable name shown in the UI. */
  label: string
  /** Optional single dominant tint. Used for the UI swatch background. */
  tint?: string
}

/**
 * Filter recipes are ordered `brightness -> contrast -> saturate -> hue-rotate -> grayscale -> sepia`
 * so results stay predictable: colour-shaping first, then the destructive greyscale/sepia passes.
 * Values follow the published Instagram filter recipes (Clarendon, Gingham, Moon, Lark, Reyes,
 * Juno, Ludwig, Aden, Perpetua, X-Pro II) and common TikTok looks.
 */
export const FILTERS: Record<FilterKey, FilterPreset> = {
  normal: {
    css: 'none',
    label: 'Natural',
  },
  bw: {
    css: 'grayscale(1) contrast(1.1) brightness(1.05)',
    label: 'Moon',
    tint: '#4a4a4a',
  },
  noir: {
    css: 'grayscale(1) contrast(1.35) brightness(0.92)',
    label: 'Noir',
    tint: '#1a1a1a',
  },
  vintage: {
    css: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)',
    label: 'Reyes',
    tint: '#b89b6a',
  },
  kodak: {
    css: 'sepia(0.15) contrast(1.1) saturate(1.3) brightness(1.04)',
    label: 'Juno',
    tint: '#d4a574',
  },
  fuji: {
    css: 'brightness(1.08) contrast(0.92) saturate(1.18) hue-rotate(-8deg)',
    label: 'Aden',
    tint: '#e8b4a0',
  },
  cinematic: {
    css: 'contrast(1.2) saturate(1.35) brightness(0.96)',
    label: 'Clarendon',
    tint: '#2c5f7c',
  },
  glow: {
    css: 'brightness(1.1) contrast(0.95) saturate(1.15)',
    label: 'Lark',
    tint: '#7fb3a0',
  },
  pastel: {
    css: 'brightness(1.1) hue-rotate(-10deg) sepia(0.04) contrast(0.95)',
    label: 'Gingham',
    tint: '#dce8f0',
  },
  cyber: {
    css: 'saturate(1.6) contrast(1.2) hue-rotate(280deg) brightness(0.95)',
    label: 'Cyber',
    tint: '#8b3fd4',
  },
  lomo: {
    css: 'contrast(1.3) saturate(1.1) brightness(0.92) sepia(0.08)',
    label: 'X-Pro II',
    tint: '#5c7a4a',
  },
  warm: {
    css: 'brightness(1.1) saturate(1.3) hue-rotate(-10deg)',
    label: 'Golden',
    tint: '#e8a33d',
  },
  cold: {
    css: 'saturate(0.9) contrast(1.1) hue-rotate(195deg) brightness(1.05)',
    label: 'Arctic',
    tint: '#6ba8c9',
  },
  haze: {
    css: 'sepia(0.2) brightness(1.15) contrast(0.8) saturate(0.7)',
    label: 'Nashville',
    tint: '#b8a88a',
  },
  vivid: {
    css: 'saturate(1.7) contrast(1.12) brightness(1.03)',
    label: 'Perpetua',
    tint: '#2e9e5b',
  },
}

export const FILTER_LABELS: Record<FilterKey, string> = Object.fromEntries(
  Object.entries(FILTERS).map(([key, preset]) => [key, preset.label])
) as Record<FilterKey, string>

function getDateLabel(config: EventConfig): string {
  return config.date || new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  config: EventConfig,
  theme: ThemeColors,
  canvasW: number,
  footerY: number,
  compact: boolean = false
) {
  ctx.fillStyle = theme.text
  ctx.font = compact ? 'bold 48px "DM Sans", sans-serif' : 'bold 60px "DM Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(config.title.toUpperCase(), canvasW / 2, footerY + (compact ? 56 : 68))

  ctx.fillStyle = theme.subtext
  ctx.font = compact ? '500 26px "DM Sans", sans-serif' : '500 30px "DM Sans", sans-serif'
  ctx.fillText(config.subtitle.toUpperCase(), canvasW / 2, footerY + (compact ? 96 : 116))

  ctx.fillStyle = theme.subtext
  ctx.font = compact ? '22px "DM Sans", sans-serif' : '26px "DM Sans", sans-serif'
  ctx.fillText(`• ${getDateLabel(config)} •`, canvasW / 2, footerY + (compact ? 136 : 160))
}

/**
 * Draws an image/canvas onto ctx at [destX, destY, destW, destH] using center-crop (object-fit: cover).
 * This completely prevents any image distortion, squishing, or stretching ("tidak penyok").
 */
export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  destX: number,
  destY: number,
  destW: number,
  destH: number
) {
  const srcW =
    (img as HTMLCanvasElement).width ||
    (img as HTMLVideoElement).videoWidth ||
    (img as HTMLImageElement).naturalWidth ||
    destW
  const srcH =
    (img as HTMLCanvasElement).height ||
    (img as HTMLVideoElement).videoHeight ||
    (img as HTMLImageElement).naturalHeight ||
    destH

  const srcAspect = srcW / srcH
  const destAspect = destW / destH

  let cropW = srcW
  let cropH = srcH
  let cropX = 0
  let cropY = 0

  if (srcAspect > destAspect) {
    // Source is wider than destination: crop sides evenly
    cropW = Math.round(srcH * destAspect)
    cropX = Math.round((srcW - cropW) / 2)
  } else {
    // Source is taller than destination: crop top & bottom evenly
    cropH = Math.round(srcW / destAspect)
    cropY = Math.round((srcH - cropH) / 2)
  }

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropW,
    cropH,
    destX,
    destY,
    destW,
    destH
  )
}

export function renderStripPhotostrip(
  frames: HTMLCanvasElement[],
  themeKey: ThemeKey,
  config: EventConfig,
  customPoses?: number
): string {
  const theme = THEMES[themeKey] || THEMES.dark
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const count = customPoses || frames.length || 4
  // 1200px wide = 2" at 300dpi — print quality
  const stripW = 1200

  // Proportionally scaled heights (2x from previous)
  let photoH = 720
  let gapY = 40
  let topY = 80
  let padX = 72

  if (count === 2) {
    photoH = 1000
    gapY = 60
    topY = 100
  } else if (count === 3) {
    photoH = 800
    gapY = 44
    topY = 88
  } else if (count === 6) {
    photoH = 500
    gapY = 28
    topY = 64
  }

  const stripH = topY + count * (photoH + gapY) + 220
  canvas.width = stripW
  canvas.height = stripH

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, stripW, stripH)

  const photoW = stripW - padX * 2

  frames.slice(0, count).forEach((frame, idx) => {
    const y = topY + idx * (photoH + gapY)
    ctx.fillStyle = theme.border
    ctx.fillRect(padX - 6, y - 6, photoW + 12, photoH + 12)
    drawCoverImage(ctx, frame, padX, y, photoW, photoH)
  })

  const footerY = topY + count * (photoH + gapY) + 32
  drawFooter(ctx, config, theme, stripW, footerY, count >= 6)

  return canvas.toDataURL('image/jpeg', 0.97)
}

export function renderGridPhotostrip(
  frames: HTMLCanvasElement[],
  themeKey: ThemeKey,
  config: EventConfig,
  rows: number = 2,
  cols: number = 2
): string {
  const theme = THEMES[themeKey] || THEMES.dark
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // 1600px wide = 4" at 400dpi — print quality
  const stripW = 1600
  const stripH = rows === 3 ? 2560 : 2120
  canvas.width = stripW
  canvas.height = stripH

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, stripW, stripH)

  const padX = 36
  const padY = 36
  const gap = 24
  const maxItems = rows * cols
  const photoW = (stripW - padX * 2 - gap * (cols - 1)) / cols
  const photoH = (stripH - padY * 2 - gap * (rows - 1) - 240) / rows

  frames.slice(0, maxItems).forEach((frame, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const x = padX + col * (photoW + gap)
    const y = padY + row * (photoH + gap)
    ctx.fillStyle = theme.border
    ctx.fillRect(x - 5, y - 5, photoW + 10, photoH + 10)
    drawCoverImage(ctx, frame, x, y, photoW, photoH)
  })

  const footerY = padY + rows * (photoH + gap) + 32
  drawFooter(ctx, config, theme, stripW, footerY)

  return canvas.toDataURL('image/jpeg', 0.97)
}

export function renderPolaroidPhotostrip(
  frames: HTMLCanvasElement[],
  themeKey: ThemeKey,
  config: EventConfig
): string {
  const theme = THEMES[themeKey] || THEMES.white
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // 1400×1840 — 4×5.3" at 350dpi
  const stripW = 1400
  const stripH = 1840
  canvas.width = stripW
  canvas.height = stripH

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, stripW, stripH)

  const padX = 72
  const padTop = 72
  const photoW = stripW - padX * 2
  const photoH = 1360

  if (frames[0]) {
    ctx.fillStyle = theme.border
    ctx.fillRect(padX - 6, padTop - 6, photoW + 12, photoH + 12)
    drawCoverImage(ctx, frames[0], padX, padTop, photoW, photoH)
  }

  const footerY = padTop + photoH + 56
  drawFooter(ctx, config, theme, stripW, footerY)

  return canvas.toDataURL('image/jpeg', 0.97)
}

export function renderPhotostripByLayout(
  frames: HTMLCanvasElement[],
  layoutKey: LayoutKey,
  themeKey: ThemeKey,
  config: EventConfig
): string {
  switch (layoutKey) {
    case 'strip2':
      return renderStripPhotostrip(frames, themeKey, config, 2)
    case 'strip3':
      return renderStripPhotostrip(frames, themeKey, config, 3)
    case 'strip4':
      return renderStripPhotostrip(frames, themeKey, config, 4)
    case 'strip6':
      return renderStripPhotostrip(frames, themeKey, config, 6)
    case 'grid4':
      return renderGridPhotostrip(frames, themeKey, config, 2, 2)
    case 'grid6':
      return renderGridPhotostrip(frames, themeKey, config, 3, 2)
    case 'polaroid':
      return renderPolaroidPhotostrip(frames, themeKey, config)
    default:
      return renderStripPhotostrip(frames, themeKey, config, 4)
  }
}
