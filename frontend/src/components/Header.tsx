import React from 'react'
import { Camera, Image as ImageIcon, Settings, MonitorPlay } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  activeTab: 'booth' | 'dashboard'
  onTabChange: (tab: 'booth' | 'dashboard') => void
  onOpenSettings: () => void
  onOpenSplash?: () => void
  eventTitle?: string
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenSplash,
  eventTitle,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/60 text-zinc-100 shadow-sm">
            <Camera className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-foreground text-sm sm:text-base">
                IT Palugada
              </span>
              <Badge variant="outline" className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase border-border/80 px-1.5 py-0">
                STUDIO 01
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {eventTitle || 'Event Photobooth Station'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
            <Button
              variant={activeTab === 'booth' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('booth')}
              className={`h-8 gap-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'booth'
                  ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Booth</span>
            </Button>
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('dashboard')}
              className={`h-8 gap-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Gallery</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 gap-1.5 text-xs border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          {onOpenSplash && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSplash}
              title="Layar Standby Kiosk"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              <MonitorPlay className="h-3.5 w-3.5 text-zinc-400" />
              <span>Standby</span>
            </Button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE STATION</span>
          </div>
        </div>
      </div>
    </header>
  )
}
