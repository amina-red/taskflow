import { useState, useEffect } from 'react'
import { X, Trash2, Calendar, Flag } from 'lucide-react'
import { useStore, Task } from '../store/useStore'
import api from '../lib/api'

type Props = {
  task: Task
  onClose: () => void
}

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['backlog', 'in_progress', 'review', 'done']

export default function TaskModal({ task, onClose }: Props) {
  const { updateTask, deleteTask } = useStore()
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    due_date: task.due_date ? task.due_date.slice(0, 10) : '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSave = async () => {
    setSaving(true)
    const { data } = await api.put(`/tasks/${task.id}`, form)
    updateTask(data)
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    await api.delete(`/tasks/${task.id}`)
    deleteTask(task.id)
    onClose()
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600 border-gray-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Edit task</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={15} />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Title</label>
            <input className="input" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Add a description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block flex items-center gap-1">
                <Flag size={11} /> Priority
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium capitalize transition-all ${
                      form.priority === p ? priorityColors[p] : 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-700 dark:border-gray-600'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
              <select className="input text-xs py-1.5" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block flex items-center gap-1">
              <Calendar size={11} /> Due date
            </label>
            <input type="date" className="input" value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button onClick={onClose} className="btn-outline px-4">Cancel</button>
        </div>
      </div>
    </div>
  )
}