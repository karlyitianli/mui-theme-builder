import type { ThemeOptions } from '@mui/material/styles';

function mergeObjects(base: unknown, override: unknown): unknown {
  if (
    typeof base !== 'object' || base === null || Array.isArray(base) ||
    typeof override !== 'object' || override === null || Array.isArray(override)
  ) {
    return override;
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    result[key] = key in result ? mergeObjects(result[key], value) : value;
  }
  return result;
}

export function mergeThemeComponents(
  ...components: Array<ThemeOptions['components'] | undefined>
): ThemeOptions['components'] {
  return components.reduce<ThemeOptions['components']>(
    (result, current) => mergeObjects(result, current ?? {}) as ThemeOptions['components'],
    {},
  );
}
