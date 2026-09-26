import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface CapturedFrame {
  imageData: ImageData
  width: number
  height: number
  capturedAt: number
}

export interface CaptureStoreValue {
  capturedFrame: CapturedFrame | null
  setCapturedFrame: (frame: CapturedFrame | null) => void
}

const CaptureStoreContext = createContext<CaptureStoreValue | null>(null)

export function CaptureStoreProvider({ children }: { children: ReactNode }) {
  const [capturedFrame, setCapturedFrame] = useState<CapturedFrame | null>(null)

  const value = useMemo<CaptureStoreValue>(
    () => ({ capturedFrame, setCapturedFrame }),
    [capturedFrame],
  )

  return <CaptureStoreContext.Provider value={value}>{children}</CaptureStoreContext.Provider>
}

export function useCaptureStore(): CaptureStoreValue {
  const value = useContext(CaptureStoreContext)
  if (!value) {
    throw new Error('useCaptureStore must be used within a CaptureStoreProvider')
  }
  return value
}
