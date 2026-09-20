import React from 'react'
import { type ThemeKey, THEMES } from '@/lib/render'

interface ThemePickerProps {
  currentTheme: ThemeKey
  onSelectTheme: (theme: ThemeKey) => void
  disabled?: boolean
}

const ALL_THEME_KEYS: ThemeKey[] = [
  'dark', 'cream', 'pink', 'white', 'lavender',
  'sage', 'terracotta', 'sky', 'cyber', 'midnight',
]

export const ThemePicker: React.FC<ThemePickerProps> = ({
  currentTheme,
  onSelectTheme,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
          Frame Theme
        </label>
        <span className="text-[10px] text-muted-foreground">
          {THEMES[currentTheme]?.name}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {ALL_THEME_KEYS.map((key) => {
          const t = THEMES[key]
          const isSelected = currentTheme === key
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTheme(key)}
              title={t.name}
              className={`group flex flex-col items-center gap-1 rounded-lg border p-1.5 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-white/50 ring-2 ring-white/20 scale-105 shadow-md'
                  : 'border-border/40 hover:border-border/80 hover:scale-102'
              } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <div
                className="h-5 w-full rounded-sm shadow-inner border transition-all group-hover:scale-105"
                style={{
                  backgroundColor: t.bg,
                  borderColor: t.border,
                  boxShadow: isSelected ? `0 0 0 1px ${t.border}` : undefined,
                }}
              />
              <span className={`text-[9px] font-medium leading-none line-clamp-1 w-full text-center ${
                isSelected ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {t.name.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
