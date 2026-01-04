import path from 'path';
import { defineConfig, loadEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const tunnelHost = 'gpqqzplk-5173.euw.devtunnels.ms';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true, // Использование true вместо '0.0.0.0' часто помогает с типами
      strictPort: true,
      hmr: {
        host: tunnelHost,
        protocol: 'wss',
      },
      // Если allowedHosts все еще подсвечивается, попробуйте временно его закомментировать
      allowedHosts: [tunnelHost], 
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      }
    }
  };
});