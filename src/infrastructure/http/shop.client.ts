import axios, { AxiosError } from 'axios';
import { ENV } from '@/config/env';
import { tokenManager } from '@/infrastructure/auth/tokenManager';

const shopClient = axios.create({
  baseURL: ENV.VITE_SHOP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
shopClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getShopToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and normalize responses
shopClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token — le backend attend { refreshToken } dans le body
        const refreshToken = tokenManager.getShopRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${ENV.VITE_SHOP_API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        // Réponse : { success, message, data: { token, refreshToken } }
        const newToken = response.data?.data?.token;
        const newRefreshToken = response.data?.data?.refreshToken;
        tokenManager.setShopToken(newToken);
        if (newRefreshToken) {
          tokenManager.setShopRefreshToken(newRefreshToken);
        }

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return shopClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        tokenManager.clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Return error with normalized message
    const message =
      (error.response?.data as any)?.message || error.message || 'An error occurred';
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

export default shopClient;
