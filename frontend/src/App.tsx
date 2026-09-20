import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { PhotoboothPage } from '@/pages/PhotoboothPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SplashScreen } from '@/components/SplashScreen'

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'booth' | 'dashboard'>('booth')
  const [openSettings, setOpenSettings] = useState<boolean>(false)

  // Ensure dark class is active on root
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Fullscreen Video Splash Screen */}
      {showSplash && (
        <SplashScreen onEnter={() => setShowSplash(false)} />
      )}

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setOpenSettings(true)}
        onOpenSplash={() => setShowSplash(true)}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'booth' ? (
          <PhotoboothPage
            onOpenSettings={openSettings}
            setOpenSettings={setOpenSettings}
          />
        ) : (
          <DashboardPage />
        )}
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IT Palugada Photobooth © {new Date().getFullYear()} — Event Station</span>
          <span className="text-[11px] text-zinc-500">Built with React + Vite + Tailwind + shadcn/ui</span>
        </div>
      </footer>
    </div>
  )
}

export default App
