import type { RGB } from '../color/lab'
import type { ImageDataLike, Landmark } from '../color/sample'

export function makeImage(width: number, height: number, color: RGB): ImageDataLike & { data: Uint8ClampedArray } {
  const data = new Uint8ClampedArray(width * height * 4)
  const image = { data, width, height }
  paintRect(image, 0, 0, width - 1, height - 1, color)
  return image
}

export function paintRect(
  image: ImageDataLike,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: RGB,
): void {
  const startX = Math.max(0, Math.min(x0, x1))
  const endX = Math.min(image.width - 1, Math.max(x0, x1))
  const startY = Math.max(0, Math.min(y0, y1))
  const endY = Math.min(image.height - 1, Math.max(y0, y1))
  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const index = (y * image.width + x) * 4
      image.data[index] = color.r
      image.data[index + 1] = color.g
      image.data[index + 2] = color.b
      image.data[index + 3] = 255
    }
  }
}

export function makeLandmarks(overrides: Record<number, Landmark> = {}): Landmark[] {
  const landmarks: Landmark[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }))
  for (const [key, value] of Object.entries(overrides)) {
    landmarks[Number(key)] = value
  }
  return landmarks
}

export const FACE_COLORS = {
  background: { r: 0, g: 0, b: 0 },
  skin: { r: 200, g: 160, b: 130 },
  hair: { r: 35, g: 28, b: 24 },
  iris: { r: 80, g: 95, b: 115 },
  lips: { r: 180, g: 105, b: 100 },
} as const

/** Landmarks whose indices land on distinct, non-overlapping painted regions. */
export function makeFaceLandmarks(): Landmark[] {
  const overrides: Record<number, Landmark> = {}
  for (const index of [50, 101, 118, 123, 205]) {
    overrides[index] = { x: 0.3, y: 0.5 }
  }
  for (const index of [280, 330, 345, 352, 425]) {
    overrides[index] = { x: 0.7, y: 0.5 }
  }
  for (const index of [10, 151, 108, 337]) {
    overrides[index] = { x: 0.5, y: 0.35 }
  }
  for (const index of [33, 133, 159, 145]) {
    overrides[index] = { x: 0.35, y: 0.5 }
  }
  for (const index of [362, 263, 386, 374]) {
    overrides[index] = { x: 0.65, y: 0.5 }
  }
  for (const index of [13, 14, 78, 308, 0, 17]) {
    overrides[index] = { x: 0.5, y: 0.7 }
  }
  overrides[152] = { x: 0.5, y: 0.85 }
  return makeLandmarks(overrides)
}

/** A synthetic face where each color region is painted a known flat color. */
export function makeFaceImage(size = 60): ImageDataLike & { data: Uint8ClampedArray } {
  const image = makeImage(size, size, FACE_COLORS.background)
  paintRect(image, 20, 0, 40, 15, FACE_COLORS.hair)
  paintRect(image, 10, 22, 25, 36, FACE_COLORS.skin)
  paintRect(image, 36, 22, 49, 36, FACE_COLORS.skin)
  paintRect(image, 20, 17, 40, 25, FACE_COLORS.skin)
  paintRect(image, 19, 27, 23, 31, FACE_COLORS.iris)
  paintRect(image, 36, 27, 40, 31, FACE_COLORS.iris)
  paintRect(image, 25, 38, 35, 44, FACE_COLORS.lips)
  return image
}
