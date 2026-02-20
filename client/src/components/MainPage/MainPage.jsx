import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import StoriesSection from './MainpageComponents/StoriesSection/StoriesSection';
import Sidebar from './MainpageComponents/SideBar/SideBar';
import PostFeed from './MainpageComponents/PostFeed/PostFeed';
import MobileBottomNavigation from './MainpageComponents/SideBar/MobileBottomNavigation';

const MainPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [stories] = useState([
        { id: 0, username: 'Your story', avatar: 'https://i.pravatar.cc/150?img=33', hasStory: false, isYourStory: true },
        { id: 1, username: 'oanaargenti', avatar: 'https://i.pravatar.cc/150?img=1', hasStory: true },
        { id: 2, username: 'sagarskd...', avatar: 'https://i.pravatar.cc/150?img=12', hasStory: true },
        { id: 3, username: 'adityaa_b...', avatar: 'https://i.pravatar.cc/150?img=13', hasStory: true },
        { id: 4, username: '__liesoso...', avatar: 'https://i.pravatar.cc/150?img=5', hasStory: true },
        { id: 5, username: '__sou.mit...', avatar: 'https://i.pravatar.cc/150?img=8', hasStory: true },
        { id: 6, username: 'soumya.d...', avatar: 'https://i.pravatar.cc/150?img=9', hasStory: true },
        { id: 7, username: 'yourbong...', avatar: 'https://i.pravatar.cc/150?img=14', hasStory: true },
        { id: 8, username: 'sarcastic...', avatar: 'https://i.pravatar.cc/150?img=15', hasStory: true },
        { id: 9, username: 'mysticdev', avatar: 'https://i.pravatar.cc/150?img=22', hasStory: true },
        { id: 10, username: 'webguru', avatar: 'https://i.pravatar.cc/150?img=27', hasStory: true },
        { id: 11, username: 'codequeen', avatar: 'https://i.pravatar.cc/150?img=24', hasStory: true },
        { id: 12, username: 'pixelmaster', avatar: 'https://i.pravatar.cc/150?img=25', hasStory: true },
        { id: 13, username: 'snapstar', avatar: 'https://i.pravatar.cc/150?img=28', hasStory: true },
    ]);

    const [posts] = useState([
        {
            id: 1,
            username: 'sarcastic_us',
            verified: false,
            avatar: 'https://i.pravatar.cc/150?img=15',
            image: 'https://picsum.photos/600/750?random=1',
            likes: '18.9K',
            comments: 248,
            caption: 'Just checking is there any another girl in his heart..',
            timeAgo: '5m',
            hasAudio: true
        },
        {
            id: 2,
            username: 'headandshouldersindia',
            verified: true,
            avatar: 'https://i.pravatar.cc/150?img=20',
            image: 'https://picsum.photos/600/700?random=2',
            likes: '3.4K',
            comments: 25,
            caption: 'Upto 100% Dandruff Protection*. Better Price thanks to GST. Head & Shoulders is now easier on the pocket',
            timeAgo: '1h',
            hasAudio: false
        },
        {
            id: 3,
            username: 'tech_guru_official',
            verified: true,
            avatar: 'https://i.pravatar.cc/150?img=11',
            image: 'https://picsum.photos/600/800?random=3',
            likes: '45.2K',
            comments: 892,
            caption: 'New setup who dis? 💻✨ #workspace #techsetup',
            timeAgo: '2h',
            hasAudio: false
        },
        {
            id: 4,
            username: 'foodie_paradise',
            verified: false,
            avatar: 'https://i.pravatar.cc/150?img=18',
            image: 'https://picsum.photos/600/750?random=4',
            likes: '12.7K',
            comments: 156,
            caption: 'Homemade pasta night 🍝❤️ Recipe in bio!',
            timeAgo: '4h',
            hasAudio: false
        },
        {
            id: 5,
            username: 'travel_diaries',
            verified: false,
            avatar: 'https://i.pravatar.cc/150?img=7',
            image: 'https://picsum.photos/600/800?random=5',
            likes: '28.1K',
            comments: 421,
            caption: 'Paradise found 🌴☀️ Bali adventures continue...',
            timeAgo: '6h',
            hasAudio: true
        }
    ]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
            {/* Desktop Sidebar Component */}
            <Sidebar isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />

            {/* Mobile Bottom Navigation Component */}
            <MobileBottomNavigation />

            {/* Main Content Area */}
            <div style={{
                marginLeft: 0,
                width: '100%',
                paddingBottom: '60px'
            }}
                className="main-content-wrapper"
            >
                <style>
                    {`
                        @media (min-width: 768px) {
                            .main-content-wrapper {
                                margin-left: 72px !important;
                                width: calc(100% - 72px) !important;
                            }
                        }
                    `}
                </style>

                {/* Stories Section Component */}
                <StoriesSection stories={stories} />

                {/* Post Feed Component */}
                <PostFeed posts={posts} />
            </div>
        </div>
    );
};

export default MainPage;