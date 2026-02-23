import api from './api';

const userService = {
  /**
   * Get current user profile
   * @returns {Promise}
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update user profile data
   * @param {Object} userData 
   * @returns {Promise}
   */
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  /**
   * Upload user profile picture
   * @param {File} file 
   * @returns {Promise}
   */
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await api.post('/users/profile/profilePicture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Check username availability
   * @param {string} username 
   * @returns {Promise}
   */
  checkUsername: async (username) => {
    const response = await api.get(`/users/check-username/${encodeURIComponent(username)}`);
    return response.data;
  },

  /**
   * Get user profile by username
   * @param {string} username 
   * @returns {Promise}
   */
  getUserProfileByUsername: async (username) => {
    const response = await api.get(`/users/u/${encodeURIComponent(username)}`);
    return response.data;
  },

  /**
   * Toggle follow/unfollow a user
   * @param {string} userId 
   * @returns {Promise}
   */
  toggleFollow: async (userId) => {
    const response = await api.post(`/users/toggle-follow/${userId}`);
    return response.data;
  },
  /**
   * Search users by username
   * @param {string} query 
   * @returns {Promise}
   */
  searchUsers: async (query) => {
    const response = await api.get(`/users/search/${encodeURIComponent(query)}`);
    return response.data;
  },
  /**
   * Get recent searches
   * @returns {Promise}
   */
  getRecentSearches: async () => {
    const response = await api.get('/users/recent-searches');
    return response.data;
  },
  /**
   * Remove user from recent searches
   * @param {string} userId 
   * @returns {Promise}
   */
  removeRecentSearch: async (userId) => {
    const response = await api.delete(`/users/recent-searches/${userId}`);
    return response.data;
  },
  /**
   * Clear all recent searches
   * @returns {Promise}
   */
  clearAllRecentSearches: async () => {
    const response = await api.delete('/users/recent-searches');
    return response.data;
  },

  /**
   * Get user followers
   * @param {string} userId 
   * @returns {Promise}
   */
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  /**
   * Get user following
   * @param {string} userId 
   * @returns {Promise}
   */
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  }
};

export default userService;
