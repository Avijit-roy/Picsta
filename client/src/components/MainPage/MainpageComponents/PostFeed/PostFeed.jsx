import React from 'react';
import { useAuth } from '../../../../context/AuthUtils';
import PostItem from './PostItem';

const PostFeed = ({ posts, onPostClick, onUserClick, onLikeToggle, onDelete, onUpdate }) => {
    const { user } = useAuth();

    return (
        <div className="d-flex justify-content-center py-4">
            <div style={{ maxWidth: '470px', width: '100%', padding: '0 10px' }}>
                {posts.map(post => (
                    <PostItem 
                        key={post._id || post.id} 
                        post={post} 
                        onPostClick={onPostClick} 
                        onUserClick={onUserClick} 
                        onLikeToggle={onLikeToggle} 
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        user={user} 
                    />
                ))}
            </div>
        </div>
    );
};

export default PostFeed;