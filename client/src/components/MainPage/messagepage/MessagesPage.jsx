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
                const messageExists = prev.find(m => m._id === message._id);
                if (messageExists || message.chat !== selected) return prev;
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
    }, [selected]);

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
