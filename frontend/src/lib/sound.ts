/**
 * Photobooth Sound Effects using Web Audio API
 * - Zero external assets, works 100% offline
 * - Low-latency synthesized sound design for countdown and shutter snap
 */
class PhotoboothAudio {
  private ctx: AudioContext | null = null

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }

    return this.ctx
  }

  /**
   * Countdown beeps for 3, 2, 1
   * Pitch rises slightly on each second to build anticipation
   */
  playCountdownBeep(count: number) {
    try {
      const ctx = this.initContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // 3 -> 659Hz (E5), 2 -> 880Hz (A5), 1 -> 1175Hz (D6)
      const freqs: Record<number, number> = { 3: 659.25, 2: 880.0, 1: 1174.66 }
      const freq = freqs[count] || 880.0

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // Smooth attack and decay envelope
      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.18)
    } catch (e) {
      console.warn('Audio playback error:', e)
    }
  }

  /**
   * Realistic camera shutter snap sound
   * Uses white noise burst for mechanical curtain + resonant thud
   */
  playShutterSound() {
    try {
      const ctx = this.initContext()
      if (!ctx) return

      const now = ctx.currentTime

      // 1. Shutter noise burst (the mechanical slap)
      const bufferSize = Math.floor(ctx.sampleRate * 0.06)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015))
      }

      const noiseSource = ctx.createBufferSource()
      noiseSource.buffer = buffer

      const bandpass = ctx.createBiquadFilter()
      bandpass.type = 'bandpass'
      bandpass.frequency.setValueAtTime(2200, now)
      bandpass.Q.setValueAtTime(1.5, now)

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.45, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

      noiseSource.connect(bandpass)
      bandpass.connect(noiseGain)
      noiseGain.connect(ctx.destination)

      noiseSource.start(now)

      // 2. Mechanical body snap (low-mid resonance click 25ms later)
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(260, now + 0.025)
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12)

      oscGain.gain.setValueAtTime(0.35, now + 0.025)
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

      osc.connect(oscGain)
      oscGain.connect(ctx.destination)

      osc.start(now + 0.025)
      osc.stop(now + 0.12)
    } catch (e) {
      console.warn('Shutter sound error:', e)
    }
  }
}

export const soundEffects = new PhotoboothAudio()
