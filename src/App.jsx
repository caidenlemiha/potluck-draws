import { Routes, Route } from 'react-router-dom'
import SessionList from './components/SessionList'
import SessionDetail from './components/SessionDetail'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<SessionList />} />
        <Route path="/session/:id" element={<SessionDetail />} />
      </Routes>
    </div>
  )
}
