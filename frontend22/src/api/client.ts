import axios from 'axios'

// Real backend client. baseURL comes from VITE_API_URL so this is the only place
// that needs to change when pointing at a deployed backend instead of localhost.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

export default client
