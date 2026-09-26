import { describe, expect, it } from 'vitest'
import {
  TYPE_PROTOTYPES,
  classifyAxisScores,
  stabilizeScore,
  type AxisScores,
} from './classifier'
import { getTypeById, TYPES } from './types'
import { isValidClassifierResult } from './classifier'

function distance(left: AxisScores, right: AxisScores): number {
  return Math.hypot(
    left.warmth - right.warmth,
    left.value - right.value,
    left.chroma - right.chroma,
    left.contrast - right.contrast,
  )
}

function snap(scores: AxisScores): AxisScores {
  return {
    warmth: stabilizeScore(scores.warmth),
    value: stabilizeScore(scores.value),
    chroma: stabilizeScore(scores.chroma),
    contrast: stabilizeScore(scores.contrast),
  }
}

function closestPair(): [AxisScores, AxisScores] {
  let best: { gap: number; left: AxisScores; right: AxisScores } | null = null
  for (let i = 0; i < TYPE_PROTOTYPES.length; i += 1) {
    for (let j = i + 1; j < TYPE_PROTOTYPES.length; j += 1) {
      const gap = distance(TYPE_PROTOTYPES[i].scores, TYPE_PROTOTYPES[j].scores)
      if (!best || gap < best.gap) {
        best = { gap, left: TYPE_PROTOTYPES[i].scores, right: TYPE_PROTOTYPES[j].scores }
      }
    }
  }
  if (!best) {
    throw new Error('no prototype pair')
  }
  return [best.left, best.right]
}

describe('classifyAxisScores', () => {
  it('defines one prototype per type', () => {
    expect(TYPE_PROTOTYPES).toHaveLength(12)
    expect(new Set(TYPE_PROTOTYPES.map((prototype) => prototype.typeId)).size).toBe(12)
  })

  it('reaches all twelve types from their prototype inputs', () => {
    const reached = new Set<string>()
    for (const prototype of TYPE_PROTOTYPES) {
      const type = getTypeById(prototype.typeId)
      expect(type).toBeDefined()
      const result = classifyAxisScores(prototype.scores)
      expect(result.label).toBe(type?.label)
      expect(result.season).toBe(type?.season)
      expect(result.dominant_axis).toBe(type?.dominant_axis)
      expect(isValidClassifierResult(result)).toBe(true)
      reached.add(result.label)
    }
    expect(reached.size).toBe(12)
    expect(new Set(reached)).toEqual(new Set(TYPES.map((type) => type.label)))
  })

  it('returns byte-identical results across repeated calls', () => {
    const input: AxisScores = { warmth: 0.42, value: 0.63, chroma: 0.31, contrast: 0.58 }
    expect(JSON.stringify(classifyAxisScores(input))).toBe(JSON.stringify(classifyAxisScores(input)))
    for (const prototype of TYPE_PROTOTYPES) {
      const first = classifyAxisScores(prototype.scores)
      const second = classifyAxisScores(prototype.scores)
      expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    }
  })

  it('lists the next two closest types as distinct secondaries', () => {
    for (const prototype of TYPE_PROTOTYPES) {
      const result = classifyAxisScores(prototype.scores)
      expect(result.secondary_types).toHaveLength(2)
      expect(new Set(result.secondary_types).size).toBe(2)
      expect(result.secondary_types).not.toContain(
        getTypeById(prototype.typeId)?.id,
      )
      expect(isValidClassifierResult(result)).toBe(true)
    }
  })

  it('reports finite confidence in 0..1 for arbitrary inputs', () => {
    const inputs: AxisScores[] = [
      { warmth: 0, value: 0, chroma: 0, contrast: 0 },
      { warmth: 1, value: 1, chroma: 1, contrast: 1 },
      { warmth: 0.5, value: 0.5, chroma: 0.5, contrast: 0.5 },
    ]
    for (const input of inputs) {
      const result = classifyAxisScores(input)
      expect(Number.isFinite(result.confidence)).toBe(true)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('drops confidence toward a boundary and keeps the label stable under small noise', () => {
    const [left, right] = closestPair()
    const midpoint = snap({
      warmth: (left.warmth + right.warmth) / 2,
      value: (left.value + right.value) / 2,
      chroma: (left.chroma + right.chroma) / 2,
      contrast: (left.contrast + right.contrast) / 2,
    })

    const boundary = classifyAxisScores(midpoint)
    const atPrototype = Math.max(
      classifyAxisScores(left).confidence,
      classifyAxisScores(right).confidence,
    )
    expect(boundary.confidence).toBeLessThan(atPrototype)

    const noise: AxisScores = {
      warmth: midpoint.warmth + 0.02,
      value: midpoint.value - 0.02,
      chroma: midpoint.chroma + 0.02,
      contrast: midpoint.contrast - 0.02,
    }
    expect(classifyAxisScores(noise).label).toBe(boundary.label)
  })

  it('snaps perturbations below half a grid cell to the same score', () => {
    const value = 0.6
    const snapped = stabilizeScore(value)
    expect(stabilizeScore(value + 0.02)).toBe(snapped)
    expect(stabilizeScore(value - 0.02)).toBe(snapped)
  })
})
