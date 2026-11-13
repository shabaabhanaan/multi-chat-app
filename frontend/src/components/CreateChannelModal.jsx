import React, { useState } from 'react';
import { createRoom } from '../services/api';
import { X, Hash, Plus } from 'lucide-react';

const CreateChannelModal = ({ onClose, onChannelCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setError('');
        setLoading(true);

        try {
            const res = await createRoom({
                name: name.trim(),
                description: description.trim(),
            });

            if (onChannelCreated) {
                onChannelCreated(res.data);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create channel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} className="animate-fade-in" onClick={onClose}>
            <div
                style={styles.card}
                className="animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={styles.iconBadge}>
                            <Hash size={18} color="#3b82f6" />
                        </div>
                        <h3 style={styles.title}>Create New Channel</h3>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} color="#94a3b8" />
                    </button>
                </div>

                <p style={styles.subtitle}>
                    Channels are where your team communicates. They are best organized around a topic — #project, #marketing, etc.
                </p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Channel Name</label>
                        <div style={styles.inputWithPrefix}>
                            <span style={styles.prefix}>#</span>
                            <input
                                type="text"
                                required
                                placeholder="e.g. general-talk"
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                style={styles.innerInput}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description (Optional)</label>
                        <input
                            type="text"
                            placeholder="What is this channel about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            style={{
                                ...styles.createBtn,
                                ...(!name.trim() || loading ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                            }}
                        >
                            <Plus size={16} style={{ marginRight: 4 }} />
                            {loading ? 'Creating...' : 'Create Channel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
    },
    card: {
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        padding: '24px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    iconBadge: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: '17px',
        fontWeight: '700',
        color: '#f8fafc',
    },
    closeBtn: {
        background: 'none',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitle: {
        fontSize: '13px',
        color: '#94a3b8',
        marginBottom: '16px',
        lineHeight: '1.4',
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        marginBottom: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    },
    inputWithPrefix: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    prefix: {
        padding: '9px 0 9px 12px',
        color: '#64748b',
        fontSize: '16px',
        fontWeight: '600',
    },
    innerInput: {
        flex: 1,
        backgroundColor: 'transparent',
        border: 'none',
        padding: '9px 12px 9px 6px',
        fontSize: '14px',
        color: '#f8fafc',
    },
    input: {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '9px 12px',
        fontSize: '14px',
        color: '#f8fafc',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '10px',
        paddingTop: '12px',
        borderTop: '1px solid #334155',
    },
    cancelBtn: {
        padding: '8px 14px',
        backgroundColor: 'transparent',
        color: '#94a3b8',
        borderRadius: '8px',
        fontSize: '13px',
    },
    createBtn: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
    },
};

export default CreateChannelModal;

