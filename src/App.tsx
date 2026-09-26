import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Landing } from './screens/Landing'
import { Prep } from './screens/Prep'
import { Camera } from './screens/Camera'
import { CaptureStoreProvider } from './state/captureStore'

export function App() {
  return (
    <CaptureStoreProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/prep" element={<Prep />} />
          <Route path="/camera" element={<Camera />} />
        </Route>
      </Routes>
    </CaptureStoreProvider>
  )
}
