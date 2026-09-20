import React from 'react'
import { type LayoutKey, LAYOUT_INFO } from '@/lib/render'
import { Badge } from '@/components/ui/badge'

interface LayoutPickerProps {
  currentLayout: LayoutKey
  onSelectLayout: (layout: LayoutKey) => void
  disabled?: boolean
}

export const LayoutPicker: React.FC<LayoutPickerProps> = ({
  currentLayout,
  onSelectLayout,
  disabled = false,
}) => {
  const layouts: { key: LayoutKey; title: string; subtitle: string; iconShape: string }[] = [
    {
      key: 'strip4',
      title: LAYOUT_INFO.strip4.label,
      subtitle: `${LAYOUT_INFO.strip4.poses} Poses • ${LAYOUT_INFO.strip4.size}`,
      iconShape: 'strip',
    },
    {
      key: 'strip3',
      title: LAYOUT_INFO.strip3.label,
      subtitle: `${LAYOUT_INFO.strip3.poses} Poses • ${LAYOUT_INFO.strip3.size}`,
      iconShape: 'strip3',
    },
    {
      key: 'grid4',
      title: LAYOUT_INFO.grid4.label,
      subtitle: `${LAYOUT_INFO.grid4.poses} Poses • ${LAYOUT_INFO.grid4.size}`,
      iconShape: 'grid',
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Format Layout
        </label>
        <Badge variant="outline" className="text-[10px] font-normal">
          {LAYOUT_INFO[currentLayout].poses} Foto
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {layouts.map((item) => {
          const isSelected = currentLayout === item.key
          return (
            <button
              key={item.key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectLayout(item.key)}
              className={`group flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
                  : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground'
              } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {/* Minimal layout icon representation */}
              <div className="mb-2 flex items-center justify-center h-8">
                {item.iconShape === 'grid' ? (
                  <div className="grid grid-cols-2 gap-0.5 w-6 h-6 p-0.5 rounded border border-current">
                    <div className="bg-current/40 rounded-[1px]" />
                    <div className="bg-current/40 rounded-[1px]" />
                    <div className="bg-current/40 rounded-[1px]" />
                    <div className="bg-current/40 rounded-[1px]" />
                  </div>
                ) : item.iconShape === 'strip3' ? (
                  <div className="flex flex-col gap-0.5 w-3.5 h-7 p-0.5 rounded border border-current">
                    <div className="bg-current/40 h-1 rounded-[1px]" />
                    <div className="bg-current/40 h-1 rounded-[1px]" />
                    <div className="bg-current/40 h-1 rounded-[1px]" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 w-3.5 h-8 p-0.5 rounded border border-current">
                    <div className="bg-current/40 h-1 rounded-[1px]" />
                    <div className="bg-current/40 h-1 rounded-[1px]" />
                    <div className="bg-current/40 h-1 rounded-[1px]" />
                    <div className="bg-current/40 h-1 rounded-[1px]" />
                  </div>
                )}
              </div>

              <span className="text-xs font-semibold leading-none">{item.title}</span>
              <span className="mt-1 text-[10px] text-muted-foreground leading-tight">
                {item.subtitle}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
