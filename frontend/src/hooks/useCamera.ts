import { useState, useRef, useEffect, useCallback } from 'react'
import { type FilterKey, FILTERS } from '@/lib/render'

export interface VideoDevice {
  deviceId: string
  label: string
  isHdmiCapture: boolean
}

/** Keywords commonly found in HDMI capture card / external USB camera labels */
const EXTERNAL_KEYWORDS = [
  'hdmi',
  'capture',
  'cam link',
  'magewell',
  'elgato',
  'usb video',
  'usb capture',
  'avermedia',
  'blackmagic',
  'razer',
  'live gamer',
  'video input',
  'analog',
  'grabber',
  'uvc',
  'usb camera',
  'usb2.0',
  'usb3.0',
  'fhd',
  'external',
  'sony',
  'cam',
]

function isExternalDevice(label: string): boolean {
  const lower = label.toLowerCase()
  // Exclude typical built-in front/back tablet/phone/laptop internal cameras
  if (
    lower.includes('front') ||
    lower.includes('facing front') ||
    lower.includes('user') ||
    lower.includes('integrated') ||
    lower.includes('built-in') ||
    lower.includes('internal')
  ) {
    return false
  }
  // USB capture cards (including MS2130 / MS2109 'USB3 .0 Video (345f:2130)')
  if (
    lower.includes('usb') ||
    lower.includes('capture') ||
    lower.includes('hdmi') ||
    lower.includes('cam link') ||
    lower.includes('2130') ||
    lower.includes('2109') ||
    lower.includes('external')
  ) {
    return true
  }
  return EXTERNAL_KEYWORDS.some((kw) => lower.includes(kw))
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isMirrored, setIsMirrored] = useState<boolean>(true)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('normal')
  const [isFlashing, setIsFlashing] = useState<boolean>(false)

  // Device enumeration state
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  // IP Stream URL mode (for Android: IP Webcam app stream, e.g. http://ip:8080/video)
  const [ipStreamUrl, setIpStreamUrl] = useState<string>('')
  const [isIpStreamMode, setIsIpStreamMode] = useState<boolean>(false)

  // -----------------------------------------------------------------------
  // Internal: stop current stream
  // -----------------------------------------------------------------------
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {
          // ignore
        }
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // -----------------------------------------------------------------------
  // Internal: open stream with resilient fallback constraints
  // -----------------------------------------------------------------------
  const openStream = useCallback(
    async (deviceId?: string): Promise<boolean> => {
      stopCurrentStream()
      setCameraError(null)
      setCameraActive(false)

      // Try multiple constraint variations:
      // 1. High res 1080p with exact deviceId
      // 2. Ideal deviceId without strict res
      // 3. Fallback generic constraint
      const constraintAttempts: MediaStreamConstraints[] = []

      if (deviceId) {
        constraintAttempts.push({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        constraintAttempts.push({
          video: {
            deviceId: { ideal: deviceId },
          },
          audio: false,
        })
      } else {
        constraintAttempts.push({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        constraintAttempts.push({
          video: true,
          audio: false,
        })
      }

      let lastError: unknown = null
      let acquiredStream: MediaStream | null = null

      for (const constraints of constraintAttempts) {
        try {
          acquiredStream = await navigator.mediaDevices.getUserMedia(constraints)
          if (acquiredStream) break
        } catch (err) {
          lastError = err
          console.warn('[Camera] Constraint attempt failed, trying fallback:', err)
        }
      }

      if (!acquiredStream) {
        console.error('All camera constraint attempts failed:', lastError)
        const msg = lastError instanceof Error ? lastError.message : 'Kamera tidak dapat diakses'
        setCameraError(msg)
        return false
      }

      try {
        streamRef.current = acquiredStream
        if (videoRef.current) {
          videoRef.current.srcObject = acquiredStream
          await videoRef.current.play()
        }
        setCameraActive(true)
        return true
      } catch (playErr) {
        console.error('[Camera] video.play error:', playErr)
        setCameraError('Gagal memutar video feed kamera')
        return false
      }
    },
    [stopCurrentStream]
  )

  // -----------------------------------------------------------------------
  // Enumerate all video input devices (requires granted permission for labels)
  // -----------------------------------------------------------------------
  const refreshDevices = useCallback(async (): Promise<VideoDevice[]> => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const inputs = all
        .filter((d) => d.kind === 'videoinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${idx + 1}`,
          isHdmiCapture: isExternalDevice(d.label),
        }))
      console.log('[Camera] Detected video devices:', inputs)
      setVideoDevices(inputs)
      return inputs
    } catch (err) {
      console.error('[Camera] enumerateDevices failed:', err)
      return []
    }
  }, [])

  // -----------------------------------------------------------------------
  // startCamera — public API
  // -----------------------------------------------------------------------
  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (deviceId) {
        const ok = await openStream(deviceId)
        if (ok) {
          setSelectedDeviceId(deviceId)
          const devices = await refreshDevices()
          const dev = devices.find((d) => d.deviceId === deviceId)
          if (dev?.isHdmiCapture) setIsMirrored(false)
        }
        return
      }

      // Step 1: Request stream to obtain device permissions
      const ok = await openStream(undefined)
      if (!ok) return

      // Step 2: Enumerate devices with granted labels
      const devices = await refreshDevices()

      // Step 3: If an external / HDMI capture card is present, auto-switch to it
      const externalDev = devices.find((d) => d.isHdmiCapture)
      if (externalDev) {
        console.log('[Camera] External / HDMI capture device detected:', externalDev.label)
        const switched = await openStream(externalDev.deviceId)
        if (switched) {
          setSelectedDeviceId(externalDev.deviceId)
          setIsMirrored(false) // Do not mirror external camera
          return
        }
      }

      // Step 4: Record active deviceId
      const activeTrack = streamRef.current?.getVideoTracks()[0]
      const settings = activeTrack?.getSettings()
      if (settings?.deviceId) {
        setSelectedDeviceId(settings.deviceId)
      }
    },
    [openStream, refreshDevices]
  )

  // -----------------------------------------------------------------------
  // switchCamera — user manually picks a device
  // -----------------------------------------------------------------------
  const switchCamera = useCallback(
    async (deviceId: string) => {
      console.log('[Camera] Switching to device:', deviceId)
      const ok = await openStream(deviceId)
      if (ok) {
        setSelectedDeviceId(deviceId)
        const devices = await refreshDevices()
        const dev = devices.find((d) => d.deviceId === deviceId)
        if (dev?.isHdmiCapture) {
          setIsMirrored(false)
        }
      }
    },
    [openStream, refreshDevices]
  )

  // -----------------------------------------------------------------------
  // cycleToNextCamera — convenient 1-button toggle between available cameras
  // -----------------------------------------------------------------------
  const cycleToNextCamera = useCallback(async () => {
    let devices = videoDevices
    if (devices.length <= 1) {
      devices = await refreshDevices()
    }
    if (devices.length <= 1) return

    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    const nextDev = devices[nextIndex]
    if (nextDev) {
      await switchCamera(nextDev.deviceId)
    }
  }, [videoDevices, selectedDeviceId, refreshDevices, switchCamera])

  // -----------------------------------------------------------------------
  // stopCamera
  // -----------------------------------------------------------------------
  const stopCamera = useCallback(() => {
    stopCurrentStream()
    setCameraActive(false)
  }, [stopCurrentStream])

  // -----------------------------------------------------------------------
  // triggerFlash
  // -----------------------------------------------------------------------
  const triggerFlash = useCallback(() => {
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 250)
  }, [])

  // -----------------------------------------------------------------------
  // captureFrame — capture full native resolution, no forced crop
  // The render system (drawCoverImage) handles fitting/cropping
  // -----------------------------------------------------------------------
  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return null

    const vw = video.videoWidth || 1280
    const vh = video.videoHeight || 720

    const canvas = document.createElement('canvas')
    canvas.width = vw
    canvas.height = vh

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    if (isMirrored) {
      ctx.translate(vw, 0)
      ctx.scale(-1, 1)
    }

    const filterCSS = FILTERS[activeFilter]
    if (filterCSS && filterCSS !== 'none') {
      ctx.filter = filterCSS
    }

    ctx.drawImage(video, 0, 0, vw, vh)
    return canvas
  }, [isMirrored, activeFilter])

  // -----------------------------------------------------------------------
  // Auto-start on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    startCamera()
    return () => {
      stopCurrentStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -----------------------------------------------------------------------
  // Listen for device change (plug/unplug)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const onDeviceChange = async () => {
      console.log('[Camera] Device change detected via devicechange event')
      const devices = await refreshDevices()
      const ext = devices.find((d) => d.isHdmiCapture)
      if (ext && ext.deviceId !== selectedDeviceId) {
        console.log('[Camera] New external camera plugged in — auto switching:', ext.label)
        await switchCamera(ext.deviceId)
      }
    }
    navigator.mediaDevices.addEventListener('devicechange', onDeviceChange)
    return () => navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange)
  }, [refreshDevices, switchCamera, selectedDeviceId])

  // -----------------------------------------------------------------------
  // connectIpStream — connect to an MJPEG/HLS stream URL
  // Works with Android "IP Webcam" app, USB Camera app, etc.
  // Usage: user enters http://192.168.x.x:8080/video in the UI
  // -----------------------------------------------------------------------
  const connectIpStream = useCallback(async (url: string) => {
    if (!url) return
    stopCurrentStream()
    setCameraError(null)
    setCameraActive(false)
    setIsIpStreamMode(true)
    setIpStreamUrl(url)
    setIsMirrored(false) // external stream, no mirror needed

    const video = videoRef.current
    if (!video) return

    // Clear any existing srcObject
    video.srcObject = null

    // Use the URL directly as video src
    video.src = url
    video.crossOrigin = 'anonymous'

    try {
      await video.play()
      setCameraActive(true)
      console.log('[Camera] IP stream connected:', url)
    } catch (err) {
      console.error('[Camera] IP stream error:', err)
      // Some MJPEG streams don't play via <video>, try <img> fallback below
      setCameraError(
        'Stream tidak bisa diputar via video. Pastikan URL adalah stream MJPEG/HLS yang valid.'
      )
      setCameraActive(false)
    }
  }, [stopCurrentStream])

  // -----------------------------------------------------------------------
  // disconnectIpStream — go back to regular camera
  // -----------------------------------------------------------------------
  const disconnectIpStream = useCallback(async () => {
    const video = videoRef.current
    if (video) {
      video.src = ''
      video.srcObject = null
    }
    setIsIpStreamMode(false)
    setIpStreamUrl('')
    await startCamera()
  }, [startCamera])

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
    // Device selection
    videoDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    switchCamera,
    cycleToNextCamera,
    refreshDevices,
    // IP Stream mode (Android / IP Webcam)
    ipStreamUrl,
    isIpStreamMode,
    connectIpStream,
    disconnectIpStream,
  }
}
