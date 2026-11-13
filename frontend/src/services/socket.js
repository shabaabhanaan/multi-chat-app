import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (user) => {
    if (!socket) {
        // Connect to same origin (Vite dev proxy forwards /socket.io to backend)
        socket = io(window.location.origin, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            if (user) {
                socket.emit('setup', user);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
    } else if (user) {
        socket.emit('setup', user);
    }

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

