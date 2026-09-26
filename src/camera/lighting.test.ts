import { describe, expect, it } from 'vitest'
import { classifyLighting, type FramePixels } from './lighting'

function solidFrame(r: number, g: number, b: number, width = 4, height = 4): FramePixels {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  return { data, width, height }
}

function splitFrame(left: number, right: number, width = 4, height = 4): FramePixels {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      const value = x < width / 2 ? left : right
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
  }
  return { data, width, height }
}

describe('classifyLighting', () => {
  it('passes a neutral, adequately lit frame', () => {
    const result = classifyLighting(solidFrame(200, 200, 200))
    expect(result.pass).toBe(true)
    expect(result.reason).toBeNull()
  })

  it('fails a low-light frame with a human-readable status', () => {
    const result = classifyLighting(solidFrame(20, 20, 20))
    expect(result.pass).toBe(false)
    expect(result.status.length).toBeGreaterThan(0)
    expect(result.reason).toBeTruthy()
  })

  it('fails a strongly color-cast frame', () => {
    const result = classifyLighting(solidFrame(180, 120, 120))
    expect(result.pass).toBe(false)
    expect(result.stats.colorCast).toBeGreaterThan(0.2)
  })

  it('fails a mixed, unevenly lit frame', () => {
    const result = classifyLighting(splitFrame(220, 40))
    expect(result.pass).toBe(false)
    expect(result.stats.unevenness).toBeGreaterThan(0.25)
  })

  it('is deterministic for identical input', () => {
    const frame = splitFrame(180, 70)
    expect(classifyLighting(frame)).toEqual(classifyLighting(frame))
  })
})
