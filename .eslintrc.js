module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'plugin:unicorn/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'unicorn'
  ],
  rules: {
    "semi": ["error", "always"],
    "unicorn/filename-case": ["error", {
      cases: {
        "camelCase": true,
        "pascalCase": true
      }
    }],
    "quotes": ["error", "single", { "allowTemplateLiterals": true }]
  }
}
