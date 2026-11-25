import { describe, expect, it } from 'vitest';

import { isNewShellEnabled } from './shell-switch';

// The v2 shell must stay opt-in: the original shell is the default unless
// the URL carries exactly ?shell=v2.
describe('isNewShellEnabled', () => {
  it('is off when there is no query string', () => {
    expect(isNewShellEnabled('')).toBe(false);
  });

  it('is off for other values and unrelated params', () => {
    expect(isNewShellEnabled('?shell=v1')).toBe(false);
    expect(isNewShellEnabled('?shell=')).toBe(false);
    expect(isNewShellEnabled('?other=v2')).toBe(false);
  });

  it('is on only for shell=v2', () => {
    expect(isNewShellEnabled('?shell=v2')).toBe(true);
    expect(isNewShellEnabled('?other=1&shell=v2')).toBe(true);
  });
});
