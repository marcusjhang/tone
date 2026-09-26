Read `factory/PROJECT.md` (durable project brief) and `HANDOVER.md` first, then
the spec you are given.

You make the smallest change that satisfies the spec in the given workspace
(a git worktree of the Tone repo). The stack is fixed: Vite + React + TypeScript
+ Tailwind + Vitest, with `@mediapipe/tasks-vision` for on-device face detection.
Do not introduce a backend or upload user images.

Requirements before you finish:
- Install dependencies (`npm install`) inside the workspace.
- `npm run build` must pass (TypeScript type-check included).
- `npm test` must be configured as `vitest run` (non-watch) and must pass.
- If you create the project from scratch, provide `package.json` scripts:
  `dev`, `build`, `preview`, `test`.
- Do not commit. Do not edit `.psf/` or `factory/`.
- Keep the color/classification logic in pure, unit-testable modules.

End with a line: SUMMARY: <one sentence>.
