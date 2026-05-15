import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scancafe_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — auto logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('scancafe_token')
      localStorage.removeItem('scancafe_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
