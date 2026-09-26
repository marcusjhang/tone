import { describe, expect, it } from 'vitest'
import { rgbToLab } from './lab'
import { robustAverage, sampleRegions } from './sample'
import {
  FACE_COLORS,
  makeFaceImage,
  makeFaceLandmarks,
  makeImage,
  makeLandmarks,
  paintRect,
} from '../test/fixtures'

describe('robustAverage', () => {
  it('recovers the planted value and rejects outliers', () => {
    expect(robustAverage([10, 10, 10], 0.2)).toBeCloseTo(10, 6)
    expect(robustAverage([0, 10, 10, 10, 255], 0.2)).toBeCloseTo(10, 6)
    expect(robustAverage([], 0.2)).toBe(0)
  })
})

describe('sampleRegions', () => {
  it('recovers a planted flat color for every region', () => {
    const image = makeFaceImage(60)
    const landmarks = makeFaceLandmarks()
    const regions = sampleRegions(image, landmarks)

    expect(regions.skin.rgb).toEqual(FACE_COLORS.skin)
    expect(regions.hair.rgb).toEqual(FACE_COLORS.hair)
    expect(regions.iris.rgb).toEqual(FACE_COLORS.iris)
    expect(regions.lips.rgb).toEqual(FACE_COLORS.lips)
  })

  it('returns an estimated Lab for skin alongside the RGB', () => {
    const image = makeImage(40, 40, { r: 210, g: 165, b: 135 })
    const regions = sampleRegions(image, makeLandmarks())
    expect(regions.skin.samples).toBeGreaterThan(0)
    expect(regions.skin.rgb).toEqual({ r: 210, g: 165, b: 135 })
    expect(regions.skin.lab).toEqual(rgbToLab({ r: 210, g: 165, b: 135 }))
  })

  it('ignores isolated bad pixels via trimming', () => {
    const image = makeImage(30, 30, { r: 120, g: 110, b: 100 })
    paintRect(image, 15, 15, 15, 15, { r: 0, g: 0, b: 0 })
    paintRect(image, 14, 14, 14, 14, { r: 255, g: 255, b: 255 })
    const regions = sampleRegions(image, makeLandmarks())
    expect(regions.skin.rgb).toEqual({ r: 120, g: 110, b: 100 })
  })

  it('is deterministic across repeated calls', () => {
    const image = makeFaceImage(60)
    const landmarks = makeFaceLandmarks()
    const first = sampleRegions(image, landmarks)
    const second = sampleRegions(image, landmarks)
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })
})
