import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { PREP_CHECKLIST } from '../content/prepChecklist'

describe('prep-guidance screen', () => {
  it('renders every checklist item', () => {
    renderApp('/prep')

    for (const item of PREP_CHECKLIST) {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    }
  })

  it('navigates to the camera placeholder when Continue to camera is activated', async () => {
    const user = userEvent.setup()
    renderApp('/prep')

    await user.click(screen.getByRole('button', { name: 'Continue to camera' }))

    expect(await screen.findByRole('heading', { name: 'Camera' })).toBeInTheDocument()
  })
})
