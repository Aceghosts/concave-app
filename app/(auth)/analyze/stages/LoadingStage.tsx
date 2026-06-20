'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  'Reviewing your brief...',
  'Pulling historical performance data...',
  'Researching comparable campaigns...',
  'Scoring against effectiveness drivers...',
  'Generating recommendations...',
];

interface Props {
  onComplete: () => void;
}

export default function LoadingStage({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 1800;
    let step = 0;

    const stepInterval = setInterval(() => {
      step += 1;
      if (step >= STEPS.length) {
        clearInterval(stepInterval);
        setTimeout(onComplete, 600);
      } else {
        setCurrentStep(step);
      }
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const target = ((step + 1) / STEPS.length) * 100;
        const next = p + (target - p) * 0.08;
        return next > 98 ? 98 : next;
      });
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass"
        style={{ maxWidth: 480, width: '100%', padding: '44px 40px 36px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="shimmer-text font-bebas" style={{ fontSize: 36, letterSpacing: 1, display: 'block' }}>
            ANALYZING
          </span>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0', fontWeight: 400 }}>
            Our AI is evaluating your campaign
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {STEPS.map((step, i) => {
            const completed = i < currentStep;
            const active = i === currentStep;
            const pending = i > currentStep;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              >
                {/* Indicator */}
                <div style={{ position: 'relative', flexShrink: 0, width: 28, height: 28 }}>
                  {completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: '#3EB489', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </motion.div>
                  )}
                  {active && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #3EB489', boxShadow: '0 0 0 4px rgba(62,180,137,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3EB489' }} />
                    </motion.div>
                  )}
                  {pending && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.12)' }} />
                  )}
                </div>

                <span style={{
                  fontFamily: 'var(--font-poppins)',
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: completed ? '#3EB489' : active ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color 0.3s',
                }}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #3EB489, #6DC4A8)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
          {Math.round(progress)}% complete
        </p>
      </motion.div>
    </div>
  );
}
