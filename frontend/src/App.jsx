import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatBox from './components/ChatBox';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import CreateChannelModal from './components/CreateChannelModal';
import {
    getRooms,
    getMessages,
    getUsers,
    getOrCreateDM,
    getMe,
} from './services/api';
import {
    initSocket,
    getSocket,
    disconnectSocket,
} from './services/socket';

function App() {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const activeRoomRef = useRef(activeRoom);
    useEffect(() => {
        activeRoomRef.current = activeRoom;
    }, [activeRoom]);

    // Check auth on load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await getMe();
                    setCurrentUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setCurrentUser(null);
                }
            }
        };
        checkAuth();
    }, []);

    // Setup Socket.IO & Initial Data when currentUser changes
    useEffect(() => {
        if (!currentUser) {
            disconnectSocket();
            setRooms([]);
            setActiveRoom(null);
            setMessages([]);
            setAllUsers([]);
            return;
        }

        const socket = initSocket(currentUser);

        // Socket event listeners
        socket.on('online_users', (userIds) => {
            setOnlineUserIds(userIds);
        });

        socket.on('message_received', (newMessage) => {
            if (activeRoomRef.current && newMessage.room === activeRoomRef.current._id) {
                setMessages((prev) => [...prev, newMessage]);
            }

            // Update lastMessage in rooms list
            setRooms((prevRooms) =>
                prevRooms.map((r) =>
                    r._id === newMessage.room ? { ...r, lastMessage: newMessage } : r
                )
            );
        });

        socket.on('user_typing', ({ roomId, username, userId }) => {
            if (
                activeRoomRef.current &&
                roomId === activeRoomRef.current._id &&
                userId !== currentUser._id
            ) {
                setTypingUsers((prev) => {
                    if (prev.some((u) => u.userId === userId)) return prev;
                    return [...prev, { userId, username }];
                });
            }
        });

        socket.on('user_stop_typing', ({ roomId, userId }) => {
            if (activeRoomRef.current && roomId === activeRoomRef.current._id) {
                setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
            }
        });

        // Load rooms and users
        loadInitialData();

        return () => {
            socket.off('online_users');
            socket.off('message_received');
            socket.off('user_typing');
            socket.off('user_stop_typing');
        };
    }, [currentUser?._id]);

    const loadInitialData = async () => {
        try {
            const [roomsRes, usersRes] = await Promise.all([getRooms(), getUsers()]);
            setRooms(roomsRes.data);
            setAllUsers(usersRes.data);

            if (roomsRes.data.length > 0) {
                // Select first room (#general or default)
                handleSelectRoom(roomsRes.data[0]);
            }
        } catch (err) {
            console.error('Error loading initial data:', err);
        }
    };

    // Switching active room
    const handleSelectRoom = async (room) => {
        const socket = getSocket();

        if (activeRoom) {
            socket?.emit('leave_room', activeRoom._id);
        }

        setActiveRoom(room);
        setTypingUsers([]);

        socket?.emit('join_room', room._id);

        try {
            const res = await getMessages(room._id);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    // Selecting a user for DM
    const handleSelectUserDM = async (targetUser) => {
        try {
            const res = await getOrCreateDM(targetUser._id);
            const dmRoom = res.data;

            // Check if already in rooms list
            setRooms((prev) => {
                if (!prev.some((r) => r._id === dmRoom._id)) {
                    return [dmRoom, ...prev];
                }
                return prev;
            });

            handleSelectRoom(dmRoom);
        } catch (err) {
            console.error('Error creating/opening DM:', err);
        }
    };

    // Sending a message
    const handleSendMessage = (messagePayload) => {
        if (!activeRoom || !currentUser) return;

        const socket = getSocket();
        socket?.emit('send_message', {
            roomId: activeRoom._id,
            senderId: currentUser._id,
            ...messagePayload,
        });
    };

    // Typing socket events
    const handleTyping = () => {
        if (!activeRoom || !currentUser) return;
        const socket = getSocket();
        socket?.emit('typing', {
            roomId: activeRoom._id,
            username: currentUser.username,
            userId: currentUser._id,
        });
    };

    const handleStopTyping = () => {
        if (!activeRoom || !currentUser) return;
        const socket = getSocket();
        socket?.emit('stop_typing', {
            roomId: activeRoom._id,
            userId: currentUser._id,
        });
    };

    // Logout
    const handleLogout = () => {
        disconnectSocket();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setActiveRoom(null);
        setMessages([]);
    };

    return (
        <div style={styles.appContainer}>
            {/* Show AuthModal if user is not authenticated */}
            {!currentUser && (
                <AuthModal
                    onAuthSuccess={(user) => {
                        setCurrentUser(user);
                    }}
                />
            )}

            {/* Main Application Layout */}
            {currentUser && (
                <div style={styles.mainLayout}>
                    <Sidebar
                        currentUser={currentUser}
                        rooms={rooms}
                        activeRoom={activeRoom}
                        onSelectRoom={handleSelectRoom}
                        allUsers={allUsers}
                        onlineUserIds={onlineUserIds}
                        onSelectUserDM={handleSelectUserDM}
                        onOpenCreateChannel={() => setIsCreateChannelModalOpen(true)}
                        onOpenProfile={() => setIsProfileModalOpen(true)}
                        onLogout={handleLogout}
                        mobileOpen={mobileSidebarOpen}
                        onCloseMobile={() => setMobileSidebarOpen(false)}
                    />

                    {/* Chat Area */}
                    <main style={styles.chatArea}>
                        {activeRoom ? (
                            <ChatBox
                                activeRoom={activeRoom}
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                currentUser={currentUser}
                                typingUsers={typingUsers}
                                onTyping={handleTyping}
                                onStopTyping={handleStopTyping}
                                onToggleMobileSidebar={() =>
                                    setMobileSidebarOpen(!mobileSidebarOpen)
                                }
                            />
                        ) : (
                            <div style={styles.selectRoomPrompt}>
                                <h2>Select a channel or message to begin</h2>
                            </div>
                        )}
                    </main>

                    {/* Modals */}
                    {isProfileModalOpen && (
                        <ProfileModal
                            user={currentUser}
                            onClose={() => setIsProfileModalOpen(false)}
                            onProfileUpdated={(updated) => {
                                setCurrentUser(updated);
                                setAllUsers((prev) =>
                                    prev.map((u) => (u._id === updated._id ? updated : u))
                                );
                            }}
                        />
                    )}

                    {isCreateChannelModalOpen && (
                        <CreateChannelModal
                            onClose={() => setIsCreateChannelModalOpen(false)}
                            onChannelCreated={(newRoom) => {
                                setRooms((prev) => [...prev, newRoom]);
                                handleSelectRoom(newRoom);
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    appContainer: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0f172a',
    },
    mainLayout: {
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
    },
    selectRoomPrompt: {
        margin: 'auto',
        color: '#64748b',
        fontSize: '18px',
    },
};

export default App;
