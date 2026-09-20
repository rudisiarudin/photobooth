import React from 'react'
import { Camera } from 'lucide-react'

interface ShotTrackProps {
  totalPoses: number
  currentPoseIndex: number
  isSessionRunning: boolean
  thumbnails: string[]
}

export const ShotTrack: React.FC<ShotTrackProps> = ({
  totalPoses,
  currentPoseIndex,
  isSessionRunning,
  thumbnails,
}) => {
  const slots = Array.from({ length: totalPoses }, (_, idx) => idx)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Pose Sequence
        </label>
        <span className="text-[10px] text-muted-foreground">
          {thumbnails.length} / {totalPoses} Terambil
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slots.map((idx) => {
          const hasPhoto = !!thumbnails[idx]
          const isCurrent = isSessionRunning && currentPoseIndex === idx

          return (
            <div
              key={idx}
              className={`relative aspect-[3/4] overflow-hidden rounded-xl border transition-all flex flex-col items-center justify-center ${
                hasPhoto
                  ? 'border-emerald-500/50 bg-black shadow-sm'
                  : isCurrent
                  ? 'border-primary ring-2 ring-primary/50 bg-primary/10 animate-pulse'
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
              }`}
            >
              {hasPhoto ? (
                <img
                  src={thumbnails[idx]}
                  alt={`Pose ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Camera
                    className={`h-4 w-4 ${
                      isCurrent ? 'text-primary animate-bounce' : 'text-muted-foreground/60'
                    }`}
                  />
                  <span className="text-[10px] font-semibold">#{idx + 1}</span>
                </div>
              )}

              {/* Status pill badge */}
              <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm">
                #{idx + 1}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
