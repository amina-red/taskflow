import { create } from 'zustand'

type Task = {
  id: number
  title: string
  description: string
  status: string
  priority: string
  project_id: number
}

type Project = {
  id: number
  name: string
  color: string
}

type User = {
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
  setUser: (user: User, token: string) => void
  logout: () => void
  setProjects: (projects: Project[]) => void
  setTasks: (tasks: Task[]) => void
  setActiveProject: (id: number) => void
  updateTask: (task: Task) => void
  addTask: (task: Task) => void
}

export const useStore = create<Store>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  projects: [],
  tasks: [],
  activeProject: null,
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
  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  })),
}))