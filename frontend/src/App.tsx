import { useState } from 'react'
import { useStore } from './store/useStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

export default function App() {
  const { token } = useStore()
  const [showRegister, setShowRegister] = useState(false)

  if (!token) {
    return showRegister
      ? <Register onSwitch={() => setShowRegister(false)} />
      : <Login onSwitch={() => setShowRegister(true)} />
  }

  return <Dashboard />
}