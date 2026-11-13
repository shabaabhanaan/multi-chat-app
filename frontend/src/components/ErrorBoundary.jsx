import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.iconBadge}>
                            <AlertTriangle size={36} color="#ef4444" />
                        </div>
                        <h2 style={styles.title}>Something went wrong</h2>
                        <p style={styles.subtitle}>
                            An unexpected interface error occurred. You can reload the app to continue chatting.
                        </p>
                        <button style={styles.reloadBtn} onClick={this.handleReload}>
                            <RefreshCw size={16} style={{ marginRight: 6 }} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '420px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    },
    iconBadge: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
    },
    title: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#94a3b8',
        lineHeight: '1.5',
        marginBottom: '20px',
    },
    reloadBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        borderRadius: '8px',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    },
};

export default ErrorBoundary;

