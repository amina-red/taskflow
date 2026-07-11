import { LayoutDashboard, Kanban, Calendar, BarChart3, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Sidebar() {
  const { projects, activeProject, setActiveProject, logout, user, darkMode, toggleDarkMode, activeView, setActiveView } = useStore()

  return (
    <aside className="w-52 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Kanban size={14} className="text-white" />
            </div>
            <span className="font-bold text-base text-gray-900 dark:text-white">TaskFlow</span>
          </div>
          <button onClick={toggleDarkMode} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {darkMode ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-gray-400" />}
          </button>
        </div>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 px-2 mb-1 uppercase tracking-wider">Views</p>
          {[
            { icon: <LayoutDashboard size={15} />, label: 'Dashboard', view: 'board' as const },
            { icon: <Kanban size={15} />, label: 'Board', view: 'board' as const },
            { icon: <Calendar size={15} />, label: 'Calendar', view: 'calendar' as const },
            { icon: <BarChart3 size={15} />, label: 'Analytics', view: 'analytics' as const },
          ].map(item => (
            <div key={item.label} onClick={() => setActiveView(item.view)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                activeView === item.view ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 px-2 mb-1 uppercase tracking-wider">Projects</p>
          {projects.map(p => (
            <div key={p.id} onClick={() => setActiveProject(p.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                activeProject === p.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <Settings size={15} /> Settings
        </div>
        <div onClick={logout} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <LogOut size={15} /> Sign out
        </div>
        <div className="flex items-center gap-2 px-2 py-2 mt-1">
          <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-400">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.name}</span>
        </div>
      </div>
    </aside>
  )
}