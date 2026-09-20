import { useState, useRef, useEffect, useCallback } from 'react'
import { type FilterKey, FILTERS } from '@/lib/render'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isMirrored, setIsMirrored] = useState<boolean>(true)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('normal')
  const [isFlashing, setIsFlashing] = useState<boolean>(false)

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user',
        },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err: unknown) {
      console.error('Camera access error:', err)
      const msg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses'
      setCameraError(msg)
      setCameraActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [stream])

  const triggerFlash = useCallback(() => {
    setIsFlashing(true)
    setTimeout(() => {
      setIsFlashing(false)
    }, 250)
  }, [])

  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return null

    const canvas = document.createElement('canvas')
    const vw = video.videoWidth || 1280
    const vh = video.videoHeight || 720
    canvas.width = vw
    canvas.height = vh

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Apply mirror if enabled
    if (isMirrored) {
      ctx.translate(vw, 0)
      ctx.scale(-1, 1)
    }

    // Apply active filter to the captured frame canvas
    const filterCSS = FILTERS[activeFilter]
    if (filterCSS && filterCSS !== 'none') {
      ctx.filter = filterCSS
    }

    ctx.drawImage(video, 0, 0, vw, vh)
    return canvas
  }, [isMirrored, activeFilter])

  // Auto-start camera on mount
  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return {
    videoRef,
    cameraActive,
    cameraError,
    isMirrored,
    setIsMirrored,
    activeFilter,
    setActiveFilter,
    isFlashing,
    triggerFlash,
    startCamera,
    stopCamera,
    captureFrame,
  }
}
