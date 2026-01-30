import axios from 'axios';
import { decryptData } from './crypto';
import { IBasicResponse } from '../constant';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: baseURL, // Replace with your API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token from localStorage (if present) to every request
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            if (role) {
                const decryptedRole = decryptData(role);
                const roleObj = decryptedRole;
                config.headers = config.headers || {};
                config.headers['role'] = `${roleObj}`;
            }
            if (token) {
                config.headers = config.headers || {};
                config.headers['token'] = `${token}`;
            }
        } catch (e) {
            // ignore (e.g., during SSR or if localStorage not available)
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => {
        const data: IBasicResponse = response.data;
        if (data.code === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(new Error('Unauthorized'));
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export default api;
