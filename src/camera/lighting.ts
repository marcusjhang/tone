export interface FramePixels {
  data: Uint8ClampedArray | Uint8Array
  width: number
  height: number
}

export interface LightingStats {
  meanLuminance: number
  colorCast: number
  unevenness: number
  meanSaturation: number
  clippedFraction: number
}

export interface LightingCheckResult {
  pass: boolean
  status: string
  reason: string | null
  stats: LightingStats
}

export interface LightingOptions {
  minLuminance?: number
  maxColorCast?: number
  maxUnevenness?: number
  gridSize?: number
}

const DEFAULT_OPTIONS: Required<LightingOptions> = {
  minLuminance: 60,
  maxColorCast: 0.2,
  maxUnevenness: 0.25,
  gridSize: 2,
}

export function computeFrameStats(frame: FramePixels, gridSize = 2): LightingStats {
  const { data, width, height } = frame
  const pixelCount = Math.max(1, width * height)

  const cells: Array<{ sum: number; count: number }> = []
  for (let i = 0; i < gridSize * gridSize; i += 1) {
    cells.push({ sum: 0, count: 0 })
  }

  let sumR = 0
  let sumG = 0
  let sumB = 0
  let sumLuminance = 0
  let sumSaturation = 0
  let clipped = 0

  for (let y = 0; y < height; y += 1) {
    const gridY = Math.min(gridSize - 1, Math.floor((y / height) * gridSize))
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      const r = data[offset] ?? 0
      const g = data[offset + 1] ?? 0
      const b = data[offset + 2] ?? 0

      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max

      sumR += r
      sumG += g
      sumB += b
      sumLuminance += luminance
      sumSaturation += saturation
      if (luminance >= 250 || luminance <= 5) {
        clipped += 1
      }

      const gridX = Math.min(gridSize - 1, Math.floor((x / width) * gridSize))
      const cell = cells[gridY * gridSize + gridX]
      cell.sum += luminance
      cell.count += 1
    }
  }

  const meanR = sumR / pixelCount
  const meanG = sumG / pixelCount
  const meanB = sumB / pixelCount
  const meanChannel = (meanR + meanG + meanB) / 3
  const colorCast =
    meanChannel === 0
      ? 0
      : (Math.max(meanR, meanG, meanB) - Math.min(meanR, meanG, meanB)) / meanChannel

  const cellMeans = cells
    .filter((cell) => cell.count > 0)
    .map((cell) => cell.sum / cell.count)
  const unevenness =
    cellMeans.length > 1 ? (Math.max(...cellMeans) - Math.min(...cellMeans)) / 255 : 0

  return {
    meanLuminance: sumLuminance / pixelCount,
    colorCast,
    unevenness,
    meanSaturation: sumSaturation / pixelCount,
    clippedFraction: clipped / pixelCount,
  }
}

export function classifyLighting(
  frame: FramePixels,
  options: LightingOptions = {},
): LightingCheckResult {
  const { minLuminance, maxColorCast, maxUnevenness, gridSize } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }
  const stats = computeFrameStats(frame, gridSize)

  if (stats.meanLuminance < minLuminance) {
    return {
      pass: false,
      status: 'Too dark',
      reason: 'Move to brighter, even light — natural daylight is best.',
      stats,
    }
  }

  if (stats.colorCast > maxColorCast) {
    return {
      pass: false,
      status: 'Strong color cast',
      reason: 'Turn off colored lights and use neutral white light.',
      stats,
    }
  }

  if (stats.unevenness > maxUnevenness) {
    return {
      pass: false,
      status: 'Uneven lighting',
      reason: 'Avoid shadows and single lamps — face a window for even light.',
      stats,
    }
  }

  return {
    pass: true,
    status: 'Lighting looks even and neutral',
    reason: null,
    stats,
  }
}
