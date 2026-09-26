import type { FaceObservation } from './faceCheck'
import type { FaceDetector, FaceDetectorFactory } from './faceDetector'

const TASKS_VISION_VERSION = '1.0.1'
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

interface Landmark {
  x: number
  y: number
}

function landmarksToObservation(landmarks: readonly Landmark[]): FaceObservation {
  let minX = 1
  let minY = 1
  let maxX = 0
  let maxY = 0

  for (const landmark of landmarks) {
    minX = Math.min(minX, landmark.x)
    minY = Math.min(minY, landmark.y)
    maxX = Math.max(maxX, landmark.x)
    maxY = Math.max(maxY, landmark.y)
  }

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export const createMediaPipeFaceDetector: FaceDetectorFactory = async () => {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE)
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'VIDEO',
    numFaces: 3,
  })

  const detector: FaceDetector = {
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs)
      return (result.faceLandmarks ?? []).map(landmarksToObservation)
    },
    close() {
      landmarker.close()
    },
  }

  return detector
}
