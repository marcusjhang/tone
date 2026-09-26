import { Link, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-content items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Tone
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-content flex-1 flex-col px-6 py-12">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10">
        <div className="mx-auto w-full max-w-content px-6 py-6 text-sm text-ink-muted">
          Tone is a styling suggestion, not a medical diagnosis. Your photo is
          processed on your device and never uploaded.
        </div>
      </footer>
    </div>
  )
}
