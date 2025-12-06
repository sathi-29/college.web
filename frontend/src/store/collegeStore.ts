import { create } from 'zustand'
import axios from 'axios'
import { College } from '../types'

interface CollegeState {
  colleges: College[]
  currentCollege: College | null
  filters: {
    search: string
    location: string
    course: string
    minFees: number | null
    maxFees: number | null
    minPlacement: number | null
    accreditation: string
    type: string[]
  }
  loading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  
  fetchColleges: (filters?: any) => Promise<void>
  fetchCollege: (id: string) => Promise<void>
  updateFilters: (filters: Partial<CollegeState['filters']>) => void
  clearFilters: () => void
  compareColleges: (collegeIds: string[]) => Promise<any>
  getAdmissionPrediction: (data: any) => Promise<any>
  saveCollege: (collegeId: string) => Promise<void>
  unsaveCollege: (collegeId: string) => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const useCollegeStore = create<CollegeState>((set, get) => ({
  colleges: [],
  currentCollege: null,
  filters: {
    search: '',
    location: '',
    course: '',
    minFees: null,
    maxFees: null,
    minPlacement: null,
    accreditation: '',
    type: [],
  },
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  fetchColleges: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = {
        ...get().filters,
        ...filters,
        page: filters.page || 1,
        limit: 12,
      }

      const response = await axios.get(`${API_URL}/colleges`, { params })
      
      set({
        colleges: response.data.data,
        totalPages: response.data.pagination?.totalPages || 1,
        currentPage: filters.page || 1,
        loading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch colleges',
        loading: false,
      })
    }
  },

  fetchCollege: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/colleges/${id}`)
      
      set({
        currentCollege: response.data.data,
        loading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch college details',
        loading: false,
      })
    }
  },

  updateFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
    // Trigger new search
    get().fetchColleges({ page: 1 })
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        location: '',
        course: '',
        minFees: null,
        maxFees: null,
        minPlacement: null,
        accreditation: '',
        type: [],
      },
    })
    get().fetchColleges({ page: 1 })
  },

  compareColleges: async (collegeIds: string[]) => {
    try {
      const response = await axios.post(`${API_URL}/colleges/compare`, {
        collegeIds,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to compare colleges')
    }
  },

  getAdmissionPrediction: async (data: any) => {
    try {
      const response = await axios.post(`${API_URL}/colleges/predict`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get prediction')
    }
  },

  saveCollege: async (collegeId: string) => {
    try {
      await axios.post(`${API_URL}/users/save-college/${collegeId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to save college')
    }
  },

  unsaveCollege: async (collegeId: string) => {
    try {
      await axios.delete(`${API_URL}/users/save-college/${collegeId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to unsave college')
    }
  },
}))