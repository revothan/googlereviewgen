import { Routes, Route } from 'react-router-dom'
import GadingSerpongPage from './pages/GadingSerpongPage'
import KelapaDuaPage from './pages/KelapaDuaPage'
import GreenLakeCityPage from './pages/GreenLakeCityPage'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/gading-serpong" element={<GadingSerpongPage />} />
        <Route path="/kelapa-dua" element={<KelapaDuaPage />} />
        <Route path="/green-lake-city" element={<GreenLakeCityPage />} />
        <Route path="/" element={<GadingSerpongPage />} />
      </Routes>
    </div>
  )
}

export default App