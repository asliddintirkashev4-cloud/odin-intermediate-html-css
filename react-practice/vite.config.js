import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],test:{environment:'jsdom',setupFiles:['./src/setup.js']},base:'./',build:{rollupOptions:{input:'app.html',output:{entryFileNames:'bundle.js',chunkFileNames:'chunk-[hash].js',assetFileNames:'[name][extname]'}}}});
