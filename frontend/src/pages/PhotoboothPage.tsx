import React from 'react'
import { useCamera } from '@/hooks/useCamera'
import { usePhotobooth, type StickerItem } from '@/hooks/usePhotobooth'
import { CameraView } from '@/components/CameraView'
import { FilterBar } from '@/components/FilterBar'
import { LayoutPicker } from '@/components/LayoutPicker'
import { ThemePicker } from '@/components/ThemePicker'
import { ShotTrack } from '@/components/ShotTrack'
import { EventSettingsDialog } from '@/components/EventSettingsDialog'
import { ResultModal } from '@/components/ResultModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, RefreshCw, Layers } from 'lucide-react'

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
    requiredPoses,
    resultDataUrl,
    showResultModal,
    setShowResultModal,
    isSaving,
    savedInfo,
    stickers,
    setStickers,
    startSession,
    resetSession,
    regenerateResultWithThemeAndLayout,
    saveToGallery,
  } = usePhotobooth()

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
    // Distribute stickers across the card
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

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Camera Stage (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
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
            isSessionRunning={isSessionRunning}
            currentPoseIndex={currentPoseIndex}
            totalPoses={requiredPoses}
          />

          <FilterBar
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            disabled={isSessionRunning}
          />
        </div>

        {/* Right: Controls & Presets (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xl">
            <CardContent className="p-5 space-y-5">
              {/* Event Header info badge */}
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold tracking-wide text-foreground">
                    {eventConfig.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {eventConfig.date}
                </span>
              </div>

              {/* Layout Picker */}
              <LayoutPicker
                currentLayout={layout}
                onSelectLayout={handleSelectLayout}
                disabled={isSessionRunning}
              />

              {/* Theme Picker */}
              <ThemePicker
                currentTheme={theme}
                onSelectTheme={handleSelectTheme}
                disabled={isSessionRunning}
              />

              {/* Shot Track (thumbnails of poses) */}
              <ShotTrack
                totalPoses={requiredPoses}
                currentPoseIndex={currentPoseIndex}
                isSessionRunning={isSessionRunning}
                thumbnails={thumbnails}
              />

              {/* Primary Actions */}
              <div className="pt-2 space-y-2">
                <Button
                  size="lg"
                  disabled={!cameraActive || isSessionRunning}
                  onClick={handleStartCapture}
                  className="w-full h-14 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm sm:text-base shadow-xl shadow-black/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-zinc-200 gap-2.5 disabled:opacity-50"
                >
                  <Camera className="h-5 w-5 stroke-[2]" />
                  <span>
                    {isSessionRunning
                      ? `Mengambil Pose #${currentPoseIndex + 1}...`
                      : 'Mulai Ambil Foto (3s Countdown)'}
                  </span>
                </Button>

                {thumbnails.length > 0 && !isSessionRunning && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResultModal(true)}
                      className="border-border/80 gap-1.5 text-xs text-foreground hover:bg-muted/50"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Lihat Hasil Strip
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetSession}
                      className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset Sesi
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
      />
    </div>
  )
}
