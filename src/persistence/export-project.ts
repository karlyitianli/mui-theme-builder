import type { ThemeProject } from '../domain/project';

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, sortJson(child)]),
  );
}

function safeFileName(name: string) {
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized || 'mui-theme';
}

export function serializeProject(project: ThemeProject) {
  return `${JSON.stringify(sortJson(project), null, 2)}\n`;
}

export function downloadProject(project: ThemeProject) {
  const blob = new Blob([serializeProject(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeFileName(project.metadata.name)}.mui-theme-builder.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
