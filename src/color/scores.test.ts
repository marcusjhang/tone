import { describe, expect, it } from 'vitest'
import type { Lab } from './lab'
import { computeAxisScores } from './scores'

const NEUTRAL: Lab = { L: 55, a: 10, b: 15 }

function withSkin(skin: Partial<Lab>) {
  return { skin: { ...NEUTRAL, ...skin }, hair: { L: 20, a: 0, b: 0 }, iris: { L: 40, a: 0, b: 0 } }
}

describe('computeAxisScores', () => {
  it('moves warmth up as skin gets yellower and undertone warms', () => {
    const warm = computeAxisScores(withSkin({ a: 12, b: 22 })).warmth
    const cool = computeAxisScores(withSkin({ a: 28, b: 6 })).warmth
    expect(warm).toBeGreaterThan(cool)
    expect(warm).toBeGreaterThan(0.5)
    expect(cool).toBeLessThan(0.5)
  })

  it('moves value up as skin lightness rises', () => {
    const light = computeAxisScores(withSkin({ L: 80 })).value
    const deep = computeAxisScores(withSkin({ L: 30 })).value
    expect(light).toBeGreaterThan(deep)
    expect(light).toBeCloseTo(0.8, 6)
    expect(deep).toBeCloseTo(0.3, 6)
  })

  it('moves chroma up as skin chroma rises', () => {
    const bright = computeAxisScores(withSkin({ a: 30, b: 25 })).chroma
    const muted = computeAxisScores(withSkin({ a: 4, b: 3 })).chroma
    expect(bright).toBeGreaterThan(muted)
  })

  it('moves contrast up as the L* spread across regions rises', () => {
    const high = computeAxisScores({
      skin: { L: 80, a: 5, b: 5 },
      hair: { L: 10, a: 0, b: 0 },
      iris: { L: 40, a: 0, b: 0 },
    }).contrast
    const low = computeAxisScores({
      skin: { L: 54, a: 5, b: 5 },
      hair: { L: 54, a: 0, b: 0 },
      iris: { L: 54, a: 0, b: 0 },
    }).contrast
    expect(high).toBeGreaterThan(low)
    expect(low).toBeCloseTo(0, 6)
  })

  it('keeps every score within 0..1 for extreme inputs', () => {
    const scores = computeAxisScores({
      skin: { L: 200, a: 400, b: 400 },
      hair: { L: -100, a: 0, b: 0 },
      iris: { L: 60, a: 0, b: 0 },
    })
    for (const score of Object.values(scores)) {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    }
  })

  it('is deterministic for identical inputs', () => {
    const first = computeAxisScores(withSkin({ L: 61, a: 14, b: 18 }))
    const second = computeAxisScores(withSkin({ L: 61, a: 14, b: 18 }))
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })
})
