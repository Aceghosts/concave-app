'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, ChevronDown, Image } from 'lucide-react';
import type { IntakeData } from '../page';

const GOALS = ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'App Downloads', 'Community Growth', 'Event Promotion'];
const PLATFORMS = ['Meta', 'Instagram', 'TikTok', 'YouTube', 'Snapchat', 'LinkedIn', 'Twitter/X'];
const TONES = ['Bold & Energetic', 'Warm & Emotional', 'Minimalist', 'Humorous', 'Premium & Aspirational', 'Educational', 'Urgent'];

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.gif';

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

// Custom dropdown to match glassmorphism design
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
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              overflow: 'hidden',
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

export default function IntakeForm({ onSubmit }: Props) {
  const [data, setData] = useState<IntakeData>({
    campaignName: '',
    brief: '',
    goal: '',
    audience: '',
    platforms: [],
    budget: '',
    timeline: '',
    tone: '',
    competitorNotes: '',
    referenceLinks: [],
    externalResearch: true,
    ideaFile: null,
    ideaType: 'none',
    canvaLink: '',
  });
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function togglePlatform(p: string) {
    setData((d) => ({
      ...d,
      platforms: d.platforms.includes(p) ? d.platforms.filter((x) => x !== p) : [...d.platforms, p],
    }));
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) acceptFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
  }

  function acceptFile(file: File) {
    setFileError('');
    const valid = ACCEPTED_TYPES.includes(file.type) ||
      file.name.endsWith('.pdf') ||
      file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    if (!valid) {
      setFileError('Only PDF and image files (JPG, PNG, WEBP, GIF) are supported.');
      return;
    }
    setData((d) => ({ ...d, ideaFile: file, ideaType: 'pptx' }));
  }

  function removeFile() {
    setData((d) => ({ ...d, ideaFile: null, ideaType: 'none' }));
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.goal) return;
    onSubmit(data);
  }

  const isPDF = data.ideaFile?.type === 'application/pdf' || data.ideaFile?.name.endsWith('.pdf');

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
            <input
              required value={data.campaignName}
              onChange={(e) => setData((d) => ({ ...d, campaignName: e.target.value }))}
              placeholder="e.g. Ramadan 2025 Brand Push"
              className="input"
            />
          </div>

          {/* Brief */}
          <div>
            <label style={labelStyle}>Campaign Brief *</label>
            <textarea
              required value={data.brief}
              onChange={(e) => setData((d) => ({ ...d, brief: e.target.value }))}
              placeholder="Describe your campaign concept, key message, and what you're trying to achieve..."
              rows={4}
              className="input"
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Goal + Audience */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Campaign Goal *</label>
              <CustomSelect
                value={data.goal}
                onChange={(v) => setData((d) => ({ ...d, goal: v }))}
                options={GOALS}
                placeholder="Select a goal"
              />
            </div>
            <div>
              <label style={labelStyle}>Target Audience *</label>
              <input
                required value={data.audience}
                onChange={(e) => setData((d) => ({ ...d, audience: e.target.value }))}
                placeholder="e.g. Women 25–40, UAE"
                className="input"
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label style={labelStyle}>Platform(s) *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLATFORMS.map((p) => {
                const active = data.platforms.includes(p);
                return (
                  <motion.button
                    key={p} type="button"
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => togglePlatform(p)}
                    style={{
                      padding: '7px 16px', borderRadius: 20,
                      border: active ? '1px solid #3EB489' : '1px solid var(--input-border)',
                      background: active ? 'rgba(62,180,137,0.12)' : 'var(--input-bg)',
                      color: active ? '#3EB489' : 'var(--text-muted)',
                      fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {p}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Budget + Timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Budget</label>
              <input value={data.budget} onChange={(e) => setData((d) => ({ ...d, budget: e.target.value }))} placeholder="e.g. $50,000" className="input" />
            </div>
            <div>
              <label style={labelStyle}>Timeline</label>
              <input value={data.timeline} onChange={(e) => setData((d) => ({ ...d, timeline: e.target.value }))} placeholder="e.g. 4 weeks, Jun–Jul 2025" className="input" />
            </div>
          </div>

          {/* Tone */}
          <div>
            <label style={labelStyle}>Tone / Mood</label>
            <CustomSelect
              value={data.tone}
              onChange={(v) => setData((d) => ({ ...d, tone: v }))}
              options={TONES}
              placeholder="Select a tone"
            />
          </div>

          {/* Competitor Notes */}
          <div>
            <label style={labelStyle}>Competitor Notes</label>
            <textarea
              value={data.competitorNotes}
              onChange={(e) => setData((d) => ({ ...d, competitorNotes: e.target.value }))}
              placeholder="Any competitor campaigns to be aware of or differentiate from..."
              rows={2} className="input" style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Upload Creative / Brief */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 4 }}>Upload Creative or Brief</label>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Upload a PDF brief or an image of your creative — Claude will read and analyze the actual content.
              Supported: <strong style={{ color: 'var(--text-secondary)' }}>PDF, JPG, PNG, WEBP, GIF</strong>
            </p>

            {data.ideaFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(62,180,137,0.06)', border: '1px solid rgba(62,180,137,0.2)', borderRadius: 14 }}>
                {isPDF ? <FileText size={22} color="#3EB489" /> : <Image size={22} color="#3EB489" />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{data.ideaFile.name}</p>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {(data.ideaFile.size / 1024 / 1024).toFixed(2)} MB · {isPDF ? 'PDF — full text extraction' : 'Image — visual analysis'}
                  </p>
                </div>
                <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
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
                  or click to browse
                </p>
                <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS} onChange={handleFileSelect} style={{ display: 'none' }} />
              </div>
            )}

            {fileError && (
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: '#EF4444', marginTop: 8 }}>{fileError}</p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 14, marginTop: 4 }}
          >
            Analyze Campaign →
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
