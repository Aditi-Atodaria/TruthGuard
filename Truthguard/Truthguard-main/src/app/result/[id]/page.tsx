'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Newspaper, Search, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import VerdictCard from '@/components/VerdictCard';
import SourceList from '@/components/SourceList';
import ShareCard from '@/components/ShareCard';
import type { VerifyResponse, ExtractedClaim } from '@/types';

export default function ResultPage() {
  const params = useParams();
  const id     = params.id as string;
  const [result, setResult]   = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem(`result-${id}`);
    if (cached) { setResult(JSON.parse(cached)); setLoading(false); return; }
    async function fetchResult() {
      try {
        const res  = await fetch(`/api/history?limit=20&offset=0`);
        const data = await res.json();
        const check = data.checks?.find((c: VerifyResponse) => c.id === id);
        if (check) setResult(check);
      } catch { /* empty */ } finally { setLoading(false); }
    }
    fetchResult();
  }, [id]);

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen px-6 pt-24 pb-16" style={{ backgroundColor: 'var(--surface-section)' }}>
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="h-5 w-28 rounded-full animate-pulse bg-[#a3a6af]/20 dark:bg-[#3a3d42]/40" />
          <div className="h-14 w-64 rounded-2xl animate-pulse bg-[#a3a6af]/15 dark:bg-[#3a3d42]/30" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              {[72, 48].map((h) => (
                <div key={h} className={`h-${h} rounded-[24px] animate-pulse bg-white dark:bg-[#1e2025]`}
                     style={{ boxShadow: 'var(--shadow-card-flat)', height: `${h * 4}px` }} />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-4">
              {[64, 32].map((h) => (
                <div key={h} className="rounded-[24px] animate-pulse bg-white dark:bg-[#1e2025]"
                     style={{ boxShadow: 'var(--shadow-card-flat)', height: `${h * 4}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--surface-section)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center
                          bg-white dark:bg-[#1e2025]"
               style={{ boxShadow: 'var(--shadow-card-flat)' }}>
            <HelpCircle className="h-8 w-8 text-[#a3a6af] dark:text-[#52565e]" />
          </div>
          <h1 className="font-display text-[44px] leading-[1.1] tracking-[-0.66px] mb-3
                         text-[#17191c] dark:text-[#e8e9eb]">
            Result Not Found
          </h1>
          <p className="text-[16px] tracking-[-0.009em] mb-8 text-[#777b86] dark:text-[#8a8e99]">
            This verification result may have expired or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[15px] font-[450] tracking-[-0.009em] transition-colors
                       bg-[#17191c] dark:bg-[#e8e9eb] text-white dark:text-[#141618]
                       hover:bg-[#2c2f34] dark:hover:bg-[#d0d2d6]"
          >
            Check Another Claim
          </Link>
        </div>
      </div>
    );
  }

  const rawInput = (result as VerifyResponse & { raw_input?: string }).raw_input;

  return (
    <div className="min-h-screen px-6 pt-24 pb-16" style={{ backgroundColor: 'var(--surface-section)' }}>
      <div className="max-w-[1200px] mx-auto">

        {/* ── Back ── */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-[450] tracking-[-0.009em] transition-colors
                       text-[#777b86] dark:text-[#8a8e99] hover:text-[#17191c] dark:hover:text-[#e8e9eb]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* ── Claim banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-[24px] p-5 flex items-start gap-4
                     bg-white dark:bg-[#1e2025]"
          style={{ boxShadow: 'var(--shadow-card-flat)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                          bg-[#f7f7f8] dark:bg-[#222429]">
            <FileText className="h-4 w-4 text-[#777b86] dark:text-[#8a8e99]" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-[500] tracking-[0.06em] uppercase mb-1.5
                          text-[#a3a6af] dark:text-[#52565e]">
              Verified Claim
            </p>
            <p className="text-[15px] leading-relaxed tracking-[-0.009em] line-clamp-3
                          text-[#17191c] dark:text-[#e8e9eb]">
              {rawInput || result.extracted_claims?.[0]?.claim || 'Original claim text'}
            </p>
          </div>
        </motion.div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-3 space-y-5">
            <VerdictCard verdict={result.verdict} confidence={result.confidence_score} summary={result.summary} />

            {/* Extracted Claims */}
            {result.extracted_claims && result.extracted_claims.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-[24px] p-6 bg-white dark:bg-[#1e2025]"
                style={{ boxShadow: 'var(--shadow-card-sm)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Search className="h-4 w-4 text-[#777b86] dark:text-[#8a8e99]" />
                  <h2 className="text-[15px] font-[500] tracking-[-0.009em] text-[#17191c] dark:text-[#e8e9eb]">
                    Extracted Claims
                  </h2>
                  <span className="ml-auto text-[13px] tracking-[-0.009em] text-[#a3a6af] dark:text-[#52565e]">
                    {result.extracted_claims.length} found
                  </span>
                </div>
                <div className="space-y-2">
                  {result.extracted_claims.map((claim: ExtractedClaim, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-2xl
                                                bg-[#f7f7f8] dark:bg-[#222429]">
                      <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full font-[500] flex-shrink-0 mt-0.5 uppercase tracking-wider ${
                        claim.importance === 'high'
                          ? 'bg-[#fbe1d1] dark:bg-[#2e1f17] text-[#5d2a1a] dark:text-[#c47a5a]'
                          : claim.importance === 'medium'
                          ? 'bg-[#d3e3fc] dark:bg-[#152033] text-[#17191c] dark:text-[#e8e9eb]'
                          : 'bg-white dark:bg-[#1e2025] text-[#777b86] dark:text-[#8a8e99] border border-[#a3a6af]/30 dark:border-[#3a3d42]/60'
                      }`}>
                        {claim.importance}
                      </span>
                      <p className="text-[14px] leading-relaxed tracking-[-0.009em]
                                    text-[#17191c] dark:text-[#e8e9eb]">
                        {claim.claim}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <ShareCard
              verdict={result.verdict}
              confidence={result.confidence_score}
              summary={result.summary}
              checkId={id}
            />
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-5">
            {result.sources && result.sources.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-[24px] p-6 bg-white dark:bg-[#1e2025]"
                style={{ boxShadow: 'var(--shadow-card-sm)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Newspaper className="h-4 w-4 text-[#777b86] dark:text-[#8a8e99]" />
                  <h2 className="text-[15px] font-[500] tracking-[-0.009em] text-[#17191c] dark:text-[#e8e9eb]">
                    Evidence & Sources
                  </h2>
                </div>
                <SourceList sources={result.sources} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="rounded-[24px] p-10 text-center bg-white dark:bg-[#1e2025]"
                style={{ boxShadow: 'var(--shadow-card-flat)' }}
              >
                <Newspaper className="h-8 w-8 mx-auto mb-3 text-[#a3a6af] dark:text-[#52565e]" />
                <p className="text-[14px] tracking-[-0.009em] text-[#777b86] dark:text-[#8a8e99]">
                  No sources were found for this claim
                </p>
              </motion.div>
            )}

            {/* CTA card */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="rounded-[24px] p-6 bg-[#fbe1d1] dark:bg-[#2e1f17]"
              style={{ boxShadow: 'var(--shadow-card-flat)' }}
            >
              <p className="text-[15px] font-[450] tracking-[-0.009em] mb-4
                            text-[#5d2a1a] dark:text-[#c47a5a]">
                Want to verify another claim?
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-full text-[15px] font-[450] tracking-[-0.009em] transition-colors
                           bg-[#17191c] dark:bg-[#e8e9eb] text-white dark:text-[#141618]
                           hover:bg-[#2c2f34] dark:hover:bg-[#d0d2d6]"
              >
                Check Another Claim
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
