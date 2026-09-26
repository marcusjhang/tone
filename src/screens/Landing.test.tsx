import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'

describe('landing screen', () => {
  it('renders the headline, one supporting line, and a single primary Start button', () => {
    renderApp('/')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Find your color type in 60 seconds. Free. No signup.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/one selfie is all it takes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('navigates to the prep checklist when Start is activated', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: 'Start' }))

    expect(
      await screen.findByRole('heading', { name: 'Get ready for your photo' }),
    ).toBeInTheDocument()
  })
})
