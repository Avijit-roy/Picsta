import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import userService from '../../../../services/userService';
import ListSkeleton from './ListSkeleton';

// --- Sub-components ---

const SearchIcon = memo(() => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
));

const UserListItem = memo(({ item, isRecent, onClick, onRemove }) => (
    <div
        onClick={() => onClick(item.username)}
        style={styles.listItem}
        onMouseEnter={e => e.currentTarget.style.background = '#1e1e1e'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
        <img
            src={item.avatar || item.profilePicture || defaultAvatar}
            alt={item.name}
            style={styles.avatar}
        />

        <div style={styles.textContainer}>
            <span style={styles.username}>
                {item.username}
            </span>
            <div style={styles.displayName}>
                {item.name}
            </div>
        </div>

        {isRecent && (
            <button
                onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                style={styles.removeBtn}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        )}
    </div>
));

const defaultAvatar = "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

const SearchPanel = ({ onClose, onUserClick, mobile = false }) => {
    const [query, setQuery] = useState('');
    const [recents, setRecents] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Fetch recent searches on mount
    const fetchRecents = useCallback(async () => {
        try {
            const result = await userService.getRecentSearches();
            if (result.success) {
                // Map backend user objects to the format expected by UserListItem if needed
                // Backend returns: [{ _id, name, username, profilePicture, isVerified }]
                // UserListItem uses: item.avatar || item.profilePicture
                setRecents(result.data.map(u => ({
                    id: u._id,
                    username: u.username,
                    name: u.name,
                    profilePicture: u.profilePicture,
                    isVerified: u.isVerified
                })));
            }
        } catch (error) {
            console.error('Failed to fetch recents:', error);
        }
    }, []);

    useEffect(() => {
        fetchRecents();
        const timer = setTimeout(() => inputRef.current?.focus(), 200);
        return () => clearTimeout(timer);
    }, [fetchRecents]);

    const handleSearch = useCallback(async (searchQuery) => {
        const cleanQuery = searchQuery.trim();
        if (!cleanQuery || cleanQuery === '@') {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const result = await userService.searchUsers(cleanQuery);
            if (result.success) setSearchResults(result.data);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (query) {
            debounceTimer.current = setTimeout(() => handleSearch(query), 300);
        } else {
            setSearchResults([]);
        }

        return () => clearTimeout(debounceTimer.current);
    }, [query, handleSearch]);

    const handleInputChange = (e) => {
        let val = e.target.value;
        if (val && !val.startsWith('@')) val = '@' + val;
        setQuery(val);
    };

    const removeRecent = async (id) => {
        try {
            const result = await userService.removeRecentSearch(id);
            if (result.success) {
                setRecents(prev => prev.filter(x => x.id !== id));
            }
        } catch (error) {
            console.error('Failed to remove recent:', error);
        }
    };

    const clearAllRecents = async () => {
        try {
            const result = await userService.clearAllRecentSearches();
            if (result.success) {
                setRecents([]);
            }
        } catch (error) {
            console.error('Failed to clear recents:', error);
        }
    };

    const handleUserClick = (username) => {
        onUserClick?.(username);
        onClose();
    };

    // Filter displayList to ensure unique IDs as a safety measure
    const displayList = (query.length > 0 ? searchResults : recents).filter((item, index, self) => 
        index === self.findIndex((t) => (
            (t.id || t._id) === (item.id || item._id)
        ))
    );

    return (
        <div style={{ ...styles.panel, width: mobile ? '100vw' : '380px', borderRight: mobile ? 'none' : '1px solid #262626', borderRadius: mobile ? '0' : '0 16px 16px 0', paddingBottom: mobile ? '70px' : '20px', boxShadow: mobile ? 'none' : '4px 0 24px rgba(0,0,0,0.7)' }}>
            
            {/* Header */}
            <div style={styles.header}>
                <span style={styles.headerTitle}>Search</span>
                <button onClick={onClose} style={styles.closeBtn} onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Input Section */}
            <div style={styles.inputContainer}>
                <div style={styles.inputWrapper}>
                    <SearchIcon />
                    <input ref={inputRef} value={query} onChange={handleInputChange} placeholder="Search" style={styles.input} />
                    {query && (
                        <button onClick={() => { setQuery(''); setSearchResults([]); }} style={styles.clearInputBtn}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div style={styles.divider} />

            {/* List Header */}
            <div style={styles.listHeader}>
                <span style={styles.listHeaderLabel}>
                    {query.length > 0 ? 'Search Results' : 'Recent'}
                </span>
                {query.length === 0 && recents.length > 0 && (
                    <button onClick={clearAllRecents} style={styles.clearAllBtn}>Clear all</button>
                )}
            </div>

            {/* Result List */}
            <div style={styles.listArea}>
                {isLoading ? (
                    <ListSkeleton />
                ) : displayList.length === 0 ? (
                    <p style={styles.emptyText}>
                        {query.length > 0 ? 'No results found.' : 'No recent searches.'}
                    </p>
                ) : (
                    displayList.map((item, idx) => (
                        <UserListItem 
                            key={item.id || item._id || idx} 
                            item={item} 
                            isRecent={query.length === 0} 
                            onClick={handleUserClick} 
                            onRemove={removeRecent} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    panel: {
        height: '100vh',
        backgroundColor: '#000000ff',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        overflowY: 'hidden',
        position: 'relative',
    },
    header: { padding: '4px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: '22px', fontWeight: 700, color: '#fff' },
    closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%', transition: 'background 0.2s', lineHeight: 0 },
    inputContainer: { padding: '0 20px 20px' },
    inputWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '10px 14px', gap: '10px' },
    input: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', flex: 1, caretColor: '#fff' },
    clearInputBtn: { background: '#888', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0 },
    divider: { height: '1px', backgroundColor: '#262626', margin: '0 0 16px' },
    listHeader: { padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    listHeaderLabel: { fontSize: '15px', fontWeight: 600, color: '#fff' },
    clearAllBtn: { background: 'transparent', border: 'none', color: '#3897f0', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 },
    listArea: { overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' },
    loaderContainer: { display: 'flex', justifyContent: 'center', marginTop: '40px' },
    emptyText: { textAlign: 'center', color: '#555', fontSize: '14px', marginTop: '40px' },
    listItem: { display: 'flex', alignItems: 'center', padding: '10px 20px', cursor: 'pointer', transition: 'background 0.15s', gap: '14px' },
    avatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
    textContainer: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    username: { color: '#fff', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    displayName: { color: '#8e8e8e', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    removeBtn: { background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' },
};

export default SearchPanel;
