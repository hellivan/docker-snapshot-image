module.exports = {
    projects: ['<rootDir>/test/*'],
    reporters: [
        'default',
        ['jest-html-reporter', {
            outputPath: './reports/html/jest.html',
            includeFailureMsg: true
        }],
        ['jest-junit', {
            outputDirectory: './reports/junit/',
            outputName: 'jest.xml'
        }]
    ],
    // collectCoverageFrom: [
    //     '**/src/**/*.{ts,js}',
    //     '!**/src/**/*.spec.{ts,js}',
    //     '!**/node_modules/**'
    // ],
    // collectCoverage: true,
    // coverageReporters: ['cobertura', 'text', 'lcov'],
    // coverageDirectory: './reports',
    // coverageThreshold: {
    //     global: {
    //         statements: 100,
    //         branches: 100,
    //         functions: 100,
    //         lines: 100
    //     }
    // }
};
