export const AXIS_IDS = [
  'warm-cool',
  'light-deep',
  'bright-muted',
  'contrast',
] as const

export type AxisId = (typeof AXIS_IDS)[number]

export type WarmCoolPole = 'warm' | 'cool'
export type LightDeepPole = 'light' | 'deep'
export type BrightMutedPole = 'bright' | 'muted'
export type ContrastPole = 'low' | 'high'

export type AxisPole = WarmCoolPole | LightDeepPole | BrightMutedPole | ContrastPole

export interface AxisPoleDefinition {
  readonly id: AxisPole
  readonly label: string
}

export interface Axis {
  readonly id: AxisId
  readonly label: string
  readonly poles: readonly [AxisPoleDefinition, AxisPoleDefinition]
}

export const AXES: readonly Axis[] = [
  {
    id: 'warm-cool',
    label: 'Warm \u2194 Cool',
    poles: [
      { id: 'warm', label: 'Warm' },
      { id: 'cool', label: 'Cool' },
    ],
  },
  {
    id: 'light-deep',
    label: 'Light \u2194 Deep',
    poles: [
      { id: 'light', label: 'Light' },
      { id: 'deep', label: 'Deep' },
    ],
  },
  {
    id: 'bright-muted',
    label: 'Bright \u2194 Muted',
    poles: [
      { id: 'bright', label: 'Bright' },
      { id: 'muted', label: 'Muted' },
    ],
  },
  {
    id: 'contrast',
    label: 'Low \u2194 High Contrast',
    poles: [
      { id: 'low', label: 'Low Contrast' },
      { id: 'high', label: 'High Contrast' },
    ],
  },
]

const AXIS_BY_ID = new Map<AxisId, Axis>(AXES.map((axis) => [axis.id, axis]))

export function getAxis(id: AxisId): Axis | undefined {
  return AXIS_BY_ID.get(id)
}
