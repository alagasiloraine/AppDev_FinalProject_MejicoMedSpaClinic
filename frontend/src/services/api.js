import axios from 'axios';
import { auth } from '../firebase'; // Ensure Firebase is imported

// Base URL for the API
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';

// Create an Axios instance
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Request timeout
});

// Request interceptor to attach Firebase token
apiService.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(); // Get Firebase token
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access, redirecting to login');
      // Example: router.push('/login');
    }
    return Promise.reject(error);
  }
);

// API function to login a user (call your backend API)
export const login = (userData) => apiService.post('/auth/login', userData);

// API function to register a new user (backend registration)
export const register = (userData) => apiService.post('/auth/register', userData);

// Logout function to clear Firebase and local storage
export const logout = async () => {
  await auth.signOut(); // Firebase sign-out
  localStorage.removeItem('token'); // Clear local storage token if needed
  return apiService.post('/auth/logout');
};

// API function to access protected route
export const getProtectedData = () => apiService.get('/protected-route');

export default apiService;
