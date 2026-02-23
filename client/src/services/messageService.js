import api from './api';

const messageService = {
  /**
   * Send a message to a chat
   * @param {string} chatId 
   * @param {string} content 
   * @param {string} type 
   * @param {string} postId
   * @returns {Promise}
   */
  sendMessage: async (chatId, content, type = 'text', postId = null) => {
    const response = await api.post('/messages', { chatId, content, type, postId });
    return response.data;
  },

  /**
   * Get messages for a chat
   * @param {string} chatId 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise}
   */
  getMessages: async (chatId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
    return response.data;
  }
};

export default messageService;
