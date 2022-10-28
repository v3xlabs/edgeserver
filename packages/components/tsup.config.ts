import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/components/index.tsx',
    },
    splitting: false,
    clean: true,
    format: ['cjs', 'esm'],
    dts: true,
});
