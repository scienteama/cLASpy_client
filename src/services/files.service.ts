import type { AxiosResponse } from 'axios';
import { api } from 'src/boot/axios';
import type { WorkDone } from 'src/models/types/api.type';
import type { FileModel, FolderModel, UploadFileParams } from 'src/models/types/files.type';

/**
 * Centralise les appels API pour la gestion des fichiers et dossiers
 */
class FileService {
  fileLoaders = {
    all: () => this.getRoot(),
    model: () => this.getModels(),
    las: () => this.getLasFiles(),
  } as const;

  async uploadFile(params: UploadFileParams): Promise<WorkDone<FileModel>> {
    const response = await api.post<WorkDone<FileModel>>('/files/upload', params.data, {
      onUploadProgress: params.onUploadProgress ?? (() => {}),
    });
    return response.data;
  }

  async getRoot(parentId?: string | null): Promise<WorkDone<FolderModel>> {
    const response = await api.get<WorkDone<FolderModel>>('/files/list', {
      params: parentId ? { parent_id: parentId } : {},
    });
    return response.data;
  }

  async getModels(parentId?: string | null): Promise<WorkDone<FolderModel>> {
    const response = await api.get<WorkDone<FolderModel>>('/files/models', {
      params: parentId ? { parent_id: parentId } : {},
    });
    return response.data;
  }

  async getLasFiles(parentId?: string | null): Promise<WorkDone<FolderModel>> {
    const response = await api.get<WorkDone<FolderModel>>('/files/las', {
      params: parentId ? { parent_id: parentId } : {},
    });
    return response.data;
  }

  async createDirectory(name: string, parentId?: string | null): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('/files/create-directory', {
      name,
      parent_id: parentId || null,
    });
    return response.data;
  }

  async removeFileOrDir(itemId: string): Promise<WorkDone<string>> {
    const response = await api.delete<WorkDone<string>>(`/files/remove/${itemId}`);
    return response.data;
  }

  async deleteItems(itemIds: string[]): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>(`/files/remove-multiple`, itemIds);
    return response.data;
  }

  async renameFileOrDir(itemId: string, newFilename: string): Promise<WorkDone<string>> {
    const response = await api.put<WorkDone<string>>(`/files/rename/${itemId}`, {
      new_name: newFilename,
    });
    return response.data;
  }

  async downloadFile(itemId: string): Promise<{ data: Blob; headers: Record<string, string> }> {
    const response: AxiosResponse<Blob> = await api.get(`/files/download-file/${itemId}`, {
      responseType: 'blob',
    });

    const headers: Record<string, string> = {};
    Object.entries(response.headers).forEach(([key, value]) => {
      if (typeof value === 'string') headers[key.toLowerCase()] = value;
    });

    return { data: response.data, headers };
  }
}

export const fileService = new FileService();
