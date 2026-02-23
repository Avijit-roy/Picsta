import api from './api';

const chatService = {
  /**
   * Create or get a 1-on-1 chat
   * @param {string} userId 
   * @returns {Promise}
   */
  createOrGetChat: async (userId) => {
    const response = await api.post('/chats', { userId });
    return response.data;
  },

  /**
   * Get all chats for the current user
   * @returns {Promise}
   */
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  /**
   * Hide a chat for the current user
   * @param {string} chatId 
   * @returns {Promise}
   */
  hideChat: async (chatId) => {
    try {
      const response = await api.delete(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to hide chat' };
    }
  }
};

export default chatService;
