import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FaceDetector } from '../camera/faceDetector'
import { CaptureStoreProvider, useCaptureStore } from '../state/captureStore'
import { renderApp } from '../test/renderApp'
import { Camera } from './Camera'

function fakeStream(): MediaStream {
  return { getTracks: () => [] } as unknown as MediaStream
}

function solidImageData(r: number, g: number, b: number, size = 4): ImageData {
  const data = new Uint8ClampedArray(size * size * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  return { data, width: size, height: size } as unknown as ImageData
}

function centeredFace(): ReturnType<FaceDetector['detect']> {
  return [{ centerX: 0.5, centerY: 0.5, width: 0.4, height: 0.5 }]
}

function Probe() {
  const { capturedFrame } = useCaptureStore()
  return (
    <span data-testid="captured">
      {capturedFrame ? `${capturedFrame.width}x${capturedFrame.height}` : 'none'}
    </span>
  )
}

describe('camera screen', () => {
  it('renders the guided camera screen inside the app shell without the placeholder', () => {
    renderApp('/camera')

    expect(screen.getByRole('heading', { name: 'Camera' })).toBeInTheDocument()
    expect(screen.getByLabelText('Live camera preview')).toBeInTheDocument()
    expect(screen.getByTestId('face-guide')).toBeInTheDocument()
    expect(screen.queryByText(/placeholder for a later milestone/i)).toBeNull()
  })

  it('shows a clear message and retry action when permission is denied, and retries', async () => {
    const requestStream = vi
      .fn<() => Promise<MediaStream>>()
      .mockRejectedValue(Object.assign(new Error('denied'), { name: 'NotAllowedError' }))

    render(
      <CaptureStoreProvider>
        <Camera requestStream={requestStream} />
      </CaptureStoreProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/denied/i))
    const retry = screen.getByRole('button', { name: /retry camera/i })
    await userEvent.click(retry)
    await waitFor(() => expect(requestStream).toHaveBeenCalledTimes(2))
  })

  it('shows a clear message and retry action when no camera exists', async () => {
    const requestStream = vi
      .fn<() => Promise<MediaStream>>()
      .mockRejectedValue(Object.assign(new Error('missing'), { name: 'NotFoundError' }))

    render(
      <CaptureStoreProvider>
        <Camera requestStream={requestStream} />
      </CaptureStoreProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no camera/i))
    expect(screen.getByRole('button', { name: /retry camera/i })).toBeInTheDocument()
  })

  it('enables the shutter when checks pass and stores the captured frame in memory', async () => {
    const detector: FaceDetector = { detect: () => centeredFace(), close: vi.fn() }

    render(
      <CaptureStoreProvider>
        <Camera
          requestStream={async () => fakeStream()}
          createFaceDetector={async () => detector}
          captureFrame={() => solidImageData(200, 200, 200)}
        />
        <Probe />
      </CaptureStoreProvider>,
    )

    const shutter = screen.getByRole('button', { name: /take photo/i })
    await waitFor(() => expect(shutter).toBeEnabled(), { timeout: 3000 })

    await userEvent.click(shutter)

    await waitFor(() => expect(screen.getByTestId('captured')).toHaveTextContent('4x4'))
  })

  it('keeps the shutter disabled and shows a reason when no face is detected', async () => {
    const detector: FaceDetector = { detect: () => [], close: vi.fn() }

    render(
      <CaptureStoreProvider>
        <Camera
          requestStream={async () => fakeStream()}
          createFaceDetector={async () => detector}
          captureFrame={() => solidImageData(200, 200, 200)}
        />
      </CaptureStoreProvider>,
    )

    await waitFor(() =>
      expect(screen.getAllByText(/center your face inside the outline/i).length).toBeGreaterThan(0),
    )
    expect(screen.getByRole('button', { name: /take photo/i })).toBeDisabled()
  })
})
