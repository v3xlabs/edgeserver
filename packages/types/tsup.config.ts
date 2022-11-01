import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
    },
    splitting: false,
    clean: true,
    format: ['cjs', 'esm'],
    dts: true,
});
