import { computeFrameStats, type FramePixels } from './lighting'

export interface BeautyAdvisory {
  suspected: boolean
  message: string | null
}

export interface BeautyOptions {
  maxNeutralSaturation?: number
  maxClippedFraction?: number
}

const DEFAULT_OPTIONS: Required<BeautyOptions> = {
  maxNeutralSaturation: 0.4,
  maxClippedFraction: 0.6,
}

export function evaluateBeautyAdvisory(
  frame: FramePixels,
  options: BeautyOptions = {},
): BeautyAdvisory {
  const { maxNeutralSaturation, maxClippedFraction } = { ...DEFAULT_OPTIONS, ...options }
  const stats = computeFrameStats(frame)
  const suspected =
    stats.meanSaturation > maxNeutralSaturation || stats.clippedFraction > maxClippedFraction

  return {
    suspected,
    message: suspected
      ? 'A filter or beauty mode may be on — turn it off for accurate results.'
      : null,
  }
}
