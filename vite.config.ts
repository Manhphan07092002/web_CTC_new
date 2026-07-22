import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const spaFallbackPlugin = () => ({
  name: 'spa-fallback-plugin',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const url = req.url || '';
      const acceptsHtml = req.headers.accept?.includes('text/html');
      // If navigating to an HTML page route without explicit file extension, serve index.html
      if (req.method === 'GET' && acceptsHtml && !url.startsWith('/api') && !url.includes('.ts') && !url.includes('.js') && !url.includes('.css') && !url.includes('.png') && !url.includes('.jpg') && !url.includes('.svg') && !url.includes('.json')) {
        req.url = '/index.html';
      }
      next();
    });
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.VITE_API_URL || 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [spaFallbackPlugin(), react()],
      build: {
        // Split large vendor libraries into separate cacheable chunks
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
              'vendor-charts': ['recharts'],
              'vendor-icons': ['lucide-react'],
            },
          },
        },
        // Warn if a chunk exceeds 800KB
        chunkSizeWarningLimit: 800,
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
