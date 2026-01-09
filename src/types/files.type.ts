import type { AxiosProgressEvent } from 'axios';

export interface FileUploadProgress {
  error: boolean;
  color: string;
  percent: number;
  icon?: string;
  uploading: boolean;
  speed?: number; // Mo per second
}

export interface UploadFileParams {
  data: FormData;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
}

export interface DownloadFileResponse {
  data: Blob;
  headers: Record<string, string>;
}

export interface FileModel {
  id: string;
  name: string;
  type?: 'file';
  mimeType: string;
  size_bytes: number;
  saved_as?: string | null;
  created_at: string;
  modified_at: string;
  user_id: number;
}

export interface FolderModel {
  id: string;
  name: string;
  type?: 'folder';
  children: Array<FileModel | FolderModel>;
  created_at: string;
  modified_at: string;
  depth: number;
  user_id: number;
}
