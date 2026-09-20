import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Download,
  RefreshCw,
  Image as ImageIcon,
  Calendar,
  Eye,
  ExternalLink,
} from 'lucide-react'

interface CaptureItem {
  name: string
  url: string
  size: number
  createdAt: string
}

export const DashboardPage: React.FC = () => {
  const [captures, setCaptures] = useState<CaptureItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPhoto, setSelectedPhoto] = useState<CaptureItem | null>(null)

  const fetchCaptures = async () => {
    setLoading(true)
    let remoteCaptures: CaptureItem[] = []
    try {
      const res = await fetch('/api/captures')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.captures)) {
          remoteCaptures = data.captures
        }
      }
    } catch (err) {
      console.warn('Error fetching server captures, using local storage:', err)
    }

    try {
      const local: CaptureItem[] = JSON.parse(
        localStorage.getItem('itpalugada_captures') || '[]'
      )
      // Merge unique captures by name or url
      const combined = [...remoteCaptures]
      for (const item of local) {
        if (!combined.some((c) => c.name === item.name || c.url === item.url)) {
          combined.push(item)
        }
      }
      setCaptures(combined)
    } catch {
      setCaptures(remoteCaptures)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaptures()
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Galeri Photobooth
            </h1>
            <Badge variant="secondary" className="text-xs">
              {captures.length} Foto
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Semua foto hasil sesi photobooth tersimpan dan siap diunduh.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchCaptures}
          disabled={loading}
          className="gap-1.5 text-xs self-end sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Galeri</span>
        </Button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Memuat galeri foto...</p>
        </div>
      ) : captures.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-8 text-center bg-muted/10">
          <div className="rounded-full bg-muted/40 p-4 text-muted-foreground mb-3">
            <ImageIcon className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-foreground">Belum Ada Foto Tersimpan</h3>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Lakukan sesi foto pertama Anda di tab Booth untuk melihat hasil cetak di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {captures.map((item) => (
            <Card
              key={item.name}
              className="group overflow-hidden border-border/60 bg-card/60 transition-all hover:border-border hover:shadow-xl flex flex-col"
            >
              {/* Photo preview */}
              <div
                onClick={() => setSelectedPhoto(item)}
                className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-950 cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                  <div className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <CardContent className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {formatBytes(item.size)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href={item.url}
                    download={item.name}
                    className="flex-1"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full h-7 text-[11px] gap-1 px-2"
                    >
                      <Download className="h-3 w-3" />
                      Unduh
                    </Button>
                  </a>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 p-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-mono font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-zinc-400" />
              {selectedPhoto?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex justify-center max-h-[70vh] overflow-hidden rounded-xl bg-black/60 p-2 border border-zinc-800/80">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  className="max-h-[66vh] w-auto object-contain rounded-lg shadow-2xl"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-zinc-400">
                  {formatDate(selectedPhoto.createdAt)} • {formatBytes(selectedPhoto.size)}
                </span>
                <a
                  href={selectedPhoto.url}
                  download={selectedPhoto.name}
                >
                  <Button size="sm" className="gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold">
                    <Download className="h-3.5 w-3.5" />
                    Download File Asli
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
