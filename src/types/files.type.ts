export interface FileUploadProgress {
  error: boolean
  color: string
  percent: number
  icon: string
}

export interface FileModel {
  id: string;
  name: string;
  type?: "file";
  size_bytes: number;
  saved_as?: string | null;
}

export interface FolderModel {
  id: string;
  name: string;
  type?: "folder";
  children: Array<FileModel | FolderModel>;
}
