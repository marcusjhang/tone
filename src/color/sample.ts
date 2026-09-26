import { rgbToLab, type Lab, type RGB } from './lab'

export interface Landmark {
  readonly x: number
  readonly y: number
}

export interface ImageDataLike {
  readonly data: Uint8ClampedArray | Uint8Array
  readonly width: number
  readonly height: number
}

export interface RegionSample {
  readonly rgb: RGB
  readonly lab: Lab
  readonly samples: number
}

export interface RegionSamples {
  readonly skin: RegionSample
  readonly hair: RegionSample
  readonly iris: RegionSample
  readonly lips: RegionSample
}

export interface SampleOptions {
  /** Half-size of the square patch sampled around each landmark, in pixels. */
  readonly patchRadius?: number
  /** Fraction of extreme values discarded from each channel before averaging. */
  readonly trimFraction?: number
}

/**
 * MediaPipe Face Mesh indices used to place region samples. Skin points sit on
 * the cheeks and forehead only; none of them fall on eyes, brows, lips or hair.
 */
export const LANDMARKS = {
  leftCheek: [50, 101, 118, 123, 205],
  rightCheek: [280, 330, 345, 352, 425],
  forehead: [10, 151, 108, 337],
  leftEye: [33, 133, 159, 145],
  rightEye: [362, 263, 386, 374],
  lips: [13, 14, 78, 308, 0, 17],
  hairlineTop: 10,
  chin: 152,
  faceLeft: 234,
  faceRight: 454,
} as const

const HAIR_OFFSETS = [0.35, 0.7]
export const DEFAULT_TRIM_FRACTION = 0.2

function pointAt(landmarks: readonly Landmark[], index: number): Landmark | undefined {
  const landmark = landmarks[index]
  if (!landmark || !Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) {
    return undefined
  }
  return landmark
}

function pointsAt(landmarks: readonly Landmark[], indices: readonly number[]): Landmark[] {
  const points: Landmark[] = []
  for (const index of indices) {
    const point = pointAt(landmarks, index)
    if (point) {
      points.push(point)
    }
  }
  return points
}

function centroid(landmarks: readonly Landmark[], indices: readonly number[]): Landmark | undefined {
  const points = pointsAt(landmarks, indices)
  if (points.length === 0) {
    return undefined
  }
  let x = 0
  let y = 0
  for (const point of points) {
    x += point.x
    y += point.y
  }
  return { x: x / points.length, y: y / points.length }
}

function hairPoints(landmarks: readonly Landmark[]): Landmark[] {
  const top = pointAt(landmarks, LANDMARKS.hairlineTop)
  const chin = pointAt(landmarks, LANDMARKS.chin)
  if (!top || !chin) {
    return []
  }

  const centerX = (top.x + chin.x) / 2
  const centerY = (top.y + chin.y) / 2
  const faceHeight = Math.hypot(top.x - chin.x, top.y - chin.y)

  let dx = top.x - centerX
  let dy = top.y - centerY
  const length = Math.hypot(dx, dy)
  if (length === 0) {
    dx = 0
    dy = -1
  } else {
    dx /= length
    dy /= length
  }

  return HAIR_OFFSETS.map((offset) => ({
    x: top.x + dx * faceHeight * offset,
    y: top.y + dy * faceHeight * offset,
  }))
}

function irisPoints(landmarks: readonly Landmark[]): Landmark[] {
  const points: Landmark[] = []
  const left = centroid(landmarks, LANDMARKS.leftEye)
  const right = centroid(landmarks, LANDMARKS.rightEye)
  if (left) {
    points.push(left)
  }
  if (right) {
    points.push(right)
  }
  return points
}

function skinPoints(landmarks: readonly Landmark[]): Landmark[] {
  return [
    ...pointsAt(landmarks, LANDMARKS.leftCheek),
    ...pointsAt(landmarks, LANDMARKS.rightCheek),
    ...pointsAt(landmarks, LANDMARKS.forehead),
  ]
}

/** Trimmed mean of a numeric list, evaluated in sorted order for determinism. */
export function robustAverage(values: readonly number[], trimFraction: number): number {
  if (values.length === 0) {
    return 0
  }
  const sorted = [...values].sort((left, right) => left - right)
  const trim = Math.floor(sorted.length * trimFraction)
  const start = trim
  const end = sorted.length - trim
  if (end <= start) {
    return sorted[Math.floor((sorted.length - 1) / 2)]
  }
  let sum = 0
  for (let index = start; index < end; index += 1) {
    sum += sorted[index]
  }
  return sum / (end - start)
}

function samplePoints(
  image: ImageDataLike,
  points: readonly Landmark[],
  patchRadius: number,
  trimFraction: number,
): RegionSample {
  const reds: number[] = []
  const greens: number[] = []
  const blues: number[] = []
  const maxX = image.width - 1
  const maxY = image.height - 1

  for (const point of points) {
    const centerX = Math.min(maxX, Math.max(0, Math.round(point.x * maxX)))
    const centerY = Math.min(maxY, Math.max(0, Math.round(point.y * maxY)))
    for (let offsetY = -patchRadius; offsetY <= patchRadius; offsetY += 1) {
      const y = centerY + offsetY
      if (y < 0 || y > maxY) {
        continue
      }
      for (let offsetX = -patchRadius; offsetX <= patchRadius; offsetX += 1) {
        const x = centerX + offsetX
        if (x < 0 || x > maxX) {
          continue
        }
        const index = (y * image.width + x) * 4
        reds.push(image.data[index])
        greens.push(image.data[index + 1])
        blues.push(image.data[index + 2])
      }
    }
  }

  if (reds.length === 0) {
    const black: RGB = { r: 0, g: 0, b: 0 }
    return { rgb: black, lab: rgbToLab(black), samples: 0 }
  }

  const average: RGB = {
    r: robustAverage(reds, trimFraction),
    g: robustAverage(greens, trimFraction),
    b: robustAverage(blues, trimFraction),
  }

  return {
    rgb: {
      r: Math.round(average.r),
      g: Math.round(average.g),
      b: Math.round(average.b),
    },
    lab: rgbToLab(average),
    samples: reds.length,
  }
}

/**
 * Sample the four color regions from a captured frame using face landmarks.
 * Returns robust (trimmed-mean) averages so single bad pixels do not move a region.
 */
export function sampleRegions(
  image: ImageDataLike,
  landmarks: readonly Landmark[],
  options: SampleOptions = {},
): RegionSamples {
  const patchRadius =
    options.patchRadius ?? Math.max(1, Math.round(Math.min(image.width, image.height) * 0.01))
  const trimFraction = options.trimFraction ?? DEFAULT_TRIM_FRACTION

  return {
    skin: samplePoints(image, skinPoints(landmarks), patchRadius, trimFraction),
    hair: samplePoints(image, hairPoints(landmarks), patchRadius, trimFraction),
    iris: samplePoints(image, irisPoints(landmarks), patchRadius, trimFraction),
    lips: samplePoints(image, pointsAt(landmarks, LANDMARKS.lips), patchRadius, trimFraction),
  }
}
