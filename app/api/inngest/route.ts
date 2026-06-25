import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { processFileFn } from '@/inngest/processFile';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processFileFn],
});
