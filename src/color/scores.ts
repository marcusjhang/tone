import type { AxisScores } from '../domain/classifier'
import { chroma, type Lab } from './lab'

export interface AxisInput {
  readonly skin: Lab
  readonly hair: Lab
  readonly iris: Lab
}

const CHROMA_REFERENCE = 50
const CONTRAST_REFERENCE = 70
const B_RANGE_MIN = -25
const B_RANGE_MAX = 25
const UNDERTONE_RANGE_MIN = -40
const UNDERTONE_RANGE_MAX = 40

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  if (value < 0) {
    return 0
  }
  if (value > 1) {
    return 1
  }
  return value
}

function normalize(value: number, min: number, max: number): number {
  return clamp01((value - min) / (max - min))
}

/**
 * Reduce three measured regions to four axis scores in 0..1.
 *
 * - warmth: 0 cool -> 1 warm, from skin yellowness (b*) and undertone (b* - a*).
 * - value: 0 deep -> 1 light, from skin lightness (L*).
 * - chroma: 0 muted -> 1 bright, from skin chroma.
 * - contrast: 0 low -> 1 high, from the L* spread across hair, skin and iris.
 */
export function computeAxisScores(input: AxisInput): AxisScores {
  const { skin, hair, iris } = input

  const yellowness = normalize(skin.b, B_RANGE_MIN, B_RANGE_MAX)
  const undertone = normalize(skin.b - skin.a, UNDERTONE_RANGE_MIN, UNDERTONE_RANGE_MAX)
  const warmth = clamp01(0.5 * yellowness + 0.5 * undertone)

  const value = clamp01(skin.L / 100)
  const chromaScore = clamp01(chroma(skin) / CHROMA_REFERENCE)

  const lightnesses = [hair.L, skin.L, iris.L]
  const spread = Math.max(...lightnesses) - Math.min(...lightnesses)
  const contrast = clamp01(spread / CONTRAST_REFERENCE)

  return { warmth, value, chroma: chromaScore, contrast }
}
