import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Cuando React vea una petición que empiece por /api...
      '/api': {
        target: 'http://127.0.0.1:8000', // ...la redirige al Backend
        changeOrigin: true,
        secure: false,
      },
      // También necesitamos redirigir las imágenes
      '/images': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
