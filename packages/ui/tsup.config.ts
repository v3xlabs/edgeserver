import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'components/index': 'src/components/index.tsx',
        defaultTheme: 'static/defaultTheme.cjs',
    },
    splitting: false,
    clean: true,
    format: ['cjs', 'esm'],
    dts: true,
});
