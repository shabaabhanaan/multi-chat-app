import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import { LogIn, UserPlus, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';

const DEMO_USERS = [
    { username: 'Alex', email: 'alex@example.com', password: 'password123', status: 'Coding something cool 💻' },
    { username: 'Sarah', email: 'sarah@example.com', password: 'password123', status: 'Designing new UX ✨' },
    { username: 'Jordan', email: 'jordan@example.com', password: 'password123', status: 'In a meeting 🎧' },
];

const AuthModal = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        emailOrUsername: '',
        password: '',
        status: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await loginUser({
                    emailOrUsername: formData.emailOrUsername || formData.email,
                    password: formData.password,
                });
            } else {
                res = await registerUser({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    status: formData.status || 'Available',
                });
            }

            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            onAuthSuccess(user);
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demo) => {
        setError('');
        setLoading(true);
        try {
            let res;
            try {
                // Try logging in
                res = await loginUser({
                    emailOrUsername: demo.email,
                    password: demo.password,
                });
            } catch (loginErr) {
                // If account does not exist, register it
                res = await registerUser({
                    username: demo.username,
                    email: demo.email,
                    password: demo.password,
                    status: demo.status,
                });
            }

            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            onAuthSuccess(user);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to authenticate demo account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} className="animate-fade-in">
            <div style={styles.card} className="animate-slide-up">
                <div style={styles.header}>
                    <div style={styles.logoBadge}>
                        <MessageSquare size={26} color="#fff" />
                    </div>
                    <h2 style={styles.title}>Multi-Chat App</h2>
                    <p style={styles.subtitle}>
                        {isLogin ? 'Sign in to jump back into your conversations' : 'Create an account to start chatting in real-time'}
                    </p>
                </div>

                <div style={styles.tabContainer}>
                    <button
                        style={{ ...styles.tab, ...(isLogin ? styles.activeTab : {}) }}
                        onClick={() => { setIsLogin(true); setError(''); }}
                        type="button"
                    >
                        <LogIn size={16} style={{ marginRight: 6 }} />
                        Sign In
                    </button>
                    <button
                        style={{ ...styles.tab, ...(!isLogin ? styles.activeTab : {}) }}
                        onClick={() => { setIsLogin(false); setError(''); }}
                        type="button"
                    >
                        <UserPlus size={16} style={{ marginRight: 6 }} />
                        Register
                    </button>
                </div>

                {error && (
                    <div style={styles.errorBox}>
                        <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                placeholder="e.g. hanaan"
                                value={formData.username}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            {isLogin ? 'Email or Username' : 'Email Address'}
                        </label>
                        <input
                            type={isLogin ? 'text' : 'email'}
                            name={isLogin ? 'emailOrUsername' : 'email'}
                            required
                            placeholder={isLogin ? 'username or name@example.com' : 'name@example.com'}
                            value={isLogin ? formData.emailOrUsername : formData.email}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    {!isLogin && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Status Message (Optional)</label>
                            <input
                                type="text"
                                name="status"
                                placeholder="e.g. Exploring Multi-Chat 🚀"
                                value={formData.status}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.submitBtn, ...(loading ? { opacity: 0.7 } : {}) }}
                    >
                        {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div style={styles.demoSection}>
                    <div style={styles.demoHeader}>
                        <Sparkles size={14} color="#f59e0b" style={{ marginRight: 6 }} />
                        <span style={styles.demoLabel}>Instant Demo Accounts</span>
                    </div>
                    <div style={styles.demoButtons}>
                        {DEMO_USERS.map((demo) => (
                            <button
                                key={demo.username}
                                type="button"
                                onClick={() => handleDemoLogin(demo)}
                                disabled={loading}
                                style={styles.demoBtn}
                            >
                                <span style={styles.demoDot} />
                                {demo.username}
                            </button>
                        ))}
                    </div>
                </div>
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
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    logoBadge: {
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px auto',
        boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: '6px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#94a3b8',
        lineHeight: '1.4',
    },
    tabContainer: {
        display: 'flex',
        backgroundColor: '#0f172a',
        borderRadius: '10px',
        padding: '4px',
        marginBottom: '20px',
    },
    tab: {
        flex: 1,
        padding: '9px 12px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#94a3b8',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
    },
    activeTab: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid #ef4444',
        color: '#fca5a5',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
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
        color: '#cbd5e1',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    input: {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#f8fafc',
        transition: 'border-color 0.15s ease',
    },
    submitBtn: {
        marginTop: '8px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'background-color 0.15s ease',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
    },
    demoSection: {
        marginTop: '22px',
        paddingTop: '16px',
        borderTop: '1px solid #334155',
    },
    demoHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
    },
    demoLabel: {
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        color: '#94a3b8',
    },
    demoButtons: {
        display: 'flex',
        gap: '8px',
    },
    demoBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '12px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.15s ease',
    },
    demoDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
    },
};

export default AuthModal;

