import react from '@vitejs/plugin-react';
import path from 'path';
// import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

// import * as packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tsconfigPaths(),
        react(),

        dts({
            include: ['src/components/*'],
        }),
    ],
    define: { global: 'globalThis' },
    build: {
        lib: {
            entry: path.resolve('src', 'components'),
            name: '@edgelabs/ui',
            formats: ['es', 'umd'],
            fileName: (format) => `index.${format}.js`,
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
});
