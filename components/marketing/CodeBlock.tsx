'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeBlock({ code, lang = 'http' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="mk-glass relative overflow-hidden !rounded-[16px] p-0">
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-5 py-3">
        <span className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {lang}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          {copied ? (
            <Check size={14} className="text-[var(--status-green)]" aria-hidden />
          ) : (
            <Copy size={14} aria-hidden />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
