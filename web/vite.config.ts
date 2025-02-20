// import GlobalPolyFill from '@esbuild-plugins/node-globals-polyfill';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
// import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
            },
        },
    },
    plugins: [
        tsconfigPaths(),
        TanStackRouterVite({
            autoCodeSplitting: true,
        }),
        // typescriptPaths({ tsConfigPath: './tsconfig.json' }),
        react(),
        // inject({
        //     util: 'util/',
        // }),
    ],
    base: '/',
    // define: { global: 'globalThis' },
    build: {
        // rollupOptions: {
        //     plugins: [nodePolyfills()],
        // },
        // commonjsOptions: {
        //     transformMixedEsModules: true,
        // },
        // target: ['esnext'],
    },
    optimizeDeps: {
        esbuildOptions: {
            // target: 'esnext',
            // Node.js global to browser globalThis
            // define: {
            //     global: 'globalThis',
            // },
            // Enable esbuild polyfill plugins
            // plugins: [GlobalPolyFill({ process: true, buffer: true })],
            supported: {
                bigint: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': new URL('src', import.meta.url).pathname,
            // process: 'process/browser',
            // stream: 'stream-browserify',
            // util: 'util',
        },
    },
});
