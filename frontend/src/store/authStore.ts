import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  clearError: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          })
          
          const { token, user } = response.data
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Login failed',
            loading: false,
          })
          throw error
        }
      },

      register: async (userData: any) => {
        set({ loading: true, error: null })
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData)
          
          const { token, user } = response.data
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            loading: false,
          })
          throw error
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      clearError: () => {
        set({ error: null })
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ loading: true, error: null })
        try {
          const response = await axios.put(`${API_URL}/auth/updatedetails`, userData)
          
          set({
            user: response.data.data,
            loading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Update failed',
            loading: false,
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)