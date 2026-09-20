import { useState, useRef, useEffect, useCallback } from 'react'
import { type FilterKey, FILTERS } from '@/lib/render'

export interface VideoDevice {
  deviceId: string
  label: string
  isHdmiCapture: boolean
}

/** Keywords found in HDMI capture card labels */
const HDMI_KEYWORDS = ['hdmi', 'capture', 'cam link', 'magewell', 'elgato', 'usb video', 'usb capture', 'analog', 'razer ripsaw', 'avermedia', 'blackmagic', 'video input', 'live gamer']

function isHdmiCaptureDevice(label: string): boolean {
  const lower = label.toLowerCase()
  return HDMI_KEYWORDS.some((kw) => lower.includes(kw))
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isMirrored, setIsMirrored] = useState<boolean>(true)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('normal')
  const [isFlashing, setIsFlashing] = useState<boolean>(false)

  // Device enumeration
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  /**
   * Enumerate all connected video input devices.
   * Must be called after the user grants camera permission (labels are hidden before that).
   */
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${idx + 1}`,
          isHdmiCapture: isHdmiCaptureDevice(d.label),
        }))
      setVideoDevices(videoInputs)

      // Auto-select HDMI capture card if available and nothing is selected yet
      const hdmi = videoInputs.find((d) => d.isHdmiCapture)
      if (hdmi && !selectedDeviceId) {
        setSelectedDeviceId(hdmi.deviceId)
        return hdmi.deviceId
      }

      return null
    } catch {
      return null
    }
  }, [selectedDeviceId])

  /**
   * Start camera stream using a specific deviceId (or default front camera).
   * When a deviceId is provided (HDMI capture card), mirroring is disabled automatically.
   */
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setCameraError(null)

      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          : {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: 'user',
            },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      setCameraActive(true)

      // If using HDMI/external camera, disable mirror (it's already the right orientation)
      if (deviceId) {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const device = devices.find((d) => d.deviceId === deviceId)
        if (device && isHdmiCaptureDevice(device.label)) {
          setIsMirrored(false)
        }
      }

      // Refresh device list after permission granted (labels now available)
      await refreshDevices()
    } catch (err: unknown) {
      console.error('Camera access error:', err)
      const msg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses'
      setCameraError(msg)
      setCameraActive(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Switch to a different camera device. Automatically handles cleanup of current stream.
   */
  const switchCamera = useCallback(async (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    setCameraActive(false)

    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    await startCamera(deviceId)
  }, [stream, startCamera])

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

    const vw = video.videoWidth || 1280
    const vh = video.videoHeight || 720

    // Match the 4:3 aspect ratio of the live camera viewfinder
    const targetAspect = 4 / 3
    const videoAspect = vw / vh

    let sx = 0
    let sy = 0
    let sw = vw
    let sh = vh

    if (videoAspect > targetAspect) {
      // Video is wider than 4:3 (e.g. 16:9): crop sides evenly to match viewfinder
      sw = Math.round(vh * targetAspect)
      sx = Math.round((vw - sw) / 2)
    } else {
      // Video is taller than 4:3: crop top/bottom evenly
      sh = Math.round(vw / targetAspect)
      sy = Math.round((vh - sh) / 2)
    }

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Apply mirror if enabled
    if (isMirrored) {
      ctx.translate(sw, 0)
      ctx.scale(-1, 1)
    }

    // Apply active filter to the captured frame canvas
    const filterCSS = FILTERS[activeFilter]
    if (filterCSS && filterCSS !== 'none') {
      ctx.filter = filterCSS
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for device changes (plug/unplug capture card)
  useEffect(() => {
    const onDeviceChange = () => {
      refreshDevices()
    }
    navigator.mediaDevices.addEventListener('devicechange', onDeviceChange)
    return () => navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange)
  }, [refreshDevices])

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
    refreshDevices,
  }
}
