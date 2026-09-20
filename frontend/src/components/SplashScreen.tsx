import React, { useState } from 'react'
import { Camera } from 'lucide-react'

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
      {/* Background Video - Fully clear and unobstructed */}
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center bg-black">
        <video
          src="/A_sleek_second_mobile_applic.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover sm:object-contain"
        />
      </div>

      {/* Minimal Top Header - discreetly placed */}
      <div className="relative z-10 w-full p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
          <Camera className="h-4 w-4 text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            IT Palugada
          </span>
          <span className="text-[10px] font-mono text-zinc-300">
            • STUDIO 01
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-1.5 backdrop-blur-md border border-white/10 text-xs font-medium text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] tracking-wider uppercase">KIOSK ACTIVE</span>
        </div>
      </div>

      {/* Empty Center Space - Do NOT cover the video text / animation! */}
      <div className="flex-1 w-full" />

      {/* Minimal Bottom Floating Prompt - Placed at bottom edge */}
      <div className="relative z-10 w-full p-6 pb-8 text-center flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-black/70 hover:bg-black/90 px-6 py-3 backdrop-blur-md border border-white/25 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            Sentuh Layar Untuk Mulai Foto
          </span>
          <span className="hidden sm:inline text-xs text-zinc-400 font-mono">
            • Tap Anywhere to Start
          </span>
        </div>
      </div>
    </div>
  )
}
