import { afterEach, describe, expect, it, vi } from 'vitest';
import { marketApi } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('API transport failures', () => {
  it('distinguishes a network failure from an unreadable success payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('offline')));
    await expect(marketApi.summary()).rejects.toMatchObject({
      status: 0,
      message: 'The API could not be reached.',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(new Response('not json', { status: 200 })),
    );
    await expect(marketApi.summary()).rejects.toMatchObject({
      status: 200,
      message: 'The API returned an unreadable response.',
    });
  });

  it('classifies a non-JSON proxy failure as unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('Bad gateway', { status: 502 })),
    );
    await expect(marketApi.summary()).rejects.toMatchObject({
      status: 502,
      message: 'The API could not be reached.',
    });
  });
});
