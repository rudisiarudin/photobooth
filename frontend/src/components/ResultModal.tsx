import React, { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ThemeKey } from '@/lib/render'
import { THEMES } from '@/lib/render'
import type { StickerItem } from '@/hooks/usePhotobooth'
import confetti from 'canvas-confetti'
import QRCode from 'qrcode'
import {
  Download,
  Share2,
  RefreshCw,
  Check,
  Palette,
  Smile,
  Trash2,
  Printer,
  Camera,
  Film,
  Image,
  Loader2,
  RotateCcw,
  AlertTriangle,} from 'lucide-react'

interface ResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resultDataUrl: string | null
  resultGifUrl?: string | null
  isGeneratingGif?: boolean
  currentTheme: ThemeKey
  onChangeTheme: (theme: ThemeKey) => void
  onSaveToGallery: () => Promise<{ name: string; url: string; directUrl?: string } | null>
  savedInfo: { name: string; url: string; directUrl?: string } | null
  storageError?: string | null
  isSaving: boolean
  onNewSession: () => void
  stickers: StickerItem[]
  onAddSticker: (emoji: string, x?: number, y?: number) => void
  onClearStickers: () => void
  thumbnails?: string[]
  onRetakePose?: (index: number) => void
}

const STICKER_EMOJIS = [
  '✨', '🌸', '🎀', '🧸', '🤍', '💫',
  '🍒', '🌙', '🍓', '💌', '🎈', '🐱',
  '🌈', '🎭', '💎', '🔮', '🦋', '🌺'
]

const THEME_SWATCHES: ThemeKey[] = [
  'dark', 'cream', 'pink', 'white', 'lavender',
  'sage', 'terracotta', 'sky', 'cyber', 'midnight'
]

export const ResultModal: React.FC<ResultModalProps> = ({
  open,
  onOpenChange,
  resultDataUrl,
  resultGifUrl = null,
  isGeneratingGif = false,
  currentTheme,
  onChangeTheme,
  onSaveToGallery,
  savedInfo,
  storageError = null,
  isSaving: _isSaving,
  onNewSession,
  stickers,
  onAddSticker,
  onClearStickers,
  thumbnails = [],
  onRetakePose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [previewTab, setPreviewTab] = useState<'strip' | 'gif'>('strip')
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const imageContainerRef = useRef<HTMLDivElement | null>(null)

  // Fire confetti on open & reset state
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      })
      handleSave()
      setPreviewTab('strip')
      setSelectedSticker(null)
    } else {
      setSelectedSticker(null)
    }
  }, [open])

  // Always generate QR Code for the capture
  useEffect(() => {
    const generateQr = async () => {
      // Prioritize direct LAN URL for phones on the same network, then standard URL, then app origin
      const targetUrl =
        savedInfo?.directUrl ||
        (savedInfo?.url
          ? savedInfo.url.startsWith('http')
            ? savedInfo.url
            : `${window.location.origin}${savedInfo.url}`
          : window.location.href)

      try {
        const qr = await QRCode.toDataURL(targetUrl, {
          width: 220,
          margin: 1,
          color: {
            dark: '#09090b',
            light: '#ffffff',
          },
        })
        setQrDataUrl(qr)
      } catch (err) {
        console.error('QR generation error:', err)
      }
    }

    if (open) {
      generateQr()
    }
  }, [savedInfo, open])

  const handleSave = async () => {
    await onSaveToGallery()
  }

  // Robust download handler using Blobs to prevent browser data-URL size limits
  const handleDownload = () => {
    const url = previewTab === 'gif' && resultGifUrl ? resultGifUrl : resultDataUrl
    if (!url) return

    const filename =
      previewTab === 'gif' ? `photobooth-${Date.now()}.gif` : `photobooth-${Date.now()}.jpg`

    try {
      if (url.startsWith('data:')) {
        // Convert data URL to Blob for reliable large file download
        const arr = url.split(',')
        const mimeMatch = arr[0].match(/:(.*?);/)
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        const blob = new Blob([u8arr], { type: mime })
        const blobUrl = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()

        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        }, 3000)
      } else {
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(() => document.body.removeChild(a), 1000)
      }
    } catch (err) {
      console.error('Download error:', err)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => document.body.removeChild(a), 500)
    }
  }

  const handleCopyLink = () => {
    const targetUrl =
      savedInfo?.directUrl ||
      (savedInfo?.url
        ? savedInfo.url.startsWith('http')
          ? savedInfo.url
          : `${window.location.origin}${savedInfo.url}`
        : window.location.href)
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    if (!resultDataUrl) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Photostrip</title>
          <style>
            @page { margin: 0; size: auto; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${resultDataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Interactive tap-to-place sticker handler
  const handlePlaceSticker = (clientX: number, clientY: number, target: HTMLElement) => {
    if (!selectedSticker) return
    const rect = target.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, Math.round(((clientX - rect.left) / rect.width) * 100)))
    const y = Math.max(5, Math.min(95, Math.round(((clientY - rect.top) / rect.height) * 100)))
    onAddSticker(selectedSticker, x, y)
    setSelectedSticker(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 p-0 z-50">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-zinc-900 border border-zinc-700/60 p-2 text-zinc-100 shadow-sm">
                <Camera className="h-5 w-5 stroke-[1.75]" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold tracking-tight">
                  HASIL SESI PHOTOBOOTH
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Foto strip siap dicetak atau diunduh langsung ke smartphone tamu.
                </DialogDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>SIAP CETAK & UNDUH</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:divide-x md:divide-zinc-800/60">
          {/* Left Preview Column */}
          <div className="md:col-span-5 flex flex-col items-center bg-zinc-900/30 p-4">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 mb-3 self-stretch">
              <button
                onClick={() => {
                  setPreviewTab('strip')
                  setSelectedSticker(null)
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  previewTab === 'strip'
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Image className="h-3.5 w-3.5" />
                Strip Photo
              </button>
              <button
                onClick={() => {
                  setPreviewTab('gif')
                  setSelectedSticker(null)
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  previewTab === 'gif'
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Film className="h-3.5 w-3.5" />
                GIF Animasi
                {isGeneratingGif && (
                  <Loader2 className="h-3 w-3 animate-spin ml-0.5" />
                )}
              </button>
            </div>

            {/* Sticker Placement Banner */}
            {selectedSticker && previewTab === 'strip' && (
              <div className="mb-2 w-full flex items-center justify-between gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-300 animate-pulse">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="text-base">{selectedSticker}</span>
                  Ketuk foto pada posisi yang kamu inginkan!
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSticker(null)}
                  className="text-[11px] underline hover:text-white cursor-pointer ml-auto shrink-0"
                >
                  Batal
                </button>
              </div>
            )}

            {/* Preview area */}
            <div
              ref={imageContainerRef}
              className="relative w-full flex items-center justify-center rounded-xl bg-zinc-900/60 border border-zinc-800/60 overflow-hidden"
              style={{ minHeight: '320px' }}
            >
              {previewTab === 'strip' ? (
                resultDataUrl ? (
                  <img
                    src={resultDataUrl}
                    alt="Hasil Photobooth"
                    onClick={(e) => {
                      if (selectedSticker) {
                        handlePlaceSticker(e.clientX, e.clientY, e.currentTarget)
                      }
                    }}
                    onTouchStart={(e) => {
                      if (selectedSticker && e.touches.length > 0) {
                        handlePlaceSticker(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)
                      }
                    }}
                    className={`max-h-[52vh] w-auto rounded-lg object-contain transition-all select-none ${
                      selectedSticker
                        ? 'cursor-crosshair ring-4 ring-emerald-400/80 ring-offset-2 ring-offset-black scale-[0.99]'
                        : ''
                    }`}
                  />
                ) : (
                  <div className="flex h-72 w-48 items-center justify-center text-zinc-600 font-mono text-xs">
                    RENDERING STRIP...
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-6 w-full">
                  {isGeneratingGif ? (
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
                      <p className="text-xs font-mono">Membuat GIF Boomerang...</p>
                    </div>
                  ) : resultGifUrl ? (
                    <>
                      <img
                        src={resultGifUrl}
                        alt="Animated GIF"
                        className="max-h-[44vh] w-auto rounded-lg object-contain shadow-2xl"
                      />
                      <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-mono text-violet-400">
                        <Film className="h-3 w-3" />
                        Boomerang Loop · Animated GIF
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Film className="h-10 w-10" />
                      <p className="text-xs font-mono">GIF belum tersedia</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme swatches */}
            <div className="mt-3 w-full">
              <p className="text-[10px] font-mono text-zinc-500 mb-1.5 flex items-center gap-1">
                <Palette className="h-3 w-3" /> Ganti Tema Strip:
              </p>
              <div className="grid grid-cols-5 gap-1">
                {THEME_SWATCHES.map((t) => (
                  <button
                    key={t}
                    onClick={() => onChangeTheme(t)}
                    title={THEMES[t].name}
                    className={`h-6 rounded-md border transition-all cursor-pointer ${
                      currentTheme === t
                        ? 'ring-2 ring-white/40 scale-110 shadow-md'
                        : 'hover:scale-105 border-zinc-700'
                    }`}
                    style={{ backgroundColor: THEMES[t].bg, borderColor: THEMES[t].border }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Action Column */}
          <div className="md:col-span-7 flex flex-col gap-3.5 p-4">
            {/* Pose Thumbnails + Retake */}
            {thumbnails.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
                <label className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Camera className="h-3 w-3" />
                  Foto Per Pose {onRetakePose && '— Hover untuk Retake'}
                </label>
                <div className={`grid gap-1.5 ${thumbnails.length <= 4 ? 'grid-cols-4' : 'grid-cols-6'}`}>
                  {thumbnails.map((thumb, idx) => (
                    <div key={idx} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-zinc-700/50 group">
                      <img
                        src={thumb}
                        alt={`Pose ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {onRetakePose && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenChange(false)
                            setTimeout(() => onRetakePose(idx), 300)
                          }}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/65 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-white" />
                          <span className="text-[8px] font-bold text-white uppercase">Retake</span>
                        </button>
                      )}
                      <div className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.5 text-[8px] font-medium text-white/90">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sticker Section — Interactive Placement */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-mono font-semibold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Smile className="h-3 w-3 text-amber-400" />
                    Tambah Stiker
                  </label>
                  <p className="text-[10px] text-zinc-400">
                    Pilih stiker lalu ketuk foto di posisi yang kamu inginkan:
                  </p>
                </div>
                {stickers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearStickers}
                    className="h-6 px-2 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus ({stickers.length})
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {STICKER_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      if (selectedSticker === emoji) {
                        setSelectedSticker(null)
                      } else {
                        setSelectedSticker(emoji)
                      }
                    }}
                    title={selectedSticker === emoji ? 'Batalkan pilihan' : 'Pilih dan ketuk foto untuk menempel'}
                    className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer border shadow-sm ${
                      selectedSticker === emoji
                        ? 'bg-emerald-500/30 border-emerald-400 ring-2 ring-emerald-400 scale-110 shadow-lg'
                        : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700/40 hover:scale-110 active:scale-95'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {selectedSticker && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    Stiker aktif: <b className="text-base">{selectedSticker}</b>
                    <span className="text-zinc-400">(Ketuk foto di sebelah kiri)</span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onAddSticker(selectedSticker, 50, 50)
                      setSelectedSticker(null)
                    }}
                    className="h-6 text-[10px] border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    Tempel di Tengah
                  </Button>
                </div>
              )}
            </div>

            {/* QR Code Section — Always Visible */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 flex items-center gap-3.5 shadow-sm">
              <div className="flex-shrink-0 bg-white p-1.5 rounded-xl shadow-lg border border-zinc-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Scan QR Code" className="h-20 w-20 object-contain" />
                ) : (
                  <div className="h-20 w-20 flex flex-col items-center justify-center text-[10px] text-zinc-500 font-mono">
                    <Loader2 className="h-5 w-5 animate-spin mb-1 text-zinc-600" />
                    <span>Loading...</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-left flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    SCAN QR CODE HP
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Arahkan kamera HP ke QR code ini untuk membuka & mengunduh foto langsung ke smartphone.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-6 px-2 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1 border border-zinc-700/60 rounded-md cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3" />}
                    <span>{copied ? 'Link Tersalin!' : 'Salin Link Foto'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="w-full gap-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-md text-xs sm:text-sm cursor-pointer rounded-xl h-11"
                >
                  <Download className="h-4 w-4" />
                  {previewTab === 'gif' && resultGifUrl ? 'Download GIF' : 'Download JPG'}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePrint}
                  className="w-full gap-2 border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-100 font-bold shadow-sm text-xs sm:text-sm cursor-pointer rounded-xl h-11"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Foto
                </Button>
              </div>

              {storageError && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] leading-snug text-amber-200"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span>{storageError}</span>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  onOpenChange(false)
                  onNewSession()
                }}
                className="w-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 text-xs py-2 h-9 cursor-pointer gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Mulai Sesi Baru
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
