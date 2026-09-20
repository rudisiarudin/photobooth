import React, { useState } from 'react'
import { VideoOff, RefreshCw, FlipHorizontal, Maximize2, Minimize2, Camera, Video, ChevronDown, Usb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FILTERS, type FilterKey } from '@/lib/render'
import type { VideoDevice } from '@/hooks/useCamera'

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
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onStartCapture?: () => void
  retakingPoseIndex?: number | null
  // External camera device selection
  videoDevices?: VideoDevice[]
  selectedDeviceId?: string | null
  onSwitchCamera?: (deviceId: string) => void
  onRefreshDevices?: () => void
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
  isFullscreen = false,
  onToggleFullscreen,
  onStartCapture,
  retakingPoseIndex = null,
  videoDevices = [],
  selectedDeviceId,
  onSwitchCamera,
  onRefreshDevices,
}) => {
  const [showDeviceMenu, setShowDeviceMenu] = useState(false)

  const currentDevice = videoDevices.find((d) => d.deviceId === selectedDeviceId)
  const hasMultipleDevices = videoDevices.length > 1

  return (
    <div
      className={`relative overflow-hidden border border-border/60 bg-black/90 shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'h-full max-h-[76vh] aspect-[4/3] rounded-2xl mx-auto flex items-center justify-center'
          : 'w-full rounded-2xl'
      }`}
      style={{ aspectRatio: '4/3' }}
    >
      {/* Video element - Always sharp, no blur during capture */}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 p-6 text-center text-zinc-300 z-20">
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

      {/* Countdown overlay - Crystal clear video, NO blur or darkening */}
      {countdownNumber !== null && (
        <div className="pointer-events-none absolute inset-0 z-25 flex flex-col items-center justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/50 bg-black/40 shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-pop">
            <span className="text-8xl font-black tracking-tighter text-white font-mono drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              {countdownNumber}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-white/30 bg-black/60 px-4 py-1.5 shadow-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            <p className="text-xs font-mono font-bold tracking-widest text-white uppercase drop-shadow">
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
            <span>
              {retakingPoseIndex !== null
                ? `RETAKE • POSE ${retakingPoseIndex + 1}`
                : `REC • POSE ${currentPoseIndex + 1} OF ${totalPoses}`}
            </span>
          </div>
        ) : (
          /* Camera device selector — shown in standby */
          <div className="relative pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                if (onRefreshDevices) onRefreshDevices()
                if (hasMultipleDevices || videoDevices.length > 0) setShowDeviceMenu(!showDeviceMenu)
              }}
              className="flex items-center gap-2 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-mono tracking-wide text-zinc-300 hover:bg-zinc-800/90 transition-colors cursor-pointer"
              title="Pilih Kamera"
            >
              {currentDevice?.isHdmiCapture ? (
                <Usb className="h-3 w-3 text-violet-400 shrink-0" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              )}
              <span className="max-w-[140px] truncate">
                {currentDevice ? currentDevice.label : 'STANDBY • LIVE'}
              </span>
              {(hasMultipleDevices || videoDevices.length === 0) && (
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              )}
            </button>

            {/* Device dropdown menu */}
            {showDeviceMenu && videoDevices.length > 0 && (
              <div
                className="absolute top-full mt-2 left-0 min-w-[240px] rounded-xl bg-zinc-900/95 border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden z-50"
                onMouseLeave={() => setShowDeviceMenu(false)}
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Pilih Kamera Input</p>
                </div>
                {videoDevices.map((device) => (
                  <button
                    key={device.deviceId}
                    type="button"
                    onClick={() => {
                      if (onSwitchCamera) onSwitchCamera(device.deviceId)
                      setShowDeviceMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-mono transition-colors hover:bg-zinc-800/80 cursor-pointer ${
                      device.deviceId === selectedDeviceId ? 'text-white bg-zinc-800/60' : 'text-zinc-400'
                    }`}
                  >
                    {device.isHdmiCapture ? (
                      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-500/20 border border-violet-500/30 shrink-0">
                        <Usb className="h-3.5 w-3.5 text-violet-400" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                        <Video className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold leading-tight">
                        {device.label}
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                        {device.isHdmiCapture ? '📹 HDMI Capture Card' : '💻 Built-in / USB Webcam'}
                      </p>
                    </div>
                    {device.deviceId === selectedDeviceId && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
                <div className="px-3 py-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { if (onRefreshDevices) onRefreshDevices(); setShowDeviceMenu(false) }}
                    className="flex items-center gap-2 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh Daftar Kamera
                  </button>
                </div>
              </div>
            )}
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

          {onToggleFullscreen && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Keluar Fullscreen (Esc)' : 'Mode Fullscreen / Layar Penuh'}
              className={`h-8 w-8 rounded-lg border-white/20 backdrop-blur-md text-white transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-red-500/80 hover:bg-red-600 hover:text-white'
                  : 'bg-zinc-950/80 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Phone-Style Camera Shutter Button (floating at bottom center of live preview) */}
      <div className="absolute bottom-4 inset-x-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-1.5">
          {isSessionRunning ? (
            // Capturing State (Recording indicator)
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full border-4 border-red-500/80 p-1 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.8)] bg-black/40 animate-pulse">
                <div className="h-6 w-6 rounded-md bg-red-500 shadow-md" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase bg-black/60 border border-white/20 px-2.5 py-0.5 rounded-full drop-shadow">
                {retakingPoseIndex !== null
                  ? `Retake Pose #${retakingPoseIndex + 1}`
                  : `Pose ${currentPoseIndex + 1} / ${totalPoses}`}
              </span>
            </div>
          ) : (
            // Idle State - Phone Camera Shutter Button
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                disabled={!cameraActive}
                onClick={onStartCapture}
                title="Mulai Foto"
                className="group relative h-16 w-16 sm:h-18 sm:w-18 rounded-full border-4 border-white/95 p-1 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.7)] transition-all duration-200 hover:scale-105 active:scale-90 bg-black/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                {/* Inner circular white shutter button */}
                <div className="h-full w-full rounded-full bg-white shadow-md transition-transform duration-150 group-hover:scale-95 group-active:scale-85 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-zinc-900 transition-transform group-hover:scale-110" />
                </div>
              </button>
              <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase bg-black/60 border border-white/20 px-2.5 py-0.5 rounded-full drop-shadow">
                Mulai Foto ({totalPoses} Pose)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="pointer-events-none absolute bottom-3 inset-x-5 flex items-center justify-between text-[10px] font-mono text-white/50 z-10">
        <span className="hidden sm:inline">
          {currentDevice?.isHdmiCapture ? '📹 HDMI CAPTURE' : '35MM • F/2.0 • ISO 200'}
        </span>
        <span className="tracking-widest hidden sm:inline">K-PHOTO LAB 2026</span>
      </div>
    </div>
  )
}
