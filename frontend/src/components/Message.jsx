import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Image as ImageIcon, X } from 'lucide-react';

const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const Message = ({ message, currentUser }) => {
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const isOwn = message.sender?._id === currentUser?._id;
    const sender = message.sender || { username: 'Unknown User' };

    const avatarUrl =
        sender.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${sender.username || 'User'}`;

    return (
        <div style={{ ...styles.messageRow, ...(isOwn ? styles.ownRow : {}) }}>
            {/* Avatar */}
            <div style={styles.avatarWrapper}>
                <img
                    src={avatarUrl}
                    alt={sender.username}
                    style={styles.avatar}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${sender.username || 'User'}`;
                    }}
                />
            </div>

            {/* Bubble */}
            <div style={{ ...styles.contentWrapper, ...(isOwn ? styles.ownContentWrapper : {}) }}>
                <div style={styles.metaRow}>
                    <span style={styles.senderName}>{sender.username}</span>
                    <span style={styles.timestamp}>{formatTime(message.createdAt)}</span>
                </div>

                <div style={{ ...styles.bubble, ...(isOwn ? styles.ownBubble : styles.otherBubble) }}>
                    {/* Text content */}
                    {message.content && (
                        <p style={styles.text}>{message.content}</p>
                    )}

                    {/* Image Attachment */}
                    {message.fileUrl && message.fileType === 'image' && (
                        <div style={styles.imageContainer}>
                            <img
                                src={message.fileUrl}
                                alt={message.fileName || 'Image attachment'}
                                style={styles.imageThumbnail}
                                onClick={() => setImageModalOpen(true)}
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* File Attachment */}
                    {message.fileUrl && message.fileType === 'file' && (
                        <a
                            href={message.fileUrl}
                            download={message.fileName || 'download'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.fileCard}
                        >
                            <div style={styles.fileIconBadge}>
                                <FileText size={20} color="#3b82f6" />
                            </div>
                            <div style={styles.fileInfo}>
                                <span style={styles.fileName}>{message.fileName || 'Attachment'}</span>
                                {message.fileSize && (
                                    <span style={styles.fileSize}>{formatFileSize(message.fileSize)}</span>
                                )}
                            </div>
                            <Download size={16} color="#94a3b8" style={{ marginLeft: 8 }} />
                        </a>
                    )}
                </div>
            </div>

            {/* Fullscreen Image Lightbox */}
            {imageModalOpen && (
                <div
                    style={styles.lightboxOverlay}
                    onClick={() => setImageModalOpen(false)}
                    className="animate-fade-in"
                >
                    <button
                        style={styles.lightboxCloseBtn}
                        onClick={() => setImageModalOpen(false)}
                    >
                        <X size={24} color="#fff" />
                    </button>
                    <img
                        src={message.fileUrl}
                        alt={message.fileName || 'Fullscreen Image'}
                        style={styles.lightboxImg}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

const styles = {
    messageRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '6px 12px',
        borderRadius: '8px',
        transition: 'background-color 0.15s ease',
    },
    ownRow: {
        flexDirection: 'row-reverse',
    },
    avatarWrapper: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#334155',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    avatar: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '72%',
    },
    ownContentWrapper: {
        alignItems: 'flex-end',
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px',
        paddingLeft: '2px',
        paddingRight: '2px',
    },
    senderName: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#e2e8f0',
    },
    timestamp: {
        fontSize: '11px',
        color: '#64748b',
    },
    bubble: {
        padding: '10px 14px',
        borderRadius: '14px',
        wordBreak: 'break-word',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    otherBubble: {
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderTopLeftRadius: '2px',
        color: '#f8fafc',
    },
    ownBubble: {
        backgroundColor: '#2563eb',
        borderTopRightRadius: '2px',
        color: '#ffffff',
    },
    text: {
        fontSize: '14px',
        lineHeight: '1.45',
        margin: 0,
        whiteSpace: 'pre-wrap',
    },
    imageContainer: {
        marginTop: '8px',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        maxHeight: '300px',
    },
    imageThumbnail: {
        display: 'block',
        maxWidth: '100%',
        maxHeight: '280px',
        borderRadius: '8px',
        objectFit: 'cover',
        transition: 'transform 0.2s ease',
    },
    fileCard: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        marginTop: '8px',
        textDecoration: 'none',
        color: '#f8fafc',
        transition: 'border-color 0.15s ease',
    },
    fileIconBadge: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '10px',
        flexShrink: 0,
    },
    fileInfo: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    fileName: {
        fontSize: '13px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '180px',
    },
    fileSize: {
        fontSize: '11px',
        color: '#94a3b8',
    },
    lightboxOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    lightboxCloseBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lightboxImg: {
        maxWidth: '90vw',
        maxHeight: '90vh',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
    },
};

export default Message;
