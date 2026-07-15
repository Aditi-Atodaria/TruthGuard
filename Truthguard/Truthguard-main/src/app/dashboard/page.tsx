'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Check, Verdict } from '@/types';
import { VERDICT_MAP } from '@/types';
import VerdictIcon from '@/components/VerdictIcon';

const VERDICT_FILTERS = [
  { label: 'All',        value: 'all' },
  { label: 'True',       value: 'true' },
  { label: 'False',      value: 'false' },
  { label: 'Misleading', value: 'misleading' },
  { label: 'Unverified', value: 'unverified' },
  { label: 'Too Recent', value: 'too_recent' },
  { label: 'Satire',     value: 'satire' },
];

export default function DashboardPage() {
  const [checks, setChecks]             = useState<Check[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');

  useEffect(() => { fetchChecks(); }, [activeFilter]);

  async function fetchChecks() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', offset: '0' });
      if (activeFilter !== 'all') params.set('verdict', activeFilter);
      const res  = await fetch(`/api/history?${params.toString()}`);
      const data = await res.json();
      setChecks(data.checks || []);
    } catch { setChecks([]); } finally { setLoading(false); }
  }

  const filteredChecks = searchQuery
    ? checks.filter((c) => c.raw_input.toLowerCase().includes(searchQuery.toLowerCase()))
    : checks;

  const verdictCounts = checks.reduce((acc, c) => {
    acc[c.verdict] = (acc[c.verdict] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen px-6 py-12 pt-24" style={{ backgroundColor: 'var(--surface-section)' }}>
      <div className="max-w-[1200px] mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-[#777b86] dark:text-[#8a8e99]" />
            <p className="text-[12px] font-[500] tracking-[0.06em] uppercase text-[#777b86] dark:text-[#8a8e99]">History</p>
          </div>
          <h1 className="font-display text-[44px] leading-[1.1] tracking-[-0.66px] mb-2
                         text-[#17191c] dark:text-[#e8e9eb]">
            Verified Claims
          </h1>
          <p className="text-[18px] leading-[1.35] tracking-[-0.16px] text-[#4c4c4c] dark:text-[#b0b3bb]">
            {checks.length} {checks.length === 1 ? 'check' : 'checks'} on record
          </p>
        </motion.div>

        {/* ── Stat cards ── */}
        {checks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(verdictCounts).slice(0, 4).map(([v, count]) => {
              const display   = VERDICT_MAP[v as Verdict] || VERDICT_MAP.unverified;
              const isWarm    = ['false', 'misleading'].includes(v);
              const isCool    = ['true', 'too_recent'].includes(v);
              const cardBg    = isWarm ? 'bg-[#fbe1d1] dark:bg-[#2e1f17]' : isCool ? 'bg-[#d3e3fc] dark:bg-[#152033]' : 'bg-white dark:bg-[#1e2025]';
              const iconColor = isWarm ? 'text-[#5d2a1a] dark:text-[#c47a5a]' : isCool ? 'text-[#17191c] dark:text-[#e8e9eb]' : 'text-[#777b86] dark:text-[#8a8e99]';

              return (
                <div key={v} className={`rounded-[24px] p-5 ${cardBg}`} style={{ boxShadow: 'var(--shadow-card-flat)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[28px] font-[500] leading-none tracking-[-0.5px] text-[#17191c] dark:text-[#e8e9eb]">{count}</p>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10"
                         style={{ boxShadow: 'var(--shadow-badge)' }}>
                      <VerdictIcon iconName={display.iconName} className={`w-4 h-4 ${iconColor}`} />
                    </div>
                  </div>
                  <p className={`text-[13px] font-[500] tracking-[-0.009em] ${iconColor}`}>{display.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a3a6af] dark:text-[#52565e]" />
            <input
              type="text"
              placeholder="Search checks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-full text-[15px] tracking-[-0.009em] focus:outline-none transition-colors
                         border border-[#a3a6af]/40 dark:border-[#3a3d42]/70
                         bg-white dark:bg-[#1e2025]
                         text-[#17191c] dark:text-[#e8e9eb]
                         placeholder:text-[#a3a6af] dark:placeholder:text-[#52565e]
                         focus:border-[#17191c] dark:focus:border-[#8a8e99]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {VERDICT_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2 rounded-full text-[13px] font-[450] tracking-[-0.009em] transition-colors ${
                  activeFilter === f.value
                    ? 'bg-[#17191c] dark:bg-[#e8e9eb] text-white dark:text-[#141618]'
                    : 'bg-white dark:bg-[#1e2025] text-[#777b86] dark:text-[#8a8e99] border border-[#a3a6af]/40 dark:border-[#3a3d42]/70 hover:border-[#17191c] dark:hover:border-[#8a8e99] hover:text-[#17191c] dark:hover:text-[#e8e9eb]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-20 rounded-[24px] animate-pulse bg-white dark:bg-[#1e2025]"
                   style={{ boxShadow: 'var(--shadow-card-flat)' }} />
            ))}
          </div>
        ) : filteredChecks.length === 0 ? (
          <div className="rounded-[24px] p-16 text-center bg-white dark:bg-[#1e2025]"
               style={{ boxShadow: 'var(--shadow-card-flat)' }}>
            <Search className="h-8 w-8 mx-auto mb-3 text-[#a3a6af] dark:text-[#52565e]" />
            <p className="text-[16px] tracking-[-0.009em] text-[#777b86] dark:text-[#8a8e99]">
              {searchQuery ? 'No matching checks found.' : 'No checks yet.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-[15px] font-[450] tracking-[-0.009em] transition-colors
                         bg-[#17191c] dark:bg-[#e8e9eb] text-white dark:text-[#141618]
                         hover:bg-[#2c2f34] dark:hover:bg-[#d0d2d6]"
            >
              Verify a claim
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChecks.map((check, index) => {
              const display   = VERDICT_MAP[check.verdict as Verdict] || VERDICT_MAP.unverified;
              const isWarm    = ['false', 'misleading'].includes(check.verdict);
              const isCool    = ['true', 'too_recent'].includes(check.verdict);
              const cardBg    = isWarm ? 'bg-[#fbe1d1] dark:bg-[#2e1f17]' : isCool ? 'bg-[#d3e3fc] dark:bg-[#152033]' : 'bg-white dark:bg-[#1e2025]';
              const iconColor = isWarm ? 'text-[#5d2a1a] dark:text-[#c47a5a]' : isCool ? 'text-[#17191c] dark:text-[#e8e9eb]' : 'text-[#777b86] dark:text-[#8a8e99]';

              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={`/result/${check.id}`}
                    className={`group flex items-center gap-4 p-5 rounded-[24px] ${cardBg} transition-all hover:shadow-md`}
                    style={{ boxShadow: 'var(--shadow-card-flat)' }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10"
                         style={{ boxShadow: 'var(--shadow-badge)' }}>
                      <VerdictIcon iconName={display.iconName} className={`w-4 h-4 ${iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-[450] tracking-[-0.009em] truncate text-[#17191c] dark:text-[#e8e9eb]">
                        {check.raw_input.substring(0, 100)}{check.raw_input.length > 100 && '…'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[13px] font-[500] tracking-[-0.009em] ${iconColor}`}>{display.label}</span>
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
        )}
      </div>
    </div>
  );
}
