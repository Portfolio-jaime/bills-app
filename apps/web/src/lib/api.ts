import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

// Public client for auth endpoints (no auth header)
export const api = axios.create({ baseURL: API_URL })

// Authenticated client — attaches JWT from NextAuth session
export const authApi = axios.create({ baseURL: API_URL })

authApi.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session) {
    config.headers.Authorization = `Bearer ${(session as any).accessToken}`
  }
  return config
})

authApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — NextAuth session should handle refresh automatically
      // For now, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
