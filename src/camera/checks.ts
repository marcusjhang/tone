import type { FaceCheckResult } from './faceCheck'
import type { LightingCheckResult } from './lighting'

export interface CaptureReadiness {
  shutterEnabled: boolean
  reasons: string[]
}

export function evaluateCaptureReadiness(
  face: FaceCheckResult | null,
  lighting: LightingCheckResult | null,
): CaptureReadiness {
  const reasons: string[] = []

  if (!face || !face.pass) {
    reasons.push(face ? (face.reason ?? face.status) : 'Waiting for face detection.')
  }

  if (!lighting || !lighting.pass) {
    reasons.push(
      lighting ? (lighting.reason ?? lighting.status) : 'Waiting for the lighting check.',
    )
  }

  return {
    shutterEnabled: Boolean(face?.pass) && Boolean(lighting?.pass),
    reasons,
  }
}
