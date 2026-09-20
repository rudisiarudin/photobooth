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

export const FILTERS: Record<FilterKey, string> = {
  normal:    'none',
  bw:        'grayscale(100%) contrast(115%)',
  noir:      'grayscale(100%) contrast(145%) brightness(95%)',
  vintage:   'sepia(50%) contrast(95%) brightness(105%)',
  kodak:     'sepia(25%) contrast(110%) saturate(120%) brightness(102%)',
  fuji:      'contrast(105%) saturate(90%) hue-rotate(-5deg) brightness(105%)',
  cinematic: 'contrast(115%) saturate(115%) hue-rotate(10deg) brightness(98%)',
  glow:      'brightness(112%) contrast(104%) saturate(110%)',
  pastel:    'brightness(118%) contrast(95%) saturate(105%)',
  cyber:     'contrast(125%) saturate(135%) hue-rotate(280deg)',
  lomo:      'contrast(150%) saturate(110%) brightness(90%)',
  warm:      'sepia(35%) saturate(130%) brightness(108%) hue-rotate(-15deg)',
  cold:      'saturate(80%) brightness(105%) hue-rotate(195deg) contrast(108%)',
  haze:      'brightness(115%) contrast(88%) saturate(75%) opacity(0.92)',
  vivid:     'saturate(180%) contrast(110%) brightness(103%)',
}

export const FILTER_LABELS: Record<FilterKey, string> = {
  normal:    'Natural',
  bw:        'Classic B&W',
  noir:      'Dramatic Noir',
  vintage:   'Vintage 90s',
  kodak:     'Kodak Portra',
  fuji:      'Fujifilm Chrome',
  cinematic: 'Teal & Orange',
  glow:      'Korean Glow',
  pastel:    'Tokyo Pastel',
  cyber:     'Cyber Violet',
  lomo:      'Lomo Effect',
  warm:      'Golden Hour',
  cold:      'Arctic Blue',
  haze:      'Film Haze',
  vivid:     'Vivid Pop',
}

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
