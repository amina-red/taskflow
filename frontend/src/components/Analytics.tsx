import { useStore } from '../store/useStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#94a3b8', '#f59e0b', '#6366f1', '#10b981']
const PRIORITY_COLORS = { low: '#94a3b8', medium: '#f59e0b', high: '#ef4444' }

export default function Analytics() {
  const { tasks, projects } = useStore()

  const statusData = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ]

  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#94a3b8' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
  ]

  const projectData = projects.map(p => ({
    name: p.name,
    tasks: tasks.filter(t => t.project_id === p.id).length,
    done: tasks.filter(t => t.project_id === p.id && t.status === 'done').length,
  }))

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
    : 0

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total tasks', value: tasks.length, color: 'text-gray-900 dark:text-white' },
          { label: 'Completion rate', value: `${completionRate}%`, color: 'text-green-600' },
          { label: 'High priority', value: tasks.filter(t => t.priority === 'high').length, color: 'text-red-500' },
          { label: 'Projects', value: projects.length, color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Tasks by status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Tasks by priority</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Tasks per project</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={projectData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="tasks" fill="#6366f1" name="Total" radius={[4, 4, 0, 0]} />
            <Bar dataKey="done" fill="#10b981" name="Done" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}