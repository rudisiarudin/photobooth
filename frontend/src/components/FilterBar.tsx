import React from 'react'
import type { FilterKey } from '@/lib/render'
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

const FILTER_ITEMS: { key: FilterKey; label: string; icon: React.ReactNode; cssFilter: string }[] = [
  { key: 'normal',    label: 'Natural',       icon: <Image className="h-3.5 w-3.5" />,    cssFilter: 'none' },
  { key: 'bw',        label: 'B&W',           icon: <Sun className="h-3.5 w-3.5" />,      cssFilter: 'grayscale(100%) contrast(115%)' },
  { key: 'noir',      label: 'Noir',          icon: <Film className="h-3.5 w-3.5" />,      cssFilter: 'grayscale(100%) contrast(145%) brightness(85%)' },
  { key: 'vintage',   label: 'Vintage',       icon: <Flame className="h-3.5 w-3.5" />,    cssFilter: 'sepia(50%) contrast(95%) brightness(105%)' },
  { key: 'kodak',     label: 'Kodak',         icon: <Aperture className="h-3.5 w-3.5" />, cssFilter: 'sepia(25%) contrast(110%) saturate(120%)' },
  { key: 'fuji',      label: 'Fuji',          icon: <Sliders className="h-3.5 w-3.5" />,  cssFilter: 'contrast(105%) saturate(90%) hue-rotate(-5deg)' },
  { key: 'cinematic', label: 'Cinematic',     icon: <Palette className="h-3.5 w-3.5" />,  cssFilter: 'contrast(115%) saturate(115%) hue-rotate(10deg)' },
  { key: 'glow',      label: 'Glow',          icon: <Sparkles className="h-3.5 w-3.5" />, cssFilter: 'brightness(112%) contrast(104%) saturate(110%)' },
  { key: 'pastel',    label: 'Pastel',        icon: <CloudSun className="h-3.5 w-3.5" />, cssFilter: 'brightness(118%) contrast(95%) saturate(105%)' },
  { key: 'cyber',     label: 'Cyber',         icon: <Zap className="h-3.5 w-3.5" />,      cssFilter: 'contrast(125%) saturate(135%) hue-rotate(280deg)' },
  { key: 'lomo',      label: 'Lomo',          icon: <Circle className="h-3.5 w-3.5" />,   cssFilter: 'contrast(150%) saturate(110%) brightness(90%)' },
  { key: 'warm',      label: 'Golden',        icon: <Sunrise className="h-3.5 w-3.5" />,  cssFilter: 'sepia(35%) saturate(130%) brightness(108%) hue-rotate(-15deg)' },
  { key: 'cold',      label: 'Arctic',        icon: <Snowflake className="h-3.5 w-3.5" />,cssFilter: 'saturate(80%) brightness(105%) hue-rotate(195deg)' },
  { key: 'haze',      label: 'Haze',          icon: <Wind className="h-3.5 w-3.5" />,     cssFilter: 'brightness(115%) contrast(88%) saturate(75%)' },
  { key: 'vivid',     label: 'Vivid',         icon: <Contrast className="h-3.5 w-3.5" />, cssFilter: 'saturate(180%) contrast(110%) brightness(103%)' },
]

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onSelectFilter,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          Camera Filter
        </span>
        <span className="text-[10px] text-muted-foreground">
          {FILTER_ITEMS.find(f => f.key === activeFilter)?.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_ITEMS.map((item) => {
          const isSelected = activeFilter === item.key
          return (
            <button
              key={item.key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectFilter(item.key)}
              title={item.label}
              className={`group flex-shrink-0 flex flex-col items-center gap-1 rounded-xl border px-2.5 py-2 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-white/40 bg-zinc-100 text-zinc-950 shadow-md scale-105'
                  : 'border-border/40 bg-muted/20 text-zinc-400 hover:border-border/80 hover:bg-muted/40 hover:text-zinc-200'
              } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <div className={`transition-transform group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap leading-none">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
