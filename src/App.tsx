import { Route, Routes } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { IndexPage } from './pages/IndexPage'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<IndexPage />} />
      </Route>
    </Routes>
  )
}

export default App
