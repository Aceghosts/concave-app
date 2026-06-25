import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'concave' });

export type FileProcessEvent = {
  name: 'file/process';
  data: {
    uploadId: string;      // row id in uploads table
    storagePath: string;   // path in Supabase Storage
    fileName: string;
    mimeType: string;
    clientId: string | null;
  };
};
