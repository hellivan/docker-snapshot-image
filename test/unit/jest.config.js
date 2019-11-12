module.exports = {
    displayName: 'unit',
    rootDir: '../../',
    preset: 'ts-jest',
    testEnvironment: 'node',
    // TODO: remove (and remove from package) as soon as jest-circus is set to default runner
    testRunner: 'jest-circus/runner',
    testMatch: ['**/src/**/*.spec.ts']
};
