import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Вставляем ваш новый адрес от VS Code Dev Tunnels
    const tunnelHost = 'gpqqzplk-5173.euw.devtunnels.ms';

    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        strictPort: true,
        // Разрешаем работу через туннель VS Code
        allowedHosts: [tunnelHost],
        hmr: {
          host: tunnelHost,
          protocol: 'wss',
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});