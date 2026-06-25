'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, ChevronDown, Image, Video, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { IntakeData } from '../page';

const GOALS = ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'App Downloads', 'Community Growth', 'Event Promotion'];
const PLATFORMS = ['Meta', 'Instagram', 'TikTok', 'YouTube', 'Snapchat', 'LinkedIn', 'Twitter/X'];
const TONES = ['Bold & Energetic', 'Warm & Emotional', 'Minimalist', 'Humorous', 'Premium & Aspirational', 'Educational', 'Urgent'];

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm,.avi,.mpeg,.pptx,.ppt,.docx,.doc,.md,.txt';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

interface Props {
  onSubmit: (data: IntakeData) => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-poppins)',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom: 7,
};

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
          padding: '11px 16px', borderRadius: 12,
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'var(--font-poppins)', fontSize: 14, cursor: 'pointer',
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
              background: 'var(--glass-bg)', backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid var(--glass-border)', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)', overflow: 'hidden',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt} type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: '100%', padding: '11px 16px', background: 'none', border: 'none',
                  color: opt === value ? '#3EB489' : 'var(--text-primary)',
                  fontFamily: 'var(--font-poppins)', fontSize: 14, cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.12s',
                  borderLeft: opt === value ? '3px solid #3EB489' : '3px solid transparent',
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
  if (mimeType.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(fileName)) return <Video size={22} color="#3EB489" />;
  if (mimeType.startsWith('image/')) return <Image size={22} color="#3EB489" />;
  return <FileText size={22} color="#3EB489" />;
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
    campaignName: '', brief: '', goal: '', audience: '',
    platforms: [], budget: '', timeline: '', tone: '',
    competitorNotes: '', referenceLinks: [], externalResearch: true,
    ideaFile: null, ideaType: 'none', canvaLink: '',
    uploadId: null, extractedMd: null,
  });
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState('');
  const [processingMsg, setProcessingMsg] = useState(0);
  const [showMdPreview, setShowMdPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setData(d => ({ ...d, ideaFile: file, uploadId: null, extractedMd: null }));
    startMessageCycle();

    try {
      // Step 1: create DB row on server, get storage path back (no file bytes through Vercel)
      const initRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type }),
      });
      const { uploadId, storagePath, error: initError } = await initRes.json();
      if (initError || !uploadId || !storagePath) throw new Error(initError || 'Upload init failed');

      // Step 2: upload file directly to Supabase using anon key (bypasses Vercel entirely)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const uploadRes = await fetch(
        `${supabaseUrl}/storage/v1/object/campaign-files/${storagePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': file.type || 'application/octet-stream',
            'x-upsert': 'false',
          },
          body: file,
        }
      );
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Storage upload failed: ${uploadRes.status} ${errText}`);
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
    setData(d => ({ ...d, ideaFile: null, uploadId: null, extractedMd: null }));
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.goal) return;
    // Allow submit even if file is still processing — analysis will use whatever is ready
    onSubmit(data);
  }

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'processing';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <h1 className="font-bebas" style={{ fontSize: 36, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1 }}>
          NEW ANALYSIS
        </h1>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>
          Tell us about your campaign and we&apos;ll score it against 6 creative-effectiveness drivers.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="glass"
          style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          {/* Campaign Name */}
          <div>
            <label style={labelStyle}>Campaign Name *</label>
            <input required value={data.campaignName}
              onChange={e => setData(d => ({ ...d, campaignName: e.target.value }))}
              placeholder="e.g. Ramadan 2025 Brand Push" className="input" />
          </div>

          {/* Brief */}
          <div>
            <label style={labelStyle}>Campaign Brief *</label>
            <textarea required value={data.brief}
              onChange={e => setData(d => ({ ...d, brief: e.target.value }))}
              placeholder="Describe your campaign concept, key message, and what you're trying to achieve..."
              rows={4} className="input" style={{ resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Goal + Audience */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Campaign Goal *</label>
              <CustomSelect value={data.goal} onChange={v => setData(d => ({ ...d, goal: v }))} options={GOALS} placeholder="Select a goal" />
            </div>
            <div>
              <label style={labelStyle}>Target Audience *</label>
              <input required value={data.audience}
                onChange={e => setData(d => ({ ...d, audience: e.target.value }))}
                placeholder="e.g. Women 25–40, UAE" className="input" />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label style={labelStyle}>Platform(s) *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLATFORMS.map(p => {
                const active = data.platforms.includes(p);
                return (
                  <motion.button key={p} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => togglePlatform(p)}
                    style={{
                      padding: '7px 16px', borderRadius: 20,
                      border: active ? '1px solid #3EB489' : '1px solid var(--input-border)',
                      background: active ? 'rgba(62,180,137,0.12)' : 'var(--input-bg)',
                      color: active ? '#3EB489' : 'var(--text-muted)',
                      fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{p}</motion.button>
                );
              })}
            </div>
          </div>

          {/* Budget + Timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Budget</label>
              <input value={data.budget} onChange={e => setData(d => ({ ...d, budget: e.target.value }))} placeholder="e.g. $50,000" className="input" />
            </div>
            <div>
              <label style={labelStyle}>Timeline</label>
              <input value={data.timeline} onChange={e => setData(d => ({ ...d, timeline: e.target.value }))} placeholder="e.g. 4 weeks, Jun–Jul 2025" className="input" />
            </div>
          </div>

          {/* Tone */}
          <div>
            <label style={labelStyle}>Tone / Mood</label>
            <CustomSelect value={data.tone} onChange={v => setData(d => ({ ...d, tone: v }))} options={TONES} placeholder="Select a tone" />
          </div>

          {/* Competitor Notes */}
          <div>
            <label style={labelStyle}>Competitor Notes</label>
            <textarea value={data.competitorNotes}
              onChange={e => setData(d => ({ ...d, competitorNotes: e.target.value }))}
              placeholder="Any competitor campaigns to be aware of or differentiate from..."
              rows={2} className="input" style={{ resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* File Upload */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 4 }}>Upload Creative or Brief</label>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Any file type — <strong style={{ color: 'var(--text-secondary)' }}>PDF, PPTX, DOCX, MP4, MOV, JPG, PNG, MD, TXT</strong>
              <br />Concave extracts all content and converts it to a structured brief before analysis.
            </p>

            {/* No file yet — drop zone */}
            {uploadStatus === 'idle' && !data.ideaFile && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileAccepted(f); }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#3EB489' : 'rgba(62,180,137,0.25)'}`,
                  borderRadius: 16, padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'rgba(62,180,137,0.05)' : 'transparent', transition: 'all 0.2s',
                }}
              >
                <Upload size={26} color={dragOver ? '#3EB489' : 'var(--text-muted)'} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', margin: 0 }}>
                  Drag & drop your file here
                </p>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>
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
                {/* File row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(62,180,137,0.06)' }}>
                  {fileIcon(data.ideaFile.type, data.ideaFile.name)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {data.ideaFile.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {(data.ideaFile.size / 1024 / 1024).toFixed(1)} MB · {fileLabel(data.ideaFile.type, data.ideaFile.name)}
                    </p>
                  </div>
                  {!isProcessing && (
                    <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Status bar */}
                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-subtle)' }}>
                  {isProcessing && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(62,180,137,0.2)', borderTop: '2px solid #3EB489', flexShrink: 0 }}
                        />
                        <motion.p
                          key={processingMsg}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}
                        >
                          {PROCESSING_MESSAGES[processingMsg]}
                        </motion.p>
                      </div>
                      <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, transparent, #3EB489, transparent)', borderRadius: 99 }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadStatus === 'ready' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={16} color="#3EB489" />
                          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#3EB489', fontWeight: 500 }}>
                            Content extracted — ready for analysis
                          </span>
                        </div>
                        <button type="button"
                          onClick={() => setShowMdPreview(v => !v)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-poppins)', fontSize: 12 }}
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
                              background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)',
                              maxHeight: 280, overflowY: 'auto',
                            }}>
                              <pre style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                {data.extractedMd.slice(0, 3000)}{data.extractedMd.length > 3000 ? '\n\n... (truncated for preview)' : ''}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {uploadStatus === 'failed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} color="#EF4444" />
                      <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#EF4444' }}>
                        {uploadError || 'Processing failed'} —{' '}
                        <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3EB489', fontFamily: 'var(--font-poppins)', fontSize: 13, padding: 0 }}>
                          try again
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 14, marginTop: 4 }}
          >
            {isProcessing ? 'Processing file... you can still continue →' : 'Analyze Campaign →'}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
