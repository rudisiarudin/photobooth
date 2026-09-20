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
import { Camera, RotateCcw, Layers } from 'lucide-react'

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

  // Sync fullscreen state with browser events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const handleToggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await boothRef.current?.requestFullscreen()
      } catch (e) {
        console.warn('Fullscreen not available:', e)
      }
    } else {
      document.exitFullscreen()
    }
  }, [])

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

  const handleAddSticker = (emoji: string) => {
    const randomX = Math.floor(Math.random() * 60) + 20
    const randomY = Math.floor(Math.random() * 70) + 15
    const newSticker: StickerItem = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: randomX,
      y: randomY,
      scale: 1,
      rotation: (Math.random() - 0.5) * 30,
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
    <div ref={boothRef} className="w-full min-h-screen bg-background flex flex-col">
      {/* === CAMERA PREVIEW — Full Width === */}
      <div className="w-full px-4 pt-4 pb-2 max-w-5xl mx-auto">
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
        />
      </div>

      {/* === CONTROLS PANEL — Below Camera === */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-6 space-y-3">

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
              <span className="text-[9px] font-mono text-muted-foreground">{eventConfig.date}</span>
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
