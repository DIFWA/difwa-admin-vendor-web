import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import authService from '../services/authService'

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            loading: false,
            error: null,

            login: async (email, password) => {
                set({ loading: true, error: null })
                try {
                    const data = await authService.login({ email, password })

                    if (typeof window !== "undefined") {
                        localStorage.setItem("token", data.token)
                        localStorage.setItem("userId", data.user._id || data.user.id)
                        localStorage.setItem("role", data.user.role)
                        localStorage.setItem("status", data.user.status)
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        loading: false
                    })
                    return data
                } catch (err) {
                    set({
                        error: err.response?.data?.message || 'Login failed',
                        loading: false
                    })
                    throw err
                }
            },

            register: async (userData) => {
                set({ loading: true, error: null })
                try {
                    const data = await authService.register(userData)

                    if (typeof window !== "undefined") {
                        localStorage.setItem("token", data.token)
                        localStorage.setItem("userId", data.user._id || data.user.id)
                        localStorage.setItem("role", data.user.role)
                        localStorage.setItem("status", data.user.status)
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        loading: false
                    })
                    return data
                } catch (err) {
                    set({
                        error: err.response?.data?.message || 'Registration failed',
                        loading: false
                    })
                    throw err
                }
            },

            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token")
                    localStorage.removeItem("userId")
                    localStorage.removeItem("role")
                    localStorage.removeItem("status")
                }
                set({ user: null, token: null, error: null })
            },

            setUser: (user) => set({ user }),

            checkAuth: async () => {
                const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

                if (userId && token) {
                    set({ loading: true })
                    try {
                        const userData = await authService.getMe(userId)
                        set({ user: userData.data || userData.user || userData, token: token, loading: false })
                    } catch (err) {
                        get().logout()
                        set({ loading: false })
                    }
                }
            }
        }),
        {
            name: 'shrimpbite-auth',
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
)

export default useAuthStore
