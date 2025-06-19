import { FileSystemManager } from './fileSystemManager';

export interface AccountCredential {
  id: string;
  title: string;
  service: string;
  email: string;
  password: string;
  createdAt: number;
  updatedAt?: number;
}

const credentialManager = new FileSystemManager<AccountCredential>('credentials.json');

export { credentialManager };

