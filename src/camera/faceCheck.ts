export interface FaceObservation {
  centerX: number
  centerY: number
  width: number
  height: number
}

export interface FaceCheckOptions {
  centerTolerance?: number
  minSize?: number
  maxSize?: number
}

export interface FaceCheckResult {
  pass: boolean
  count: number
  status: string
  reason: string | null
}

const DEFAULT_OPTIONS: Required<FaceCheckOptions> = {
  centerTolerance: 0.15,
  minSize: 0.12,
  maxSize: 1.5,
}

export function evaluateFaceCheck(
  faces: readonly FaceObservation[],
  options: FaceCheckOptions = {},
): FaceCheckResult {
  const { centerTolerance, minSize, maxSize } = { ...DEFAULT_OPTIONS, ...options }
  const count = faces.length

  if (count === 0) {
    return {
      pass: false,
      count,
      status: 'No face detected',
      reason: 'Center your face inside the outline.',
    }
  }

  if (count > 1) {
    return {
      pass: false,
      count,
      status: 'More than one face detected',
      reason: 'Only you should be in frame.',
    }
  }

  const face = faces[0]
  const offCenter =
    Math.abs(face.centerX - 0.5) > centerTolerance ||
    Math.abs(face.centerY - 0.5) > centerTolerance

  if (offCenter) {
    return {
      pass: false,
      count,
      status: 'Face not centered',
      reason: 'Align your face with the outline.',
    }
  }

  const size = Math.max(face.width, face.height)
  if (size < minSize) {
    return {
      pass: false,
      count,
      status: 'Face too small',
      reason: 'Move a little closer to the camera.',
    }
  }

  if (size > maxSize) {
    return {
      pass: false,
      count,
      status: 'Face too large',
      reason: 'Move a little further from the camera.',
    }
  }

  return {
    pass: true,
    count,
    status: 'Face detected',
    reason: null,
  }
}
