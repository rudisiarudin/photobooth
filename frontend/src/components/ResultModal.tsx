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
} from 'lucide-react'

interface ResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resultDataUrl: string | null
  resultGifUrl?: string | null
  isGeneratingGif?: boolean
  currentTheme: ThemeKey
  onChangeTheme: (theme: ThemeKey) => void
  onSaveToGallery: () => Promise<{ name: string; url: string } | null>
  savedInfo: { name: string; url: string } | null
  isSaving: boolean
  onNewSession: () => void
  stickers: StickerItem[]
  onAddSticker: (emoji: string) => void
  onClearStickers: () => void
  thumbnails?: string[]
  onRetakePose?: (index: number) => void
}

const STICKER_EMOJIS = ['✨', '🌸', '🎀', '🧸', '🤍', '💫', '🍒', '🌙', '🍓', '💌', '🎈', '🐱', '🌈', '🎭', '💎', '🔮', '🦋', '🌺']

const THEME_SWATCHES: ThemeKey[] = ['dark', 'cream', 'pink', 'white', 'lavender', 'sage', 'terracotta', 'sky', 'cyber', 'midnight']

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
  isSaving,
  onNewSession,
  stickers,
  onAddSticker,
  onClearStickers,
  thumbnails = [],
  onRetakePose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false)
  const [previewTab, setPreviewTab] = useState<'strip' | 'gif'>('strip')
  const imageContainerRef = useRef<HTMLDivElement | null>(null)

  // Fire confetti on open
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      })
      // Auto save to gallery
      handleSave()
      setPreviewTab('strip')
    } else {
      setSavedSuccess(false)
    }
  }, [open])

  // Generate QR only when savedInfo has a real server file path (not a base64 data URL)
  useEffect(() => {
    const generateQr = async () => {
      // savedInfo.url is a real server path like /captures/photo-xxx.jpg when the backend is running,
      // but is a long base64 data URL when offline (Vercel/static). Don't generate QR for data URLs.
      const isServerPath = savedInfo?.url && savedInfo.url.startsWith('/captures/')
      if (!isServerPath) {
        setQrDataUrl(null)
        return
      }

      const targetUrl = `${window.location.origin}${savedInfo!.url}`
      try {
        const qr = await QRCode.toDataURL(targetUrl, {
          width: 180,
          margin: 1,
          color: {
            dark: '#18181b',
            light: '#ffffff',
          },
        })
        setQrDataUrl(qr)
      } catch (err) {
        console.error('QR generation error:', err)
        setQrDataUrl(null)
      }
    }


    if (open) {
      generateQr()
    }
  }, [savedInfo, open])

  const handleSave = async () => {
    const res = await onSaveToGallery()
    if (res) {
      setSavedSuccess(true)
    }
  }

  const handleDownload = () => {
    const url = previewTab === 'gif' && resultGifUrl ? resultGifUrl : resultDataUrl
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = previewTab === 'gif' ? `photobooth-${Date.now()}.gif` : `photobooth-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyLink = () => {
    if (!savedInfo?.url || !savedInfo.url.startsWith('/captures/')) return
    const fullUrl = `${window.location.origin}${savedInfo.url}`
    navigator.clipboard.writeText(fullUrl)
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
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: #fff;
            }
            img {
              max-width: 100vw;
              max-height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${resultDataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 p-0">
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
              <span>SIAP CETAK</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:divide-x md:divide-zinc-800/60">
          {/* Left Preview Column */}
          <div className="md:col-span-5 flex flex-col items-center bg-zinc-900/30 p-4">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 mb-3 self-stretch">
              <button
                onClick={() => setPreviewTab('strip')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  previewTab === 'strip'
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Image className="h-3.5 w-3.5" />
                Strip Photo
              </button>
              <button
                onClick={() => setPreviewTab('gif')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
                    className="max-h-[52vh] w-auto rounded-lg object-contain"
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
                    className={`h-6 rounded-md border transition-all ${
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
          <div className="md:col-span-7 flex flex-col gap-4 p-4">
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

            {/* Sticker Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Smile className="h-3 w-3" />
                  Tambah Stiker
                </label>
                {stickers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearStickers}
                    className="h-6 px-2 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 gap-1"
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
                    onClick={() => onAddSticker(emoji)}
                    className="h-9 w-9 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-lg flex items-center justify-center transition-transform hover:scale-115 active:scale-95 cursor-pointer border border-zinc-700/40 shadow-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 flex items-center gap-3">
              {/* Only show QR if server returned a real file path */}
              {qrDataUrl ? (
                <>
                  <div className="flex-shrink-0 bg-white p-1.5 rounded-xl shadow-md">
                    <img src={qrDataUrl} alt="Scan QR Code" className="h-20 w-20 object-contain" />
                  </div>
                  <div className="space-y-1 text-left flex-1">
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                      Download ke HP
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Scan QR untuk unduh foto langsung ke smartphone.
                    </p>
                    {savedInfo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        className="h-6 px-2 text-[10px] text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1 mt-1"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3" />}
                        <span>{copied ? 'Link Tersalin!' : 'Salin Link Foto'}</span>
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                    <Download className="h-7 w-7 text-zinc-500" />
                  </div>
                  <div className="space-y-1.5 text-left flex-1">
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                      Simpan ke Perangkat
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Klik tombol Download di bawah untuk menyimpan foto ke perangkat ini.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                    >
                      Download sekarang →
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
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

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving || savedSuccess}
                  className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 gap-1.5 text-xs rounded-lg"
                >
                  <Check className={`h-3.5 w-3.5 ${savedSuccess ? 'text-emerald-400' : ''}`} />
                  {isSaving ? 'Menyimpan...' : savedSuccess ? 'Tersimpan!' : 'Simpan Galeri'}
                </Button>

                <Button
                  variant="secondary"
                  onClick={onNewSession}
                  className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 gap-1.5 text-xs rounded-lg"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Sesi Baru
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
