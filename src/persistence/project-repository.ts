import type { ThemeProject } from '../domain/project';

export interface ProjectRepository {
  load(): Promise<ThemeProject | undefined>;
  save(project: ThemeProject): Promise<void>;
}
