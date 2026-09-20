import { useState, useCallback, useRef } from 'react'
import {
  type LayoutKey,
  type ThemeKey,
  type EventConfig,
  LAYOUT_INFO,
  renderPhotostripByLayout,
} from '@/lib/render'

export interface StickerItem {
  id: string
  emoji: string
  x: number // percentage 0 - 100
  y: number // percentage 0 - 100
  scale: number
  rotation: number
}

// Global declaration for gifshot
declare global {
  interface Window {
    gifshot?: {
      createGIF: (
        options: {
          images?: string[]
          interval?: number
          gifWidth?: number
          gifHeight?: number
          numWorkers?: number
        },
        callback: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void
      ) => void
    }
  }
}

export function usePhotobooth() {
  const [layout, setLayout] = useState<LayoutKey>('strip4')
  const [theme, setTheme] = useState<ThemeKey>('dark')
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    title: 'IT PALUGADA',
    subtitle: 'PHOTOBOOTH MEMORY',
    date: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  })

  const [frames, setFrames] = useState<HTMLCanvasElement[]>([])
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [isSessionRunning, setIsSessionRunning] = useState<boolean>(false)
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null)
  const [currentPoseIndex, setCurrentPoseIndex] = useState<number>(0)
  const [retakingPoseIndex, setRetakingPoseIndex] = useState<number | null>(null)

  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null)
  const [resultGifUrl, setResultGifUrl] = useState<string | null>(null)
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false)

  const [showResultModal, setShowResultModal] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [savedInfo, setSavedInfo] = useState<{ name: string; url: string } | null>(null)
  const [stickers, setStickers] = useState<StickerItem[]>([])

  const cancelSessionRef = useRef<boolean>(false)

  const requiredPoses = LAYOUT_INFO[layout].poses

  const resetSession = useCallback(() => {
    cancelSessionRef.current = true
    setIsSessionRunning(false)
    setCountdownNumber(null)
    setCurrentPoseIndex(0)
    setRetakingPoseIndex(null)
    setFrames([])
    setThumbnails([])
    setResultDataUrl(null)
    setResultGifUrl(null)
    setShowResultModal(false)
    setSavedInfo(null)
    setStickers([])
  }, [])

  // Generate animated GIF (Boomerang effect) using gifshot
  const generateAnimatedGif = useCallback((canvasFrames: HTMLCanvasElement[]) => {
    if (!canvasFrames || canvasFrames.length === 0) return
    setIsGeneratingGif(true)

    try {
      // Build forward & backward images for a smooth boomerang loop
      const forwardThumbs = canvasFrames.map((canvas) => canvas.toDataURL('image/jpeg', 0.85))
      const backwardThumbs = [...forwardThumbs].reverse().slice(1, -1)
      const loopImages = [...forwardThumbs, ...backwardThumbs]

      if (window.gifshot && typeof window.gifshot.createGIF === 'function') {
        window.gifshot.createGIF(
          {
            images: loopImages,
            interval: 0.28,
            gifWidth: 480,
            gifHeight: 360,
            numWorkers: 2,
          },
          (obj) => {
            setIsGeneratingGif(false)
            if (!obj.error && obj.image) {
              setResultGifUrl(obj.image)
            } else {
              console.warn('GIF generation error:', obj.errorMsg)
            }
          }
        )
      } else {
        console.warn('gifshot library not loaded, skipping GIF')
        setIsGeneratingGif(false)
      }
    } catch (err) {
      console.warn('Failed to build GIF:', err)
      setIsGeneratingGif(false)
    }
  }, [])

  const startSession = useCallback(
    async (
      captureFn: () => HTMLCanvasElement | null,
      flashFn: () => void
    ) => {
      cancelSessionRef.current = false
      setIsSessionRunning(true)
      setFrames([])
      setThumbnails([])
      setSavedInfo(null)
      setResultDataUrl(null)
      setResultGifUrl(null)

      const capturedList: HTMLCanvasElement[] = []
      const thumbsList: string[] = []

      for (let i = 0; i < requiredPoses; i++) {
        if (cancelSessionRef.current) break
        setCurrentPoseIndex(i)

        // 3-second countdown
        for (let cd = 3; cd >= 1; cd--) {
          if (cancelSessionRef.current) break
          setCountdownNumber(cd)
          await new Promise((r) => setTimeout(r, 1000))
        }

        if (cancelSessionRef.current) break

        // Flash and capture
        setCountdownNumber(null)
        flashFn()
        const frame = captureFn()
        if (frame) {
          capturedList.push(frame)
          thumbsList.push(frame.toDataURL('image/jpeg', 0.8))
          setFrames([...capturedList])
          setThumbnails([...thumbsList])
        }

        // Delay before next pose
        if (i < requiredPoses - 1) {
          await new Promise((r) => setTimeout(r, 1200))
        }
      }

      if (cancelSessionRef.current) {
        setIsSessionRunning(false)
        return
      }

      setIsSessionRunning(false)
      setCountdownNumber(null)

      // Auto-render strip & GIF
      if (capturedList.length > 0) {
        const finalUrl = renderPhotostripByLayout(capturedList, layout, theme, eventConfig)
        setResultDataUrl(finalUrl)
        setShowResultModal(true)

        // Generate animated GIF
        generateAnimatedGif(capturedList)
      }
    },
    [requiredPoses, layout, theme, eventConfig, generateAnimatedGif]
  )

  // Retake a single specific pose
  const retakeSinglePose = useCallback(
    async (
      poseIndex: number,
      captureFn: () => HTMLCanvasElement | null,
      flashFn: () => void
    ) => {
      if (isSessionRunning) return
      setRetakingPoseIndex(poseIndex)
      setCurrentPoseIndex(poseIndex)

      // 3-second countdown
      for (let cd = 3; cd >= 1; cd--) {
        setCountdownNumber(cd)
        await new Promise((r) => setTimeout(r, 1000))
      }

      setCountdownNumber(null)
      flashFn()
      const newFrame = captureFn()

      if (newFrame) {
        const updatedFrames = [...frames]
        const updatedThumbs = [...thumbnails]
        updatedFrames[poseIndex] = newFrame
        updatedThumbs[poseIndex] = newFrame.toDataURL('image/jpeg', 0.8)

        setFrames(updatedFrames)
        setThumbnails(updatedThumbs)

        // Re-render strip with updated frames
        const newUrl = renderPhotostripByLayout(updatedFrames, layout, theme, eventConfig)
        setResultDataUrl(newUrl)

        // Re-generate GIF
        generateAnimatedGif(updatedFrames)
      }

      setRetakingPoseIndex(null)
    },
    [isSessionRunning, frames, thumbnails, layout, theme, eventConfig, generateAnimatedGif]
  )

  const regenerateResultWithThemeAndLayout = useCallback(
    (newTheme?: ThemeKey, newLayout?: LayoutKey, currentStickers?: StickerItem[]) => {
      if (frames.length === 0) return
      const t = newTheme || theme
      const l = newLayout || layout
      const st = currentStickers !== undefined ? currentStickers : stickers

      const baseDataUrl = renderPhotostripByLayout(frames, l, t, eventConfig)

      // If there are stickers, draw them onto the image
      if (st.length > 0) {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.drawImage(img, 0, 0)

          st.forEach((s) => {
            ctx.save()
            const posX = (s.x / 100) * canvas.width
            const posY = (s.y / 100) * canvas.height
            ctx.translate(posX, posY)
            ctx.rotate((s.rotation * Math.PI) / 180)
            ctx.font = `${Math.round(48 * s.scale)}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(s.emoji, 0, 0)
            ctx.restore()
          })

          setResultDataUrl(canvas.toDataURL('image/jpeg', 0.95))
        }
        img.src = baseDataUrl
      } else {
        setResultDataUrl(baseDataUrl)
      }
    },
    [frames, theme, layout, eventConfig, stickers]
  )

  const saveToGallery = useCallback(
    async (customDataUrl?: string) => {
      const urlToSave = customDataUrl || resultDataUrl
      if (!urlToSave) return null

      setIsSaving(true)
      try {
        const res = await fetch('/api/captures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: urlToSave }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.capture) {
            setSavedInfo(data.capture)
            return data.capture
          }
        }
      } catch (err) {
        console.warn('Server save unavailable, falling back to local storage:', err)
      } finally {
        setIsSaving(false)
      }

      // Fallback: save to client-side localStorage so it works on static hosts like Vercel
      const filename = `photo-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`
      const fallbackCapture = {
        name: filename,
        url: urlToSave,
        size: Math.round((urlToSave.length * 3) / 4),
        createdAt: new Date().toISOString(),
      }
      try {
        const stored = JSON.parse(localStorage.getItem('itpalugada_captures') || '[]')
        localStorage.setItem(
          'itpalugada_captures',
          JSON.stringify([fallbackCapture, ...stored.slice(0, 49)])
        )
      } catch (e) {
        console.warn('LocalStorage save error:', e)
      }
      setSavedInfo(fallbackCapture)
      return fallbackCapture
    },
    [resultDataUrl]
  )

  return {
    layout,
    setLayout,
    theme,
    setTheme,
    eventConfig,
    setEventConfig,
    frames,
    thumbnails,
    isSessionRunning,
    countdownNumber,
    currentPoseIndex,
    retakingPoseIndex,
    requiredPoses,
    resultDataUrl,
    setResultDataUrl,
    resultGifUrl,
    isGeneratingGif,
    showResultModal,
    setShowResultModal,
    isSaving,
    savedInfo,
    stickers,
    setStickers,
    startSession,
    retakeSinglePose,
    resetSession,
    regenerateResultWithThemeAndLayout,
    saveToGallery,
  }
}
