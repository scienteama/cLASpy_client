import { api } from 'src/boot/axios';
import type { WorkDone } from 'src/types/api.type';
import type { FileModel, FolderModel, UploadFileParams } from 'src/types/files.type';

/**
 * Centralise les appels API pour la gestion des fichiers et dossiers
 *
 */
class FileService {
  async uploadFile(params: UploadFileParams): Promise<WorkDone<FileModel>> {
    const response = await api.post<WorkDone<FileModel>>('/files/upload', params.data, {
      onUploadProgress: params.onUploadProgress ?? (() => {}),
    });
    return response.data;
  }

  async getRoot(): Promise<WorkDone<FolderModel>> {
    const response = await api.get<WorkDone<FolderModel>>('/files/list');
    return response.data;
  }

  async createDirectory(name: string, sub_path: string): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('/files/create-directory', {
      name,
      sub_path: sub_path,
    });
    return response.data;
  }

  async removeFileOrDir(itemId: string): Promise<WorkDone<string>> {
    const response = await api.delete<WorkDone<string>>(`/files/remove/${itemId}`);
    return response.data;
  }

  async renameFileOrDir(itemId: string, newFilename: string): Promise<WorkDone<string>> {
    const response = await api.put<WorkDone<string>>(`/files/rename/${itemId}`, {
      new_name: newFilename,
    });
    return response.data;
  }
}

export const fileService = new FileService();
