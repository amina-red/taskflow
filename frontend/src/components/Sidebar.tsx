import { LayoutDashboard, Kanban, Calendar, BarChart3, Plus, Settings, LogOut } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Sidebar() {
  const { projects, activeProject, setActiveProject, logout, user } = useStore()

  return (
    <aside className="w-52 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Kanban size={14} className="text-white" />
          </div>
          <span className="font-bold text-base">TaskFlow</span>
        </div>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 px-2 mb-1 uppercase tracking-wider">General</p>
          {[
            { icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
            { icon: <Kanban size={15} />, label: 'Board' },
            { icon: <Calendar size={15} />, label: 'Calendar' },
            { icon: <BarChart3 size={15} />, label: 'Analytics' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
              {item.icon} {item.label}
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 px-2 mb-1 uppercase tracking-wider">Projects</p>
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => setActiveProject(p.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer ${activeProject === p.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-gray-50 cursor-pointer">
            <Plus size={15} /> New project
          </div>
        </div>
      </nav>

      <div className="p-2 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
          <Settings size={15} /> Settings
        </div>
        <div onClick={logout} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
          <LogOut size={15} /> Sign out
        </div>
        <div className="flex items-center gap-2 px-2 py-2 mt-1">
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-700">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-600 truncate">{user?.name}</span>
        </div>
      </div>
    </aside>
  )
}