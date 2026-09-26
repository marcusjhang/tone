import { describe, expect, it } from 'vitest'
import {
  AXES,
  PALETTES,
  SEASONS,
  STYLING,
  STYLING_CATEGORIES,
  TYPES,
  getAllTypes,
  getPalette,
  getStyling,
  getTypeById,
  getTypeByLabel,
  isValidClassifierResult,
  isValidHex,
  isValidPalette,
  validateClassifierResult,
  validatePalette,
  type ClassifierResult,
  type Palette,
  type PaletteColor,
} from './index'

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2
  let h = 0
  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6)
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2)
    } else {
      h = 60 * ((r - g) / delta + 4)
    }
  }
  if (h < 0) {
    h += 360
  }
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  return { h, s, l }
}

function bestAndNeutral(palette: Palette): readonly PaletteColor[] {
  return [...palette.best, ...palette.neutral]
}

const WARM_SEASONS = new Set(['Spring', 'Autumn'])
const COOL_SEASONS = new Set(['Summer', 'Winter'])

describe('axes', () => {
  it('exposes exactly four axes with the named poles', () => {
    expect(AXES).toHaveLength(4)
    const byId = Object.fromEntries(AXES.map((axis) => [axis.id, axis]))
    expect(byId['warm-cool'].poles.map((pole) => pole.id)).toEqual(['warm', 'cool'])
    expect(byId['light-deep'].poles.map((pole) => pole.id)).toEqual(['light', 'deep'])
    expect(byId['bright-muted'].poles.map((pole) => pole.id)).toEqual(['bright', 'muted'])
    expect(byId['contrast'].poles.map((pole) => pole.id)).toEqual(['low', 'high'])
    for (const axis of AXES) {
      expect(axis.poles).toHaveLength(2)
    }
  })
})

describe('types', () => {
  it('defines exactly twelve types, three per season', () => {
    expect(TYPES).toHaveLength(12)
    for (const season of SEASONS) {
      expect(TYPES.filter((type) => type.season === season)).toHaveLength(3)
    }
  })

  it('has unique ids and unique canonical labels', () => {
    const ids = TYPES.map((type) => type.id)
    const labels = TYPES.map((type) => type.label)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('uses valid seasons, dominant axes and alias lists', () => {
    for (const type of TYPES) {
      expect(SEASONS).toContain(type.season)
      expect(AXES.map((axis) => axis.id)).toContain(type.dominant_axis)
      expect(Array.isArray(type.aliases)).toBe(true)
      expect(type.label.startsWith(type.season)).toBe(true)
    }
  })

  it('matches each dominant axis to its subtype', () => {
    const expected: Record<string, string> = {
      Warm: 'warm-cool',
      Cool: 'warm-cool',
      Light: 'light-deep',
      Deep: 'light-deep',
      Bright: 'bright-muted',
      Mute: 'bright-muted',
    }
    for (const type of TYPES) {
      const subtype = type.label.split(' ')[1] as string
      expect(type.dominant_axis).toBe(expected[subtype])
    }
  })

  it('resolves every canonical id', () => {
    for (const type of TYPES) {
      expect(getTypeById(type.id)).toBe(type)
    }
  })

  it('resolves every alias in any casing to its canonical type', () => {
    for (const type of TYPES) {
      expect(getTypeByLabel(type.label)).toBe(type)
      expect(getTypeByLabel(type.label.toUpperCase())).toBe(type)
      for (const alias of type.aliases) {
        expect(getTypeByLabel(alias)).toBe(type)
        expect(getTypeByLabel(alias.toLowerCase())).toBe(type)
        expect(getTypeByLabel(`  ${alias.toUpperCase()}  `)).toBe(type)
      }
    }
  })

  it('maps the known synonym families', () => {
    expect(getTypeByLabel('Spring Clear')?.id).toBe('spring-bright')
    expect(getTypeByLabel('spring vivid')?.id).toBe('spring-bright')
    expect(getTypeByLabel('WINTER STRONG')?.id).toBe('winter-bright')
    expect(getTypeByLabel('Summer Soft')?.id).toBe('summer-mute')
    expect(getTypeByLabel('autumn dark')?.id).toBe('autumn-deep')
    expect(getTypeByLabel('Winter Dark')?.id).toBe('winter-deep')
  })

  it('returns undefined for unknown ids and labels', () => {
    expect(getTypeById('does-not-exist')).toBeUndefined()
    expect(getTypeByLabel('does-not-exist')).toBeUndefined()
  })
})

describe('classifier result', () => {
  const valid: ClassifierResult = {
    season: 'Summer',
    dominant_axis: 'warm-cool',
    label: 'Summer Cool',
    confidence: 0.72,
    secondary_types: ['summer-mute', 'summer-light'],
  }

  it('accepts a well-formed result', () => {
    expect(isValidClassifierResult(valid)).toBe(true)
    expect(validateClassifierResult(valid).errors).toEqual([])
  })

  it('accepts boundaries and alias labels', () => {
    expect(isValidClassifierResult({ ...valid, confidence: 0 })).toBe(true)
    expect(isValidClassifierResult({ ...valid, confidence: 1 })).toBe(true)
    expect(
      isValidClassifierResult({
        ...valid,
        label: 'Summer Soft',
        dominant_axis: 'bright-muted',
        secondary_types: [],
      }),
    ).toBe(true)
  })

  it('rejects out-of-range confidence', () => {
    expect(isValidClassifierResult({ ...valid, confidence: 1.01 })).toBe(false)
    expect(isValidClassifierResult({ ...valid, confidence: -0.01 })).toBe(false)
    expect(isValidClassifierResult({ ...valid, confidence: Number.NaN })).toBe(false)
  })

  it('rejects unknown, self and excessive secondary ids', () => {
    expect(isValidClassifierResult({ ...valid, secondary_types: ['nope'] })).toBe(false)
    expect(isValidClassifierResult({ ...valid, secondary_types: ['summer-cool'] })).toBe(false)
    expect(
      isValidClassifierResult({
        ...valid,
        secondary_types: ['summer-mute', 'summer-light', 'winter-cool'],
      }),
    ).toBe(false)
  })

  it('rejects a label that disagrees with the season or axis', () => {
    expect(isValidClassifierResult({ ...valid, season: 'Winter' })).toBe(false)
    expect(isValidClassifierResult({ ...valid, dominant_axis: 'light-deep' })).toBe(false)
    expect(isValidClassifierResult({ ...valid, label: 'not a type' })).toBe(false)
  })
})

describe('palettes', () => {
  it('covers all twelve types', () => {
    expect(PALETTES).toHaveLength(12)
    for (const type of TYPES) {
      expect(getPalette(type.id)?.typeId).toBe(type.id)
    }
  })

  it('has complete groups with valid hex and substitutes', () => {
    for (const type of TYPES) {
      const palette = getPalette(type.id)
      expect(palette).toBeDefined()
      if (!palette) {
        continue
      }
      expect(palette.best.length).toBeGreaterThanOrEqual(6)
      expect(palette.worst.length).toBeGreaterThanOrEqual(4)
      expect(palette.neutral.length).toBeGreaterThanOrEqual(4)
      for (const entry of bestAndNeutral(palette)) {
        expect(entry.name.trim().length).toBeGreaterThan(0)
        expect(isValidHex(entry.hex)).toBe(true)
      }
      for (const entry of palette.worst) {
        expect(isValidHex(entry.hex)).toBe(true)
        expect(isValidHex(entry.substitute.hex)).toBe(true)
        expect(entry.substitute.name.trim().length).toBeGreaterThan(0)
      }
      expect(isValidPalette(palette)).toBe(true)
    }
  })

  it('keeps warm types warm-hued and cool types cool-hued', () => {
    for (const type of TYPES) {
      const palette = getPalette(type.id)
      if (!palette) {
        continue
      }
      for (const entry of bestAndNeutral(palette)) {
        const { h } = hexToHsl(entry.hex)
        if (WARM_SEASONS.has(type.season)) {
          expect(h < 60 || h >= 330).toBe(true)
        } else {
          expect(COOL_SEASONS.has(type.season)).toBe(true)
          expect(h > 150 && h < 300).toBe(true)
        }
      }
    }
  })

  it('keeps bright types higher-chroma than muted types across best and neutral', () => {
    const saturation = (poles: string[]) =>
      TYPES.filter((type) => poles.includes(type.dominant_pole)).flatMap((type) => {
        const palette = getPalette(type.id)
        return palette ? bestAndNeutral(palette).map((entry) => hexToHsl(entry.hex).s) : []
      })
    const bright = saturation(['bright'])
    const muted = saturation(['muted'])
    expect(Math.min(...bright)).toBeGreaterThan(Math.max(...muted))
  })

  it('keeps light types higher-value than deep types across best and neutral', () => {
    const lightness = (poles: string[]) =>
      TYPES.filter((type) => poles.includes(type.dominant_pole)).flatMap((type) => {
        const palette = getPalette(type.id)
        return palette ? bestAndNeutral(palette).map((entry) => hexToHsl(entry.hex).l) : []
      })
    const light = lightness(['light'])
    const deep = lightness(['deep'])
    expect(Math.min(...light)).toBeGreaterThan(Math.max(...deep))
  })
})

describe('styling', () => {
  it('covers every category for every type', () => {
    for (const type of TYPES) {
      const guidance = getStyling(type.id)
      expect(guidance).toBeDefined()
      if (!guidance) {
        continue
      }
      for (const category of STYLING_CATEGORIES) {
        expect(guidance[category].trim().length).toBeGreaterThan(0)
      }
      expect(Object.keys(guidance).sort()).toEqual([...STYLING_CATEGORIES].sort())
    }
    expect(Object.keys(STYLING)).toHaveLength(12)
  })

  it('avoids medical language and color-psychology claims', () => {
    const banned = [
      'medical',
      'diagnos',
      'treat',
      'therapy',
      'therapeutic',
      'heal',
      'calm',
      'energiz',
      'energy',
      'mood',
      'psycholog',
    ]
    for (const guidance of Object.values(STYLING)) {
      const text = Object.values(guidance).join(' ').toLowerCase()
      for (const word of banned) {
        expect(text).not.toContain(word)
      }
    }
  })
})

describe('validation helpers', () => {
  it('accepts well-formed hex and rejects malformed hex', () => {
    expect(isValidHex('#a1b2c3')).toBe(true)
    expect(isValidHex('#A1B2C3')).toBe(true)
    expect(isValidHex('#abc')).toBe(false)
    expect(isValidHex('a1b2c3')).toBe(false)
    expect(isValidHex('#gggggg')).toBe(false)
    expect(isValidHex(123 as unknown)).toBe(false)
  })

  it('rejects incomplete or malformed palettes', () => {
    const incomplete = {
      typeId: 'spring-warm',
      best: [{ name: 'Coral', hex: '#e27e5a' }],
      worst: [],
      neutral: [],
    } as unknown as Palette
    expect(isValidPalette(incomplete)).toBe(false)
    expect(validatePalette(incomplete).errors.length).toBeGreaterThan(0)

    const badHex = {
      typeId: 'spring-warm',
      best: Array.from({ length: 6 }, () => ({ name: 'Bad', hex: '#zzzzzz' })),
      worst: [],
      neutral: [],
    } as unknown as Palette
    expect(isValidPalette(badHex)).toBe(false)
  })
})

describe('helper determinism and unknown lookups', () => {
  it('returns empty/undefined without throwing for unknown ids', () => {
    expect(getTypeById('missing')).toBeUndefined()
    expect(getTypeByLabel('missing')).toBeUndefined()
    expect(getPalette('missing')).toBeUndefined()
    expect(getStyling('missing')).toBeUndefined()
  })

  it('returns deeply equal results across repeated calls', () => {
    expect(getAllTypes()).toEqual(getAllTypes())
    expect(getTypeById('winter-bright')).toEqual(getTypeById('winter-bright'))
    expect(getPalette('autumn-deep')).toEqual(getPalette('autumn-deep'))
    expect(getStyling('summer-light')).toEqual(getStyling('summer-light'))
    expect(getPalette('winter-bright')).toEqual(
      JSON.parse(JSON.stringify(getPalette('winter-bright'))),
    )
  })
})
