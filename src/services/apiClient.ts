import axios, { AxiosInstance, AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Only redirect on 401 for authenticated routes (when token exists)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const isLoginOrRegister = error.config?.url?.includes('/auth/login') || 
                                 error.config?.url?.includes('/auth/register');
      
      // Only clear token and redirect if user was authenticated and it's not a login/register attempt
      if (token && !isLoginOrRegister) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    
    const errorMessage = 
      (error.response?.data as any)?.message || 
      error.message || 
      'An error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;