import React, { useState } from 'react';
import {
    Hash,
    Plus,
    Search,
    Settings,
    LogOut,
    MessageSquare,
    User,
    X,
    Users,
} from 'lucide-react';

const Sidebar = ({
    currentUser,
    rooms = [],
    activeRoom,
    onSelectRoom,
    allUsers = [],
    onlineUserIds = [],
    onSelectUserDM,
    onOpenCreateChannel,
    onOpenProfile,
    onLogout,
    mobileOpen,
    onCloseMobile,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const channelRooms = (rooms || []).filter((r) => r && !r.isDirectMessage);

    const query = (searchQuery || '').trim().toLowerCase();

    const filteredChannels = channelRooms.filter((r) =>
        (r?.name || '').toLowerCase().includes(query)
    );

    const filteredUsers = (allUsers || []).filter((u) => {
        if (!u || u._id === currentUser?._id) return false;
        const name = (u.username || '').toLowerCase();
        const status = (u.status || '').toLowerCase();
        return name.includes(query) || status.includes(query);
    });

    const isUserOnline = (userId) => {
        return Boolean(userId && onlineUserIds.includes(userId));
    };

    return (
        <aside
            style={{
                ...styles.sidebar,
                ...(mobileOpen ? styles.sidebarMobileOpen : {}),
            }}
        >
            {/* Top Brand Header */}
            <div style={styles.brandHeader}>
                <div style={styles.brandLeft}>
                    <div style={styles.brandBadge}>
                        <MessageSquare size={18} color="#fff" />
                    </div>
                    <span style={styles.brandText}>Multi-Chat</span>
                </div>
                {mobileOpen && (
                    <button style={styles.iconBtn} onClick={onCloseMobile}>
                        <X size={20} color="#94a3b8" />
                    </button>
                )}
            </div>

            {/* Current User Card */}
            <div style={styles.currentUserCard}>
                <div style={styles.userAvatarContainer}>
                    <img
                        src={
                            currentUser?.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'User'}`
                        }
                        alt={currentUser?.username || 'User'}
                        style={styles.currentUserAvatar}
                    />
                    <span style={styles.onlineBadge} />
                </div>
                <div style={styles.userInfo}>
                    <span style={styles.currentUserName}>{currentUser?.username || 'User'}</span>
                    <span style={styles.currentUserStatus}>
                        {currentUser?.status || 'Online'}
                    </span>
                </div>
                <div style={styles.userActions}>
                    <button
                        title="Edit Profile"
                        style={styles.iconBtn}
                        onClick={onOpenProfile}
                    >
                        <Settings size={16} color="#94a3b8" />
                    </button>
                    <button
                        title="Sign Out"
                        style={styles.iconBtn}
                        onClick={onLogout}
                    >
                        <LogOut size={16} color="#ef4444" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div style={styles.searchWrapper}>
                <Search size={14} color="#64748b" style={{ marginRight: 8 }} />
                <input
                    type="text"
                    placeholder="Search channels & users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />
                {searchQuery && (
                    <button style={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>
                        <X size={12} color="#94a3b8" />
                    </button>
                )}
            </div>

            {/* Scrollable list of Channels and DMs */}
            <div style={styles.listsContainer}>
                {/* Channels Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>Channels</span>
                        <button
                            title="Create Channel"
                            style={styles.addChannelBtn}
                            onClick={onOpenCreateChannel}
                        >
                            <Plus size={15} color="#94a3b8" />
                        </button>
                    </div>

                    <div style={styles.itemsList}>
                        {filteredChannels.length === 0 ? (
                            <div style={styles.emptyNote}>No channels found</div>
                        ) : (
                            filteredChannels.map((room) => {
                                const isActive = activeRoom?._id === room._id;
                                return (
                                    <button
                                        key={room._id}
                                        style={{
                                            ...styles.roomItem,
                                            ...(isActive ? styles.activeRoomItem : {}),
                                        }}
                                        onClick={() => {
                                            onSelectRoom(room);
                                            if (onCloseMobile) onCloseMobile();
                                        }}
                                    >
                                        <Hash
                                            size={16}
                                            color={isActive ? '#ffffff' : '#64748b'}
                                            style={{ marginRight: 8, flexShrink: 0 }}
                                        />
                                        <span style={styles.roomName}>{room.name}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Direct Messages Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={styles.sectionTitle}>Direct Messages</span>
                            <span style={styles.countBadge}>
                                {(allUsers || []).filter((u) => u && u._id !== currentUser?._id && isUserOnline(u._id)).length} online
                            </span>
                        </div>
                    </div>

                    <div style={styles.itemsList}>
                        {filteredUsers.length === 0 ? (
                            <div style={styles.emptyNote}>No users found</div>
                        ) : (
                            filteredUsers.map((user) => {
                                const online = isUserOnline(user._id);
                                const isActive =
                                    activeRoom?.isDirectMessage &&
                                    activeRoom?.members?.some((m) =>
                                        (m?._id || m) === user._id
                                    );

                                return (
                                    <button
                                        key={user._id}
                                        style={{
                                            ...styles.roomItem,
                                            ...(isActive ? styles.activeRoomItem : {}),
                                        }}
                                        onClick={() => {
                                            onSelectUserDM(user);
                                            if (onCloseMobile) onCloseMobile();
                                        }}
                                    >
                                        <div style={styles.dmAvatarWrapper}>
                                            <img
                                                src={
                                                    user.avatar ||
                                                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || 'User'}`
                                                }
                                                alt={user.username || 'User'}
                                                style={styles.dmAvatar}
                                            />
                                            <span
                                                style={{
                                                    ...styles.userStatusDot,
                                                    backgroundColor: online ? '#10b981' : '#64748b',
                                                }}
                                            />
                                        </div>
                                        <div style={styles.dmInfo}>
                                            <span style={styles.roomName}>{user.username || 'User'}</span>
                                            {user.status && (
                                                <span style={styles.dmStatusSnippet}>
                                                    {user.status}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

const styles = {
    sidebar: {
        width: '280px',
        height: '100%',
        backgroundColor: '#1e293b',
        borderRight: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 40,
        transition: 'transform 0.25s ease-in-out',
    },
    sidebarMobileOpen: {
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        width: '80%',
        maxWidth: '300px',
        boxShadow: '10px 0 25px rgba(0, 0, 0, 0.5)',
    },
    brandHeader: {
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #334155',
    },
    brandLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    brandBadge: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandText: {
        fontSize: '17px',
        fontWeight: '700',
        color: '#f8fafc',
        letterSpacing: '-0.3px',
    },
    currentUserCard: {
        padding: '12px 14px',
        margin: '12px',
        backgroundColor: '#0f172a',
        borderRadius: '10px',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    userAvatarContainer: {
        position: 'relative',
        width: '36px',
        height: '36px',
        flexShrink: 0,
    },
    currentUserAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        backgroundColor: '#334155',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        border: '2px solid #0f172a',
    },
    userInfo: {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    currentUserName: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#f8fafc',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    currentUserStatus: {
        fontSize: '11px',
        color: '#94a3b8',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    userActions: {
        display: 'flex',
        gap: '4px',
    },
    iconBtn: {
        background: 'none',
        padding: '6px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.15s ease',
    },
    searchWrapper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        margin: '0 12px 12px 12px',
        padding: '6px 10px',
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '12px',
        color: '#f8fafc',
    },
    clearSearchBtn: {
        background: 'none',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
    },
    listsContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 10px 16px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px',
        marginBottom: '6px',
    },
    sectionTitle: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
    },
    countBadge: {
        fontSize: '10px',
        padding: '2px 6px',
        borderRadius: '10px',
        backgroundColor: '#0f172a',
        color: '#10b981',
        fontWeight: '600',
    },
    addChannelBtn: {
        background: 'none',
        padding: '3px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    roomItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 10px',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        textAlign: 'left',
        width: '100%',
        color: '#cbd5e1',
        transition: 'all 0.15s ease',
    },
    activeRoomItem: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        fontWeight: '600',
    },
    roomName: {
        fontSize: '13px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
    },
    emptyNote: {
        fontSize: '12px',
        color: '#64748b',
        padding: '6px 10px',
        fontStyle: 'italic',
    },
    dmAvatarWrapper: {
        position: 'relative',
        width: '24px',
        height: '24px',
        marginRight: '10px',
        flexShrink: 0,
    },
    dmAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    userStatusDot: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        border: '1.5px solid #1e293b',
    },
    dmInfo: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flex: 1,
    },
    dmStatusSnippet: {
        fontSize: '10px',
        color: '#94a3b8',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

export default Sidebar;
