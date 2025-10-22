import { api } from 'src/boot/axios';
import type { FolderModel } from 'src/types/files.type';

class FileService {
  async getRoot(): Promise<FolderModel> {
    const response = await api.get<FolderModel>('/files/list');
    return response.data;
  }

  async createDirectory(name: string, sub_path: string): Promise<FolderModel> {
    const response = await api.post<FolderModel>('/files/create-directory', {
      name,
      sub_path: sub_path,
    });
    return response.data;
  }

  async removeFileOrDir(itemId: string): Promise<boolean> {
    const response = await api.delete<boolean>(`/files/remove/${itemId}`);
    return response.data;
  }

  async renameFileOrDir(itemId: string, newFilename: string): Promise<boolean> {
    const response = await api.put<boolean>(`/files/rename/${itemId}`, { new_name: newFilename });
    return response.data;
  }
}

export const fileService = new FileService();
