import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { VideoDevice } from '@/hooks/useCamera'
import {
  Camera,
  Usb,
  Video,
  Globe,
  Info,
  RefreshCw,
  Wifi,
  Check,
} from 'lucide-react'

interface CameraSettingsProps {
  videoDevices: VideoDevice[]
  selectedDeviceId: string | null
  isMirrored: boolean
  isCapturing: boolean
  ipStreamUrl: string
  isIpStreamMode: boolean
  onSwitchCamera: (deviceId: string) => void
  onCycleCamera?: () => void
  onRefreshDevices: () => void
  onToggleMirror: () => void
  onConnectIpStream: (url: string) => Promise<void>
  onDisconnectIpStream: () => Promise<void>
}

export const CameraSettings: React.FC<CameraSettingsProps> = ({
  videoDevices,
  selectedDeviceId,
  isMirrored,
  isCapturing,
  ipStreamUrl,
  isIpStreamMode,
  onSwitchCamera,
  onCycleCamera,
  onRefreshDevices,
  onToggleMirror,
  onConnectIpStream,
  onDisconnectIpStream,
}) => {
  const [showStreamInput, setShowStreamInput] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [streamUrl, setStreamUrl] = useState(ipStreamUrl || 'http://localhost:8080/video')

  const current = videoDevices.find((d) => d.deviceId === selectedDeviceId)
  const selectedIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId)
  const total = videoDevices.length

  return (
    <div className="space-y-4">
      {/* ---- Active source summary ---- */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 ${
              current?.isHdmiCapture
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {current?.isHdmiCapture ? <Usb className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Sumber Kamera Aktif
            </p>
            <p className="truncate text-sm font-semibold text-zinc-100">
              {current?.label || 'Belum terdeteksi'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {current?.isHdmiCapture ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              HDMI / Sony A6000
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Kamera Internal
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            {total} perangkat
          </span>
          {selectedIndex >= 0 && total > 1 && (
            <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
              {selectedIndex + 1} / {total}
            </span>
          )}
        </div>
      </div>

      {/* ---- Device list ---- */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300">Pilih Kamera</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefreshDevices}
            disabled={isCapturing}
            className="h-7 gap-1.5 rounded-lg px-2 font-mono text-[10px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <RefreshCw className="h-3 w-3" />
            Pindai Ulang
          </Button>
        </div>

        {videoDevices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-4 text-center">
            <p className="text-xs text-zinc-500">
              Belum ada kamera terdeteksi. Colok Sony A6000 + HDMI capture card, lalu pindai ulang.
            </p>
          </div>
        ) : (
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {videoDevices.map((device, idx) => {
              const isActive = device.deviceId === selectedDeviceId
              return (
                <button
                  key={device.deviceId || idx}
                  type="button"
                  disabled={isCapturing}
                  onClick={() => onSwitchCamera(device.deviceId)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isActive
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-800/60'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      device.isHdmiCapture
                        ? 'border-violet-500/40 bg-violet-500/20 text-violet-300'
                        : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {device.isHdmiCapture ? <Usb className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-200">
                      {device.label || `Camera ${idx + 1}`}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {device.isHdmiCapture ? 'HDMI Capture Card' : 'Kamera Internal / Tablet'}
                    </p>
                  </div>
                  {isActive ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <span className="font-mono text-[10px] text-zinc-600">#{idx + 1}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {total > 1 && onCycleCamera && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCycleCamera}
            disabled={isCapturing}
            className="h-8 w-full gap-1.5 rounded-xl border-zinc-700 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Ganti ke Kamera Berikutnya
          </Button>
        )}
      </div>

      {/* ---- Mirror ---- */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-zinc-300">Tampilan</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleMirror}
          disabled={isCapturing}
          className="h-9 w-full justify-between rounded-xl border-zinc-700 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          <span>Mode Mirror (Cermin)</span>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
              isMirrored
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
            }`}
          >
            {isMirrored ? 'AKTIF' : 'NONAKTIF'}
          </span>
        </Button>
      </div>

      {/* ---- IP Stream ---- */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setShowStreamInput((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg px-1 py-1 text-xs font-semibold text-zinc-300 hover:text-sky-300"
        >
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Stream IP / Android (USB Camera)
          </span>
          <span className="text-[10px] text-zinc-500">{showStreamInput ? '−' : '+'}</span>
        </button>

        {isIpStreamMode && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2">
            <span className="flex min-w-0 items-center gap-1.5 font-mono text-[10px] text-emerald-400">
              <Wifi className="h-3.5 w-3.5 shrink-0 animate-pulse" />
              <span className="truncate">{ipStreamUrl}</span>
            </span>
            <button
              type="button"
              onClick={() => onDisconnectIpStream()}
              className="ml-2 shrink-0 text-[10px] text-rose-400 hover:underline"
            >
              Putuskan
            </button>
          </div>
        )}

        {showStreamInput && (
          <div className="space-y-2 rounded-xl border border-sky-500/25 bg-sky-950/20 p-3">
            <p className="text-[10px] leading-relaxed text-zinc-400">
              Buka aplikasi <span className="font-semibold text-sky-300">USB Camera</span> di tablet,
              aktifkan <span className="font-semibold text-sky-300">IP Camera Server</span>, lalu
              salin URL-nya ke sini.
            </p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="http://192.168.20.15:8080/video"
                className="flex-1 rounded-lg border border-zinc-700 bg-black/50 px-2.5 py-1.5 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-sky-400 focus:outline-none"
              />
              <Button
                type="button"
                size="sm"
                disabled={isCapturing || !streamUrl}
                onClick={() => onConnectIpStream(streamUrl)}
                className="h-8 shrink-0 bg-sky-600 px-3 text-[10px] text-white hover:bg-sky-500"
              >
                Hubungkan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Help ---- */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg px-1 py-1 text-xs font-semibold text-zinc-300 hover:text-amber-300"
        >
          <span className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Panduan Tablet Android
          </span>
          <span className="text-[10px] text-zinc-500">{showHelp ? '−' : '+'}</span>
        </button>

        {showHelp && (
          <div className="space-y-2 rounded-xl border border-amber-500/25 bg-amber-950/20 p-3 text-[10px] leading-relaxed text-amber-100/90">
            <p className="font-semibold text-amber-300">
              Kenapa Chrome di Android memblokir USB capture card?
            </p>
            <p className="text-zinc-300">
              Android <strong>memblokir akses USB capture card dari browser</strong> demi keamanan.
              Chrome hanya bisa membaca kamera depan/belakang bawaan tablet.
            </p>
            <ol className="list-decimal space-y-1.5 pl-1 text-zinc-300">
              <li>
                <strong>Cara terbaik — Spacedesk:</strong> colok Sony A6000 ke PC (di PC sudah
                terbukti jalan), lalu install <em>Spacedesk</em> agar tablet menjadi monitor
                layar sentuh. Pengunjung menekan tablet, kamera diproses di PC.
              </li>
              <li>
                <strong>Stream via aplikasi:</strong> buka <em>USB Camera</em> di tablet → aktifkan{' '}
                <em>IP Camera Server</em> → masukkan URL-nya di atas.
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
