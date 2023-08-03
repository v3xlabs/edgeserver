import GlobalPolyFill from '@esbuild-plugins/node-globals-polyfill';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tsconfigPaths(),
        // typescriptPaths({ tsConfigPath: './tsconfig.json' }),
        react(),
        // inject({
        //     util: 'util/',
        // }),
    ],
    define: { global: 'globalThis' },
    build: {
        rollupOptions: {
            plugins: [nodePolyfills()],
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        target: ['esnext'],
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis',
            },
            // Enable esbuild polyfill plugins
            plugins: [GlobalPolyFill({ process: true, buffer: true })],
            supported: {
                bigint: true,
            },
        },
    },
    resolve: {
        alias: {
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util',
        },
    },
});
