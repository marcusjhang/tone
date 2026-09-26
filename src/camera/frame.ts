export function captureFrame(
  video: HTMLVideoElement,
  canvas?: HTMLCanvasElement,
): ImageData | null {
  const width = video.videoWidth
  const height = video.videoHeight
  if (!width || !height) {
    return null
  }

  const target = canvas ?? document.createElement('canvas')
  target.width = width
  target.height = height

  const context = target.getContext('2d')
  if (!context) {
    return null
  }

  context.drawImage(video, 0, 0, width, height)
  return context.getImageData(0, 0, width, height)
}
