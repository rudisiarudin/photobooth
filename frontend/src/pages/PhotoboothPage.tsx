import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { usePhotobooth, type StickerItem } from '@/hooks/usePhotobooth'
import { CameraView } from '@/components/CameraView'
import { FilterBar } from '@/components/FilterBar'
import { LayoutPicker } from '@/components/LayoutPicker'
import { ThemePicker } from '@/components/ThemePicker'
import { ShotTrack } from '@/components/ShotTrack'
import { EventSettingsDialog } from '@/components/EventSettingsDialog'
import { ResultModal } from '@/components/ResultModal'
import { Button } from '@/components/ui/button'
import { Camera, RotateCcw, Layers, Maximize2, Minimize2, SwitchCamera, Usb, RefreshCw } from 'lucide-react'

interface PhotoboothPageProps {
  onOpenSettings: boolean
  setOpenSettings: (open: boolean) => void
}

export const PhotoboothPage: React.FC<PhotoboothPageProps> = ({
  onOpenSettings,
  setOpenSettings,
}) => {
  const {
    videoRef,
    cameraActive,
    cameraError,
    isMirrored,
    setIsMirrored,
    activeFilter,
    setActiveFilter,
    isFlashing,
    triggerFlash,
    startCamera,
    captureFrame,
    videoDevices,
    selectedDeviceId,
    switchCamera,
    cycleToNextCamera,
    refreshDevices,
  } = useCamera()

  const {
    layout,
    setLayout,
    theme,
    setTheme,
    eventConfig,
    setEventConfig,
    thumbnails,
    isSessionRunning,
    countdownNumber,
    currentPoseIndex,
    retakingPoseIndex,
    requiredPoses,
    resultDataUrl,
    resultGifUrl,
    isGeneratingGif,
    showResultModal,
    setShowResultModal,
    isSaving,
    savedInfo,
    stickers,
    setStickers,
    startSession,
    retakeSinglePose,
    resetSession,
    regenerateResultWithThemeAndLayout,
    saveToGallery,
  } = usePhotobooth()

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const boothRef = useRef<HTMLDivElement>(null)

  const handleToggleFullscreen = useCallback(async () => {
    const doc = document as unknown as {
      fullscreenElement?: Element
      webkitFullscreenElement?: Element
      mozFullScreenElement?: Element
      msFullscreenElement?: Element
      exitFullscreen?: () => Promise<void>
      webkitExitFullscreen?: () => Promise<void>
      mozCancelFullScreen?: () => Promise<void>
      msExitFullscreen?: () => Promise<void>
    }

    const isDocFs = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    )

    if (!isFullscreen && !isDocFs) {
      setIsFullscreen(true)
      const el = (boothRef.current || document.documentElement) as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>
        mozRequestFullScreen?: () => Promise<void>
        msRequestFullscreen?: () => Promise<void>
      }
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen()
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen()
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen()
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen()
        }
      } catch (e) {
        console.warn('Native requestFullscreen denied or unavailable, using CSS fullscreen:', e)
      }
    } else {
      setIsFullscreen(false)
      try {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen()
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen()
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen()
        }
      } catch (e) {
        console.warn('Exit fullscreen error:', e)
      }
    }
  }, [isFullscreen])

  // Sync fullscreen state with browser events & Escape key
  useEffect(() => {
    const doc = document as unknown as {
      fullscreenElement?: Element
      webkitFullscreenElement?: Element
      mozFullScreenElement?: Element
      msFullscreenElement?: Element
    }

    const onFsChange = () => {
      const active = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      )
      if (!active) {
        setIsFullscreen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('mozfullscreenchange', onFsChange)
    document.addEventListener('MSFullscreenChange', onFsChange)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('mozfullscreenchange', onFsChange)
      document.removeEventListener('MSFullscreenChange', onFsChange)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isFullscreen, handleToggleFullscreen])

  const handleStartCapture = () => {
    startSession(captureFrame, triggerFlash)
  }

  const handleSelectLayout = (newLayout: typeof layout) => {
    setLayout(newLayout)
  }

  const handleSelectTheme = (newTheme: typeof theme) => {
    setTheme(newTheme)
    if (resultDataUrl) {
      regenerateResultWithThemeAndLayout(newTheme, layout, stickers)
    }
  }

  const handleAddSticker = (emoji: string, x?: number, y?: number) => {
    const targetX = x !== undefined ? x : Math.floor(Math.random() * 50) + 25
    const targetY = y !== undefined ? y : Math.floor(Math.random() * 60) + 20
    const newSticker: StickerItem = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: targetX,
      y: targetY,
      scale: 1,
      rotation: (Math.random() - 0.5) * 20,
    }
    const updated = [...stickers, newSticker]
    setStickers(updated)
    regenerateResultWithThemeAndLayout(theme, layout, updated)
  }

  const handleClearStickers = () => {
    setStickers([])
    regenerateResultWithThemeAndLayout(theme, layout, [])
  }

  const handleRetakePose = useCallback((index: number) => {
    retakeSinglePose(index, captureFrame, triggerFlash)
  }, [retakeSinglePose, captureFrame, triggerFlash])

  const isCapturing = isSessionRunning || retakingPoseIndex !== null

  return (
    <div
      ref={boothRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-40 bg-zinc-950 text-foreground flex flex-col w-screen h-screen overflow-hidden select-none'
          : 'w-full min-h-screen bg-background flex flex-col'
      }
    >
      {/* Fullscreen Kiosk Header */}
      {isFullscreen && (
        <div className="w-full flex items-center justify-between px-6 py-2 bg-black/70 backdrop-blur-md border-b border-white/10 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-ring" />
            <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
              {eventConfig.title}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
              • FULLSCREEN KIOSK MODE
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFullscreen}
            className="text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 gap-1.5 h-8 px-3 rounded-lg border border-white/15 cursor-pointer"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span>Keluar Fullscreen (Esc)</span>
          </Button>
        </div>
      )}

      {/* === CAMERA PREVIEW === */}
      <div
        className={
          isFullscreen
            ? 'flex-1 w-full flex items-center justify-center p-2 sm:p-3 min-h-0'
            : 'w-full px-4 pt-4 pb-2 max-w-5xl mx-auto'
        }
      >
        <CameraView
          videoRef={videoRef}
          cameraActive={cameraActive}
          cameraError={cameraError}
          isMirrored={isMirrored}
          onToggleMirror={() => setIsMirrored(!isMirrored)}
          onRetryCamera={startCamera}
          activeFilter={activeFilter}
          isFlashing={isFlashing}
          countdownNumber={countdownNumber}
          isSessionRunning={isCapturing}
          currentPoseIndex={currentPoseIndex}
          totalPoses={requiredPoses}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onStartCapture={handleStartCapture}
          retakingPoseIndex={retakingPoseIndex}
          videoDevices={videoDevices}
          selectedDeviceId={selectedDeviceId}
          onSwitchCamera={switchCamera}
          onCycleCamera={cycleToNextCamera}
          onRefreshDevices={refreshDevices}
        />
      </div>

      {/* === CONTROLS PANEL — Below Camera === */}
      <div
        className={
          isFullscreen
            ? 'w-full max-w-5xl mx-auto px-4 pb-3 pt-1 space-y-2 max-h-[28vh] overflow-y-auto shrink-0'
            : 'w-full max-w-5xl mx-auto px-4 pb-6 space-y-3'
        }
      >
        {/* ---- Camera Source & Device Bar ---- */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-xl border shrink-0 ${
                videoDevices.find((d) => d.deviceId === selectedDeviceId)?.isHdmiCapture
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              {videoDevices.find((d) => d.deviceId === selectedDeviceId)?.isHdmiCapture ? (
                <Usb className="h-4 w-4" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Kamera:
                </span>
                {videoDevices.find((d) => d.deviceId === selectedDeviceId)?.isHdmiCapture ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-violet-300 bg-violet-500/20 border border-violet-500/40 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
                    HDMI / Sony A6000 Aktif
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Kamera Internal ({videoDevices.length} Terdeteksi)
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold truncate text-foreground mt-0.5">
                {videoDevices.find((d) => d.deviceId === selectedDeviceId)?.label || 'Mendeteksi kamera...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {videoDevices.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={cycleToNextCamera}
                disabled={isCapturing}
                className="h-8 px-3 text-xs font-mono gap-1.5 rounded-xl border-border/70 hover:bg-muted/60 cursor-pointer"
                title="Ganti ke kamera berikutnya (Depan / Belakang / HDMI Sony)"
              >
                <SwitchCamera className="h-3.5 w-3.5" />
                <span>Ganti Kamera</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshDevices()}
              disabled={isCapturing}
              className="h-8 px-2.5 text-xs font-mono gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
              title="Pindai ulang koneksi USB / HDMI Capture Card"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pindai Ulang</span>
            </Button>
          </div>
        </div>

        {/* ---- Filter Bar ---- */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm px-4 py-3 shadow-sm">
          <FilterBar
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            disabled={isCapturing}
          />
        </div>

        {/* ---- Main Controls Grid ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Layout Picker */}
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 shadow-sm">
            <LayoutPicker
              currentLayout={layout}
              onSelectLayout={handleSelectLayout}
              disabled={isCapturing}
            />
          </div>

          {/* Theme Picker */}
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 shadow-sm">
            <ThemePicker
              currentTheme={theme}
              onSelectTheme={handleSelectTheme}
              disabled={isCapturing}
            />
          </div>

          {/* Shot Track + Actions */}
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 shadow-sm space-y-3">
            {/* Event label */}
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 pulse-ring" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-foreground uppercase">
                  {eventConfig.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted-foreground">{eventConfig.date}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFullscreen}
                  title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
                  className="h-6 px-2 text-[10px] font-mono gap-1 rounded-md border-border/70 text-foreground hover:bg-muted/50 cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </Button>
              </div>
            </div>

            <ShotTrack
              totalPoses={requiredPoses}
              currentPoseIndex={currentPoseIndex}
              isSessionRunning={isCapturing}
              thumbnails={thumbnails}
              retakingPoseIndex={retakingPoseIndex}
              onRetake={thumbnails.length === requiredPoses ? handleRetakePose : undefined}
            />

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Button
                size="lg"
                disabled={!cameraActive || isCapturing}
                onClick={handleStartCapture}
                className="w-full h-12 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm shadow-xl shadow-black/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-zinc-200 gap-2.5 disabled:opacity-50"
              >
                <Camera className="h-4 w-4 stroke-[2]" />
                <span>
                  {isCapturing
                    ? retakingPoseIndex !== null
                      ? `Retake Pose #${retakingPoseIndex + 1}...`
                      : `Mengambil Pose #${currentPoseIndex + 1}...`
                    : 'Mulai Foto (3s Countdown)'}
                </span>
              </Button>

              {thumbnails.length > 0 && !isCapturing && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResultModal(true)}
                    className="border-border/70 gap-1.5 text-xs text-foreground hover:bg-muted/50 rounded-lg"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Lihat Hasil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSession}
                    className="text-muted-foreground hover:text-destructive gap-1.5 text-xs rounded-lg"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Sesi
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <EventSettingsDialog
        open={onOpenSettings}
        onOpenChange={setOpenSettings}
        config={eventConfig}
        onSave={(newCfg) => {
          setEventConfig(newCfg)
          if (resultDataUrl) {
            regenerateResultWithThemeAndLayout(theme, layout, stickers)
          }
        }}
      />

      {/* Result Modal */}
      <ResultModal
        open={showResultModal}
        onOpenChange={setShowResultModal}
        resultDataUrl={resultDataUrl}
        resultGifUrl={resultGifUrl}
        isGeneratingGif={isGeneratingGif}
        currentTheme={theme}
        onChangeTheme={handleSelectTheme}
        onSaveToGallery={saveToGallery}
        savedInfo={savedInfo}
        isSaving={isSaving}
        onNewSession={() => {
          setShowResultModal(false)
          resetSession()
        }}
        stickers={stickers}
        onAddSticker={handleAddSticker}
        onClearStickers={handleClearStickers}
        thumbnails={thumbnails}
        onRetakePose={handleRetakePose}
      />
    </div>
  )
}
