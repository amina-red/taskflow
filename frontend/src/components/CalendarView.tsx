import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-gray-400',
  in_progress: 'bg-yellow-400',
  review: 'bg-indigo-400',
  done: 'bg-green-400',
}

export default function CalendarView() {
  const { tasks } = useStore()
  const [current, setCurrent] = useState(new Date())

  const days = eachDayOfInterval({
    start: startOfMonth(current),
    end: endOfMonth(current),
  })

  const firstDayOfWeek = startOfMonth(current).getDay()

  const tasksWithDueDate = tasks.filter(t => t.due_date)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
          {format(current, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(subMonths(current, 1))}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrent(new Date())}
            className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Today
          </button>
          <button onClick={() => setCurrent(addMonths(current, 1))}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dayTasks = tasksWithDueDate.filter(t => isSameDay(new Date(t.due_date!), day))
          const today = isToday(day)
          return (
            <div key={day.toISOString()}
              className={`min-h-16 p-1.5 rounded-lg border transition-colors ${
                today
                  ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
              }`}>
              <span className={`text-xs font-medium block mb-1 ${
                today ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
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
                  <span className="text-[9px] text-gray-400">+{dayTasks.length - 2} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-gray-500 capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}