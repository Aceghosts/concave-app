// Client-side predicted-attention pipeline (Phase E1).
// MSI-Net (alexanderkroner/saliency, MIT; SALICON-trained weights from the author's
// HuggingFace repo, converted once to ONNX) running in the browser via onnxruntime-web,
// plus tesseract.js OCR for text-region attention shares. No server, no Python at runtime.

import type { AttentionMetrics, AttentionRegion } from './attention-types';

const MODEL_URL = '/models/msi-net/msi-net.onnx';
const ORT_WASM_DIR = '/models/ort/'; // self-hosted ort-web wasm (copied from onnxruntime-web/dist)
const MAX_OUT_WIDTH = 800;

/** MSI-Net was trained at these three shapes — pick the closest aspect (HF model card logic). */
function targetShape(h: number, w: number): [number, number] {
  const ar = h / w;
  const d = (x: number) => Math.abs(ar - x);
  const best = Math.min(d(1), d(240 / 320), d(320 / 240));
  if (best === d(1)) return [320, 320];
  if (best === d(240 / 320)) return [240, 320];
  return [320, 240];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sessionPromise: Promise<{ ort: any; session: any }> | null = null;
function getSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await import('onnxruntime-web');
      ort.env.wasm.wasmPaths = ORT_WASM_DIR;
      ort.env.wasm.numThreads = 1; // multithreading needs cross-origin isolation headers we don't set
      const session = await ort.InferenceSession.create(MODEL_URL, { executionProviders: ['wasm'] });
      return { ort, session };
    })();
    sessionPromise.catch(() => { sessionPromise = null; }); // allow retry after a failed load
  }
  return sessionPromise;
}

function jet(v: number): [number, number, number] {
  // Classic jet colormap, v in 0..1
  const r = Math.min(Math.max(1.5 - Math.abs(4 * v - 3), 0), 1);
  const g = Math.min(Math.max(1.5 - Math.abs(4 * v - 2), 0), 1);
  const b = Math.min(Math.max(1.5 - Math.abs(4 * v - 1), 0), 1);
  return [r * 255, g * 255, b * 255];
}

type TextBlock = { label: string; box: [number, number, number, number] };

/** OCR the image; tesseract already merges adjacent words into lines — we use lines as text blocks. */
async function ocrTextBlocks(canvas: HTMLCanvasElement): Promise<TextBlock[]> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true });
    const blocks: TextBlock[] = [];
    for (const b of data.blocks ?? []) {
      for (const p of b.paragraphs) {
        for (const line of p.lines) {
          const text = line.text.trim();
          if (!text || line.confidence < 40) continue;
          const { x0, y0, x1, y1 } = line.bbox;
          if (x1 - x0 < 4 || y1 - y0 < 4) continue;
          blocks.push({
            label: text.length > 40 ? text.slice(0, 37) + '…' : text,
            box: [x0 / canvas.width, y0 / canvas.height, (x1 - x0) / canvas.width, (y1 - y0) / canvas.height],
          });
        }
      }
    }
    return blocks;
  } finally {
    await worker.terminate();
  }
}

function positionPhrase(fx: number, fy: number): string {
  const col = fx < 1 / 3 ? 'left' : fx < 2 / 3 ? 'center' : 'right';
  const row = fy < 1 / 3 ? 'upper' : fy < 2 / 3 ? 'middle' : 'lower';
  if (row === 'middle' && col === 'center') return 'the center of the image';
  return `the ${row} ${col} of the image`;
}

/**
 * Run the full predicted-attention pipeline on an image file.
 * Throws on any failure — callers should catch, console.warn, and move on (never block analysis).
 */
export async function computeAttentionMetrics(file: File): Promise<AttentionMetrics> {
  const bitmap = await createImageBitmap(file);
  try {
    // Working canvas (capped for OCR speed; all geometry is fractional)
    const workW = Math.min(bitmap.width, 1200);
    const workH = Math.round(bitmap.height * (workW / bitmap.width));
    const work = document.createElement('canvas');
    work.width = workW; work.height = workH;
    work.getContext('2d')!.drawImage(bitmap, 0, 0, workW, workH);

    // ── Saliency inference (MSI-Net via onnxruntime-web) ──
    const [th, tw] = targetShape(bitmap.height, bitmap.width);
    const scale = Math.min(tw / bitmap.width, th / bitmap.height);
    const fitW = Math.round(bitmap.width * scale);
    const fitH = Math.round(bitmap.height * scale);
    const padX = Math.floor((tw - fitW) / 2);
    const padY = Math.floor((th - fitH) / 2);

    const inCanvas = document.createElement('canvas');
    inCanvas.width = tw; inCanvas.height = th;
    const inCtx = inCanvas.getContext('2d')!;
    inCtx.fillStyle = '#000';
    inCtx.fillRect(0, 0, tw, th);
    inCtx.drawImage(bitmap, padX, padY, fitW, fitH);
    const px = inCtx.getImageData(0, 0, tw, th).data;
    const input = new Float32Array(th * tw * 3); // NHWC, RGB 0-255 (model normalizes internally)
    for (let i = 0; i < th * tw; i++) {
      input[i * 3] = px[i * 4];
      input[i * 3 + 1] = px[i * 4 + 1];
      input[i * 3 + 2] = px[i * 4 + 2];
    }

    const { ort, session } = await getSession();
    const feeds = { [session.inputNames[0]]: new ort.Tensor('float32', input, [1, th, tw, 3]) };
    const results = await session.run(feeds);
    const out = results[session.outputNames[0]];
    const [, oh, ow] = out.dims as number[]; // [1, th, tw, 1]
    const raw = out.data as Float32Array;

    // Crop the padding back out → saliency grid matching the image
    const gw = Math.max(1, Math.round(fitW * (ow / tw)));
    const gh = Math.max(1, Math.round(fitH * (oh / th)));
    const gx = Math.floor((ow - gw) / 2);
    const gy = Math.floor((oh - gh) / 2);
    const grid = new Float32Array(gw * gh);
    let total = 0, max = 0, argmax = 0;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const v = raw[(y + gy) * ow + (x + gx)];
        grid[y * gw + x] = v;
        total += v;
        if (v > max) { max = v; argmax = y * gw + x; }
      }
    }
    if (!(total > 0)) throw new Error('Saliency output is empty');

    // ── OCR text blocks ──
    let textBlocks: TextBlock[] = [];
    try {
      textBlocks = await ocrTextBlocks(work);
    } catch (e) {
      console.warn('OCR failed — region metrics limited to the heatmap:', e);
    }

    // ── Region shares + text union share (mask avoids double counting overlaps) ──
    const regions: AttentionRegion[] = [];
    const textMask = new Uint8Array(gw * gh);
    for (const tb of textBlocks) {
      const x0 = Math.max(0, Math.floor(tb.box[0] * gw));
      const y0 = Math.max(0, Math.floor(tb.box[1] * gh));
      const x1 = Math.min(gw, Math.ceil((tb.box[0] + tb.box[2]) * gw));
      const y1 = Math.min(gh, Math.ceil((tb.box[1] + tb.box[3]) * gh));
      let mass = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          mass += grid[y * gw + x];
          textMask[y * gw + x] = 1;
        }
      }
      regions.push({ label: tb.label, share: mass / total, box: tb.box });
    }
    regions.sort((a, b) => b.share - a.share);
    let textMass = 0;
    for (let i = 0; i < textMask.length; i++) if (textMask[i]) textMass += grid[i];
    const text_attention_share = textMass / total;

    // ── top_focus one-liner ──
    const fx = ((argmax % gw) + 0.5) / gw;
    const fy = (Math.floor(argmax / gw) + 0.5) / gh;
    const hitRegion = regions.find(r =>
      fx >= r.box[0] && fx <= r.box[0] + r.box[2] && fy >= r.box[1] && fy <= r.box[1] + r.box[3]);
    const top_focus = hitRegion
      ? `Predicted attention peaks in ${positionPhrase(fx, fy)}, on the text "${hitRegion.label}" (${Math.round(hitRegion.share * 100)}% of attention).`
      : `Predicted attention peaks in ${positionPhrase(fx, fy)}${regions.length ? `; OCR text overall draws ${Math.round(text_attention_share * 100)}% of attention` : ''}.`;

    // ── Jet alpha overlay PNG (max 800px wide) ──
    const outW = Math.min(bitmap.width, MAX_OUT_WIDTH);
    const outH = Math.round(bitmap.height * (outW / bitmap.width));
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = gw; gridCanvas.height = gh;
    const gctx = gridCanvas.getContext('2d')!;
    const gimg = gctx.createImageData(gw, gh);
    for (let i = 0; i < gw * gh; i++) {
      const v = grid[i] / max;
      gimg.data[i * 4] = gimg.data[i * 4 + 1] = gimg.data[i * 4 + 2] = Math.round(v * 255);
      gimg.data[i * 4 + 3] = 255;
    }
    gctx.putImageData(gimg, 0, 0);

    const smooth = document.createElement('canvas');
    smooth.width = outW; smooth.height = outH;
    const sctx = smooth.getContext('2d')!;
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(gridCanvas, 0, 0, outW, outH);
    const sdata = sctx.getImageData(0, 0, outW, outH);
    const overlay = sctx.createImageData(outW, outH);
    for (let i = 0; i < outW * outH; i++) {
      const v = sdata.data[i * 4] / 255;
      const [r, g, b] = jet(v);
      overlay.data[i * 4] = r;
      overlay.data[i * 4 + 1] = g;
      overlay.data[i * 4 + 2] = b;
      overlay.data[i * 4 + 3] = Math.round(Math.min(1, v * 1.1) * 0.72 * 255); // low saliency fades out
    }
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = outW; overlayCanvas.height = outH;
    overlayCanvas.getContext('2d')!.putImageData(overlay, 0, 0);
    const heatmap_data_url = overlayCanvas.toDataURL('image/png'); // PNG: overlay needs alpha

    // Downscaled original so the report can toggle the overlay (extension field)
    const orig = document.createElement('canvas');
    orig.width = outW; orig.height = outH;
    orig.getContext('2d')!.drawImage(bitmap, 0, 0, outW, outH);
    const image_data_url = orig.toDataURL('image/jpeg', 0.82);

    return { source: 'msi-net', heatmap_data_url, regions, text_attention_share, top_focus, image_data_url };
  } finally {
    bitmap.close();
  }
}
