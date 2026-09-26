import type { AxisId, AxisPole } from './axes'

export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const

export type Season = (typeof SEASONS)[number]

export interface ColorType {
  readonly id: string
  readonly season: Season
  readonly dominant_axis: AxisId
  readonly dominant_pole: AxisPole
  readonly label: string
  readonly aliases: readonly string[]
}

export const TYPES: readonly ColorType[] = [
  {
    id: 'spring-warm',
    season: 'Spring',
    dominant_axis: 'warm-cool',
    dominant_pole: 'warm',
    label: 'Spring Warm',
    aliases: [],
  },
  {
    id: 'spring-light',
    season: 'Spring',
    dominant_axis: 'light-deep',
    dominant_pole: 'light',
    label: 'Spring Light',
    aliases: [],
  },
  {
    id: 'spring-bright',
    season: 'Spring',
    dominant_axis: 'bright-muted',
    dominant_pole: 'bright',
    label: 'Spring Bright',
    aliases: ['Spring Clear', 'Spring Vivid', 'Spring Strong'],
  },
  {
    id: 'summer-cool',
    season: 'Summer',
    dominant_axis: 'warm-cool',
    dominant_pole: 'cool',
    label: 'Summer Cool',
    aliases: [],
  },
  {
    id: 'summer-light',
    season: 'Summer',
    dominant_axis: 'light-deep',
    dominant_pole: 'light',
    label: 'Summer Light',
    aliases: [],
  },
  {
    id: 'summer-mute',
    season: 'Summer',
    dominant_axis: 'bright-muted',
    dominant_pole: 'muted',
    label: 'Summer Mute',
    aliases: ['Summer Soft'],
  },
  {
    id: 'autumn-warm',
    season: 'Autumn',
    dominant_axis: 'warm-cool',
    dominant_pole: 'warm',
    label: 'Autumn Warm',
    aliases: [],
  },
  {
    id: 'autumn-deep',
    season: 'Autumn',
    dominant_axis: 'light-deep',
    dominant_pole: 'deep',
    label: 'Autumn Deep',
    aliases: ['Autumn Dark'],
  },
  {
    id: 'autumn-mute',
    season: 'Autumn',
    dominant_axis: 'bright-muted',
    dominant_pole: 'muted',
    label: 'Autumn Mute',
    aliases: ['Autumn Soft'],
  },
  {
    id: 'winter-cool',
    season: 'Winter',
    dominant_axis: 'warm-cool',
    dominant_pole: 'cool',
    label: 'Winter Cool',
    aliases: [],
  },
  {
    id: 'winter-deep',
    season: 'Winter',
    dominant_axis: 'light-deep',
    dominant_pole: 'deep',
    label: 'Winter Deep',
    aliases: ['Winter Dark'],
  },
  {
    id: 'winter-bright',
    season: 'Winter',
    dominant_axis: 'bright-muted',
    dominant_pole: 'bright',
    label: 'Winter Bright',
    aliases: ['Winter Clear', 'Winter Vivid', 'Winter Strong'],
  },
]

export function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

const TYPE_BY_ID = new Map<string, ColorType>(TYPES.map((type) => [type.id, type]))

const TYPE_BY_LABEL = new Map<string, ColorType>()
for (const type of TYPES) {
  TYPE_BY_LABEL.set(normalizeLabel(type.label), type)
  for (const alias of type.aliases) {
    TYPE_BY_LABEL.set(normalizeLabel(alias), type)
  }
}

export function getTypeById(id: string): ColorType | undefined {
  return TYPE_BY_ID.get(id)
}

export function getTypeByLabel(label: string): ColorType | undefined {
  return TYPE_BY_LABEL.get(normalizeLabel(label))
}

export function getAllTypes(): readonly ColorType[] {
  return TYPES
}
