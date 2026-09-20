import React, { useState } from 'react'
import { Camera, Sparkles, ChevronRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SplashScreenProps {
  onEnter: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isFadingOut, setIsFadingOut] = useState(false)

  const handleStart = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      onEnter()
    }, 500)
  }

  return (
    <div
      onClick={handleStart}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white cursor-pointer select-none overflow-hidden transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          src="/A_sleek_second_mobile_applic.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-85"
        />
        {/* Subtle dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
      </div>

      {/* Top Header Branding */}
      <div className="relative z-10 w-full p-6 sm:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/30 backdrop-blur-md">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                IT Palugada
              </h2>
              <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-zinc-200">
                Photobooth
              </span>
            </div>
            <p className="text-xs text-zinc-300">Modern Event Station Experience</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-md text-xs font-medium text-white/90">
          <Sparkles className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
          <span>Ready to Snap</span>
        </div>
      </div>

      {/* Center Prompt / CTA */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg space-y-6 animate-fade-in">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-rose-400 drop-shadow">
            Capture Your Best Moment
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xl">
            Sentuh Layar <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Untuk Mulai Foto
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto drop-shadow">
            Ciptakan photostrip estetik dengan berbagai filter dan tema bingkai eksklusif.
          </p>
        </div>

        {/* Glowing Touch Button */}
        <div className="pt-2">
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              handleStart()
            }}
            className="h-14 px-8 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 text-white font-bold text-base shadow-2xl shadow-rose-500/40 hover:scale-105 transition-all gap-3 border border-white/20 cursor-pointer"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Mulai Sekarang</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="relative z-10 w-full p-6 text-center text-xs text-zinc-400">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-1.5 backdrop-blur-md border border-white/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Tap anywhere on screen to enter booth</span>
        </div>
      </div>
    </div>
  )
}
