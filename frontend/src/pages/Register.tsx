import { useState } from 'react'
import { useStore } from '../store/useStore'
import api from '../lib/api'
import { UserPlus } from 'lucide-react'

export default function Register({ onSwitch }: { onSwitch: () => void }) {
  const { setUser } = useStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      setUser(data.user, data.token)
    } catch {
      setError('Email already exists')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <UserPlus size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">TaskFlow</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Start managing your projects</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="input" type="text" placeholder="Full name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input className="input" type="email" placeholder="Email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <input className="input" type="password" placeholder="Password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary py-2.5 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Have an account? <button onClick={onSwitch} className="text-indigo-600 font-medium">Sign in</button>
        </p>
      </div>
    </div>
  )
}