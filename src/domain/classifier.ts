import type { AxisId } from './axes'
import { AXIS_IDS } from './axes'
import type { ColorType, Season } from './types'
import { SEASONS, TYPES, getTypeById, getTypeByLabel } from './types'

export interface ClassifierResult {
  readonly season: Season
  readonly dominant_axis: AxisId
  readonly label: string
  readonly confidence: number
  readonly secondary_types: readonly string[]
}

/** The four continuous axes in 0..1. Cooler/deeper/muted/lower contrast = 0. */
export interface AxisScores {
  readonly warmth: number
  readonly value: number
  readonly chroma: number
  readonly contrast: number
}

export interface TypePrototype {
  readonly typeId: string
  readonly scores: AxisScores
}

/**
 * One prototype point per type in the four-axis space. Coordinates sit on the
 * 0.05 stability grid so quantization never moves a prototype.
 */
export const TYPE_PROTOTYPES: readonly TypePrototype[] = [
  { typeId: 'spring-warm', scores: { warmth: 0.85, value: 0.75, chroma: 0.75, contrast: 0.45 } },
  { typeId: 'spring-light', scores: { warmth: 0.75, value: 0.9, chroma: 0.6, contrast: 0.3 } },
  { typeId: 'spring-bright', scores: { warmth: 0.8, value: 0.6, chroma: 0.95, contrast: 0.7 } },
  { typeId: 'summer-cool', scores: { warmth: 0.15, value: 0.8, chroma: 0.35, contrast: 0.3 } },
  { typeId: 'summer-light', scores: { warmth: 0.3, value: 0.9, chroma: 0.4, contrast: 0.25 } },
  { typeId: 'summer-mute', scores: { warmth: 0.25, value: 0.6, chroma: 0.2, contrast: 0.2 } },
  { typeId: 'autumn-warm', scores: { warmth: 0.85, value: 0.4, chroma: 0.45, contrast: 0.5 } },
  { typeId: 'autumn-deep', scores: { warmth: 0.75, value: 0.2, chroma: 0.35, contrast: 0.8 } },
  { typeId: 'autumn-mute', scores: { warmth: 0.65, value: 0.45, chroma: 0.2, contrast: 0.35 } },
  { typeId: 'winter-cool', scores: { warmth: 0.15, value: 0.3, chroma: 0.8, contrast: 0.6 } },
  { typeId: 'winter-deep', scores: { warmth: 0.2, value: 0.15, chroma: 0.7, contrast: 0.9 } },
  { typeId: 'winter-bright', scores: { warmth: 0.25, value: 0.45, chroma: 0.95, contrast: 0.8 } },
]

const PROTOTYPE_BY_ID = new Map<string, AxisScores>(
  TYPE_PROTOTYPES.map((prototype) => [prototype.typeId, prototype.scores]),
)

/** Number of cells per unit used to snap incoming scores onto the stability grid. */
export const STABILITY_GRID = 20

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

/** Snap a score to the stability grid so small perturbations are ignored. */
export function stabilizeScore(value: number): number {
  return Math.round(clamp01(value) * STABILITY_GRID) / STABILITY_GRID
}

function axisDistance(left: AxisScores, right: AxisScores): number {
  const dw = stabilizeScore(left.warmth) - stabilizeScore(right.warmth)
  const dv = stabilizeScore(left.value) - stabilizeScore(right.value)
  const dc = stabilizeScore(left.chroma) - stabilizeScore(right.chroma)
  const dx = stabilizeScore(left.contrast) - stabilizeScore(right.contrast)
  return Math.sqrt(dw * dw + dv * dv + dc * dc + dx * dx)
}

interface RankedType {
  readonly type: ColorType
  readonly distance: number
  readonly order: number
}

/**
 * Deterministically map four axis scores to the nearest of the twelve types.
 * Ties break by canonical type order. Confidence is the normalized margin
 * between the best and next-best type, so it falls to 0 before the label can
 * change; secondary_types are the next two closest types.
 */
export function classifyAxisScores(scores: AxisScores): ClassifierResult {
  const ranked: RankedType[] = TYPES.map((type, order) => {
    const prototype = PROTOTYPE_BY_ID.get(type.id)
    return {
      type,
      distance: prototype ? axisDistance(scores, prototype) : Number.POSITIVE_INFINITY,
      order,
    }
  })

  ranked.sort((left, right) => {
    if (left.distance !== right.distance) {
      return left.distance - right.distance
    }
    return left.order - right.order
  })

  const best = ranked[0]
  const second = ranked[1]
  const margin = second ? second.distance - best.distance : 0
  const confidence = second && second.distance > 0 ? clamp01(margin / second.distance) : 0

  return {
    season: best.type.season,
    dominant_axis: best.type.dominant_axis,
    label: best.type.label,
    confidence,
    secondary_types: [ranked[1].type.id, ranked[2].type.id],
  }
}

export interface ClassifierValidation {
  readonly valid: boolean
  readonly errors: readonly string[]
}

export function validateClassifierResult(result: ClassifierResult): ClassifierValidation {
  const errors: string[] = []

  if (!result || typeof result !== 'object') {
    return { valid: false, errors: ['result must be an object'] }
  }

  if (!SEASONS.includes(result.season)) {
    errors.push(`unknown season: ${String(result.season)}`)
  }

  if (!AXIS_IDS.includes(result.dominant_axis)) {
    errors.push(`unknown dominant_axis: ${String(result.dominant_axis)}`)
  }

  const type = typeof result.label === 'string' ? getTypeByLabel(result.label) : undefined

  if (!type) {
    errors.push(`label does not resolve to a known type: ${String(result.label)}`)
  } else {
    if (type.season !== result.season) {
      errors.push(`label ${type.label} belongs to season ${type.season}`)
    }
    if (type.dominant_axis !== result.dominant_axis) {
      errors.push(`label ${type.label} has dominant_axis ${type.dominant_axis}`)
    }

    if (!Array.isArray(result.secondary_types)) {
      errors.push('secondary_types must be an array')
    } else {
      if (result.secondary_types.length > 2) {
        errors.push('secondary_types must contain at most 2 ids')
      }
      const seen = new Set<string>()
      for (const secondary of result.secondary_types) {
        if (typeof secondary !== 'string' || !getTypeById(secondary)) {
          errors.push(`unknown secondary type id: ${String(secondary)}`)
          continue
        }
        if (secondary === type.id) {
          errors.push('secondary_types must not include the primary type id')
        }
        if (seen.has(secondary)) {
          errors.push(`duplicate secondary type id: ${secondary}`)
        }
        seen.add(secondary)
      }
    }
  }

  if (typeof result.confidence !== 'number' || !Number.isFinite(result.confidence)) {
    errors.push('confidence must be a finite number')
  } else if (result.confidence < 0 || result.confidence > 1) {
    errors.push('confidence must be within 0..1 inclusive')
  }

  return { valid: errors.length === 0, errors }
}

export function isValidClassifierResult(result: ClassifierResult): boolean {
  return validateClassifierResult(result).valid
}
