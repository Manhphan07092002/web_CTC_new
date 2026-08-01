import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const spaFallbackPlugin = () => ({
  name: 'spa-fallback-plugin',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const url = req.url || '';
      const acceptsHtml = req.headers.accept?.includes('text/html');
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
    plugins: [tailwindcss(), spaFallbackPlugin(), react()],
    esbuild: mode === 'production' ? {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    } : {},
    build: {
      emptyOutDir: false,
      cssCodeSplit: true,
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: 'esbuild',
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      esbuildOptions: {
        supported: { 'dynamic-import': true },
        legalComments: 'none',
        treeShaking: true,
        charset: 'utf8',
      },
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Tiptap rich-text editor (admin only)
            if (id.includes('@tiptap')) return 'vendor-tiptap';

            // Charts / D3 (admin dashboard only)
            if (id.includes('recharts') || id.includes('/d3-') || id.includes('d3-scale') || id.includes('d3-shape')) return 'vendor-charts';

            // Google AI (chat widget, dynamic on-demand loaded)
            if (id.includes('@google/genai')) return 'vendor-ai';

            // Icons
            if (id.includes('lucide-react')) return 'vendor-icons';

            // SEO metadata
            if (id.includes('react-helmet-async') || id.includes('react-fast-compare') || id.includes('invariant')) return 'vendor-seo';

            // Utility libraries (not needed on initial FCP paint)
            if (id.includes('i18next') || id.includes('canvas-confetti') || id.includes('adm-zip')) return 'vendor-utils';

            // React core
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-is/') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/scheduler/')
            ) return 'vendor-react';

            // All other node_modules → shared vendor misc
            if (id.includes('node_modules/')) return 'vendor-misc';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
