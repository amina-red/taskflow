import { create } from 'zustand'

export type Task = {
  id: number
  title: string
  description: string
  status: string
  priority: string
  project_id: number
  due_date?: string
}

export type Project = {
  id: number
  name: string
  color: string
}

export type User = {
  id: number
  name: string
  email: string
}

type Store = {
  user: User | null
  token: string | null
  projects: Project[]
  tasks: Task[]
  activeProject: number | null
  darkMode: boolean
  activeView: 'board' | 'calendar' | 'analytics' | 'settings'
  setUser: (user: User, token: string) => void
  logout: () => void
  setProjects: (projects: Project[]) => void
  setTasks: (tasks: Task[]) => void
  setActiveProject: (id: number) => void
  updateTask: (task: Task) => void
  addTask: (task: Task) => void
  deleteTask: (id: number) => void
  toggleDarkMode: () => void
  setActiveView: (view: 'board' | 'calendar' | 'analytics' | 'settings') => void
}

export const useStore = create<Store>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  projects: [],
  tasks: [],
  activeProject: null,
  darkMode: localStorage.getItem('darkMode') === 'true',
  activeView: 'board',
  setUser: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, projects: [], tasks: [] })
  },
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  setActiveProject: (id) => set({ activeProject: id }),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t)
  })),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) })),
  toggleDarkMode: () => set((state) => {
    const next = !state.darkMode
    localStorage.setItem('darkMode', String(next))
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    return { darkMode: next }
  }),
  setActiveView: (view) => set({ activeView: view }),
}))