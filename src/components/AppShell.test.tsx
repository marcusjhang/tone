import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/renderApp'

describe('app shell', () => {
  const routes = ['/', '/prep', '/camera']

  it.each(routes)('wraps %s in the shared shell', (path) => {
    renderApp(path)

    expect(screen.getByRole('link', { name: 'Tone' })).toBeInTheDocument()
    expect(screen.getByText(/not a medical diagnosis/i)).toBeInTheDocument()
  })
})
