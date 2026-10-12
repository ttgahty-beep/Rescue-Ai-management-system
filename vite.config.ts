import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import { processEmergencyWithGemini } from './src/server/geminiService.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ai/process' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const params = JSON.parse(body || '{}');
              const result = await processEmergencyWithGemini(params);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Internal error' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  const basemapKey =
    process.env.basmaps_Apikey ||
    process.env.basemaps_apikey ||
    process.env.BASEMAPS_API_KEY ||
    process.env.BASEMAP_API_KEY ||
    process.env.VITE_BASEMAP_API_KEY ||
    process.env.VITE_BASEMAPS_API_KEY ||
    process.env.MAPBOX_API_KEY ||
    '';

  return {
    define: {
      'import.meta.env.VITE_BASEMAPS_API_KEY': JSON.stringify(basemapKey),
    },
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


