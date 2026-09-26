export interface RGB {
  readonly r: number
  readonly g: number
  readonly b: number
}

export interface Lab {
  readonly L: number
  readonly a: number
  readonly b: number
}

// CIE standard illuminant D65, normalized so that Y = 1.
const D65_X = 0.95047
const D65_Y = 1.0
const D65_Z = 1.08883

// sRGB (IEC 61966-2-1) to CIE XYZ (D65) matrix.
const M = {
  rX: 0.4124564,
  rY: 0.2126729,
  rZ: 0.0193339,
  gX: 0.3575761,
  gY: 0.7151522,
  gZ: 0.119192,
  bX: 0.1804375,
  bY: 0.072175,
  bZ: 0.9503041,
} as const

const DELTA = 6 / 29
const DELTA_CUBED = DELTA * DELTA * DELTA

function srgbToLinear(value: number): number {
  const channel = value / 255
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
}

function labF(t: number): number {
  return t > DELTA_CUBED ? Math.cbrt(t) : t / (3 * DELTA * DELTA) + 4 / 29
}

/** Convert an sRGB color with 0-255 channels to CIE L*a*b* under D65. */
export function rgbToLab(rgb: RGB): Lab {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)

  const x = (M.rX * r + M.gX * g + M.bX * b) / D65_X
  const y = (M.rY * r + M.gY * g + M.bY * b) / D65_Y
  const z = (M.rZ * r + M.gZ * g + M.bZ * b) / D65_Z

  const fx = labF(x)
  const fy = labF(y)
  const fz = labF(z)

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

/** Chroma (colorfulness) of a Lab triple: sqrt(a*^2 + b*^2). */
export function chroma(lab: Lab): number {
  return Math.hypot(lab.a, lab.b)
}

/** Hue angle of a Lab triple in degrees, normalized to [0, 360). */
export function hueAngle(lab: Lab): number {
  const degrees = (Math.atan2(lab.b, lab.a) * 180) / Math.PI
  return ((degrees % 360) + 360) % 360
}

/** Individual Typology Angle in degrees. Positive is lighter, negative darker. */
export function ita(lab: Lab): number {
  return (Math.atan2(lab.L - 50, lab.b) * 180) / Math.PI
}
