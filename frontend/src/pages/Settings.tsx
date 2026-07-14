import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Bell, Moon, User, Shield } from 'lucide-react'
import api from '../lib/api'

export default function SettingsPage() {
  const { user, darkMode, toggleDarkMode } = useStore()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const sendTestReminder = async () => {
    setSending(true)
    await api.post('/reminders/test')
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <User size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Account type</span>
          </div>
          <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-full font-medium">Free plan</span>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Moon size={16} /> Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Dark mode</p>
            <p className="text-xs text-gray-400">Switch between light and dark theme</p>
          </div>
          <button onClick={toggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Bell size={16} /> Email reminders
        </h3>
        <p className="text-sm text-gray-500 mb-4">Get notified by email when tasks are due tomorrow</p>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-3">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Daily reminders</p>
            <p className="text-xs text-gray-400">Sent every day at 8:00 AM</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
        </div>
        <button onClick={sendTestReminder} disabled={sending}
          className="btn-outline w-full py-2.5 flex items-center justify-center gap-2">
          <Bell size={14} />
          {sent ? 'Reminder sent to your email!' : sending ? 'Sending...' : 'Send test reminder'}
        </button>
      </div>
    </div>
  )
}