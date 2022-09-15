import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';
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
        inject({
            util: 'util/',
        }),
    ],
    define: { global: 'globalThis' },
    build: {
        rollupOptions: {
            plugins: [nodePolyfills()],
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis',
            },
            // Enable esbuild polyfill plugins
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                }),
            ],
        },
    },
});
