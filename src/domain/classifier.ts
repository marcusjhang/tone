import type { AxisId } from './axes'
import { AXIS_IDS } from './axes'
import type { Season } from './types'
import { SEASONS, getTypeById, getTypeByLabel } from './types'

export interface ClassifierResult {
  readonly season: Season
  readonly dominant_axis: AxisId
  readonly label: string
  readonly confidence: number
  readonly secondary_types: readonly string[]
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
