// Phase 1 shell switch.
//
// The v2 shell (Figma frame 358:10) is opt-in only: open the app with
// ?shell=v2 in the URL to see it. Anything else, including no query string
// at all, keeps the original shell as the default.
export const NEW_SHELL_QUERY_PARAM = 'shell';
export const NEW_SHELL_QUERY_VALUE = 'v2';

export function isNewShellEnabled(search: string): boolean {
  return (
    new URLSearchParams(search).get(NEW_SHELL_QUERY_PARAM) ===
    NEW_SHELL_QUERY_VALUE
  );
}
