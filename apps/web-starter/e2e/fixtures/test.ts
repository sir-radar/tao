import { test as base, expect } from '@playwright/test';

type RuntimeFixtures = {
  runtimeErrors: string[];
};

export const test = base.extend<RuntimeFixtures>({
  runtimeErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on('pageerror', (error) =>
        errors.push(`pageerror: ${error.message}`),
      );
      page.on('console', (message) => {
        if (message.type() === 'error') {
          errors.push(`console: ${message.text()}`);
        }
      });

      await use(errors);
      expect(errors, 'browser runtime errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
