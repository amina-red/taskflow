import { useEffect } from 'react'
import { Plus, Wifi } from 'lucide-react'
import { useStore } from '../store/useStore'
import api from '../lib/api'
import Sidebar from '../components/Sidebar'
import KanbanBoard from '../components/KanbanBoard'
import CalendarView from '../components/CalendarView'
import Analytics from '../components/Analytics'
import SettingsPage from './Settings'

export default function Dashboard() {
  const { projects, setProjects, setActiveProject, activeProject, tasks, activeView, darkMode } = useStore()

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data || [])
      if (data?.length > 0) setActiveProject(data[0].id)
    })
  }, [])

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
    const ws = new WebSocket(`${wsUrl}?token=${localStorage.getItem('token')}`)
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'task_update') {
        useStore.getState().updateTask(msg.task)
      }
    }
    return () => ws.close()
  }, [])

  const handleCreateProject = async () => {
    const name = prompt('Project name:')
    if (!name) return
    const { data } = await api.post('/projects', { name })
    setProjects([...projects, data])
    setActiveProject(data.id)
  }

  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const backlog = tasks.filter(t => t.status === 'backlog').length

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            {activeView === 'calendar' ? 'Calendar' : activeView === 'analytics' ? 'Analytics' : projects.find(p => p.id === activeProject)?.name || 'My workspace'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <Wifi size={12} /> Live
            </div>
            <button onClick={handleCreateProject} className="btn-primary flex items-center gap-1.5 py-1.5">
              <Plus size={14} /> New project
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto">
         {activeView === 'settings' ? (
  <SettingsPage />
) : activeView === 'analytics' ? (
  <Analytics />
) : activeView === 'calendar' ? (
  <CalendarView />
) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total tasks', value: total, color: 'text-gray-900 dark:text-white' },
                  { label: 'In progress', value: inProgress, color: 'text-yellow-600' },
                  { label: 'Completed', value: done, color: 'text-green-600' },
                  { label: 'Backlog', value: backlog, color: 'text-gray-400' },
                ].map(s => (
                  <div key={s.label} className="card p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              {activeProject ? <KanbanBoard /> : (
                <div className="text-center py-20">
                  <p className="text-gray-400 mb-4">No projects yet</p>
                  <button onClick={handleCreateProject} className="btn-primary">Create your first project</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}