import axios from 'axios'

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2018'

// Helper function to get full API endpoint
export const getApiUrl = (path) => {
    return `${API_URL}${path}`
}

const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }
    return Promise.reject(error)
})

export default api
