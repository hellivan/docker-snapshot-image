module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    plugins: ['prettier', 'simple-import-sort'],
    rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'prettier/prettier': 'error',
    },
};
