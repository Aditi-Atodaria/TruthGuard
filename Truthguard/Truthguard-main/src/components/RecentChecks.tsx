'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Check, Verdict } from '@/types';
import { VERDICT_MAP } from '@/types';
import VerdictIcon from './VerdictIcon';
import Link from 'next/link';

export default function RecentChecks() {
  const [checks, setChecks]   = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res  = await fetch('/api/history?limit=5');
        const data = await res.json();
        setChecks(data.checks || []);
      } catch { /* silent */ } finally { setLoading(false); }
    }
    fetchRecent();
  }, []);

  const skeletonCls = "h-20 rounded-[24px] animate-pulse bg-white dark:bg-[#1e2025]";

  if (loading) return (
    <div className="w-full">
      <h2 className="font-display text-[44px] leading-[1.1] tracking-[-0.66px] mb-8 text-[#17191c] dark:text-[#e8e9eb]">
        Recently verified
      </h2>
      <div className="space-y-3">
        {[1,2,3].map((i) => <div key={i} className={skeletonCls} style={{ boxShadow: 'var(--shadow-card-flat)' }} />)}
      </div>
    </div>
  );

  if (checks.length === 0) return (
    <div className="w-full">
      <h2 className="font-display text-[44px] leading-[1.1] tracking-[-0.66px] mb-8 text-[#17191c] dark:text-[#e8e9eb]">
        Recently verified
      </h2>
      <div className="rounded-[24px] p-10 text-center bg-white dark:bg-[#1e2025]" style={{ boxShadow: 'var(--shadow-card-flat)' }}>
        <p className="text-[16px] tracking-[-0.009em] text-[#777b86] dark:text-[#8a8e99]">No checks yet. Be the first to verify a claim!</p>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full">
      <h2 className="font-display text-[44px] leading-[1.1] tracking-[-0.66px] mb-8 text-[#17191c] dark:text-[#e8e9eb]">
        Recently verified
      </h2>
      <div className="space-y-3">
        {checks.map((check, index) => {
          const display   = VERDICT_MAP[check.verdict as Verdict] || VERDICT_MAP.unverified;
          const isWarm    = ['false', 'misleading'].includes(check.verdict);
          const isCool    = ['true', 'too_recent'].includes(check.verdict);
          const cardBg    = isWarm ? 'bg-[#fbe1d1] dark:bg-[#2e1f17]' : isCool ? 'bg-[#d3e3fc] dark:bg-[#152033]' : 'bg-white dark:bg-[#1e2025]';
          const iconColor = isWarm ? 'text-[#5d2a1a] dark:text-[#c47a5a]' : isCool ? 'text-[#17191c] dark:text-[#e8e9eb]' : 'text-[#777b86] dark:text-[#8a8e99]';
          const labelColor= iconColor;

          return (
            <motion.div key={check.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * index }}>
              <Link
                href={`/result/${check.id}`}
                className={`group flex items-center gap-4 p-5 rounded-[24px] ${cardBg} transition-all duration-200 hover:shadow-md`}
                style={{ boxShadow: 'var(--shadow-card-sm)' }}
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10"
                  style={{ boxShadow: 'var(--shadow-badge)' }}
                >
                  <VerdictIcon iconName={display.iconName} className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-[450] tracking-[-0.009em] truncate text-[#17191c] dark:text-[#e8e9eb]">
                    {check.raw_input.substring(0, 100)}{check.raw_input.length > 100 && '…'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[13px] font-[500] tracking-[-0.009em] ${labelColor}`}>{display.label}</span>
                    <span className="text-[13px] text-[#a3a6af] dark:text-[#52565e]">·</span>
                    <span className="text-[13px] tracking-[-0.009em] text-[#a3a6af] dark:text-[#52565e]">
                      {new Date(check.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 transition-colors text-[#a3a6af] dark:text-[#52565e] group-hover:text-[#17191c] dark:group-hover:text-[#e8e9eb]" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
