import axios from 'axios';

const client = axios.create({
   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
// Add an interceptor to automatically add the JWT token to requests
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
