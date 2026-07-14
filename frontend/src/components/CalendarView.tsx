import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns'
import api from '../lib/api'

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-gray-400',
  in_progress: 'bg-yellow-400',
  review: 'bg-indigo-400',
  done: 'bg-green-400',
}

export default function CalendarView() {
  const { tasks, activeProject, addTask } = useStore()
  const [current, setCurrent] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const days = eachDayOfInterval({
    start: startOfMonth(current),
    end: endOfMonth(current),
  })

  const firstDayOfWeek = startOfMonth(current).getDay()
  const tasksWithDueDate = tasks.filter(t => t.due_date)

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    setNewTitle('')
  }

  const handleAddTask = async () => {
    if (!newTitle.trim() || !activeProject || !selectedDay) return
    setAdding(true)
    const { data } = await api.post(`/projects/${activeProject}/tasks`, {
      title: newTitle,
      status: 'backlog',
      priority: 'medium',
      due_date: format(selectedDay, 'yyyy-MM-dd'),
    })
    addTask(data)
    setNewTitle('')
    setSelectedDay(null)
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
            {format(current, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrent(subMonths(current, 1))}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrent(new Date())}
              className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
              Today
            </button>
            <button onClick={() => setCurrent(addMonths(current, 1))}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
          {days.map(day => {
            const dayTasks = tasksWithDueDate.filter(t => isSameDay(parseISO(t.due_date!), day))
            const today = isToday(day)
            const selected = selectedDay && isSameDay(selectedDay, day)
            return (
              <div key={day.toISOString()} onClick={() => handleDayClick(day)}
                className={`min-h-16 p-1.5 rounded-lg border cursor-pointer transition-all ${
                  selected ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : today ? 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800'
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                <span className={`text-xs font-medium block mb-1 ${
                  today ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {format(day, 'd')}
                </span>
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, 2).map(task => (
                    <div key={task.id} className={`text-[9px] text-white px-1 py-0.5 rounded truncate ${STATUS_COLORS[task.status]}`}>
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <span className="text-[9px] text-gray-400">+{dayTasks.length - 2}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex-wrap">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-gray-500 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {format(selectedDay, 'EEEE, MMMM d')}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={14} className="text-gray-400" />
            </button>
          </div>

          {tasksWithDueDate.filter(t => isSameDay(parseISO(t.due_date!), selectedDay)).length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {tasksWithDueDate.filter(t => isSameDay(parseISO(t.due_date!), selectedDay)).map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{task.title}</span>
                  <span className="ml-auto text-xs text-gray-400 capitalize">{task.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Add task for this day..."
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddTask() }} />
            <button onClick={handleAddTask} disabled={adding || !newTitle.trim()}
              className="btn-primary flex items-center gap-1.5 px-3 disabled:opacity-50">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}