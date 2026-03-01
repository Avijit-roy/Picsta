import api from './api';

const processMediaUrl = (url) => {
    if (!url) return url;
    // Fix urls that contain 'localhost' but are being accessed from another device
    if (url.includes('localhost') && window.location.hostname !== 'localhost') {
        return url.replace('localhost', window.location.hostname);
    }
    return url;
};

const storyService = {
    // Get active stories grouped by user
    getActiveStories: async () => {
        try {
            const response = await api.get('/stories');
            if (response.data && response.data.success) {
                // Process media urls
                response.data.data = response.data.data.map(userGroup => ({
                    ...userGroup,
                    user: {
                        ...userGroup.user,
                        profilePicture: processMediaUrl(userGroup.user.profilePicture)
                    },
                    stories: userGroup.stories.map(story => ({
                        ...story,
                        mediaUrl: processMediaUrl(story.mediaUrl)
                    }))
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching stories:', error);
            throw error.response?.data || error;
        }
    },

    // Create a new story
    createStory: async (mediaFile) => {
        try {
            const formData = new FormData();
            formData.append('media', mediaFile);
            
            const response = await api.post('/stories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data && response.data.success && response.data.data) {
                response.data.data.mediaUrl = processMediaUrl(response.data.data.mediaUrl);
                if (response.data.data.user) {
                    response.data.data.user.profilePicture = processMediaUrl(response.data.data.user.profilePicture);
                }
            }
            return response.data;
        } catch (error) {
            console.error('Error creating story:', error);
            throw error.response?.data || error;
        }
    },

    // Mark story as viewed
    markAsViewed: async (storyId) => {
        try {
            const response = await api.post(`/stories/${storyId}/view`);
            return response.data;
        } catch (error) {
            console.error('Error marking story as viewed:', error);
            throw error.response?.data || error;
        }
    },

    // Delete a story
    deleteStory: async (storyId) => {
        try {
            const response = await api.delete(`/stories/${storyId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting story:', error);
            throw error.response?.data || error;
        }
    },

    // Get story viewers
    getStoryViewers: async (storyId) => {
        try {
            const response = await api.get(`/stories/${storyId}/viewers`);
            if (response.data && response.data.success) {
                // Process profile pictures
                response.data.data = response.data.data.map(viewer => ({
                    ...viewer,
                    profilePicture: processMediaUrl(viewer.profilePicture)
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching story viewers:', error);
            throw error.response?.data || error;
        }
    }
};

export default storyService;
