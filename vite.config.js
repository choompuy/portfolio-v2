import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024,
        })
    ],
    build: {
        minify: 'esbuild',
        target: 'es2015',
    }
});
