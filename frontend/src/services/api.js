import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = () => apiService.get('/health');

export const loginUser = (userData) => apiService.post('/login', userData);

export const registerUser = (userData) => apiService.post('/register', userData);

export default apiService;