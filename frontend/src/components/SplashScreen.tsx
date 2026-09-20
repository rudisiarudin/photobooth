import React, { useState } from 'react'
import { Camera, ChevronRight, Play } from 'lucide-react'
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900/90 border border-zinc-700/70 text-zinc-100 shadow-lg backdrop-blur-md">
            <Camera className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                IT Palugada
              </h2>
              <span className="rounded border border-zinc-700/80 bg-zinc-900/80 px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase text-zinc-300">
                STUDIO 01
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono tracking-tight">SELF-PORTRAIT PHOTO STATION</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3.5 py-1 backdrop-blur-md text-xs font-medium text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] tracking-wider uppercase">READY FOR SNAP</span>
        </div>
      </div>

      {/* Center Prompt / CTA */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg space-y-6 animate-fade-in">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 uppercase backdrop-blur-sm">
            <span>MEMORIES IN 4-CUTS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-2xl">
            SENTUH LAYAR <br />
            <span className="text-zinc-200">
              UNTUK MEMULAI
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed drop-shadow">
            Abadikan momen terbaik Anda dengan photostrip estetik, filter analog, dan cetak resolusi tinggi.
          </p>
        </div>

        {/* Tactile Studio Shutter Button */}
        <div className="pt-2">
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              handleStart()
            }}
            className="h-14 px-8 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-sm sm:text-base shadow-2xl hover:scale-105 active:scale-95 transition-all gap-3 border border-white/40 ring-4 ring-white/10 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Mulai Foto Sekarang</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="relative z-10 w-full p-6 text-center text-xs text-zinc-400">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-1.5 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>TAP ANYWHERE ON SCREEN TO ENTER BOOTH</span>
        </div>
      </div>
    </div>
  )
}
