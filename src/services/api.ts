import axios from 'axios';
import { decryptData } from './crypto';
import { IBasicResponse, IUser } from '../constant';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: baseURL, // Replace with your API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token from localStorage (if present) to every request
api.interceptors.request.use(
    async (config) => {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (token) {
                config.headers = config.headers || {};
                const decryptedToken = await decryptData(token);
                console.log(decryptedToken, 'decryptedToken');
                config.headers['token'] = `${decryptedToken}`;
                if (user) {
                    const decryptedUser: string = await decryptData(user);
                    const parsedUser: IUser = JSON.parse(decryptedUser);
                    config.headers['Authorization'] = parsedUser.unique_key;
                }
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
