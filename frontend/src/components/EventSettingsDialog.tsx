import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EventConfig } from '@/lib/render'
import { Sparkles, Calendar, Type } from 'lucide-react'

interface EventSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: EventConfig
  onSave: (config: EventConfig) => void
}

export const EventSettingsDialog: React.FC<EventSettingsDialogProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [title, setTitle] = useState(config.title)
  const [subtitle, setSubtitle] = useState(config.subtitle)
  const [date, setDate] = useState(config.date)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, subtitle, date })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-400">
            <Sparkles className="h-5 w-5" />
            <DialogTitle className="text-xl">Pengaturan Event</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-xs">
            Teks ini akan dicetak di bagian bawah (footer) frame foto photobooth Anda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="event-title" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-zinc-400" />
              Judul Event / Brand
            </Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: IT PALUGADA"
              className="bg-zinc-900/80 border-zinc-800 focus-visible:ring-rose-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-sub" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-zinc-400" />
              Subjudul / Tagline
            </Label>
            <Input
              id="event-sub"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Contoh: WEDDING OF SARAH & BUDI"
              className="bg-zinc-900/80 border-zinc-800 focus-visible:ring-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-date" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              Label Tanggal / Lokasi
            </Label>
            <Input
              id="event-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Contoh: 20 September 2026"
              className="bg-zinc-900/80 border-zinc-800 focus-visible:ring-rose-500"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-gradient-to-r from-rose-500 to-indigo-500 text-white hover:opacity-90"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
