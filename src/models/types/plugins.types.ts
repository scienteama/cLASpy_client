export interface Plugin {
  name: string;
  version: string;
  enable: boolean;
  description: string;
  tooltip: string;
}

export interface TaskRunner {
  enabled: boolean;
  workers: WorkerState[];
}

export interface WorkerState {
  name: string;
  pid: number;
}
