import type { FaceObservation } from './faceCheck'

export interface FaceDetector {
  detect(video: HTMLVideoElement, timestampMs: number): FaceObservation[]
  close(): void
}

export type FaceDetectorFactory = () => Promise<FaceDetector>
