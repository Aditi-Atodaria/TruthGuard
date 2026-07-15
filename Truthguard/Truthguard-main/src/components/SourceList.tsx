'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { Source } from '@/types';

interface SourceListProps { sources: Source[]; }
type Tab = 'all' | 'supporting' | 'contradicting';

export default function SourceList({ sources }: SourceListProps) {
  const [tab, setTab]               = useState<Tab>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const supportingSources    = sources.filter((s) => s.supports_claim);
  const contradictingSources = sources.filter((s) => !s.supports_claim);
  const displayed            = tab === 'all' ? sources : tab === 'supporting' ? supportingSources : contradictingSources;
  const visibleSources       = isExpanded ? displayed : displayed.slice(0, 3);

  const getFavicon = (url: string) => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
    catch { return null; }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all',           label: 'All',           count: sources.length },
    { key: 'supporting',    label: 'Supporting',    count: supportingSources.length },
    { key: 'contradicting', label: 'Contradicting', count: contradictingSources.length },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-fit bg-[#f7f7f8] dark:bg-[#222429]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setIsExpanded(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-[450] tracking-[-0.009em] transition-all ${
              tab === t.key
                ? 'shadow-sm bg-white dark:bg-[#1e2025] text-[#17191c] dark:text-[#e8e9eb]'
                : 'text-[#777b86] dark:text-[#8a8e99] hover:text-[#17191c] dark:hover:text-[#e8e9eb]'
            }`}
          >
            {t.label}
            <span className={`text-[11px] font-[500] px-1.5 py-0.5 rounded-full ${
              tab === t.key
                ? 'bg-[#f7f7f8] dark:bg-[#222429] text-[#17191c] dark:text-[#e8e9eb]'
                : 'text-[#a3a6af] dark:text-[#52565e]'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Source cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleSources.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-8 text-[14px] tracking-[-0.009em] text-[#a3a6af] dark:text-[#52565e]">
              No {tab} sources found
            </motion.div>
          ) : visibleSources.map((source, index) => {
            const favicon       = getFavicon(source.url);
            const isSupporting  = source.supports_claim;
            const cardBg        = isSupporting ? 'bg-[#d3e3fc] dark:bg-[#152033]' : 'bg-[#fbe1d1] dark:bg-[#2e1f17]';
            const mainColor     = isSupporting ? 'text-[#17191c] dark:text-[#e8e9eb]' : 'text-[#5d2a1a] dark:text-[#c47a5a]';
            const badgeBg       = 'bg-white/50 dark:bg-white/10';

            return (
              <motion.div
                key={source.url + index}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl p-4 ${cardBg}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${mainColor}`}>
                    {isSupporting ? <ThumbsUp className="h-3.5 w-3.5" /> : <ThumbsDown className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {favicon && (
                        <img src={favicon} alt="" className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      <span className="text-[12px] font-[500] tracking-[-0.009em] truncate max-w-[120px] text-[#777b86] dark:text-[#8a8e99]">
                        {source.publisher}
                      </span>
                      <span className={`text-[11px] font-[500] px-2 py-0.5 rounded-full tracking-[-0.009em] ${badgeBg} ${mainColor}`}>
                        {source.credibility_score}/100
                      </span>
                    </div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer"
                      className={`text-[14px] font-[450] tracking-[-0.009em] hover:underline line-clamp-2 leading-snug flex items-start gap-1 ${mainColor}`}>
                      {source.title}
                      <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5 opacity-50" />
                    </a>
                    {source.snippet && (
                      <p className="mt-1.5 text-[13px] line-clamp-2 leading-relaxed tracking-[-0.009em] text-[#4c4c4c] dark:text-[#b0b3bb]">
                        {source.snippet}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Expand / collapse */}
      {displayed.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[13px] font-[450] tracking-[-0.009em] transition-colors mx-auto text-[#777b86] dark:text-[#8a8e99] hover:text-[#17191c] dark:hover:text-[#e8e9eb]"
        >
          {isExpanded
            ? <><ChevronUp className="h-3.5 w-3.5" />Show less</>
            : <><ChevronDown className="h-3.5 w-3.5" />Show {displayed.length - 3} more</>}
        </button>
      )}
    </div>
  );
}
