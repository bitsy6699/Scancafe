import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        localStorage.setItem('scancafe_token', token)
        localStorage.setItem('scancafe_user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('scancafe_token')
        localStorage.removeItem('scancafe_user')
        set({ user: null, token: null, isAuthenticated: false })
      },

      getToken: () => get().token || localStorage.getItem('scancafe_token'),
    }),
    { name: 'scancafe-auth', partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }) }
  )
)

export default useAuthStore
