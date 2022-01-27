module.exports = {
    projects: ['<rootDir>/test/*'],
    reporters: [
        'default',
        [
            'jest-html-reporter',
            {
                outputPath: './reports/html/jest.junit.html',
                includeFailureMsg: true,
            },
        ],
        [
            'jest-junit',
            {
                outputDirectory: './reports/junit/',
                outputName: 'jest.junit.xml',
            },
        ],
    ],
    collectCoverageFrom: ['**/src/**/*.ts', '!**/src/**/*.spec.ts', '!**/node_modules/**'],
    coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
    coverageDirectory: './reports/coverage',
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
};
