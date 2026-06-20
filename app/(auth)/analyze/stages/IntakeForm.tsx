'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, Link, FileText, ChevronDown } from 'lucide-react';
import type { IntakeData } from '../page';

const GOALS = ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'App Downloads', 'Community Growth', 'Event Promotion'];
const PLATFORMS = ['Meta', 'Instagram', 'TikTok', 'YouTube', 'Snapchat', 'LinkedIn', 'Twitter/X'];
const TONES = ['Bold & Energetic', 'Warm & Emotional', 'Minimalist', 'Humorous', 'Premium & Aspirational', 'Educational', 'Urgent'];

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
    referenceLinks: [''],
    externalResearch: true,
    ideaFile: null,
    ideaType: 'none',
    canvaLink: '',
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function togglePlatform(p: string) {
    setData((d) => ({
      ...d,
      platforms: d.platforms.includes(p) ? d.platforms.filter((x) => x !== p) : [...d.platforms, p],
    }));
  }

  function addLink() { setData((d) => ({ ...d, referenceLinks: [...d.referenceLinks, ''] })); }
  function updateLink(i: number, val: string) {
    setData((d) => { const links = [...d.referenceLinks]; links[i] = val; return { ...d, referenceLinks: links }; });
  }
  function removeLink(i: number) {
    setData((d) => ({ ...d, referenceLinks: d.referenceLinks.filter((_, idx) => idx !== i) }));
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.pptx') || file.name.endsWith('.ppt'))) {
      setData((d) => ({ ...d, ideaFile: file, ideaType: 'pptx', canvaLink: '' }));
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setData((d) => ({ ...d, ideaFile: file, ideaType: 'pptx', canvaLink: '' }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(data);
  }

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
              <div style={{ position: 'relative' }}>
                <select
                  required value={data.goal}
                  onChange={(e) => setData((d) => ({ ...d, goal: e.target.value }))}
                  className="input"
                  style={{ paddingRight: 36, cursor: 'pointer' }}
                >
                  <option value="">Select a goal</option>
                  {GOALS.map((g) => <option key={g}>{g}</option>)}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
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
            <div style={{ position: 'relative' }}>
              <select value={data.tone} onChange={(e) => setData((d) => ({ ...d, tone: e.target.value }))} className="input" style={{ paddingRight: 36, cursor: 'pointer' }}>
                <option value="">Select a tone</option>
                {TONES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
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

          {/* Share Your Idea */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>Share Your Idea</label>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Already have a presentation or Canva design? Share it and we&apos;ll read all content — text, visuals, and links.
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {(['none', 'pptx', 'canva'] as const).map((type) => {
                const active = data.ideaType === type;
                return (
                  <motion.button key={type} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setData((d) => ({ ...d, ideaType: type, ideaFile: null, canvaLink: '' }))}
                    style={{
                      padding: '8px 18px', borderRadius: 20,
                      border: active ? '1px solid #3EB489' : '1px solid var(--input-border)',
                      background: active ? 'rgba(62,180,137,0.12)' : 'var(--input-bg)',
                      color: active ? '#3EB489' : 'var(--text-muted)',
                      fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {type === 'none' ? 'No file' : type === 'pptx' ? '📎 Upload PPTX' : '🔗 Canva Link'}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {data.ideaType === 'pptx' && (
                <motion.div key="pptx" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  {data.ideaFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(62,180,137,0.06)', border: '1px solid rgba(62,180,137,0.2)', borderRadius: 14 }}>
                      <FileText size={20} color="#3EB489" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{data.ideaFile.name}</p>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{(data.ideaFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={() => setData((d) => ({ ...d, ideaFile: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
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
                        borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer',
                        background: dragOver ? 'rgba(62,180,137,0.05)' : 'transparent', transition: 'all 0.2s',
                      }}
                    >
                      <Upload size={28} color={dragOver ? '#3EB489' : 'var(--text-muted)'} style={{ margin: '0 auto 12px' }} />
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', margin: 0 }}>Drag & drop your PPTX here</p>
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>or click to browse — .pptx files only</p>
                      <input ref={fileInputRef} type="file" accept=".pptx,.ppt" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </div>
                  )}
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    We&apos;ll extract all text, slide content, speaker notes, embedded images, and links from your presentation.
                  </p>
                </motion.div>
              )}

              {data.ideaType === 'canva' && (
                <motion.div key="canva" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <div style={{ position: 'relative' }}>
                    <Link size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="url" value={data.canvaLink} onChange={(e) => setData((d) => ({ ...d, canvaLink: e.target.value }))} placeholder="https://www.canva.com/design/..." className="input" style={{ paddingLeft: 40 }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    Make sure your Canva design is set to &quot;Anyone with the link can view&quot;. We&apos;ll screenshot every slide and extract all text and links.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reference Links */}
          <div>
            <label style={labelStyle}>Reference Links</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence>
                {data.referenceLinks.map((link, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} style={{ display: 'flex', gap: 8 }}>
                    <input type="url" value={link} onChange={(e) => updateLink(i, e.target.value)} placeholder="https://..." className="input" style={{ flex: 1 }} />
                    {data.referenceLinks.length > 1 && (
                      <button type="button" onClick={() => removeLink(i)} style={{ padding: '0 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, cursor: 'pointer', color: '#EF4444' }}>
                        <X size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={addLink}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'rgba(62,180,137,0.06)', border: '1px dashed rgba(62,180,137,0.3)', borderRadius: 12, color: '#3EB489', fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}>
                <Plus size={14} /> Add Link
              </motion.button>
            </div>
          </div>

          {/* External Research Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(62,180,137,0.04)', borderRadius: 14, border: '1px solid rgba(62,180,137,0.1)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>External Research</p>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>Pull comparable campaigns and industry benchmarks from the web</p>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => setData((d) => ({ ...d, externalResearch: !d.externalResearch }))}
              style={{ width: 48, height: 26, borderRadius: 13, background: data.externalResearch ? '#3EB489' : 'var(--border-subtle)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <motion.div
                animate={{ x: data.externalResearch ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
              />
            </motion.button>
          </div>

          {/* Submit */}
          <motion.button type="submit" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 14, marginTop: 4 }}>
            Analyze Campaign →
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
