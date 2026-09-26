import { describe, expect, it } from 'vitest'
import { chroma, hueAngle, ita, rgbToLab } from './lab'

function expectClose(actual: number, expected: number, tolerance: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}

describe('rgbToLab', () => {
  it('converts white, black and mid gray to neutral Lab', () => {
    const white = rgbToLab({ r: 255, g: 255, b: 255 })
    expectClose(white.L, 100, 0.01)
    expectClose(white.a, 0, 0.5)
    expectClose(white.b, 0, 0.5)

    const black = rgbToLab({ r: 0, g: 0, b: 0 })
    expectClose(black.L, 0, 0.001)
    expectClose(black.a, 0, 0.001)
    expectClose(black.b, 0, 0.001)

    const gray = rgbToLab({ r: 128, g: 128, b: 128 })
    expectClose(gray.L, 53.585, 0.05)
    expectClose(gray.a, 0, 0.05)
    expectClose(gray.b, 0, 0.05)
  })

  it('matches reference D65 Lab values for the primaries', () => {
    const red = rgbToLab({ r: 255, g: 0, b: 0 })
    expectClose(red.L, 53.2408, 0.05)
    expectClose(red.a, 80.0925, 0.05)
    expectClose(red.b, 67.2032, 0.05)

    const green = rgbToLab({ r: 0, g: 255, b: 0 })
    expectClose(green.L, 87.7347, 0.05)
    expectClose(green.a, -86.1827, 0.05)
    expectClose(green.b, 83.1793, 0.05)

    const blue = rgbToLab({ r: 0, g: 0, b: 255 })
    expectClose(blue.L, 32.297, 0.05)
    expectClose(blue.a, 79.1875, 0.05)
    expectClose(blue.b, -107.8602, 0.05)
  })

  it('is deterministic across repeated calls', () => {
    const first = rgbToLab({ r: 173, g: 121, b: 88 })
    const second = rgbToLab({ r: 173, g: 121, b: 88 })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })
})

describe('color helpers', () => {
  it('computes chroma as the a*b* magnitude', () => {
    expectClose(chroma({ L: 50, a: 3, b: 4 }), 5, 0.0001)
    expectClose(chroma({ L: 50, a: 0, b: 0 }), 0, 0.0001)
  })

  it('computes hue angle in degrees normalized to [0, 360)', () => {
    expectClose(hueAngle({ L: 50, a: 1, b: 1 }), 45, 0.0001)
    expectClose(hueAngle({ L: 50, a: -1, b: -1 }), 225, 0.0001)
    expectClose(hueAngle({ L: 50, a: 0, b: 1 }), 90, 0.0001)
    expectClose(hueAngle({ L: 50, a: 0, b: -1 }), 270, 0.0001)
  })

  it('computes ITA from L* and b*', () => {
    expectClose(ita({ L: 60, a: 0, b: 10 }), 45, 0.0001)
    expectClose(ita({ L: 40, a: 0, b: 10 }), -45, 0.0001)
    expectClose(ita({ L: 50, a: 0, b: 0 }), 0, 0.0001)
  })
})
