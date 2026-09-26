import { useCallback, useEffect, useRef, useState } from 'react'
import { evaluateBeautyAdvisory, type BeautyAdvisory } from '../camera/beauty'
import { evaluateCaptureReadiness } from '../camera/checks'
import { evaluateFaceCheck, type FaceCheckResult } from '../camera/faceCheck'
import type { FaceDetector, FaceDetectorFactory } from '../camera/faceDetector'
import { captureFrame as captureFrameFromVideo } from '../camera/frame'
import { classifyLighting, type LightingCheckResult } from '../camera/lighting'
import { createMediaPipeFaceDetector } from '../camera/mediapipeFaceDetector'
import { useCaptureStore } from '../state/captureStore'

type CameraStatus = 'starting' | 'ready' | 'denied' | 'unavailable' | 'error'

type FrameCallback = (time: number) => void

const scheduleFrame: (callback: FrameCallback) => number =
  typeof requestAnimationFrame === 'function'
    ? (callback) => requestAnimationFrame(callback)
    : (callback) => window.setTimeout(() => callback(Date.now()), 16)

const cancelFrame: (handle: number) => void =
  typeof cancelAnimationFrame === 'function'
    ? (handle) => cancelAnimationFrame(handle)
    : (handle) => window.clearTimeout(handle)

const DETECTION_INTERVAL_MS = 250

class CameraUnavailableError extends Error {}

function defaultRequestStream(): Promise<MediaStream> {
  const mediaDevices = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined
  if (!mediaDevices?.getUserMedia) {
    return Promise.reject(new CameraUnavailableError('This browser does not support camera access.'))
  }
  return mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
}

interface CameraErrorInfo {
  status: Exclude<CameraStatus, 'starting' | 'ready'>
  message: string
}

function classifyCameraError(error: unknown): CameraErrorInfo {
  const name = (error as { name?: string } | null)?.name ?? ''

  if (
    name === 'NotAllowedError' ||
    name === 'PermissionDeniedError' ||
    name === 'SecurityError'
  ) {
    return {
      status: 'denied',
      message: 'Camera access was denied. Allow camera permission and try again.',
    }
  }

  if (
    name === 'NotFoundError' ||
    name === 'DevicesNotFoundError' ||
    name === 'OverconstrainedError'
  ) {
    return { status: 'unavailable', message: 'No camera was found on this device.' }
  }

  if (error instanceof CameraUnavailableError) {
    return { status: 'unavailable', message: error.message }
  }

  return { status: 'error', message: 'The camera could not be started. Please try again.' }
}

export interface CameraProps {
  createFaceDetector?: FaceDetectorFactory
  requestStream?: () => Promise<MediaStream>
  captureFrame?: (video: HTMLVideoElement) => ImageData | null
}

function CheckRow({
  label,
  pass,
  reason,
}: {
  label: string
  pass: boolean | undefined
  reason: string | null
}) {
  const tone = pass === undefined ? 'text-ink-muted' : pass ? 'text-brand-dark' : 'text-ink'
  return (
    <li className="flex items-start gap-3 rounded-xl bg-brand-soft p-4">
      <span aria-hidden="true" className={`mt-0.5 ${tone}`}>
        {pass === undefined ? '\u2026' : pass ? '\u2713' : '\u2022'}
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{label}</span>
        {reason ? <span className="text-sm text-ink-muted">{reason}</span> : null}
      </div>
    </li>
  )
}

export function Camera({
  createFaceDetector = createMediaPipeFaceDetector,
  requestStream = defaultRequestStream,
  captureFrame = captureFrameFromVideo,
}: CameraProps = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<FaceDetector | null>(null)
  const rafRef = useRef<number | null>(null)

  const createFaceDetectorRef = useRef(createFaceDetector)
  const requestStreamRef = useRef(requestStream)
  const captureFrameRef = useRef(captureFrame)
  createFaceDetectorRef.current = createFaceDetector
  requestStreamRef.current = requestStream
  captureFrameRef.current = captureFrame

  const [status, setStatus] = useState<CameraStatus>('starting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [face, setFace] = useState<FaceCheckResult | null>(null)
  const [lighting, setLighting] = useState<LightingCheckResult | null>(null)
  const [beauty, setBeauty] = useState<BeautyAdvisory | null>(null)
  const [captured, setCaptured] = useState(false)

  const { setCapturedFrame } = useCaptureStore()

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    setStatus('starting')
    setErrorMessage(null)
    setCaptured(false)
    setFace(null)
    setLighting(null)
    setBeauty(null)

    try {
      const stream = await requestStreamRef.current()
      streamRef.current = stream

      const video = videoRef.current
      if (video) {
        try {
          video.srcObject = stream
        } catch {
          // Some environments do not support srcObject; the stream is still held.
        }

        const hasVideoTrack =
          typeof stream.getVideoTracks === 'function' && stream.getVideoTracks().length > 0
        if (hasVideoTrack) {
          try {
            const playResult = video.play()
            if (playResult && typeof (playResult as Promise<void>).then === 'function') {
              await playResult
            }
          } catch {
            // Autoplay can be blocked; the stream stays attached to the preview.
          }
        }
      }

      if (!detectorRef.current) {
        try {
          detectorRef.current = await createFaceDetectorRef.current()
        } catch {
          setFace({
            pass: false,
            count: 0,
            status: 'Face detection unavailable',
            reason: 'Face detection could not start. Reload and try again.',
          })
        }
      }

      setStatus('ready')
    } catch (error) {
      const info = classifyCameraError(error)
      setStatus(info.status)
      setErrorMessage(info.message)
    }
  }, [])

  useEffect(() => {
    void start()
    return () => {
      stopStream()
      if (rafRef.current !== null) {
        cancelFrame(rafRef.current)
        rafRef.current = null
      }
      detectorRef.current?.close()
      detectorRef.current = null
    }
  }, [start, stopStream])

  useEffect(() => {
    if (status !== 'ready') {
      return
    }

    let cancelled = false
    let lastDetection = 0

    const tick = (time: number) => {
      if (cancelled) {
        return
      }
      rafRef.current = scheduleFrame(tick)

      const video = videoRef.current
      const detector = detectorRef.current
      if (!video || !detector || time - lastDetection < DETECTION_INTERVAL_MS) {
        return
      }
      lastDetection = time

      let observations: Parameters<typeof evaluateFaceCheck>[0] = []
      try {
        observations = detector.detect(video, time)
      } catch {
        observations = []
      }
      setFace(evaluateFaceCheck(observations))

      let frame: ImageData | null = null
      try {
        frame = captureFrameRef.current(video)
      } catch {
        frame = null
      }
      if (frame) {
        setLighting(classifyLighting(frame))
        setBeauty(evaluateBeautyAdvisory(frame))
      }
    }

    rafRef.current = scheduleFrame(tick)

    return () => {
      cancelled = true
      if (rafRef.current !== null) {
        cancelFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [status])

  const readiness = evaluateCaptureReadiness(face, lighting)

  const handleCapture = () => {
    const video = videoRef.current
    if (!video || !readiness.shutterEnabled) {
      return
    }
    const imageData = captureFrameRef.current(video)
    if (!imageData) {
      return
    }
    setCapturedFrame({
      imageData,
      width: imageData.width,
      height: imageData.height,
      capturedAt: Date.now(),
    })
    setCaptured(true)
  }

  const cameraFailed = status === 'denied' || status === 'unavailable' || status === 'error'

  return (
    <section aria-labelledby="camera-heading" className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 id="camera-heading" className="text-3xl font-semibold leading-tight">
          Camera
        </h1>
        <p className="text-ink-muted">
          One face in the outline, even daylight, no filters. Nothing is uploaded.
        </p>
      </div>

      <div
        data-testid="camera-preview"
        className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl bg-ink/90"
      >
        <video
          ref={videoRef}
          aria-label="Live camera preview"
          autoPlay
          playsInline
          muted
          className="h-full w-full -scale-x-100 object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            data-testid="face-guide"
            className="h-[68%] w-[56%] rounded-[50%] border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.32)]"
          />
        </div>
      </div>

      {cameraFailed ? (
        <div role="alert" className="flex flex-col gap-4 rounded-xl border border-ink/20 p-6">
          <p>{errorMessage}</p>
          <div>
            <button
              type="button"
              onClick={() => void start()}
              className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Retry camera
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3">
            <CheckRow
              label={face ? face.status : 'Checking face\u2026'}
              pass={face?.pass}
              reason={face ? face.reason : null}
            />
            <CheckRow
              label={lighting ? lighting.status : 'Checking lighting\u2026'}
              pass={lighting?.pass}
              reason={lighting ? lighting.reason : null}
            />
          </ul>

          {beauty?.suspected && beauty.message ? (
            <p role="status" className="rounded-xl border border-brand p-4 text-sm">
              {beauty.message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleCapture}
              disabled={!readiness.shutterEnabled}
              className="rounded-full bg-brand px-8 py-3 text-base font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              Take photo
            </button>

            {!readiness.shutterEnabled && readiness.reasons.length > 0 ? (
              <ul className="flex flex-col gap-1 text-sm text-ink-muted">
                {readiness.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : null}

            {captured ? (
              <p role="status" className="text-sm text-brand-dark">
                Photo captured and held on your device only.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}
