import { describe, expect, it } from 'vitest'
import { analyzeImage } from './pipeline'
import { isValidClassifierResult } from '../domain/classifier'
import { makeFaceImage, makeFaceLandmarks, makeImage } from '../test/fixtures'

describe('analyzeImage', () => {
  it('produces byte-identical results for identical images and landmarks', () => {
    const image = makeFaceImage(60)
    const landmarks = makeFaceLandmarks()
    const first = analyzeImage(image, landmarks)
    const second = analyzeImage(image, landmarks)
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('classifies a warm, light face toward a Spring type', () => {
    const image = makeImage(60, 60, { r: 230, g: 180, b: 120 })
    const result = analyzeImage(image, makeFaceLandmarks())
    expect(result.result.season).toBe('Spring')
    expect(isValidClassifierResult(result.result)).toBe(true)
  })

  it('reports a finite confidence within 0..1', () => {
    const image = makeFaceImage(60)
    const result = analyzeImage(image, makeFaceLandmarks())
    expect(Number.isFinite(result.result.confidence)).toBe(true)
    expect(result.result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.result.confidence).toBeLessThanOrEqual(1)
  })

  it('keeps the label stable under a small, uniform pixel perturbation', () => {
    const image = makeFaceImage(60)
    const landmarks = makeFaceLandmarks()
    const before = analyzeImage(image, landmarks)

    const perturbed = makeFaceImage(60)
    for (let index = 0; index < perturbed.data.length; index += 4) {
      perturbed.data[index] = Math.min(255, perturbed.data[index] + 1)
      perturbed.data[index + 1] = Math.min(255, perturbed.data[index + 1] + 1)
      perturbed.data[index + 2] = Math.min(255, perturbed.data[index + 2] + 1)
    }
    const after = analyzeImage(perturbed, landmarks)

    expect(after.result.label).toBe(before.result.label)
  })
})
