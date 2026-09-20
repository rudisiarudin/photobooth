import React from 'react'
import { VideoOff, RefreshCw, FlipHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-white/40 bg-black/60 shadow-2xl animate-pop">
            <span className="text-7xl font-black tracking-tighter text-white drop-shadow-md">
              {countdownNumber}
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold tracking-wider text-white uppercase drop-shadow">
            Bersiap untuk Pose {currentPoseIndex + 1}
          </p>
        </div>
      )}

      {/* Top Status & Controls Overlay */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
        {isSessionRunning ? (
          <Badge className="bg-rose-600 text-white shadow-lg pointer-events-auto animate-pulse flex items-center gap-1.5 px-3 py-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-white" />
            Pose {currentPoseIndex + 1} dari {totalPoses}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/10 text-zinc-300 pointer-events-auto text-xs">
            <Eye className="h-3 w-3 mr-1 text-emerald-400" />
            Live Preview
          </Badge>
        )}

        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMirror}
            title={isMirrored ? 'Mode Normal' : 'Mode Mirror'}
            className="h-8 w-8 rounded-full border-white/15 bg-black/60 text-white hover:bg-white/20 hover:text-white"
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Film grain / vintage scanline aesthetic */}
      <div className="pointer-events-none absolute inset-0 border border-white/5 bg-gradient-to-b from-transparent via-transparent to-black/30" />
    </div>
  )
}
