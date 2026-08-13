import { test as base, expect } from '@playwright/test';

type RuntimeFixtures = {
  runtimeErrors: string[];
};

type RuntimeOptions = {
  allowApiErrors: boolean;
};

function isApiUrl(url: string) {
  try {
    return new URL(url).pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

export const test = base.extend<RuntimeFixtures & RuntimeOptions>({
  allowApiErrors: [false, { option: true }],
  runtimeErrors: [
    async ({ page, allowApiErrors }, use) => {
      const errors: string[] = [];

      page.on('pageerror', (error) =>
        errors.push(`pageerror: ${error.message}`),
      );
      page.on('console', (message) => {
        const isExpectedHttpFailure =
          allowApiErrors &&
          message
            .text()
            .startsWith(
              'Failed to load resource: the server responded with a status of',
            ) &&
          isApiUrl(message.location().url);
        if (message.type() === 'error' && !isExpectedHttpFailure) {
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
