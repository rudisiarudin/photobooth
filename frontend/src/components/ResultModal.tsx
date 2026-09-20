import React, { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ThemeKey } from '@/lib/render'
import type { StickerItem } from '@/hooks/usePhotobooth'
import confetti from 'canvas-confetti'
import QRCode from 'qrcode'
import {
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  Check,
  Palette,
  Smile,
  Trash2,
} from 'lucide-react'

interface ResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resultDataUrl: string | null
  currentTheme: ThemeKey
  onChangeTheme: (theme: ThemeKey) => void
  onSaveToGallery: () => Promise<{ name: string; url: string } | null>
  savedInfo: { name: string; url: string } | null
  isSaving: boolean
  onNewSession: () => void
  stickers: StickerItem[]
  onAddSticker: (emoji: string) => void
  onClearStickers: () => void
}

const STICKER_EMOJIS = ['✨', '🌸', '🎀', '🧸', '🤍', '💫', '🍒', '🌙', '🍓', '💌', '🎈', '🐱']

export const ResultModal: React.FC<ResultModalProps> = ({
  open,
  onOpenChange,
  resultDataUrl,
  currentTheme,
  onChangeTheme,
  onSaveToGallery,
  savedInfo,
  isSaving,
  onNewSession,
  stickers,
  onAddSticker,
  onClearStickers,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false)
  const imageContainerRef = useRef<HTMLDivElement | null>(null)

  // Fire confetti on open
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981'],
      })
      // Auto save to gallery
      handleSave()
    } else {
      setSavedSuccess(false)
    }
  }, [open])

  // Generate QR code when savedInfo is available or using current page origin
  useEffect(() => {
    const generateQr = async () => {
      const targetUrl = savedInfo?.url
        ? `${window.location.origin}${savedInfo.url}`
        : window.location.href

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
    if (!resultDataUrl) return
    const a = document.createElement('a')
    a.href = resultDataUrl
    a.download = `photobooth-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyLink = () => {
    if (!savedInfo) return
    const fullUrl = `${window.location.origin}${savedInfo.url}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 p-4 sm:p-6">
        <DialogHeader className="pb-2 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  Hasil Photobooth Anda!
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Foto berhasil dirangkai. Hias dengan stiker, simpan, atau scan QR code.
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs hidden sm:flex">
              Siap Cetak
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
          {/* Left Preview Column */}
          <div className="md:col-span-6 flex flex-col items-center justify-center rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800/80">
            <div
              ref={imageContainerRef}
              className="relative max-h-[58vh] overflow-hidden rounded-xl shadow-2xl transition-all"
            >
              {resultDataUrl ? (
                <img
                  src={resultDataUrl}
                  alt="Hasil Photobooth"
                  className="max-h-[58vh] w-auto rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-72 w-48 items-center justify-center text-zinc-600">
                  Memuat foto...
                </div>
              )}
            </div>

            {/* Quick theme switch underneath */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Palette className="h-3 w-3" /> Tema:
              </span>
              {(['dark', 'cream', 'pink', 'white'] as ThemeKey[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onChangeTheme(t)}
                  className={`h-6 px-2.5 rounded-full text-[10px] font-medium transition-all capitalize ${
                    currentTheme === t
                      ? 'bg-zinc-100 text-zinc-900 font-semibold ring-2 ring-rose-500'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Column */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            {/* Sticker Decorator Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Smile className="h-3.5 w-3.5 text-rose-400" />
                  Tambah Stiker Cute
                </label>
                {stickers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearStickers}
                    className="h-6 px-2 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus Stiker ({stickers.length})
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {STICKER_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onAddSticker(emoji)}
                    className="h-9 w-9 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-lg flex items-center justify-center transition-transform hover:scale-125 active:scale-95 cursor-pointer shadow-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500">
                Klik stiker untuk menempelkannya otomatis di photostrip.
              </p>
            </div>

            {/* QR Code Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center gap-4">
              <div className="flex-shrink-0 bg-white p-2 rounded-xl shadow-md">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Scan QR Code" className="h-24 w-24 object-contain" />
                ) : (
                  <div className="h-24 w-24 flex items-center justify-center text-xs text-zinc-400">
                    QR...
                  </div>
                )}
              </div>

              <div className="space-y-1 text-left flex-1">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Download ke Smartphone
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Scan QR code menggunakan kamera HP untuk mengunduh foto langsung.
                </p>
                {savedInfo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-6 px-2 text-[10px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-1 mt-1"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3" />}
                    <span>{copied ? 'Link Tersalin!' : 'Salin Link Foto'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                size="lg"
                onClick={handleDownload}
                className="w-full gap-2 bg-gradient-to-r from-rose-500 to-indigo-500 text-white font-semibold shadow-lg shadow-rose-500/20 hover:opacity-95"
              >
                <Download className="h-4 w-4" />
                Download Foto High-Res
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving || savedSuccess}
                  className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 gap-1.5 text-xs"
                >
                  <Check className={`h-3.5 w-3.5 ${savedSuccess ? 'text-emerald-400' : ''}`} />
                  {isSaving ? 'Menyimpan...' : savedSuccess ? 'Tersimpan di Galeri' : 'Simpan ke Galeri'}
                </Button>

                <Button
                  variant="secondary"
                  onClick={onNewSession}
                  className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 gap-1.5 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Sesi Foto Baru
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
