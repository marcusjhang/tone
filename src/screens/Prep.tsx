import { useNavigate } from 'react-router-dom'
import { PREP_CHECKLIST } from '../content/prepChecklist'

export function Prep() {
  const navigate = useNavigate()

  return (
    <section aria-labelledby="prep-heading" className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 id="prep-heading" className="text-3xl font-semibold leading-tight">
          Get ready for your photo
        </h1>
        <p className="text-ink-muted">
          A few quick checks make your result much more reliable.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {PREP_CHECKLIST.map((item) => (
          <li key={item.id} className="flex gap-3 rounded-xl bg-brand-soft p-4">
            <span aria-hidden="true" className="mt-0.5 text-brand-dark">
              &#10003;
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{item.label}</span>
              <span className="text-sm text-ink-muted">{item.detail}</span>
            </div>
          </li>
        ))}
      </ul>

      <div>
        <button
          type="button"
          onClick={() => navigate('/camera')}
          className="rounded-full bg-brand px-8 py-3 text-base font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Continue to camera
        </button>
      </div>
    </section>
  )
}
