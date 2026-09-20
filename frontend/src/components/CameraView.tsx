import React from 'react'
import { VideoOff, RefreshCw, FlipHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FILTERS, type FilterKey } from '@/lib/render'

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  cameraActive: boolean
  cameraError: string | null
  isMirrored: boolean
  onToggleMirror: () => void
  onRetryCamera: () => void
  activeFilter: FilterKey
  isFlashing: boolean
  countdownNumber: number | null
  isSessionRunning: boolean
  currentPoseIndex: number
  totalPoses: number
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  cameraActive,
  cameraError,
  isMirrored,
  onToggleMirror,
  onRetryCamera,
  activeFilter,
  isFlashing,
  countdownNumber,
  isSessionRunning,
  currentPoseIndex,
  totalPoses,
}) => {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-black/90 shadow-2xl">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover transition-transform duration-300 ${
          isMirrored ? '-scale-x-100' : ''
        }`}
        style={{
          filter: FILTERS[activeFilter] !== 'none' ? FILTERS[activeFilter] : undefined,
        }}
      />

      {/* Camera inactive / error state */}
      {(!cameraActive || cameraError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 p-6 text-center text-zinc-300">
          <div className="rounded-full bg-zinc-800/80 p-4 text-zinc-400">
            <VideoOff className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-zinc-200">
              {cameraError ? 'Kamera Tidak Terdeteksi' : 'Kamera Belum Aktif'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm">
              {cameraError || 'Izinkan akses kamera di browser Anda untuk mulai berfoto.'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onRetryCamera}
            className="mt-2 gap-2 bg-zinc-100 text-zinc-900 hover:bg-white"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Akses Kamera
          </Button>
        </div>
      )}

      {/* Flash overlay */}
      {isFlashing && (
        <div className="pointer-events-none absolute inset-0 z-30 bg-white animate-flash" />
      )}

      {/* Countdown overlay */}
      {countdownNumber !== null && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-white/20 bg-zinc-950/80 shadow-2xl ring-8 ring-white/5 animate-pop">
            <span className="text-8xl font-black tracking-tighter text-white font-mono">
              {countdownNumber}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-mono tracking-widest text-white uppercase">
              POSE {currentPoseIndex + 1} / {totalPoses}
            </p>
          </div>
        </div>
      )}

      {/* Viewfinder Corner Brackets */}
      <div className="pointer-events-none absolute inset-6 z-10">
        <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-white/30" />
        <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-white/30" />
        <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-white/30" />
        <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-white/30" />
      </div>

      {/* Top Status & Controls Overlay */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-15 pointer-events-none">
        {isSessionRunning ? (
          <div className="flex items-center gap-2 rounded-full bg-red-600/90 text-white shadow-lg pointer-events-auto px-3.5 py-1 text-xs font-mono font-semibold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            <span>REC • POSE {currentPoseIndex + 1} OF {totalPoses}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-mono tracking-wide text-zinc-300 pointer-events-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>STANDBY • 1080P</span>
          </div>
        )}

        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMirror}
            title={isMirrored ? 'Mode Normal' : 'Mode Mirror'}
            className="h-8 w-8 rounded-lg border-white/15 bg-zinc-950/80 backdrop-blur-md text-white hover:bg-zinc-800 hover:text-white"
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="pointer-events-none absolute bottom-3 inset-x-5 flex items-center justify-between text-[10px] font-mono text-white/50 z-10">
        <span>35MM • F/2.0 • ISO 200</span>
        <span className="tracking-widest">K-PHOTO LAB 2026</span>
      </div>
    </div>
  )
}
