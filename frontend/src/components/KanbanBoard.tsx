import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import { useStore } from '../store/useStore'
import api from '../lib/api'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'review', label: 'In Review', color: '#6366f1' },
  { id: 'done', label: 'Done', color: '#10b981' },
]

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export default function KanbanBoard() {
  const { tasks, activeProject, setTasks, addTask, updateTask } = useStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTo, setAddingTo] = useState<string | null>(null)

  useEffect(() => {
    if (activeProject) {
      api.get(`/projects/${activeProject}/tasks`).then(({ data }) => setTasks(data || []))
    }
  }, [activeProject])

  const handleAddTask = async (status: string) => {
    if (!newTaskTitle.trim() || !activeProject) return
    const { data } = await api.post(`/projects/${activeProject}/tasks`, {
      title: newTaskTitle, status, priority: 'medium'
    })
    addTask(data)
    setNewTaskTitle('')
    setAddingTo(null)
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    const { data } = await api.put(`/tasks/${taskId}`, { status })
    updateTask(data)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id)
        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-64 bg-gray-50 rounded-xl border border-gray-200 p-3"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-medium text-gray-600">{col.label}</span>
                <span className="text-xs bg-white border border-gray-200 rounded-full px-1.5 text-gray-400">{colTasks.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-h-8">
              {colTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('taskId', task.id.toString())}
                  className={`bg-white border border-gray-100 rounded-lg p-3 cursor-grab hover:border-indigo-200 transition-colors ${task.status === 'done' ? 'opacity-60' : ''}`}
                >
                  <p className={`text-xs font-medium text-gray-800 mb-2 ${task.status === 'done' ? 'line-through' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                    <button className="text-gray-300 hover:text-gray-500">
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {addingTo === col.id ? (
              <div className="mt-2">
                <input
                  autoFocus
                  className="w-full text-xs border border-indigo-300 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-400 mb-1.5"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTask(col.id); if (e.key === 'Escape') setAddingTo(null) }}
                />
                <div className="flex gap-1.5">
                  <button onClick={() => handleAddTask(col.id)} className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg">Add</button>
                  <button onClick={() => setAddingTo(null)} className="text-xs text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-100">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(col.id)}
                className="flex items-center gap-1.5 w-full mt-2 text-xs text-gray-400 hover:text-gray-600 px-1 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus size={13} /> Add task
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}