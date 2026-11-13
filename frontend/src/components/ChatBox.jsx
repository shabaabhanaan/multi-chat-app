import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import { uploadFile } from '../services/api';
import {
    Send,
    Paperclip,
    Smile,
    Search,
    X,
    Hash,
    Menu,
    Image,
    FileText,
    Loader2,
} from 'lucide-react';

const POPULAR_EMOJIS = ['👋', '👍', '❤️', '🔥', '🎉', '🚀', '😂', '💡', '✨', '🙌', '😎', '👀', '💯', '👏'];

const ChatBox = ({
    activeRoom,
    messages,
    onSendMessage,
    currentUser,
    typingUsers,
    onTyping,
    onStopTyping,
    onToggleMobileSidebar,
}) => {
    const [input, setInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (!isSearching) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, typingUsers, isSearching]);

    // Handle typing indicator
    const handleInputChange = (e) => {
        setInput(e.target.value);

        if (onTyping) {
            onTyping();
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (onStopTyping) {
                onStopTyping();
            }
        }, 2000);
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setFilePreview(ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedFile) return;

        let fileData = null;

        if (selectedFile) {
            setUploading(true);
            try {
                const uploadRes = await uploadFile(selectedFile);
                fileData = uploadRes.data;
            } catch (err) {
                console.error('File upload failed:', err);
                alert('File upload failed. Please try again.');
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        onSendMessage({
            content: input.trim(),
            fileUrl: fileData ? fileData.fileUrl : null,
            fileType: fileData ? fileData.fileType : null,
            fileName: fileData ? fileData.fileName : null,
            fileSize: fileData ? fileData.fileSize : null,
        });

        setInput('');
        handleClearFile();
        setShowEmojiPicker(false);

        if (onStopTyping) {
            onStopTyping();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emoji) => {
        setInput((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Filter messages if search is active
    const displayedMessages = searchQuery.trim()
        ? messages.filter((m) =>
              m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : messages;

    // Determine room details
    const isDM = activeRoom?.isDirectMessage;
    const dmPartner = isDM
        ? activeRoom?.members?.find((m) => (m._id || m) !== currentUser?._id)
        : null;

    const roomTitle = isDM
        ? dmPartner?.username || 'Direct Message'
        : `#${activeRoom?.name || 'general'}`;

    const roomSubtitle = isDM
        ? dmPartner?.status || (dmPartner?.isOnline ? 'Online' : 'Offline')
        : activeRoom?.description || `${activeRoom?.members?.length || 0} members`;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        style={styles.mobileMenuBtn}
                        onClick={onToggleMobileSidebar}
                        title="Toggle Sidebar"
                    >
                        <Menu size={20} color="#cbd5e1" />
                    </button>

                    <div style={styles.headerTitleGroup}>
                        <div style={styles.titleRow}>
                            {!isDM && <Hash size={18} color="#3b82f6" style={{ marginRight: 6 }} />}
                            <h2 style={styles.titleText}>{roomTitle}</h2>
                            {isDM && (
                                <span
                                    style={{
                                        ...styles.headerStatusDot,
                                        backgroundColor: dmPartner?.isOnline ? '#10b981' : '#64748b',
                                    }}
                                />
                            )}
                        </div>
                        <span style={styles.subtitleText}>{roomSubtitle}</span>
                    </div>
                </div>

                {/* Search Bar Toggle */}
                <div style={styles.headerRight}>
                    {isSearching ? (
                        <div style={styles.searchBar}>
                            <Search size={14} color="#94a3b8" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search in this chat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                            <button
                                style={styles.closeSearchBtn}
                                onClick={() => {
                                    setIsSearching(false);
                                    setSearchQuery('');
                                }}
                            >
                                <X size={14} color="#94a3b8" />
                            </button>
                        </div>
                    ) : (
                        <button
                            style={styles.searchToggleBtn}
                            onClick={() => setIsSearching(true)}
                            title="Search messages"
                        >
                            <Search size={18} color="#94a3b8" />
                        </button>
                    )}
                </div>
            </div>

            {/* Message Area */}
            <div style={styles.chatMessages}>
                {displayedMessages.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyBadge}>
                            {isDM ? <Smile size={32} color="#3b82f6" /> : <Hash size={32} color="#3b82f6" />}
                        </div>
                        <h3 style={styles.emptyTitle}>
                            {searchQuery
                                ? 'No messages match your search'
                                : isDM
                                ? `This is the start of your direct messages with ${dmPartner?.username || 'this user'}`
                                : `Welcome to #${activeRoom?.name || 'chat'}!`}
                        </h3>
                        <p style={styles.emptySubtitle}>
                            {searchQuery
                                ? 'Try searching for a different keyword.'
                                : 'Say hello or share a file to kick things off.'}
                        </p>
                    </div>
                ) : (
                    displayedMessages.map((msg, index) => (
                        <Message
                            key={msg._id || index}
                            message={msg}
                            currentUser={currentUser}
                        />
                    ))
                )}

                {/* Typing Indicator */}
                {typingUsers && typingUsers.length > 0 && (
                    <div style={styles.typingContainer}>
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span style={styles.typingText}>
                            {typingUsers.map((u) => u.username).join(', ')}{' '}
                            {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Controls */}
            <div style={styles.inputArea}>
                {/* File Attachment Preview */}
                {selectedFile && (
                    <div style={styles.previewBar}>
                        {filePreview ? (
                            <img src={filePreview} alt="Upload preview" style={styles.previewThumbnail} />
                        ) : (
                            <div style={styles.filePreviewIcon}>
                                <FileText size={20} color="#3b82f6" />
                            </div>
                        )}
                        <div style={styles.previewInfo}>
                            <span style={styles.previewFileName}>{selectedFile.name}</span>
                            <span style={styles.previewFileSize}>
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                        <button style={styles.removePreviewBtn} onClick={handleClearFile}>
                            <X size={14} color="#f8fafc" />
                        </button>
                    </div>
                )}

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div style={styles.emojiPicker}>
                        {POPULAR_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                style={styles.emojiBtn}
                                onClick={() => handleEmojiClick(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Bar */}
                <div style={styles.inputBox}>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <button
                        type="button"
                        style={styles.actionBtn}
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach file or image"
                    >
                        <Paperclip size={18} color="#94a3b8" />
                    </button>

                    <button
                        type="button"
                        style={styles.actionBtn}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Add emoji"
                    >
                        <Smile size={18} color="#94a3b8" />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        style={styles.input}
                        placeholder={
                            isDM
                                ? `Message ${dmPartner?.username || 'user'}...`
                                : `Message #${activeRoom?.name || 'chat'}...`
                        }
                    />

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={uploading || (!input.trim() && !selectedFile)}
                        style={{
                            ...styles.sendButton,
                            ...(!input.trim() && !selectedFile
                                ? { opacity: 0.5, cursor: 'not-allowed' }
                                : {}),
                        }}
                    >
                        {uploading ? (
                            <Loader2 size={16} className="animate-spin" color="#fff" />
                        ) : (
                            <Send size={16} color="#fff" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0f172a',
        overflow: 'hidden',
    },
    header: {
        height: '64px',
        padding: '0 20px',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    mobileMenuBtn: {
        display: 'flex',
        alignItems: 'center',
        background: 'none',
        padding: '6px',
        borderRadius: '6px',
    },
    headerTitleGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
    },
    titleText: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#f8fafc',
    },
    headerStatusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        marginLeft: '8px',
    },
    subtitleText: {
        fontSize: '11px',
        color: '#94a3b8',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
    },
    searchToggleBtn: {
        background: 'none',
        padding: '8px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '4px 10px',
        gap: '6px',
    },
    searchInput: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#f8fafc',
        fontSize: '12px',
        width: '180px',
    },
    closeSearchBtn: {
        background: 'none',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
    },
    chatMessages: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    emptyState: {
        margin: 'auto',
        textAlign: 'center',
        maxWidth: '360px',
        padding: '40px 20px',
    },
    emptyBadge: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
    },
    emptyTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: '6px',
    },
    emptySubtitle: {
        fontSize: '13px',
        color: '#94a3b8',
        lineHeight: '1.4',
    },
    typingContainer: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 14px',
        gap: '4px',
    },
    typingText: {
        fontSize: '12px',
        color: '#94a3b8',
        marginLeft: '6px',
        fontStyle: 'italic',
    },
    inputArea: {
        padding: '14px 20px',
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
        position: 'relative',
    },
    previewBar: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '6px 10px',
        marginBottom: '10px',
        gap: '10px',
    },
    previewThumbnail: {
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        objectFit: 'cover',
    },
    filePreviewIcon: {
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewInfo: {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    previewFileName: {
        fontSize: '12px',
        color: '#f8fafc',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    previewFileSize: {
        fontSize: '10px',
        color: '#94a3b8',
    },
    removePreviewBtn: {
        background: '#ef4444',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiPicker: {
        position: 'absolute',
        bottom: '70px',
        left: '20px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        maxWidth: '280px',
        zIndex: 50,
    },
    emojiBtn: {
        fontSize: '20px',
        background: 'none',
        padding: '6px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputBox: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '6px 10px',
        gap: '8px',
    },
    actionBtn: {
        background: 'none',
        padding: '6px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        border: 'none',
        padding: '8px 4px',
        fontSize: '14px',
        color: '#f8fafc',
    },
    sendButton: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
    },
};

export default ChatBox;
