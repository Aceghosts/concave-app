'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { IntakeData, ClarificationData } from '../page';

const MOCK_QUESTIONS = [
  'What emotional state do you want your audience to be in immediately after seeing this ad?',
  'Is there a specific hero visual or scene you already have in mind — or is the creative concept still open?',
  'Who is your biggest competitor in this space right now, and what are they doing that you want to differentiate from?',
  'What does success look like for this campaign — is it purely awareness, or are there hard conversion metrics attached?',
];

interface Props {
  intake: IntakeData;
  onSubmit: (data: ClarificationData) => void;
}

function cardVariants(i: number) {
  return {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
  };
}

export default function ClarificationStage({ intake, onSubmit }: Props) {
  const [answers, setAnswers] = useState<string[]>(MOCK_QUESTIONS.map(() => ''));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ questions: MOCK_QUESTIONS, answers });
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-bebas" style={{ fontSize: 28, letterSpacing: 1, color: 'var(--text-primary)', margin: 0 }}>
          QUICK CLARIFICATION
        </h1>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>
          A few questions about <strong style={{ color: '#3EB489' }}>{intake.campaignName}</strong> to sharpen the analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MOCK_QUESTIONS.map((q, i) => (
            <motion.div
              key={i}
              variants={cardVariants(i)}
              initial="hidden"
              animate="show"
              className="glass"
              style={{ padding: '24px 28px' }}
            >
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.6 }}>
                <span style={{ color: '#3EB489', fontWeight: 600 }}>Q{i + 1}. </span>{q}
              </p>
              <textarea
                value={answers[i]}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                placeholder="Your answer..."
                rows={2}
                className="input"
                style={{
                  width: '100%',
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3EB489'; e.target.style.boxShadow = '0 0 0 3px rgba(62,180,137,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
              />
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
            >
              Proceed to Analysis →
            </motion.button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
