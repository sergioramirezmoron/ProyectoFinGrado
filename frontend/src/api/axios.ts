import axios from 'axios';

const api = axios.create({
    // CAMBIO CLAVE: Usamos ruta relativa para aprovechar el Proxy de Vite
    baseURL: '/api', 
    // Sin headers globales para que la subida de archivos funcione sola
});

// INTERCEPTOR: Pegar el Token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;