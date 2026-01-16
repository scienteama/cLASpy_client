import { type FileModel } from "./files.type";

export type AppEvents = {

    data: { message: string; timestamp: number };
    error: Error;
    finished: void;

    "existing-file-event": {file: FileModel | null}
    "upload-file-event": {file: File | null}

};
