export interface FileUploadProgress {
  error: boolean;
  color: string;
  percent: number;
  icon?: string;
  uploading: boolean;
  speed?: number; // Mo per second
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
}

export interface FolderModel {
  id: string;
  name: string;
  type?: 'folder';
  children: Array<FileModel | FolderModel>;
  created_at: string;
  modified_at: string;
}
