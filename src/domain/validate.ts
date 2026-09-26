import type { Palette, PaletteColor } from './palette'

export const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

export const MIN_BEST_COLORS = 6
export const MIN_WORST_COLORS = 4
export const MIN_NEUTRAL_COLORS = 4

export interface ValidationResult {
  readonly valid: boolean
  readonly errors: readonly string[]
}

export function isValidHex(value: unknown): value is string {
  return typeof value === 'string' && HEX_PATTERN.test(value)
}

function isNamedColor(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<PaletteColor>
  return typeof candidate.name === 'string' && candidate.name.trim().length > 0 &&
    isValidHex(candidate.hex)
}

export function validatePalette(palette: Palette): ValidationResult {
  const errors: string[] = []

  if (!palette || typeof palette !== 'object') {
    return { valid: false, errors: ['palette must be an object'] }
  }

  if (typeof palette.typeId !== 'string' || palette.typeId.length === 0) {
    errors.push('palette must carry a typeId')
  }

  if (!Array.isArray(palette.best) || palette.best.length < MIN_BEST_COLORS) {
    errors.push(`best must contain at least ${MIN_BEST_COLORS} colors`)
  } else {
    palette.best.forEach((entry, index) => {
      if (!isNamedColor(entry)) {
        errors.push(`best[${index}] must have a name and a valid #RRGGBB hex`)
      }
    })
  }

  if (!Array.isArray(palette.neutral) || palette.neutral.length < MIN_NEUTRAL_COLORS) {
    errors.push(`neutral must contain at least ${MIN_NEUTRAL_COLORS} colors`)
  } else {
    palette.neutral.forEach((entry, index) => {
      if (!isNamedColor(entry)) {
        errors.push(`neutral[${index}] must have a name and a valid #RRGGBB hex`)
      }
    })
  }

  if (!Array.isArray(palette.worst) || palette.worst.length < MIN_WORST_COLORS) {
    errors.push(`worst must contain at least ${MIN_WORST_COLORS} colors`)
  } else {
    palette.worst.forEach((entry, index) => {
      if (!isNamedColor(entry)) {
        errors.push(`worst[${index}] must have a name and a valid #RRGGBB hex`)
        return
      }
      if (!isNamedColor(entry.substitute)) {
        errors.push(`worst[${index}] must pair a valid substitute color`)
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

export function isValidPalette(palette: Palette): boolean {
  return validatePalette(palette).valid
}
