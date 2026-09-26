import { describe, expect, it } from 'vitest'
import { evaluateBeautyAdvisory } from './beauty'
import type { FramePixels } from './lighting'
import { evaluateCaptureReadiness } from './checks'
import type { FaceCheckResult } from './faceCheck'
import type { LightingCheckResult } from './lighting'

function solidFrame(r: number, g: number, b: number, size = 4): FramePixels {
  const data = new Uint8ClampedArray(size * size * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  return { data, width: size, height: size }
}

const passFace: FaceCheckResult = { pass: true, count: 1, status: 'Face detected', reason: null }
const failFace: FaceCheckResult = { pass: false, count: 0, status: 'No face', reason: 'No face' }

function lighting(pass: boolean): LightingCheckResult {
  return {
    pass,
    status: pass ? 'Lighting looks even and neutral' : 'Too dark',
    reason: pass ? null : 'Too dark',
    stats: {
      meanLuminance: pass ? 200 : 20,
      colorCast: 0,
      unevenness: 0,
      meanSaturation: 0,
      clippedFraction: 0,
    },
  }
}

describe('evaluateBeautyAdvisory', () => {
  it('does not suspect a filter on a neutral frame', () => {
    expect(evaluateBeautyAdvisory(solidFrame(150, 140, 135)).suspected).toBe(false)
  })

  it('surfaces an advisory for a heavily saturated frame', () => {
    const advisory = evaluateBeautyAdvisory(solidFrame(255, 0, 0))
    expect(advisory.suspected).toBe(true)
    expect(advisory.message).toBeTruthy()
  })
})

describe('evaluateCaptureReadiness', () => {
  it('enables the shutter only when face and lighting both pass', () => {
    const readiness = evaluateCaptureReadiness(passFace, lighting(true))
    expect(readiness.shutterEnabled).toBe(true)
    expect(readiness.reasons).toHaveLength(0)
  })

  it('disables the shutter and explains a failing face check', () => {
    const readiness = evaluateCaptureReadiness(failFace, lighting(true))
    expect(readiness.shutterEnabled).toBe(false)
    expect(readiness.reasons).toContain('No face')
  })

  it('disables the shutter and explains a failing lighting check', () => {
    const readiness = evaluateCaptureReadiness(passFace, lighting(false))
    expect(readiness.shutterEnabled).toBe(false)
    expect(readiness.reasons).toContain('Too dark')
  })

  it('is not disabled by a beauty advisory alone', () => {
    const readiness = evaluateCaptureReadiness(passFace, lighting(true))
    expect(readiness.shutterEnabled).toBe(true)
  })

  it('stays disabled while checks are pending', () => {
    expect(evaluateCaptureReadiness(null, null).shutterEnabled).toBe(false)
  })
})
