import axios from 'axios';

// Base URL for the API
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

// Create an axios instance with the base URL and default headers
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Set a timeout for requests
});

// Request interceptor
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Attach token if available
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

// Response interceptor
apiService.interceptors.response.use(
  (response) => response, // Pass through the response if it's successful
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access, redirecting to login');
      // Implement redirect logic here if needed
      // Example: router.push('/login');
    }
    return Promise.reject(error); // Handle response errors
  }
);

// API function to login a user
export const login = (userData) => apiService.post('/auth/login', userData);

// API function to register a new user
export const register = (userData) => apiService.post('/auth/register', userData);

// API function to log out a user
export const logout = () => {
  localStorage.removeItem('token'); // Clear the token from local storage
  return apiService.post('/auth/logout'); // Call logout endpoint
};

// API function to get protected data
export const getProtectedData = () => apiService.get('/protected-route');

// Export the axios instance for use in other files
export default apiService;
