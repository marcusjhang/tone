import { describe, expect, it } from 'vitest'
import { PREP_CHECKLIST } from './prepChecklist'

describe('PREP_CHECKLIST', () => {
  it('is a stable, ordered list of five unique items', () => {
    expect(PREP_CHECKLIST).toHaveLength(5)

    const ids = PREP_CHECKLIST.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)

    expect(PREP_CHECKLIST[0]?.label).toBe('Bare face')
    expect(PREP_CHECKLIST[PREP_CHECKLIST.length - 1]?.label).toBe(
      'Beauty mode and filters turned off',
    )
  })
})
