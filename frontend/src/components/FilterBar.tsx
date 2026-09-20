import React from 'react'
import type { FilterKey } from '@/lib/render'
import { Button } from '@/components/ui/button'
import { Sparkles, Sun, Flame, Image } from 'lucide-react'

interface FilterBarProps {
  activeFilter: FilterKey
  onSelectFilter: (filter: FilterKey) => void
  disabled?: boolean
}

const FILTER_ITEMS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  { key: 'normal', label: 'Natural', icon: <Image className="h-3.5 w-3.5" /> },
  { key: 'bw', label: 'Monochrome', icon: <Sun className="h-3.5 w-3.5" /> },
  { key: 'vintage', label: 'Vintage Warm', icon: <Flame className="h-3.5 w-3.5" /> },
  { key: 'glow', label: 'Korean Glow', icon: <Sparkles className="h-3.5 w-3.5" /> },
]

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onSelectFilter,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap pl-1">
        Filter:
      </span>
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50">
        {FILTER_ITEMS.map((item) => {
          const isSelected = activeFilter === item.key
          return (
            <Button
              key={item.key}
              variant={isSelected ? 'default' : 'ghost'}
              size="sm"
              disabled={disabled}
              onClick={() => onSelectFilter(item.key)}
              className={`h-8 gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
