import React from 'react'
import { Camera, RotateCcw } from 'lucide-react'

interface ShotTrackProps {
  totalPoses: number
  currentPoseIndex: number
  isSessionRunning: boolean
  thumbnails: string[]
  retakingPoseIndex?: number | null
  onRetake?: (index: number) => void
}

export const ShotTrack: React.FC<ShotTrackProps> = ({
  totalPoses,
  currentPoseIndex,
  isSessionRunning,
  thumbnails,
  retakingPoseIndex = null,
  onRetake,
}) => {
  const slots = Array.from({ length: totalPoses }, (_, idx) => idx)
  const canRetake = !isSessionRunning && retakingPoseIndex === null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
          Pose Sequence
        </label>
        <span className="text-[10px] text-muted-foreground">
          {thumbnails.length} / {totalPoses} Terambil
        </span>
      </div>

      <div className={`grid gap-1.5 ${totalPoses <= 4 ? 'grid-cols-4' : totalPoses <= 6 ? 'grid-cols-6' : 'grid-cols-4'}`}>
        {slots.map((idx) => {
          const hasPhoto = !!thumbnails[idx]
          const isCurrent = isSessionRunning && currentPoseIndex === idx
          const isRetaking = retakingPoseIndex === idx

          return (
            <div
              key={idx}
              className={`relative aspect-[3/4] overflow-hidden rounded-lg border transition-all flex flex-col items-center justify-center group ${
                hasPhoto
                  ? 'border-emerald-500/40 bg-black shadow-sm'
                  : isCurrent || isRetaking
                  ? 'border-primary ring-2 ring-primary/50 bg-primary/10 animate-pulse'
                  : 'border-border/50 bg-muted/20 text-muted-foreground'
              }`}
            >
              {hasPhoto ? (
                <>
                  <img
                    src={thumbnails[idx]}
                    alt={`Pose ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {/* Retake hover overlay */}
                  {canRetake && onRetake && (
                    <button
                      type="button"
                      onClick={() => onRetake(idx)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4 text-white" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-wide">Retake</span>
                    </button>
                  )}
                  {/* Retaking state overlay */}
                  {isRetaking && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 backdrop-blur-sm">
                      <RotateCcw className="h-4 w-4 text-primary animate-spin" />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wide">Ulang...</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Camera
                    className={`h-4 w-4 ${
                      isCurrent ? 'text-primary animate-bounce' : 'text-muted-foreground/60'
                    }`}
                  />
                  <span className="text-[9px] font-semibold">#{idx + 1}</span>
                </div>
              )}

              {/* Status pill badge */}
              {!isRetaking && (
                <div className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.5 text-[8px] font-medium text-white/90 backdrop-blur-sm">
                  #{idx + 1}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {canRetake && onRetake && thumbnails.length > 0 && (
        <p className="text-[9px] text-muted-foreground text-center pt-0.5">
          Hover foto untuk retake ulang
        </p>
      )}
    </div>
  )
}
