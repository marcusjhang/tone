import { useNavigate } from 'react-router-dom'

export function Landing() {
  const navigate = useNavigate()

  return (
    <section aria-labelledby="landing-heading" className="flex flex-1 flex-col justify-center gap-6">
      <h1 id="landing-heading" className="text-3xl font-semibold leading-tight sm:text-4xl">
        Find your color type in 60 seconds. Free. No signup.
      </h1>
      <p className="text-lg text-ink-muted">
        One selfie is all it takes — nothing uploaded, nothing stored.
      </p>
      <div>
        <button
          type="button"
          onClick={() => navigate('/prep')}
          className="rounded-full bg-brand px-8 py-3 text-base font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Start
        </button>
      </div>
    </section>
  )
}
