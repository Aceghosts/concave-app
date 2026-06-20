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
      if (intake?.ideaFile) {
        const file = intake.ideaFile;
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        body.fileBase64 = btoa(binary);
        body.fileMediaType = file.type || 'application/octet-stream';
        body.fileName = file.name;
      }
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
