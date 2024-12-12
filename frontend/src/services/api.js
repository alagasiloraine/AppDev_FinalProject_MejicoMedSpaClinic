import axios from 'axios';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      if (error.response.status === 401) {
        console.error('Unauthorized access, redirecting to login');
        // You might want to redirect to login page here
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    if (response.data && response.data.role) {
      localStorage.setItem('userRole', response.data.role);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    return await api.post('/auth/register', userData);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('userRole');
    return await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

// export const getProducts = async () => {
//   try {
//     return await api.get('/products/');
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// };

// export const submitPurchase = async (data) => {
//   try {
//     return await api.post('/products/purchase/', data);
//   } catch (error) {
//     console.error('Error submitting purchase:', error);
//     throw error;
//   }
// };

// export const getPurchaseHistory = async () => {
//   try {
//     return await api.get('/products/history/');
//   } catch (error) {
//     console.error('Error fetching purchase history:', error);
//     throw error;
//   }
// };

// export const getRecommendations = async () => {
//   try {
//     console.log('Fetching recommendations...');
//     const response = await api.get('/products/recommendations/');
//     console.log('Recommendations response:', response.data);
//     return response;
//   } catch (error) {
//     console.error('Error fetching recommendations:', error.response || error);
//     throw error;
//   }
// };

// Sales API endpoints
export const submitSales = async (data) => {
  try {
    return await api.post('/sales/submit/', data);
  } catch (error) {
    console.error('Error submitting sales:', error);
    throw error;
  }
};

export const getSalesHistory = async () => {
  try {
    return await api.get('/sales/history/');
  } catch (error) {
    console.error('Error fetching sales history:', error);
    throw error;
  }
};

export const getSalesPrediction = async () => {
  try {
    return await api.get('/predictions/predict');
  } catch (error) {
    console.error('Error fetching sales prediction:', error);
    throw error;
  }
};

export const getSalesPerCategory = async () => {
  try {
    return await api.get('/sales/per-category/');
  } catch (error) {
    console.error('Error fetching sales per category:', error);
    throw error;
  }
};

export const getSalesData = async () => {
  try {
    return await api.get('/sales/data/');
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

export const getMonthlySalesData = async () => {
  try {
    return await api.get('/predictions/monthly-sales');
  } catch (error) {
    console.error('Error fetching monthly sales data:', error);
    throw error;
  }
};

// ML Prediction endpoints
export const getMachineLearningPrediction = async () => {
  try {
    return await api.get('/prediction/sales/');
  } catch (error) {
    console.error('Error fetching ML prediction:', error);
    throw error;
  }
};

export const getMachineLearningRecommendations = async (userId) => {
  try {
    return await api.get('/predictions/stock', { params: { user_id: userId } });
  } catch (error) {
    console.error('Error fetching ML recommendations:', error);
    throw error;
  }
};

// Other API endpoints
export const getProtectedData = async () => {
  try {
    return await api.get('/protected-route');
  } catch (error) {
    console.error('Error fetching protected data:', error);
    throw error;
  }
};

export default api;