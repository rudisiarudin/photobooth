import React from 'react'
import { Camera, Image as ImageIcon, Settings, Sparkles, MonitorPlay } from 'lucide-react'
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
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-500 text-white shadow-md shadow-rose-500/20">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-foreground">
                IT Palugada
              </span>
              <Badge variant="secondary" className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Photobooth
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {eventTitle || 'Modern Event Photo Experience'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
            <Button
              variant={activeTab === 'booth' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('booth')}
              className="gap-1.5 text-xs font-medium"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Booth</span>
            </Button>
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('dashboard')}
              className="gap-1.5 text-xs font-medium"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Gallery</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="gap-1.5 text-xs border-dashed"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          {onOpenSplash && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSplash}
              title="Tampilkan Layar Splash Standby Kiosk"
              className="gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 hidden sm:flex"
            >
              <MonitorPlay className="h-3.5 w-3.5 text-rose-400" />
              <span>Standby</span>
            </Button>
          )}

          <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
            <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
            Live Station
          </Badge>
        </div>
      </div>
    </header>
  )
}
