'use client';

import { motion } from 'framer-motion';
import type { Verdict } from '@/types';
import { VERDICT_MAP } from '@/types';
import ConfidenceMeter from './ConfidenceMeter';
import VerdictIcon from './VerdictIcon';
import { AlertTriangle } from 'lucide-react';

interface VerdictCardProps {
  verdict: Verdict;
  confidence: number;
  summary: string;
}

const verdictStyles: Record<string, {
  bg: string; textColor: string; iconBg: string; divider: string;
}> = {
  true:       { bg: 'bg-[#d3e3fc] dark:bg-[#152033]',    textColor: 'text-[#17191c] dark:text-[#e8e9eb]', iconBg: 'bg-white/60 dark:bg-white/10', divider: 'bg-[#17191c]/10 dark:bg-white/10' },
  mostly_true:{ bg: 'bg-[#d3e3fc] dark:bg-[#152033]',    textColor: 'text-[#17191c] dark:text-[#e8e9eb]', iconBg: 'bg-white/60 dark:bg-white/10', divider: 'bg-[#17191c]/10 dark:bg-white/10' },
  misleading: { bg: 'bg-[#fbe1d1] dark:bg-[#2e1f17]',    textColor: 'text-[#5d2a1a] dark:text-[#c47a5a]', iconBg: 'bg-white/60 dark:bg-white/10', divider: 'bg-[#5d2a1a]/15 dark:bg-white/10' },
  false:      { bg: 'bg-[#fbe1d1] dark:bg-[#2e1f17]',    textColor: 'text-[#5d2a1a] dark:text-[#c47a5a]', iconBg: 'bg-white/60 dark:bg-white/10', divider: 'bg-[#5d2a1a]/15 dark:bg-white/10' },
  unverified: { bg: 'bg-[#f7f7f8] dark:bg-[#1e2025]',    textColor: 'text-[#777b86] dark:text-[#8a8e99]', iconBg: 'bg-white dark:bg-white/10',    divider: 'bg-[#a3a6af]/20 dark:bg-white/08' },
  too_recent: { bg: 'bg-[#d3e3fc] dark:bg-[#152033]',    textColor: 'text-[#17191c] dark:text-[#e8e9eb]', iconBg: 'bg-white/60 dark:bg-white/10', divider: 'bg-[#17191c]/10 dark:bg-white/10' },
  satire:     { bg: 'bg-[#f7f7f8] dark:bg-[#1e2025]',    textColor: 'text-[#777b86] dark:text-[#8a8e99]', iconBg: 'bg-white dark:bg-white/10',    divider: 'bg-[#a3a6af]/20 dark:bg-white/08' },
};

export default function VerdictCard({ verdict, confidence, summary }: VerdictCardProps) {
  const display = VERDICT_MAP[verdict];
  const style   = verdictStyles[verdict] || verdictStyles.unverified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', damping: 20 }}
      className="w-full"
    >
      <div
        className={`rounded-[24px] ${style.bg} p-6 md:p-8`}
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="text-[12px] font-[500] tracking-[0.06em] uppercase mb-2 text-[#777b86] dark:text-[#52565e]">Verdict</p>
            <h2 className={`font-display text-[40px] leading-[1.05] tracking-[-0.66px] ${style.textColor}`}>
              {display.label}
            </h2>
            <p className={`text-[15px] tracking-[-0.009em] mt-1.5 leading-[1.4] opacity-70 ${style.textColor}`}>
              {display.description}
            </p>
          </div>
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mt-1 ${style.iconBg}`}
            style={{ boxShadow: 'var(--shadow-badge)' }}
          >
            <VerdictIcon iconName={display.iconName} className={`w-5 h-5 ${style.textColor}`} />
          </div>
        </div>

        {/* Confidence */}
        <div className="mb-6">
          <ConfidenceMeter score={confidence} verdict={verdict} />
        </div>

        {/* Divider */}
        <div className={`h-px mb-6 ${style.divider}`} />

        {/* Summary */}
        <div>
          <p className="text-[12px] font-[500] tracking-[0.06em] uppercase mb-3 text-[#777b86] dark:text-[#52565e]">Analysis Summary</p>
          <p className={`text-[15px] leading-[1.6] tracking-[-0.009em] ${style.textColor}`}>
            {summary}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 flex items-center gap-1.5 text-[12px] tracking-[-0.009em] text-[#a3a6af] dark:text-[#52565e]">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>AI-assisted analysis. Always verify important information yourself.</span>
        </div>
      </div>
    </motion.div>
  );
}
