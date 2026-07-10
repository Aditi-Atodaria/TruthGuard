'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, Globe, Shield, Lock, UploadCloud, CheckCircle2, FileSearch } from 'lucide-react';
import InputForm from '@/components/InputForm';
import LoadingOverlay from '@/components/LoadingOverlay';
import RecentChecks from '@/components/RecentChecks';
import type { VerifyResponse } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading]     = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError]             = useState<string | null>(null);

  const handleResult = (result: VerifyResponse) => {
    sessionStorage.setItem(`result-${result.id}`, JSON.stringify(result));
    router.push(`/result/${result.id}`);
  };

  const features = [
    { icon: Zap,    title: 'Real-Time',    description: 'Claims verified against live sources in seconds' },
    { icon: Globe,  title: 'Multi-Source', description: 'Reuters, AP, BBC, Snopes & 100+ fact-checkers' },
    { icon: Shield, title: 'AI Accuracy',  description: 'Structured reasoning across dozens of evidence points' },
    { icon: Lock,   title: 'Private',      description: 'Anonymous checks. No tracking, no data selling.' },
  ];

  const steps = [
    { num: '01', icon: UploadCloud,  title: 'Submit',  desc: 'Paste a URL, text, or upload a screenshot of any claim',
      bg: 'bg-[#fbe1d1] dark:bg-[#2e1f17]', iconBg: 'bg-white/60 dark:bg-white/10', iconColor: 'text-[#5d2a1a] dark:text-[#c47a5a]' },
    { num: '02', icon: FileSearch,   title: 'Analyze', desc: 'AI extracts claims, searches live sources, cross-references evidence',
      bg: 'bg-[#d3e3fc] dark:bg-[#152033]', iconBg: 'bg-white/60 dark:bg-white/10', iconColor: 'text-[#17191c] dark:text-[#e8e9eb]' },
    { num: '03', icon: CheckCircle2, title: 'Verdict', desc: 'Get a credibility report with sources, confidence score & shareable link',
      bg: 'bg-[#f7f7f8] dark:bg-[#1e2025]', iconBg: 'bg-white dark:bg-white/10',    iconColor: 'text-[#777b86] dark:text-[#8a8e99]' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-page)' }}>

      {/* ── Hero ── */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[560px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(251,225,209,0.45) 0%, transparent 68%)' }}
        />
        {/* Subtle dark-mode glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[560px] pointer-events-none opacity-0 dark:opacity-100"
          style={{ background: 'radial-gradient(ellipse at top, rgba(196,122,90,0.12) 0%, transparent 68%)' }}
        />

        <div className="relative max-w-[1200px] mx-auto">
          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[14px] font-[450] tracking-[-0.009em]
                             border border-[#a3a6af]/40 dark:border-[#3a3d42]/80
                             bg-white/80 dark:bg-[#1e2025]/80
                             text-[#777b86] dark:text-[#8a8e99]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5d2a1a] dark:bg-[#c47a5a] flex-shrink-0" />
              AI-Powered Fact Checking
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="font-display text-center text-[44px] md:text-[64px] leading-[1.1] tracking-[-1.6px] mb-5 max-w-3xl mx-auto
                       text-[#17191c] dark:text-[#e8e9eb]"
          >
            Know what&apos;s real
            <br />before you share.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="text-center text-[18px] max-w-lg mx-auto mb-10 leading-[1.4] tracking-[-0.16px]
                       text-[#4c4c4c] dark:text-[#b0b3bb]"
          >
            Paste any news article, social media post, or claim.
            Our AI verifies it against real sources in seconds.
          </motion.p>

          {/* Input card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <AnimatePresence mode="wait">
              {isLoading
                ? <LoadingOverlay isLoading={isLoading} currentStep={currentStep} />
                : <InputForm onResult={handleResult} onLoading={setIsLoading} onStep={setCurrentStep} onError={setError} />
              }
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-4 rounded-2xl p-4 text-[14px] tracking-[-0.009em]
                             border border-[#a3a6af]/30 dark:border-[#3a3d42]/60
                             bg-[#f7f7f8] dark:bg-[#1e2025]
                             text-[#4c4c4c] dark:text-[#b0b3bb]"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="px-6 py-16 bg-[#f7f7f8] dark:bg-[#1a1c1f]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.07 }}
                  className="rounded-[24px] p-6 bg-white dark:bg-[#1e2025]"
                  style={{ boxShadow: 'var(--shadow-card-sm)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4
                                  bg-[#fbe1d1] dark:bg-[#2e1f17]">
                    <Icon className="h-[18px] w-[18px] text-[#5d2a1a] dark:text-[#c47a5a]" />
                  </div>
                  <h3 className="text-[15px] font-[500] mb-1.5 tracking-[-0.009em]
                                 text-[#17191c] dark:text-[#e8e9eb]">{feature.title}</h3>
                  <p className="text-[14px] leading-[1.5] tracking-[-0.009em]
                                text-[#777b86] dark:text-[#8a8e99]">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-20" style={{ backgroundColor: 'var(--surface-page)' }}>
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
            <h2 className="font-display text-[44px] leading-[1.1] tracking-[-0.66px] mb-3
                           text-[#17191c] dark:text-[#e8e9eb]">
              How it works
            </h2>
            <p className="text-[18px] leading-[1.35] tracking-[-0.16px] text-[#4c4c4c] dark:text-[#b0b3bb]">
              Three steps from claim to verdict.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                  className={`${item.bg} rounded-[24px] p-6 md:p-8`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[13px] font-[500] tracking-[0.06em] text-[#a3a6af] dark:text-[#52565e]">{item.num}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconBg}`}
                         style={{ boxShadow: 'var(--shadow-badge)' }}>
                      <Icon className={`h-[18px] w-[18px] ${item.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="font-display text-[26px] leading-[1.18] tracking-[-0.23px] mb-3
                                 text-[#17191c] dark:text-[#e8e9eb]">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed tracking-[-0.009em]
                                text-[#4c4c4c] dark:text-[#b0b3bb]">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Recent Checks ── */}
      <section className="px-6 py-20 bg-[#f7f7f8] dark:bg-[#1a1c1f]">
        <div className="max-w-[1200px] mx-auto">
          <RecentChecks />
        </div>
      </section>
    </div>
  );
}
