import type { AxisScores, ClassifierResult } from '../domain/classifier'
import { classifyAxisScores } from '../domain/classifier'
import type { ImageDataLike, Landmark, RegionSamples, SampleOptions } from './sample'
import { sampleRegions } from './sample'
import { computeAxisScores } from './scores'

export interface AnalysisResult {
  readonly regions: RegionSamples
  readonly scores: AxisScores
  readonly result: ClassifierResult
}

/**
 * Full pure pipeline: captured frame + landmarks -> region colors -> axis
 * scores -> classified type. No camera, DOM, network or randomness involved.
 */
export function analyzeImage(
  image: ImageDataLike,
  landmarks: readonly Landmark[],
  options: SampleOptions = {},
): AnalysisResult {
  const regions = sampleRegions(image, landmarks, options)
  const scores = computeAxisScores({
    skin: regions.skin.lab,
    hair: regions.hair.lab,
    iris: regions.iris.lab,
  })
  const result = classifyAxisScores(scores)
  return { regions, scores, result }
}
