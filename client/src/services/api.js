import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Send HttpOnly cookies on every request
});

// =============================================
// RESPONSE INTERCEPTOR — Auto-refresh on 401
// =============================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response, // Pass successful responses through as-is
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, only once per request,
    // and NEVER on the refresh endpoint itself (would cause infinite loop)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      // If already refreshing, queue this request until refresh completes
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => API(originalRequest)).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        await API.post('/auth/refresh');
        processQueue(null);
        return API(originalRequest); // Retry original request
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — force logout across the app
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
