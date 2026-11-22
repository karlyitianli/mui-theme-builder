import { migrateThemeProject, type ThemeProject } from '../domain/project';

const MAX_PROJECT_BYTES = 1_000_000;

export async function importProjectFile(file: File): Promise<ThemeProject> {
  if (file.size > MAX_PROJECT_BYTES) throw new Error('Project file must be smaller than 1 MB.');
  if (!file.name.toLowerCase().endsWith('.json')) throw new Error('Choose a JSON project file.');

  let value: unknown;
  try {
    value = JSON.parse(await file.text());
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  const migrated = migrateThemeProject(value);
  if (!migrated.success) throw new Error(migrated.errors.join(' '));
  return migrated.project;
}
