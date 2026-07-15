'use client';

import { motion } from 'framer-motion';
import type { Verdict } from '@/types';

interface ConfidenceMeterProps {
  score: number;
  verdict: Verdict;
}

export default function ConfidenceMeter({ score, verdict }: ConfidenceMeterProps) {
  const isWarm = ['false', 'misleading'].includes(verdict);
  const isCool = ['true', 'too_recent'].includes(verdict);

  // Use CSS vars so colors adapt in dark mode automatically
  const barColor   = isWarm ? 'var(--color-rust)'      : isCool ? 'var(--color-ink)'      : 'var(--color-graphite)';
  const trackColor = isWarm ? 'rgba(93,42,26,0.12)'    : isCool ? 'rgba(23,25,28,0.08)'   : 'rgba(119,123,134,0.12)';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-[500] tracking-[-0.009em] text-[#777b86] dark:text-[#8a8e99]">
          Confidence Score
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[22px] font-[500] tracking-[-0.009em]"
          style={{ color: barColor }}
        >
          {score}%
        </motion.span>
      </div>

      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: trackColor }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: barColor }}
        />
      </div>

      <div className="flex justify-between text-[12px] tracking-[-0.009em] text-[#a3a6af] dark:text-[#52565e]">
        <span>Low</span><span>Medium</span><span>High</span>
      </div>
    </div>
  );
}
