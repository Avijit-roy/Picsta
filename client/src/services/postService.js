import api from './api';

const postService = {
  /**
   * Create a new post
   * @param {FormData} formData
   */
  createPost: async (formData) => {
    try {
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  },

  /**
   * Get all posts (Feed)
   */
  getPosts: async () => {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  },

  /**
   * Get a specific user's posts
   * @param {string} username
   */
  getUserPosts: async (username) => {
    try {
      const response = await api.get(`/posts/user/${username}`);
      return response.data;
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  },

  /**
   * Delete a post
   * @param {string} postId
   */
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  },

  /**
   * Update a post
   * @param {string} postId
   * @param {object} updateData
   */
  updatePost: async (postId, updateData) => {
    try {
      const response = await api.patch(`/posts/${postId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  },

  /**
   * Toggle like/unlike a post
   * @param {string} postId
   */
  toggleLike: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  },
  
  /**
   * Add a comment to a post
   * @param {string} postId
   * @param {string} text
   */
  addComment: async (postId, text, parentCommentId = null) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { text, parentCommentId });
      return response.data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  /**
   * Get comments for a post
   * @param {string} postId
   */
  getComments: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   * @param {string} postId
   * @param {string} commentId
   */
  deleteComment: async (postId, commentId) => {
    try {
      const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  },

  /**
   * Toggle save/unsave a post
   * @param {string} postId
   */
  toggleSave: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/save`);
      return response.data;
    } catch (error) {
      console.error('Toggle save error:', error);
      throw error;
    }
  },

  /**
   * Get current user's saved posts
   */
  getSavedPosts: async () => {
    try {
      const response = await api.get('/posts/saved');
      return response.data;
    } catch (error) {
      console.error('Get saved posts error:', error);
      throw error;
    }
  },
  /**
   * Get all video posts (Reels)
   */
  getReels: async () => {
    try {
      const response = await api.get('/posts/reels');
      return response.data;
    } catch (error) {
      console.error('Get reels error:', error);
      throw error;
    }
  },
  /**
   * Get users who liked a post
   * @param {string} postId
   */
  getLikers: async (postId) => {
    const response = await api.get(`/posts/${postId}/likers`);
    return response.data;
  },
  /**
   * Notify other components about a post update
   * @param {string} postId
   * @param {object} data
   */
  notifyPostUpdate: (postId, data) => {
    window.dispatchEvent(new CustomEvent('POST_UPDATED', { detail: { postId, ...data } }));
  }
};

export default postService;
