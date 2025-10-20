import { api } from 'src/boot/axios';
import type { FolderModel } from 'src/types/files.type';

class FileService {
  async getRoot(): Promise<FolderModel> {
    const response = await api.get<FolderModel>('/files/list');
    return response.data;
  }

  async createDirectory(name: string, subPath: string): Promise<boolean> {
    const response = await api.post<boolean>('/files/create-directory', { name, subPath });
    return response.data;
  }

  async removeFileOrDir(itemId: string): Promise<boolean> {
    const response = await api.delete<boolean>(`files/remove/${itemId}`);
    return response.data;
  }

  async renameFileOrDir(itemId: string, new_filename: string): Promise<boolean> {
    const response = await api.put<boolean>(`files/rename/${itemId}`, { new_name: new_filename });
    return response.data;
  }
}

export const fileService = new FileService();
