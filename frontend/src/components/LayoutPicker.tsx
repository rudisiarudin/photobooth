import React from 'react'
import { type LayoutKey, LAYOUT_INFO } from '@/lib/render'

interface LayoutPickerProps {
  currentLayout: LayoutKey
  onSelectLayout: (layout: LayoutKey) => void
  disabled?: boolean
}

// Minimal SVG-like icons for each layout
const LayoutIcon: React.FC<{ layoutKey: LayoutKey; isSelected: boolean }> = ({ layoutKey, isSelected }) => {
  const opacity = isSelected ? 'opacity-80' : 'opacity-40'

  switch (layoutKey) {
    case 'strip2':
      return (
        <div className="flex flex-col gap-[2px] w-4 h-7 p-[2px] rounded border border-current">
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
        </div>
      )
    case 'strip3':
      return (
        <div className="flex flex-col gap-[2px] w-4 h-7 p-[2px] rounded border border-current">
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
        </div>
      )
    case 'strip4':
      return (
        <div className="flex flex-col gap-[2px] w-4 h-8 p-[2px] rounded border border-current">
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
          <div className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
        </div>
      )
    case 'strip6':
      return (
        <div className="flex flex-col gap-[1.5px] w-4 h-9 p-[2px] rounded border border-current">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`bg-current ${opacity} flex-1 rounded-[1px]`} />
          ))}
        </div>
      )
    case 'grid4':
      return (
        <div className="grid grid-cols-2 gap-[2px] w-7 h-7 p-[2px] rounded border border-current">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`bg-current ${opacity} rounded-[1px]`} />
          ))}
        </div>
      )
    case 'grid6':
      return (
        <div className="grid grid-cols-2 gap-[2px] w-7 h-9 p-[2px] rounded border border-current">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`bg-current ${opacity} rounded-[1px]`} />
          ))}
        </div>
      )
    case 'polaroid':
      return (
        <div className="flex flex-col gap-[2px] w-7 h-8 p-[2px] rounded border border-current">
          <div className={`bg-current ${opacity} rounded-[1px] flex-1`} />
          <div className={`bg-current opacity-20 rounded-[1px] h-2`} />
        </div>
      )
    default:
      return null
  }
}

const ALL_LAYOUTS: LayoutKey[] = ['strip4', 'strip3', 'strip2', 'strip6', 'grid4', 'grid6', 'polaroid']

export const LayoutPicker: React.FC<LayoutPickerProps> = ({
  currentLayout,
  onSelectLayout,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
          Format Layout
        </label>
        <span className="text-[10px] text-muted-foreground">
          {LAYOUT_INFO[currentLayout].poses} Foto · {LAYOUT_INFO[currentLayout].size}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {ALL_LAYOUTS.map((key) => {
          const info = LAYOUT_INFO[key]
          const isSelected = currentLayout === key
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectLayout(key)}
              className={`group flex flex-col items-center justify-center rounded-lg border px-1.5 py-2 text-center transition-all cursor-pointer gap-1.5 ${
                isSelected
                  ? 'border-white/40 bg-white/10 text-white shadow-sm ring-1 ring-white/20 scale-105'
                  : 'border-border/40 bg-muted/10 text-muted-foreground hover:border-border/70 hover:bg-muted/30 hover:text-foreground'
              } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <div className="flex items-center justify-center h-9">
                <LayoutIcon layoutKey={key} isSelected={isSelected} />
              </div>
              <div>
                <span className="text-[10px] font-semibold leading-none block">{info.label}</span>
                <span className="text-[9px] text-muted-foreground leading-none">{info.poses}×</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
