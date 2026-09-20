import React from 'react'
import { type ThemeKey, THEMES } from '@/lib/render'

interface ThemePickerProps {
  currentTheme: ThemeKey
  onSelectTheme: (theme: ThemeKey) => void
  disabled?: boolean
}

const THEME_OPTIONS: { key: ThemeKey; name: string; previewBg: string; previewBorder: string }[] = [
  { key: 'dark', name: 'Noir Dark', previewBg: THEMES.dark.bg, previewBorder: '#3f3f46' },
  { key: 'cream', name: 'Warm Cream', previewBg: THEMES.cream.bg, previewBorder: THEMES.cream.border },
  { key: 'pink', name: 'Pastel Rose', previewBg: THEMES.pink.bg, previewBorder: THEMES.pink.border },
  { key: 'white', name: 'Minimal White', previewBg: THEMES.white.bg, previewBorder: THEMES.white.border },
]

export const ThemePicker: React.FC<ThemePickerProps> = ({
  currentTheme,
  onSelectTheme,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Frame Theme
        </label>
        <span className="text-[10px] text-muted-foreground capitalize">
          {THEME_OPTIONS.find((t) => t.key === currentTheme)?.name}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {THEME_OPTIONS.map((item) => {
          const isSelected = currentTheme === item.key
          return (
            <button
              key={item.key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTheme(item.key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                  : 'border-border/60 hover:border-border hover:bg-muted/30'
              } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div
                className="h-6 w-full rounded-md shadow-inner border transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: item.previewBg,
                  borderColor: item.previewBorder,
                }}
              />
              <span className="text-[10px] font-medium text-foreground line-clamp-1">
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
