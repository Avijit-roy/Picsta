import API from './api';

const authService = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  login: async (emailOrUsername, password) => {
    const response = await API.post('/auth/login', { emailOrUsername, password });
    return response.data;
  },

  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  refresh: async () => {
    const response = await API.post('/auth/refresh');
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await API.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await API.post('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await API.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  }
};

export default authService;
