'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, ChevronDown, Image, Video, CheckCircle, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import type { IntakeData } from '../page';
import { CHANNELS, DEFAULT_CHANNEL, type ChannelId } from '@/lib/channels';
import { computeAttentionMetrics } from '@/lib/attention';

const GOALS = ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'App Downloads', 'Community Growth', 'Event Promotion'];
const PLATFORMS = ['Meta', 'Instagram', 'TikTok', 'YouTube', 'Snapchat', 'LinkedIn', 'Twitter/X'];
const TONES = ['Bold & Energetic', 'Warm & Emotional', 'Minimalist', 'Humorous', 'Premium & Aspirational', 'Educational', 'Urgent'];

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm,.avi,.mpeg,.pptx,.ppt,.docx,.doc,.md,.txt';

/** Channel-aware helper line for the Placement context group (labels only — no new data). */
const PLACEMENT_HINT: Record<ChannelId, string> = {
  campaign_brief: 'Where the campaign will run — mandatories are checked per platform.',
  social: 'Pick every placement — safe zones, ratios and durations are judged per platform.',
  digital: 'Networks the display set will traffic to — each size is judged at rendered size.',
  video: 'Where the film will air — length and grammar are checked per placement.',
  script_storyboard: 'Intended platforms once produced — informs the potential assessment.',
};

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

interface Props {
  onSubmit: (data: IntakeData) => void;
}

/* ── Typography: readable on the near-opaque card fill (WCAG AA) ── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-poppins)',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.9px',
  marginBottom: 8,
};

const helpStyle: React.CSSProperties = {
  fontFamily: 'var(--font-poppins)',
  fontSize: 13.5,
  lineHeight: 1.55,
  color: 'var(--text-secondary)',
};

const inputStyle: React.CSSProperties = { fontSize: 15, padding: '12px 15px' };

/* One card level only — near-opaque fill so text never ghosts (no glass-on-glass). */
const sectionCard: React.CSSProperties = {
  background: 'linear-gradient(180deg, #101829 0%, #0B101F 100%)',
  border: '1px solid var(--glass-border)',
  borderRadius: 18,
  boxShadow: '0 16px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
  padding: '28px 30px',
};

function SectionHeader({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
      <span
        aria-hidden
        style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--gradient-brand)', color: '#070A14',
          fontFamily: 'var(--font-bebas)', fontSize: 15, fontWeight: 700,
        }}
      >
        {n}
      </span>
      <div>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 19, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {sub && <p style={{ ...helpStyle, margin: '4px 0 0' }}>{sub}</p>}
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 700,
      color: 'var(--text-primary)', margin: '0 0 2px',
    }}>
      {children}
    </p>
  );
}

function CustomSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 12,
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'var(--font-poppins)', fontSize: 15, cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>{value || placeholder}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} color="var(--text-muted)" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
              background: '#0E1528',
              border: '1px solid var(--glass-border)', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt} type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                  color: opt === value ? '#3DDCC8' : 'var(--text-primary)',
                  fontFamily: 'var(--font-poppins)', fontSize: 15, cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.12s',
                  borderLeft: opt === value ? '3px solid #3DDCC8' : '3px solid transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fileIcon(mimeType: string, fileName: string) {
  if (mimeType.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(fileName)) return <Video size={22} color="#3DDCC8" />;
  if (mimeType.startsWith('image/')) return <Image size={22} color="#3DDCC8" />;
  return <FileText size={22} color="#3DDCC8" />;
}

function fileLabel(mimeType: string, fileName: string) {
  if (mimeType.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(fileName)) return 'Video — Gemini AI will watch & analyze';
  if (mimeType.startsWith('image/')) return 'Image — visual analysis';
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'PDF — full text extraction';
  if (/\.(pptx|ppt)$/i.test(fileName)) return 'Presentation — slide content extraction';
  if (/\.(docx|doc)$/i.test(fileName)) return 'Word doc — full text extraction';
  if (/\.(md|txt)$/i.test(fileName)) return 'Text file — direct analysis';
  return 'File — content extraction';
}

const PROCESSING_MESSAGES = [
  'Uploading your file...',
  'Extracting content...',
  'Converting to structured brief...',
  'Analyzing structure...',
  'Almost ready...',
];

export default function IntakeForm({ onSubmit }: Props) {
  const [data, setData] = useState<IntakeData>({
    channel: DEFAULT_CHANNEL,
    campaignName: '', brief: '', goal: '', audience: '',
    platforms: [], budget: '', timeline: '', tone: '',
    competitorNotes: '', referenceLinks: [], externalResearch: true,
    ideaFile: null, ideaType: 'none', canvaLink: '',
    uploadId: null, extractedMd: null,
    attention_metrics: null,
  });
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState('');
  const [processingMsg, setProcessingMsg] = useState(0);
  const [showMdPreview, setShowMdPreview] = useState(false);
  const [attnStatus, setAttnStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attnToken = useRef(0);

  /** Phase E1: predicted-attention pipeline for image creatives — never blocks the analysis. */
  function startAttentionPipeline(file: File) {
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!isImage) { setAttnStatus('idle'); return; } // non-image: skip silently
    const token = ++attnToken.current;
    setAttnStatus('running');
    computeAttentionMetrics(file)
      .then(metrics => {
        if (token !== attnToken.current) return; // stale (file was replaced)
        setData(d => ({ ...d, attention_metrics: metrics }));
        setAttnStatus('done');
      })
      .catch(err => {
        if (token !== attnToken.current) return;
        console.warn('Attention measurement skipped:', err); // skip silently — never block the analysis
        setAttnStatus('idle');
      });
  }

  const startMessageCycle = useCallback(() => {
    let i = 0;
    msgRef.current = setInterval(() => {
      i = (i + 1) % PROCESSING_MESSAGES.length;
      setProcessingMsg(i);
    }, 2500);
  }, []);

  const stopMessageCycle = useCallback(() => {
    if (msgRef.current) { clearInterval(msgRef.current); msgRef.current = null; }
  }, []);

  async function handleFileAccepted(file: File) {
    setUploadError('');
    setUploadStatus('uploading');
    setData(d => ({ ...d, ideaFile: file, uploadId: null, extractedMd: null, attention_metrics: null }));
    startMessageCycle();
    startAttentionPipeline(file);

    try {
      // Step 1: create DB row on server, get storage path back (no file bytes through Vercel)
      const initRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type }),
      });
      const { uploadId, storagePath, error: initError } = await initRes.json();
      if (initError || !uploadId || !storagePath) throw new Error(initError || 'Upload init failed');

      // Step 2: upload file via server proxy (avoids CORS issues with direct Supabase upload)
      const uploadController = new AbortController();
      const uploadTimeout = setTimeout(() => uploadController.abort(), 120000);
      let uploadRes: Response;
      try {
        uploadRes = await fetch(
          `/api/upload?path=${encodeURIComponent(storagePath)}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
              'x-mime-type': file.type || 'application/octet-stream',
            },
            body: file,
            signal: uploadController.signal,
          }
        );
      } finally {
        clearTimeout(uploadTimeout);
      }
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Storage upload failed (${uploadRes.status}): ${errText}`);
      }

      // Step 3: trigger Inngest background processing
      await fetch('/api/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, storagePath, fileName: file.name, mimeType: file.type }),
      });

      setUploadStatus('processing');

      // Step 4: poll until Inngest job completes
      const poll = async () => {
        const statusRes = await fetch(`/api/upload/status?id=${uploadId}`);
        const status = await statusRes.json();

        if (status.status === 'ready') {
          stopMessageCycle();
          setUploadStatus('ready');
          setData(d => ({ ...d, uploadId, extractedMd: status.extractedMd }));
          // Pre-fill empty form fields from the extracted content
          if (status.extractedMd) {
            fetch('/api/prefill', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ extractedMd: status.extractedMd }),
            })
              .then(r => r.json())
              .then((p) => {
                if (p.error) return;
                setData(d => ({
                  ...d,
                  campaignName: d.campaignName || p.campaignName || '',
                  brief: d.brief || p.brief || '',
                  goal: d.goal || p.goal || '',
                  audience: d.audience || p.audience || '',
                  platforms: d.platforms.length ? d.platforms : (p.platforms || []),
                  budget: d.budget || p.budget || '',
                  timeline: d.timeline || p.timeline || '',
                  tone: d.tone || p.tone || '',
                }));
              })
              .catch(() => {});
          }
        } else if (status.status === 'failed') {
          stopMessageCycle();
          setUploadStatus('failed');
          setUploadError(status.error || 'Processing failed');
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      };
      poll();
    } catch (err) {
      stopMessageCycle();
      setUploadStatus('failed');
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  function removeFile() {
    if (pollRef.current) clearTimeout(pollRef.current);
    stopMessageCycle();
    attnToken.current++;
    setAttnStatus('idle');
    setData(d => ({ ...d, ideaFile: null, uploadId: null, extractedMd: null, attention_metrics: null }));
    setUploadStatus('idle');
    setUploadError('');
    setShowMdPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function togglePlatform(p: string) {
    setData(d => ({
      ...d,
      platforms: d.platforms.includes(p) ? d.platforms.filter(x => x !== p) : [...d.platforms, p],
    }));
  }

  const isFlagship = (data.channel ?? DEFAULT_CHANNEL) === 'campaign_brief';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isFlagship) {
      if (!data.goal) return;
      // Allow submit even if file is still processing — analysis will use whatever is ready
      onSubmit(data);
      return;
    }
    // Non-flagship apps are upload-only: the file is the brief. Fill the required
    // context fields with honest defaults so the API contract is unchanged.
    if (!data.ideaFile) return;
    const label = CHANNELS[data.channel].label;
    onSubmit({
      ...data,
      campaignName: data.campaignName || data.ideaFile.name.replace(/\.[^.]+$/, '') || `Untitled ${label} analysis`,
      brief: data.brief || `Score this ${label} asset against channel best practices.`,
      goal: data.goal || GOALS[0],
      audience: data.audience || 'General audience (infer from the asset)',
    });
  }

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'processing';

  // Instant local preview: object URL renders the moment a file is picked, before any upload finishes
  const previewUrl = useMemo(() => {
    const f = data.ideaFile;
    if (!f || !(f.type.startsWith('image/') || f.type.startsWith('video/'))) return null;
    return URL.createObjectURL(f);
  }, [data.ideaFile]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  const submitBlocked = !isFlagship && !data.ideaFile;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 30 }}
      >
        <h1 className="font-bebas" style={{ fontSize: 44, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>
          NEW ANALYSIS
        </h1>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, color: 'var(--text-secondary)', margin: '8px 0 0' }}>
          Tell us about your campaign and we&apos;ll score it against 6 creative-effectiveness drivers.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ── 1 · Analysis app (full-width row of 5) ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          style={sectionCard}
        >
          <SectionHeader
            n="1"
            title="Pick your analysis app"
            sub="Each app tunes the sub-KPIs to its medium — pick the one that matches what you're scoring."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {Object.values(CHANNELS).map((ch) => {
              const active = data.channel === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setData(d => ({ ...d, channel: ch.id as ChannelId }))}
                  aria-pressed={active}
                  style={{
                    position: 'relative', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    padding: '16px 16px 14px', borderRadius: 14,
                    border: active ? '1px solid #3DDCC8' : '1px solid var(--glass-border)',
                    boxShadow: active
                      ? '0 0 0 1px #3DDCC8, 0 0 28px rgba(61,220,200,0.22)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    background: active
                      ? 'linear-gradient(180deg, rgba(61,220,200,0.16), rgba(124,140,255,0.08))'
                      : 'rgba(255,255,255,0.035)',
                    transition: 'all 0.15s',
                  }}
                >
                  {active && (
                    <span aria-hidden style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#3DDCC8', color: '#070A14',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  {/* Title row — badge inline, never overlapping */}
                  <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingRight: 26 }}>
                    <span style={{
                      fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700,
                      color: active ? '#3DDCC8' : 'var(--text-primary)',
                    }}>
                      {ch.label}
                    </span>
                    {ch.id === 'campaign_brief' && (
                      <span style={{
                        fontFamily: 'var(--font-poppins)', fontSize: 9, fontWeight: 700,
                        letterSpacing: '0.8px', textTransform: 'uppercase',
                        color: '#070A14', background: 'var(--gradient-brand)',
                        padding: '3px 8px', borderRadius: 99, lineHeight: 1,
                      }}>Flagship</span>
                    )}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-poppins)', fontSize: 13, lineHeight: 1.55,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    margin: '8px 0 12px', flex: 1,
                  }}>
                    {ch.description}
                  </span>
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {ch.assetKinds.map(k => (
                      <span key={k} style={{
                        fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        color: active ? '#3DDCC8' : 'var(--text-secondary)',
                        background: active ? 'rgba(61,220,200,0.14)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${active ? 'rgba(61,220,200,0.35)' : 'var(--border-subtle)'}`,
                        padding: '3px 8px', borderRadius: 99,
                      }}>{k}</span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* ── 2 + 3 side by side on desktop ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 22, alignItems: 'start' }}>

          {/* ── 2 · Upload (prominent, tall) ── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={sectionCard}
          >
            <SectionHeader
              n="2"
              title={isFlagship ? 'Upload creative or brief' : 'Upload the asset'}
              sub={isFlagship
                ? 'Concave extracts the content and auto-fills the context form — review, adjust, and analyze.'
                : "Upload the asset — that's all we need. Scoring runs against channel best practices."}
            />
            <p style={{ ...helpStyle, margin: '0 0 16px' }}>
              Any file type — <strong style={{ color: 'var(--text-primary)' }}>PDF, PPTX, DOCX, MP4, MOV, JPG, PNG, MD, TXT</strong>
            </p>

            {/* No file yet — tall drop zone */}
            {uploadStatus === 'idle' && !data.ideaFile && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileAccepted(f); }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#3DDCC8' : 'rgba(61,220,200,0.35)'}`,
                  borderRadius: 16, padding: '72px 24px', minHeight: 300,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'rgba(61,220,200,0.08)' : 'rgba(61,220,200,0.03)',
                  transition: 'all 0.2s',
                }}
              >
                <span aria-hidden style={{
                  width: 56, height: 56, borderRadius: 16, marginBottom: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(61,220,200,0.20), rgba(124,140,255,0.16))',
                  border: '1px solid rgba(61,220,200,0.30)',
                  boxShadow: '0 0 24px rgba(61,220,200,0.18)',
                }}>
                  <Upload size={24} color="#3DDCC8" />
                </span>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Drag &amp; drop your file here
                </p>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13.5, color: 'var(--text-secondary)', margin: '8px 0 0' }}>
                  or click to browse — any size
                </p>
                <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileAccepted(f); }}
                  style={{ display: 'none' }} />
              </div>
            )}

            {/* File selected — show status */}
            {data.ideaFile && (
              <div style={{ border: '1px solid var(--glass-border)', borderRadius: 14, overflow: 'hidden' }}>
                {/* Instant preview — object URL, zero wait */}
                {previewUrl && (
                  <div style={{ background: '#05070F', display: 'flex', justifyContent: 'center', maxHeight: 280, overflow: 'hidden' }}>
                    {data.ideaFile.type.startsWith('video/') ? (
                      <video src={previewUrl} muted playsInline preload="metadata" controls
                        style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Uploaded creative preview"
                        style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain' }} />
                    )}
                  </div>
                )}
                {/* File row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', background: 'rgba(61,220,200,0.08)' }}>
                  {fileIcon(data.ideaFile.type, data.ideaFile.name)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {data.ideaFile.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                      {(data.ideaFile.size / 1024 / 1024).toFixed(1)} MB · {fileLabel(data.ideaFile.type, data.ideaFile.name)}
                    </p>
                  </div>
                  {!isProcessing && (
                    <button type="button" onClick={removeFile} aria-label="Remove file" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, flexShrink: 0 }}>
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Status bar */}
                <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)' }}>
                  {isProcessing && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(61,220,200,0.2)', borderTop: '2px solid #3DDCC8', flexShrink: 0 }}
                        />
                        <motion.p
                          key={processingMsg}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: 'var(--text-primary)', margin: 0 }}
                        >
                          {PROCESSING_MESSAGES[processingMsg]}
                        </motion.p>
                      </div>
                      <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, transparent, #3DDCC8, transparent)', borderRadius: 99 }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadStatus === 'ready' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={16} color="#3DDCC8" />
                          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: '#3DDCC8', fontWeight: 600 }}>
                            Content extracted — ready for analysis
                          </span>
                        </div>
                        <button type="button"
                          onClick={() => setShowMdPreview(v => !v)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-poppins)', fontSize: 13 }}
                        >
                          {showMdPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                          {showMdPreview ? 'Hide preview' : 'Preview extracted content'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showMdPreview && data.extractedMd && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              marginTop: 12, padding: '14px 16px', borderRadius: 10,
                              background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)',
                              maxHeight: 280, overflowY: 'auto',
                            }}>
                              <pre style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                {data.extractedMd.slice(0, 3000)}{data.extractedMd.length > 3000 ? '\n\n... (truncated for preview)' : ''}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {attnStatus !== 'idle' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: uploadStatus === 'failed' ? 0 : 10 }}>
                      {attnStatus === 'running' ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(124,140,255,0.25)', borderTop: '2px solid #7C8CFF', flexShrink: 0 }}
                          />
                          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            Measuring predicted attention…
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={13} color="#7C8CFF" />
                          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            Predicted attention measured — {data.attention_metrics ? `${Math.round(data.attention_metrics.text_attention_share * 100)}% of attention on text, ${data.attention_metrics.regions.length} region${data.attention_metrics.regions.length === 1 ? '' : 's'}` : 'heatmap ready'}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {uploadStatus === 'failed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} color="#F87171" />
                      <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: '#F87171' }}>
                        {uploadError || 'Processing failed'} —{' '}
                        <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3DDCC8', fontFamily: 'var(--font-poppins)', fontSize: 14, padding: 0 }}>
                          try again
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.section>

          {/* ── 3 · Campaign context (flagship only — other apps are upload-only) ── */}
          {isFlagship && <motion.section
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            style={{ ...sectionCard, display: 'flex', flexDirection: 'column', gap: 26 }}
          >
            <SectionHeader
              n="3"
              title="Campaign context"
              sub="Brand, intended message and placement — the context every score is judged against."
            />

            {/* Brand & campaign */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GroupLabel>Brand &amp; campaign</GroupLabel>
              <div>
                <label style={labelStyle}>Campaign Name *</label>
                <input required value={data.campaignName}
                  onChange={e => setData(d => ({ ...d, campaignName: e.target.value }))}
                  placeholder="e.g. Ramadan 2025 Brand Push" className="input" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Target Audience *</label>
                <input required value={data.audience}
                  onChange={e => setData(d => ({ ...d, audience: e.target.value }))}
                  placeholder="e.g. Women 25–40, UAE" className="input" style={inputStyle} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 0 }} />

            {/* Intended message */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GroupLabel>Intended message</GroupLabel>
              <div>
                <label style={labelStyle}>Key Message / Brief *</label>
                <textarea required value={data.brief}
                  onChange={e => setData(d => ({ ...d, brief: e.target.value }))}
                  placeholder="Describe your campaign concept, key message, and what you're trying to achieve..."
                  rows={4} className="input" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={labelStyle}>Campaign Goal *</label>
                <CustomSelect value={data.goal} onChange={v => setData(d => ({ ...d, goal: v }))} options={GOALS} placeholder="Select a goal" />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 0 }} />

            {/* Placement context — channel-aware copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <GroupLabel>Placement context</GroupLabel>
                <p style={{ ...helpStyle, fontSize: 13, margin: '4px 0 0' }}>
                  {PLACEMENT_HINT[data.channel ?? DEFAULT_CHANNEL]}
                </p>
              </div>
              <div>
                <label style={labelStyle}>Platform(s) *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PLATFORMS.map(p => {
                    const active = data.platforms.includes(p);
                    return (
                      <motion.button key={p} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => togglePlatform(p)}
                        style={{
                          padding: '8px 17px', borderRadius: 20,
                          border: active ? '1px solid #3DDCC8' : '1px solid var(--input-border)',
                          background: active ? 'rgba(61,220,200,0.14)' : 'var(--input-bg)',
                          color: active ? '#3DDCC8' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}>{p}</motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 0 }} />

            {/* Optional enrichers — rarely change the score, kept out of the main flow */}
            <details>
              <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>
                More context (optional) — tone, competitors, budget, timeline
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Tone / Mood</label>
                    <CustomSelect value={data.tone} onChange={v => setData(d => ({ ...d, tone: v }))} options={TONES} placeholder="Select a tone" />
                  </div>
                  <div>
                    <label style={labelStyle}>Budget</label>
                    <input value={data.budget} onChange={e => setData(d => ({ ...d, budget: e.target.value }))} placeholder="e.g. $50,000" className="input" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Timeline</label>
                  <input value={data.timeline} onChange={e => setData(d => ({ ...d, timeline: e.target.value }))} placeholder="e.g. 4 weeks, Jun–Jul 2025" className="input" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Competitor Notes</label>
                  <textarea value={data.competitorNotes}
                    onChange={e => setData(d => ({ ...d, competitorNotes: e.target.value }))}
                    placeholder="Any competitor campaigns to be aware of or differentiate from..."
                    rows={2} className="input" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
              </div>
            </details>
          </motion.section>}
        </div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.button
            type="submit"
            disabled={submitBlocked}
            whileHover={submitBlocked ? undefined : { scale: 1.01, y: -1 }} whileTap={submitBlocked ? undefined : { scale: 0.99 }}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 14, opacity: submitBlocked ? 0.5 : 1, cursor: submitBlocked ? 'not-allowed' : 'pointer' }}
          >
            {submitBlocked ? 'Upload an asset to analyze' : isProcessing ? 'Processing file... you can still continue →' : 'Analyze Campaign →'}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
