import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/renderApp'

describe('camera screen', () => {
  it('renders a clearly labeled placeholder when loaded directly', () => {
    renderApp('/camera')

    expect(screen.getByRole('heading', { name: 'Camera' })).toBeInTheDocument()
    expect(screen.getByText(/placeholder for a later milestone/i)).toBeInTheDocument()
  })
})
