import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getRecentActivity = () => api.get('/dashboard/recent-activity')
export const runCleanup = () => api.post('/dashboard/run-cleanup')

// Rules
export const getRules = () => api.get('/rules')
export const getRule = (id: number) => api.get(`/rules/${id}`)
export const createRule = (data: unknown) => api.post('/rules', data)
export const updateRule = (id: number, data: unknown) => api.put(`/rules/${id}`, data)
export const deleteRule = (id: number) => api.delete(`/rules/${id}`)

// Connections
export const getConnections = () => api.get('/connections')
export const testConnection = (service: string) => api.post(`/connections/test/${service}`)

// History
export const getHistory = (params?: { page?: number; size?: number; startDate?: string; endDate?: string }) =>
  api.get('/history', { params })
export const getHistorySummary = () => api.get('/history/summary')

// Logs
export const getLogFiles = () => api.get('/logs/files')
export const downloadLogFile = (filename: string) =>
  api.get(`/logs/download/${filename}`, { responseType: 'blob' })

export default api
