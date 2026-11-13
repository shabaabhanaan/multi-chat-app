import React, { useState } from 'react';
import { updateProfile } from '../services/api';
import { X, RefreshCw, Check, Sparkles, User, FileText, Smile } from 'lucide-react';

const AVATAR_COLLECTIONS = [
    'bottts',
    'adventurer',
    'fun-emoji',
    'lorelei',
    'notionists',
];

const STATUS_PRESETS = [
    'Available 🟢',
    'Coding something cool 💻',
    'In a deep focus session 🎧',
    'Away for coffee ☕',
    'Reviewing pull requests 🚀',
    'Do Not Disturb ⛔',
];

const ProfileModal = ({ user, onClose, onProfileUpdated }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [status, setStatus] = useState(user?.status || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const generateRandomAvatar = () => {
        const style = AVATAR_COLLECTIONS[Math.floor(Math.random() * AVATAR_COLLECTIONS.length)];
        const randomSeed = Math.random().toString(36).substring(2, 9);
        const newAvatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${randomSeed}`;
        setAvatar(newAvatarUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const res = await updateProfile({
                username: username.trim(),
                avatar,
                status: status.trim(),
                bio: bio.trim(),
            });

            const updated = res.data;
            localStorage.setItem('user', JSON.stringify(updated));
            setSuccess(true);
            if (onProfileUpdated) onProfileUpdated(updated);
            setTimeout(() => {
                onClose();
            }, 600);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
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
                    <h3 style={styles.title}>Edit Profile</h3>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} color="#94a3b8" />
                    </button>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}
                {success && <div style={styles.successBox}>Profile updated successfully!</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Avatar Preview & Generator */}
                    <div style={styles.avatarSection}>
                        <div style={styles.avatarContainer}>
                            <img
                                src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
                                alt={username}
                                style={styles.avatarImg}
                            />
                        </div>
                        <div style={styles.avatarControls}>
                            <span style={styles.avatarLabel}>Display Avatar</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={generateRandomAvatar}
                                    style={styles.randomAvatarBtn}
                                >
                                    <RefreshCw size={14} style={{ marginRight: 6 }} />
                                    Randomize
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Custom Avatar URL */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Avatar Image URL</label>
                        <input
                            type="text"
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            placeholder="https://... (or use randomizer above)"
                            style={styles.input}
                        />
                    </div>

                    {/* Username */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <User size={13} style={{ marginRight: 4, verticalAlign: -1 }} />
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    {/* Status Presets */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <Smile size={13} style={{ marginRight: 4, verticalAlign: -1 }} />
                            Status Message
                        </label>
                        <input
                            type="text"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            placeholder="What's happening?"
                            style={styles.input}
                        />
                        <div style={styles.presetTags}>
                            {STATUS_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setStatus(preset)}
                                    style={styles.tagBtn}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <FileText size={13} style={{ marginRight: 4, verticalAlign: -1 }} />
                            About You (Bio)
                        </label>
                        <textarea
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell the team a bit about yourself..."
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={styles.saveBtn}>
                            {loading ? 'Saving...' : success ? <Check size={16} /> : 'Save Changes'}
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
        maxWidth: '480px',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        padding: '24px',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        borderBottom: '1px solid #334155',
        paddingBottom: '12px',
    },
    title: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#f8fafc',
    },
    closeBtn: {
        background: 'none',
        padding: '4px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        marginBottom: '16px',
    },
    avatarContainer: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid #3b82f6',
        backgroundColor: '#1e293b',
        flexShrink: 0,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    avatarControls: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    avatarLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#f8fafc',
    },
    randomAvatarBtn: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px',
        borderRadius: '6px',
        backgroundColor: '#334155',
        color: '#cbd5e1',
        fontSize: '12px',
        fontWeight: '500',
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
    input: {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '9px 12px',
        fontSize: '14px',
        color: '#f8fafc',
    },
    textarea: {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '9px 12px',
        fontSize: '14px',
        color: '#f8fafc',
        resize: 'vertical',
    },
    presetTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '6px',
    },
    tagBtn: {
        padding: '4px 8px',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '6px',
        color: '#94a3b8',
        fontSize: '11px',
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        marginBottom: '12px',
    },
    successBox: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#6ee7b7',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        marginBottom: '12px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '10px',
        paddingTop: '14px',
        borderTop: '1px solid #334155',
    },
    cancelBtn: {
        padding: '8px 14px',
        backgroundColor: 'transparent',
        color: '#94a3b8',
        borderRadius: '8px',
        fontSize: '13px',
    },
    saveBtn: {
        padding: '8px 18px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
    },
};

export default ProfileModal;

