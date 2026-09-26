import React from 'react'
import type { FilterKey } from '@/lib/render'
import { FILTERS, FILTER_LABELS, FILTER_SMOOTHING } from '@/lib/render'
import {
  Sparkles,
  Sun,
  Flame,
  Image,
  Film,
  Aperture,
  Sliders,
  Palette,
  CloudSun,
  Zap,
  Circle,
  Sunrise,
  Snowflake,
  Wind,
  Contrast,
} from 'lucide-react'

interface FilterBarProps {
  activeFilter: FilterKey
  onSelectFilter: (filter: FilterKey) => void
  disabled?: boolean
}

const FILTER_ICONS: Record<FilterKey, React.ReactNode> = {
  normal:    <Image className="h-3.5 w-3.5" />,
  bw:        <Sun className="h-3.5 w-3.5" />,
  noir:      <Film className="h-3.5 w-3.5" />,
  vintage:   <Flame className="h-3.5 w-3.5" />,
  kodak:     <Aperture className="h-3.5 w-3.5" />,
  fuji:      <Sliders className="h-3.5 w-3.5" />,
  cinematic: <Palette className="h-3.5 w-3.5" />,
  glow:      <Sparkles className="h-3.5 w-3.5" />,
  pastel:    <CloudSun className="h-3.5 w-3.5" />,
  cyber:     <Zap className="h-3.5 w-3.5" />,
  lomo:      <Circle className="h-3.5 w-3.5" />,
  warm:      <Sunrise className="h-3.5 w-3.5" />,
  cold:      <Snowflake className="h-3.5 w-3.5" />,
  haze:      <Wind className="h-3.5 w-3.5" />,
  vivid:     <Contrast className="h-3.5 w-3.5" />,
}

const FILTER_KEYS = Object.keys(FILTERS) as FilterKey[]

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onSelectFilter,
  disabled = false,
}) => {
  const smoothing = FILTER_SMOOTHING[activeFilter]
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          Camera Filter
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {smoothing > 0 && (
            <span className="rounded-full bg-primary/15 border border-primary/25 px-1.5 py-px text-primary font-mono">
              SMOOTH {Math.round(smoothing * 100)}%
            </span>
          )}
          {FILTER_LABELS[activeFilter]}
        </span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_KEYS.map((key) => {
          const item = FILTERS[key]
          const isSelected = activeFilter === key
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectFilter(key)}
              title={item.label}
              className={`group relative flex-shrink-0 flex flex-col items-center gap-1 rounded-xl border px-2.5 py-2 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-white/40 bg-zinc-100 text-zinc-950 shadow-md scale-105'
                  : 'border-border/40 bg-muted/20 text-zinc-400 hover:border-border/80 hover:bg-muted/40 hover:text-zinc-200'
              } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {/* Colour swatch: a hint of the look's dominant tint. */}
              {item.tint && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-xl opacity-[0.14] group-hover:opacity-[0.2] transition-opacity"
                  style={{ backgroundColor: item.tint }}
                />
              )}
              <div className={`relative transition-transform group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`}>
                {FILTER_ICONS[key]}
              </div>
              <span className="relative text-[10px] font-medium whitespace-nowrap leading-none">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
