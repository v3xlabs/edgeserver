/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unicorn/prevent-abbreviations */
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
