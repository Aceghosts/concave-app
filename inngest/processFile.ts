import { inngest } from '@/lib/inngest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg'];
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

async function getSupabase() {
  const { supabaseServer } = await import('@/lib/supabase-server');
  return supabaseServer;
}

async function downloadFromSupabase(storagePath: string): Promise<Buffer> {
  const sb = await getSupabase();
  const { data, error } = await sb.storage
    .from('campaign-files')
    .download(storagePath);
  if (error || !data) throw new Error(`Storage download failed: ${error?.message}`);
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse: any = await import('pdf-parse');
  const fn = pdfParse.default ?? pdfParse;
  const result = await fn(buffer);
  return result.text;
}

async function extractOffice(buffer: Buffer, fileName: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const officeparser: any = await import('officeparser');
  const fn = officeparser.parseOfficeAsync ?? officeparser.parseOffice ?? (officeparser.default?.parseOfficeAsync) ?? (officeparser.default?.parseOffice);
  const text = await fn(buffer, { outputErrorToConsole: false });
  return typeof text === 'string' ? text : String(text);
}

async function extractWithGemini(buffer: Buffer, mimeType: string, fileName: string, isVideo: boolean): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY!;
  const fileManager = new GoogleAIFileManager(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);

  // Write buffer to temp file for Gemini SDK
  const { writeFile, unlink } = await import('fs/promises');
  const { join } = await import('path');
  const { tmpdir } = await import('os');
  const tmpPath = join(tmpdir(), `concave_${Date.now()}_${fileName}`);

  try {
    await writeFile(tmpPath, buffer);
    const uploadResult = await fileManager.uploadFile(tmpPath, { mimeType, displayName: fileName });

    // Wait for processing
    let file = await fileManager.getFile(uploadResult.file.name);
    let attempts = 0;
    while (file.state === FileState.PROCESSING && attempts < 60) {
      await new Promise(r => setTimeout(r, 3000));
      file = await fileManager.getFile(uploadResult.file.name);
      attempts++;
    }
    if (file.state === FileState.FAILED) throw new Error('Gemini processing failed');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = isVideo
      ? `Watch this video ad creative carefully. Extract and describe everything:
1. Scene-by-scene breakdown with timestamps
2. All text/overlays shown on screen (transcribe exactly)
3. Voiceover/dialogue (transcribe exactly)
4. Music style, mood, and energy
5. Visual style, color palette, production quality
6. Brand elements (logo, colors, name mentions)
7. Call-to-action (what, when, how delivered)
8. Pacing and editing rhythm
9. Emotional arc and key emotional moments
10. Overall creative approach and strategy

Be exhaustive. This is the foundation for a campaign analysis.`
      : `Analyze this image and extract all content:
1. All text visible (transcribe exactly)
2. Visual elements, layout, hierarchy
3. Colors, typography, design style
4. Brand elements
5. Key message communicated
6. Overall creative execution quality`;

    const result = await model.generateContent([
      { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
      { text: prompt },
    ]);

    // Clean up Gemini file
    await fileManager.deleteFile(file.name).catch(() => {});

    return result.response.text();
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

function buildMarkdown(fileName: string, mimeType: string, extractedContent: string): string {
  const fileType = VIDEO_TYPES.includes(mimeType) ? 'Video Ad Creative'
    : IMAGE_TYPES.includes(mimeType) ? 'Image Creative'
    : mimeType === 'application/pdf' ? 'PDF Document'
    : mimeType.includes('presentation') || fileName.endsWith('.pptx') ? 'Presentation'
    : mimeType.includes('word') || fileName.endsWith('.docx') ? 'Word Document'
    : 'Document';

  return `# Campaign Brief — ${fileName}
**File Type:** ${fileType}
**Extracted:** ${new Date().toISOString()}

---

${extractedContent}
`;
}

export const processFileFn = inngest.createFunction(
  {
    id: 'process-campaign-file',
    name: 'Process Campaign File → MD',
    retries: 2,
    triggers: [{ event: 'file/process' }],
  },
  async ({ event, step }) => {
    const { uploadId, storagePath, fileName, mimeType } = event.data;

    // Mark as processing
    await step.run('mark-processing', async () => {
      const sb = await getSupabase();
      await sb.from('uploads').update({ status: 'processing' }).eq('id', uploadId);
    });

    // Download file from Supabase Storage — returned as plain object after JSON serialization
    const rawBuffer = await step.run('download-file', async () => {
      const buf = await downloadFromSupabase(storagePath);
      return buf.toJSON(); // { type: 'Buffer', data: [...] }
    });

    // Re-hydrate Buffer (Inngest serializes step results as JSON)
    const buffer = Buffer.from(rawBuffer.data);

    // Extract content based on file type
    const rawContent = await step.run('extract-content', async () => {
      if (mimeType === 'application/pdf') {
        return extractPDF(buffer);
      }
      if (mimeType.includes('presentation') || fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
        return extractOffice(buffer, fileName);
      }
      if (mimeType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        return extractOffice(buffer, fileName);
      }
      if (VIDEO_TYPES.includes(mimeType) || IMAGE_TYPES.includes(mimeType)) {
        return extractWithGemini(buffer, mimeType, fileName, VIDEO_TYPES.includes(mimeType));
      }
      if (mimeType === 'text/plain' || mimeType === 'text/markdown' || fileName.endsWith('.md') || fileName.endsWith('.txt')) {
        return buffer.toString('utf-8');
      }
      throw new Error(`Unsupported file type: ${mimeType}`);
    });

    // Structure into clean MD
    const markdown = buildMarkdown(fileName, mimeType, rawContent);

    // Save to DB
    await step.run('save-markdown', async () => {
      const sb = await getSupabase();
      await sb.from('uploads').update({ status: 'ready', extracted_md: markdown }).eq('id', uploadId);
    });

    return { uploadId, mdLength: markdown.length };
  },
);
