import React, { useState, useEffect, useCallback, useRef } from 'react';
import chatService from '../../../services/chatService';
import messageService from '../../../services/messageService';
import socketService from '../../../services/socketService';
import { useAuth } from '../../../context/AuthContext';
import ConversationSidebar from './ConversationSidebar';
import ChatPanel from './ChatPanel';
import ChatEmptyState from './ChatEmptyState';

const MessagesPage = ({ onBack, initialChat, onUserClick, onPostClick }) => {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = useCallback(async (chatId) => {
        try {
            setLoadingMessages(true);
            const result = await messageService.getMessages(chatId);
            if (result.success) {
                setMessages(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        socketService.connect();

        socketService.onNewMessage((message) => {
            setMessages((prev) => {
                // 1. Prevent Duplication: Check if message ID already exists
                if (prev.find(m => m._id === message._id)) return prev;

                // 2. Ignore messages meant for other chat rooms
                if (message.chat !== selected) return prev;

                // 3. Optimistic Deduplication: Replace temp/uploading message with the real one
                const currentUserId = user?.id || user?._id;
                const senderId = message.sender?._id || message.sender;
                const isMe = senderId?.toString() === currentUserId?.toString();

                if (isMe) {
                    // Look for a pending message of the same type that was sent recently
                    const tempIndex = prev.findIndex(m => 
                        (m.isUploading || m._id?.toString().startsWith('temp')) && 
                        (m.messageType === message.messageType || m.type === message.type)
                    );

                    if (tempIndex !== -1) {
                        const updated = [...prev];
                        updated[tempIndex] = message;
                        return updated;
                    }
                }

                return [...prev, message];
            });

            setConversations((prev) => {
                return prev.map(c => {
                    if (c._id === message.chat) {
                        return { ...c, lastMessage: message, updatedAt: message.createdAt };
                    }
                    return c;
                }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            });
        });

        return () => {
            socketService.disconnect();
        };
    }, [selected, user?.id, user?._id]);

    useEffect(() => {
        if (selected) {
            socketService.joinChat(selected);
            fetchMessages(selected);
        }
        
        return () => {
            if (selected) {
                socketService.leaveChat(selected);
            }
        };
    }, [selected, fetchMessages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selected) return;

        const content = newMessage.trim();
        setNewMessage('');

        try {
            const result = await messageService.sendMessage(selected, content);
            if (result.success) {
                // Socket will handle the update
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleSendImage = async (file) => {
        if (!file || !selected) return;

        // File size up to 10MB (matches backend uploadChatMedia limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // 1. Image Upload Flow: Create temporary message object and preview URL
        const previewUrl = URL.createObjectURL(file);
        const tempId = `temp-${Date.now()}`;
        
        const optimisticMessage = {
            _id: tempId,
            sender: { _id: user?.id || user?._id, ...user },
            chat: selected,
            content: '',
            mediaUrl: previewUrl,      // use mediaUrl (unified schema)
            type: 'image',             // use type (unified schema)
            isUploading: true,
            createdAt: new Date().toISOString()
        };

        // Add to UI instantly (Optimistic UI)
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const formData = new FormData();
            formData.append('media', file);
            
            // 5. Optimization: Backend already handles Cloudinary, here we just upload
            const uploadResult = await messageService.uploadImage(formData);
            
            if (uploadResult.success) {
                // Save message to MongoDB
                const saveResult = await messageService.sendMessage(selected, '', 'image', null, uploadResult.mediaUrl);
                
                if (saveResult.success) {
                    // Replace temporary message with final server data (fallback in case socket missed/delayed)
                    setMessages((prev) => 
                        prev.map((m) => (m._id === tempId || (m.isUploading && m.image === previewUrl)) ? { ...saveResult.data, isUploading: false } : m)
                    );
                } else {
                    throw new Error('Failed to save message');
                }
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Failed to send image:', error);
            // Mark as failed instead of removing, so user can retry or see error
            setMessages((prev) => 
                prev.map((m) => m._id === tempId ? { ...m, isUploading: false, isFailed: true } : m)
            );
        } finally {
            // Revoke object URL after a while or immediately if needed
            // Actually, we keep it until the image state updates with the Cloudinary URL
            setTimeout(() => URL.revokeObjectURL(previewUrl), 10000); 
        }
    };



    const selectedChatData = conversations.find(c => c._id === selected);
    const otherParticipant = selectedChatData && !selectedChatData.isGroup 
        ? selectedChatData.participants.find(p => p._id !== user?.id) 
        : null;

    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const result = await chatService.getChats();
            if (result.success) {
                setConversations(result.data);
                
                if (initialChat) {
                    setSelected(initialChat._id);
                    if (!result.data.find(c => c._id === initialChat._id)) {
                        setConversations(prev => [initialChat, ...prev]);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [initialChat]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const handleDeleteConversation = async (e, chatId) => {
        e.stopPropagation();
        try {
            const result = await chatService.hideChat(chatId);
            if (result.success) {
                setConversations(prev => prev.filter(c => c._id !== chatId));
                if (selected === chatId) {
                    setSelected(null);
                }
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    const filtered = conversations.filter(c => {
        if (!user) return false;
        const oPart = c.participants.find(p => p._id !== (user.id || user._id));
        const name = c.isGroup ? (c.name || 'Group Chat') : (oPart?.name || oPart?.username || 'Unknown');
        return name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#0f0f0f',
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: '#e8e8e8',
            overflow: 'hidden',
        }}>
            <ConversationSidebar 
                search={search}
                setSearch={setSearch}
                onBack={onBack}
                conversations={filtered}
                loading={loading}
                selected={selected}
                setSelected={setSelected}
                user={user}
                handleDeleteConversation={handleDeleteConversation}
            />

            {selected ? (
                <ChatPanel 
                    selected={selected}
                    setSelected={setSelected}
                    otherParticipant={otherParticipant}
                    onUserClick={onUserClick}
                    onPostClick={onPostClick}
                    messages={messages}
                    loadingMessages={loadingMessages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                    handleSendImage={handleSendImage}
                    messagesEndRef={messagesEndRef}
                    user={user}
                />

            ) : (
                <ChatEmptyState />
            )}
        </div>
    );
};

export default MessagesPage;
