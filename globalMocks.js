jest.mock('./src/utils/viteHelpers', () => ({
    getEnvironmentVariable: jest.fn(() => {
      'env-var'
    }),
}));