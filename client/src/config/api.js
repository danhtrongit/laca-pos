// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2018'

// Helper function to get full API endpoint
export const getApiUrl = (path) => {
    return `${API_URL}${path}`
}

export default {
    API_URL,
    getApiUrl
}
