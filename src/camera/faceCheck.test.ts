import { describe, expect, it } from 'vitest'
import { evaluateFaceCheck, type FaceObservation } from './faceCheck'

function face(overrides: Partial<FaceObservation> = {}): FaceObservation {
  return { centerX: 0.5, centerY: 0.5, width: 0.4, height: 0.5, ...overrides }
}

describe('evaluateFaceCheck', () => {
  it('passes with exactly one centered face', () => {
    const result = evaluateFaceCheck([face()])
    expect(result.pass).toBe(true)
    expect(result.count).toBe(1)
  })

  it('fails when no face is present', () => {
    const result = evaluateFaceCheck([])
    expect(result.pass).toBe(false)
    expect(result.reason).toBeTruthy()
  })

  it('fails when more than one face is present', () => {
    const result = evaluateFaceCheck([face(), face({ centerX: 0.2 })])
    expect(result.pass).toBe(false)
    expect(result.count).toBe(2)
  })

  it('fails when a single face is outside the centering tolerance', () => {
    const result = evaluateFaceCheck([face({ centerX: 0.5 + 0.2 })])
    expect(result.pass).toBe(false)
  })

  it('fails when the single face is too small', () => {
    const result = evaluateFaceCheck([face({ width: 0.05, height: 0.05 })])
    expect(result.pass).toBe(false)
  })

  it('is deterministic for identical input', () => {
    const input = [face({ centerX: 0.48, centerY: 0.52 })]
    expect(evaluateFaceCheck(input)).toEqual(evaluateFaceCheck(input))
  })
})
