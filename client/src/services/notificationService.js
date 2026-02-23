import api from './api';

const notificationService = {
  /**
   * Get all notifications for the current user
   * @returns {Promise}
   */
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch notifications' };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAsRead: async () => {
    try {
      const response = await api.patch('/notifications/mark-read');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to mark notifications as read' };
    }
  },

  /**
   * Delete a notification
   * @param {string} id 
   * @returns {Promise}
   */
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete notification' };
    }
  },

  /**
   * Delete all notifications for the current user
   * @returns {Promise}
   */
  clearAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to clear notifications' };
    }
  }
};

export default notificationService;
