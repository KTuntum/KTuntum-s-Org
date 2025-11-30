export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  notes?: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ProcessingState {
  status: ProcessingStatus;
  data: Transaction[];
  error?: string;
}