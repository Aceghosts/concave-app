// Phase E2 — render decks and videos to images so Claude can SEE the design,
// not just extracted text. Every function here degrades gracefully: any missing
// binary or conversion failure returns [] and the text-only pipeline continues.

import { existsSync } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const MAX_FRAMES = 8;
export const MAX_FRAME_WIDTH = 1280;
const VIDEO_KEYFRAMES = 6;

export type FrameResult = {
  paths: string[];       // storage paths in campaign-files, e.g. "<uploadId>/frames/01.png"
  kind: 'pages' | 'keyframes';
  count: number;
};

// ---------- PDF → PNGs ----------

export async function pdfToFramePngs(pdfBuffer: Buffer): Promise<Buffer[]> {
  const { pdfToPng } = await import('pdf-to-png-converter');
  const input = new Uint8Array(pdfBuffer);
  const pages = Array.from({ length: MAX_FRAMES }, (_, i) => i + 1);

  // Probe page 1 dimensions at scale 1 so rendered pages stay <= MAX_FRAME_WIDTH wide
  let scale = 1.5;
  try {
    const [meta] = await pdfToPng(input, { pagesToProcess: [1], returnMetadataOnly: true });
    if (meta?.width) scale = Math.min(2, MAX_FRAME_WIDTH / meta.width);
  } catch { /* keep default scale */ }

  const out = await pdfToPng(input, { pagesToProcess: pages, viewportScale: scale });
  return out.map(p => p.content).filter((c): c is Buffer => !!c);
}

// ---------- PPTX/DOCX → PDF via LibreOffice ----------

const SOFFICE_WIN = 'C:/Program Files/LibreOffice/program/soffice.exe';

async function sofficeAvailable(): Promise<boolean> {
  if (existsSync(SOFFICE_WIN)) return true;
  try {
    await execFileAsync('soffice', ['--version'], { timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

/** Office doc → PDF buffer, or null when soffice is absent/fails (decks stay text-only). */
export async function officeToPdf(buffer: Buffer, fileName: string): Promise<Buffer | null> {
  if (!(await sofficeAvailable())) {
    console.warn('[frames] soffice not found — skipping deck imaging for', fileName);
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const libre: any = await import('libreoffice-convert');
    const mod = libre.default ?? libre;
    const convert = promisify(mod.convertWithOptions ?? mod.convert);
    // format is 'pdf' (no dot) — the lib builds `--convert-to ${format}` and reads `<base>.${format}`
    const pdf: Buffer = mod.convertWithOptions
      ? await convert(buffer, 'pdf', undefined, { fileName, sofficeBinaryPaths: [SOFFICE_WIN] })
      : await convert(buffer, 'pdf', undefined);
    return pdf;
  } catch (e) {
    console.warn('[frames] libreoffice conversion failed for', fileName, e);
    return null;
  }
}

// ---------- Video → keyframes via system ffmpeg ----------

function ffmpegBinary(): string | null {
  if (existsSync('C:/Users/Dell/ffmpeg/ffmpeg.exe')) return 'C:/Users/Dell/ffmpeg/ffmpeg.exe';
  return 'ffmpeg'; // PATH fallback — probed below
}

async function videoDurationSeconds(ffmpeg: string, filePath: string): Promise<number | null> {
  // `ffmpeg -i` exits non-zero without an output, but prints Duration to stderr
  try {
    await execFileAsync(ffmpeg, ['-hide_banner', '-i', filePath], { timeout: 30000 });
  } catch (e) {
    const stderr = (e as { stderr?: string }).stderr ?? '';
    const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    // ENOENT etc. → no ffmpeg
  }
  return null;
}

/** Video buffer → up to 6 evenly-spaced keyframe PNGs. [] when ffmpeg is absent/fails. */
export async function videoToKeyframes(buffer: Buffer, fileName: string): Promise<Buffer[]> {
  const { writeFile, readFile, unlink } = await import('fs/promises');
  const { join } = await import('path');
  const { tmpdir } = await import('os');

  const ffmpeg = ffmpegBinary();
  if (!ffmpeg) return [];

  const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '.mp4';
  const base = join(tmpdir(), `concave_kf_${Date.now()}`);
  const srcPath = `${base}${ext}`;
  const cleanup: string[] = [srcPath];

  try {
    await writeFile(srcPath, buffer);
    const duration = await videoDurationSeconds(ffmpeg, srcPath);
    if (!duration || duration <= 0) {
      console.warn('[frames] ffmpeg unavailable or could not read duration for', fileName);
      return [];
    }

    const frames: Buffer[] = [];
    for (let i = 0; i < VIDEO_KEYFRAMES; i++) {
      const t = duration * ((i + 0.5) / VIDEO_KEYFRAMES); // frame centers: 8%, 25%, ... 92%
      const outPath = `${base}_${i}.png`;
      cleanup.push(outPath);
      try {
        await execFileAsync(ffmpeg, [
          '-hide_banner', '-loglevel', 'error',
          '-ss', t.toFixed(2), '-i', srcPath,
          '-frames:v', '1',
          '-vf', `scale='min(${MAX_FRAME_WIDTH},iw)':-2`,
          '-y', outPath,
        ], { timeout: 60000 });
        frames.push(await readFile(outPath));
      } catch (e) {
        console.warn(`[frames] keyframe ${i} failed for`, fileName, e);
      }
    }
    return frames;
  } finally {
    await Promise.all(cleanup.map(p => unlink(p).catch(() => {})));
  }
}

// ---------- Keyframe position labels (shared with the analyze route) ----------

export function keyframePercent(index: number, total: number): number {
  return Math.round(((index + 0.5) / total) * 100);
}
