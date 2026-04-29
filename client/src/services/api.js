import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // adjust if your server runs on a different port
});

// Request interceptor for adding the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
