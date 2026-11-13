import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
});

// Add auth token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 unauthorized
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If token expired, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// Auth
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Users
export const getUsers = (search = '') => API.get(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const getUserById = (id) => API.get(`/users/${id}`);

// Chat / Rooms
export const getRooms = () => API.get('/chat/rooms');
export const createRoom = (data) => API.post('/chat/rooms', data);
export const getOrCreateDM = (targetUserId) => API.post('/chat/dm', { targetUserId });
export const getMessages = (roomId, search = '') => API.get(`/chat/messages/${roomId}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const sendMessage = (messageData) => API.post('/chat/messages', messageData);

// Upload
export const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export default API;

