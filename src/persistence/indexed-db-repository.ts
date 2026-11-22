import { migrateThemeProject, type ThemeProject } from '../domain/project';
import type { ProjectRepository } from './project-repository';

const DATABASE_NAME = 'mui-theme-builder';
const DATABASE_VERSION = 1;
const STORE_NAME = 'projects';
const ACTIVE_PROJECT_KEY = 'active';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Could not open local project storage.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local project storage failed.'));
  });
}

export const indexedDbProjectRepository: ProjectRepository = {
  async load() {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const value = await requestResult(transaction.objectStore(STORE_NAME).get(ACTIVE_PROJECT_KEY));
      if (value === undefined) return undefined;
      const migrated = migrateThemeProject(value);
      if (!migrated.success) throw new Error(`Saved project is invalid: ${migrated.errors.join(' ')}`);
      return migrated.project;
    } finally {
      database.close();
    }
  },

  async save(project: ThemeProject) {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      await requestResult(transaction.objectStore(STORE_NAME).put(project, ACTIVE_PROJECT_KEY));
    } finally {
      database.close();
    }
  },
};
