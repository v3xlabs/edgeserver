# @edgelabs/components

This is a shared component library for edgeserver. To use it:
1. Run the following in the project you wish to add the component library to:
```
pnpm add @edgelabs/components (--workspace)
```

2. Your projects `tailwind.config.cjs` will need to have `require('@edgelabs/core-ui/theme').componentsInclude` inside the `content` array for tailwind to include the component styling.

Example config:
```js
const theme = require('@edgelabs/core-ui/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [theme.defaultTheme],
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}', theme.componentsInclude],

    plugins: [],
};
```
