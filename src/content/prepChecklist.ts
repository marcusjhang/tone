export interface PrepChecklistItem {
  id: string
  label: string
  detail: string
}

export const PREP_CHECKLIST: readonly PrepChecklistItem[] = [
  {
    id: 'bare-face',
    label: 'Bare face',
    detail: 'No makeup. Moisturizer is fine if your skin feels dry.',
  },
  {
    id: 'no-lenses-or-glasses',
    label: 'No colored contacts or glasses',
    detail: 'They tint your eyes and cast shadows on your skin.',
  },
  {
    id: 'hair-back',
    label: 'Hair pulled back',
    detail: 'Keep your hair away from your face and neck.',
  },
  {
    id: 'daylight',
    label: 'Face a window or even light — no lamps and no shade',
    detail: 'Natural, even daylight only. Avoid lamps, shade, and mixed light.',
  },
  {
    id: 'no-filters',
    label: 'Beauty mode and filters turned off',
    detail: 'Turn off beauty mode, smoothing, and any camera filter.',
  },
]
