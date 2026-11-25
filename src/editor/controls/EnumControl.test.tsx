import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EnumControl } from './EnumControl';

// Smoke test: proves the component test setup (jsdom + Testing Library)
// works against a real editor control.
describe('EnumControl (test setup smoke test)', () => {
  it('renders the label and the current value', () => {
    render(
      <EnumControl
        label="Variant"
        options={['contained', 'outlined', 'text'] as const}
        value="contained"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Variant')).toBeInTheDocument();
    expect(screen.getByText('contained')).toBeInTheDocument();
  });
});
