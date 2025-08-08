module.exports = {
    root: true,
    extends: ['next', 'next/core-web-vitals', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        // Disable Next.js warning for using <img>
        '@next/next/no-img-element': 'off',

        // Allow 'any' type (not recommended for prod, but okay during prototyping)
        '@typescript-eslint/no-explicit-any': 'off',

        // Allow unused vars (temporarily, for dev)
        '@typescript-eslint/no-unused-vars': 'warn',

        // Example: Allow custom fonts not defined in _document.js
        '@next/next/no-page-custom-font': 'off'
    },
};
