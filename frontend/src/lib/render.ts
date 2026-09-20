export type ThemeKey = 'dark' | 'cream' | 'pink' | 'white'

export interface ThemeColors {
  bg: string
  border: string
  text: string
  subtext: string
}

export const THEMES: Record<ThemeKey, ThemeColors> = {
  dark:  { bg: '#18181b', border: '#27272a', text: '#ffffff', subtext: '#a1a1aa' },
  cream: { bg: '#fbf7ee', border: '#ece3ce', text: '#292524', subtext: '#78716c' },
  pink:  { bg: '#fdf2f8', border: '#fbcfe8', text: '#831843', subtext: '#db2777' },
  white: { bg: '#ffffff', border: '#e4e4e7', text: '#09090b', subtext: '#71717a' },
}

export interface EventConfig {
  title: string
  subtitle: string
  date: string
}

export type LayoutKey = 'strip4' | 'strip3' | 'grid4'

export const LAYOUT_INFO: Record<LayoutKey, { label: string; size: string; poses: number }> = {
  strip4: { label: 'Strip 4', size: '2 × 6"', poses: 4 },
  strip3: { label: 'Strip 3', size: '2 × 6"', poses: 3 },
  grid4:  { label: 'Grid 2×2', size: '4 × 6"', poses: 4 },
}

export type FilterKey = 'normal' | 'bw' | 'vintage' | 'glow'

export const FILTERS: Record<FilterKey, string> = {
  normal:  'none',
  bw:      'grayscale(100%) contrast(110%)',
  vintage: 'sepia(50%) contrast(95%) brightness(105%)',
  glow:    'brightness(115%) contrast(105%) saturate(110%)',
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
) {
  ctx.fillStyle = theme.text
  ctx.font = 'bold 32px "DM Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(config.title.toUpperCase(), canvasW / 2, footerY + 38)

  ctx.fillStyle = theme.subtext
  ctx.font = '500 15px "DM Sans", sans-serif'
  ctx.fillText(config.subtitle.toUpperCase(), canvasW / 2, footerY + 62)

  ctx.fillStyle = theme.subtext
  ctx.font = '13px "DM Sans", sans-serif'
  ctx.fillText(`• ${getDateLabel(config)} •`, canvasW / 2, footerY + 86)
}

export function renderStripPhotostrip(
  frames: HTMLCanvasElement[],
  themeKey: ThemeKey,
  config: EventConfig,
): string {
  const theme = THEMES[themeKey]
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const count = frames.length || 4
  const stripW = 600
  const photoH = 360
  const gapY = 22
  const topY = 46
  const stripH = topY + count * (photoH + gapY) + 110

  canvas.width = stripW
  canvas.height = stripH

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, stripW, stripH)

  const padX = 38
  const photoW = stripW - padX * 2

  frames.forEach((frame, idx) => {
    const y = topY + idx * (photoH + gapY)
    ctx.fillStyle = theme.border
    ctx.fillRect(padX - 4, y - 4, photoW + 8, photoH + 8)
    ctx.drawImage(frame, padX, y, photoW, photoH)
  })

  const footerY = topY + count * (photoH + gapY) + 16
  drawFooter(ctx, config, theme, stripW, footerY)

  return canvas.toDataURL('image/jpeg', 0.95)
}

export function renderGridPhotostrip(
  frames: HTMLCanvasElement[],
  themeKey: ThemeKey,
  config: EventConfig,
): string {
  const theme = THEMES[themeKey]
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const stripW = 800
  const stripH = 1060
  canvas.width = stripW
  canvas.height = stripH

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, stripW, stripH)

  const padX = 16
  const padY = 16
  const gap = 10
  const cols = 2
  const rows = 2
  const photoW = (stripW - padX * 2 - gap) / cols
  const photoH = (stripH - padY * 2 - gap - 130) / rows

  frames.slice(0, 4).forEach((frame, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const x = padX + col * (photoW + gap)
    const y = padY + row * (photoH + gap)
    ctx.fillStyle = theme.border
    ctx.fillRect(x - 3, y - 3, photoW + 6, photoH + 6)
    ctx.drawImage(frame, x, y, photoW, photoH)
  })

  const footerY = padY + rows * (photoH + gap) + 16
  drawFooter(ctx, config, theme, stripW, footerY)

  return canvas.toDataURL('image/jpeg', 0.95)
}
