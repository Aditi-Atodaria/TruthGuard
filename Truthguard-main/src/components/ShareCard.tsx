'use client';

import { motion } from 'framer-motion';
import { Copy, Check, MessageCircle, Share2 } from 'lucide-react';
import type { Verdict } from '@/types';
import { VERDICT_MAP } from '@/types';
import { useState } from 'react';

interface ShareCardProps {
  verdict: Verdict;
  confidence: number;
  summary: string;
  checkId: string;
}

export default function ShareCard({ verdict, confidence, summary, checkId }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const display = VERDICT_MAP[verdict];

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/result/${checkId}`
    : '';

  const shareText = `TruthGuard Verdict: ${display.label} (${confidence}% confidence)\n\n"${summary.substring(0, 120)}..."\n\nVerify it yourself:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* empty */ }
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const btn = [
    'flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-[450] tracking-[-0.009em] transition-colors',
    'border border-[#a3a6af]/40 dark:border-[#3a3d42]/70',
    'text-[#17191c] dark:text-[#e8e9eb]',
    'hover:bg-[#f7f7f8] dark:hover:bg-[#1e2025]',
  ].join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex items-center gap-3 flex-wrap"
    >
      <button onClick={handleCopy} className={btn}>
        {copied
          ? <><Check className="h-4 w-4 text-[#5d2a1a] dark:text-[#c47a5a]" />Copied!</>
          : <><Copy className="h-4 w-4" />Copy Result</>}
      </button>

      <button onClick={handleTwitterShare} className={btn}>
        <MessageCircle className="h-4 w-4" />
        Share on X
      </button>

      <button
        onClick={() => {
          if (navigator.share)
            navigator.share({ title: 'TruthGuard Verdict', text: shareText, url: shareUrl });
        }}
        className={btn}
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
    </motion.div>
  );
}
