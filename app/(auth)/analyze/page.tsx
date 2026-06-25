'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import IntakeForm from './stages/IntakeForm';
import ClarificationStage from './stages/ClarificationStage';
import LoadingStage from './stages/LoadingStage';

export type IntakeData = {
  campaignName: string;
  brief: string;
  goal: string;
  audience: string;
  platforms: string[];
  budget: string;
  timeline: string;
  tone: string;
  competitorNotes: string;
  referenceLinks: string[];
  externalResearch: boolean;
  ideaFile: File | null;
  ideaType: 'none' | 'pptx' | 'canva';
  canvaLink: string;
  // Set after background processing completes
  uploadId: string | null;
  extractedMd: string | null;
};

export type ClarificationData = {
  questions: string[];
  answers: string[];
};

type Stage = 'intake' | 'clarification' | 'loading';

export default function AnalyzePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('intake');
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [clarification, setClarification] = useState<ClarificationData | null>(null);

  function handleIntakeSubmit(data: IntakeData) {
    setIntake(data);
    setStage('clarification');
  }

  function handleClarificationSubmit(data: ClarificationData) {
    setClarification(data);
    setStage('loading');

    const reportId = crypto.randomUUID();

    async function buildBody() {
      const body: Record<string, unknown> = { intake, clarification: data };

      // If Inngest already extracted the file to MD, use that — no re-processing needed
      if (intake?.extractedMd) {
        body.extractedMd = intake.extractedMd;
        body.fileName = intake.ideaFile?.name;
        return body;
      }

      // Fallback: if file is still processing or upload was skipped, pass file inline
      const file = intake?.ideaFile;
      if (!file) return body;

      const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg'];
      const isVideo = VIDEO_TYPES.includes(file.type) || /\.(mp4|mov|webm|avi|mpeg)$/i.test(file.name);

      if (!isVideo) {
        // PDF / image inline for small files
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        body.fileBase64 = btoa(binary);
        body.fileMediaType = file.type || 'application/octet-stream';
        body.fileName = file.name;
      }
      // Videos without extractedMd: analysis will proceed without the file content
      return body;
    }

    // Navigate as soon as API responds — loading screen waits indefinitely
    buildBody()
      .then(body => fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }))
      .then(r => r.json())
      .then(({ analysis, error }) => {
        if (error || !analysis) throw new Error(error || 'No analysis');
        const payload = { id: reportId, campaignName: intake!.campaignName, ...analysis };
        localStorage.setItem(`report:${reportId}`, JSON.stringify(payload));
        router.push(`/analyze/${reportId}`);
      })
      .catch(err => {
        console.error('Analysis failed:', err);
        router.push('/analyze/demo-report');
      });
  }

  // Loading stage no longer drives navigation — it just shows progress
  function handleAnalysisComplete() { /* no-op */ }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px' }}>
      <AnimatePresence mode="wait">
        {stage === 'intake' && (
          <motion.div
            key="intake"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <IntakeForm onSubmit={handleIntakeSubmit} />
          </motion.div>
        )}
        {stage === 'clarification' && intake && (
          <motion.div
            key="clarification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <ClarificationStage intake={intake} onSubmit={handleClarificationSubmit} />
          </motion.div>
        )}
        {stage === 'loading' && intake && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <LoadingStage onComplete={handleAnalysisComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
