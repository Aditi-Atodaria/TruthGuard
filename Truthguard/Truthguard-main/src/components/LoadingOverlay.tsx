'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Brain, CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  currentStep: string;
}

const steps = [
  { key: 'Extracting claims...',  icon: FileText,      label: 'Extracting Claims' },
  { key: 'Searching sources...',  icon: Search,        label: 'Searching Sources' },
  { key: 'Analyzing evidence...', icon: Brain,         label: 'Analyzing Evidence' },
  { key: 'Generating verdict...',  icon: CheckCircle2, label: 'Generating Verdict' },
];

export default function LoadingOverlay({ isLoading, currentStep }: LoadingOverlayProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          className="w-full"
        >
          <div className="rounded-[24px] p-8 bg-white dark:bg-[#1e2025]" style={{ boxShadow: 'var(--shadow-card)' }}>

            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#f7f7f8] dark:bg-[#222429]">
                <Loader2 className="h-5 w-5 animate-spin text-[#17191c] dark:text-[#e8e9eb]" />
              </div>
            </div>

            <div className="space-y-1">
              {steps.map((step, index) => {
                const Icon        = step.icon;
                const isActive    = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                  <motion.div
                    key={step.key}
                    animate={{ opacity: isActive ? 1 : isCompleted ? 0.55 : 0.25 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                      isActive ? 'bg-[#f7f7f8] dark:bg-[#222429]' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 ${
                      isCompleted ? 'text-[#5d2a1a] dark:text-[#c47a5a]'
                      : isActive  ? 'text-[#17191c] dark:text-[#e8e9eb]'
                                  : 'text-[#a3a6af] dark:text-[#52565e]'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[14px] tracking-[-0.009em] ${
                      isActive
                        ? 'text-[#17191c] dark:text-[#e8e9eb] font-[500]'
                        : isCompleted
                        ? 'text-[#4c4c4c] dark:text-[#b0b3bb] font-[450]'
                        : 'text-[#a3a6af] dark:text-[#52565e] font-[450]'
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-[13px] tracking-[-0.009em] mt-6 text-[#a3a6af] dark:text-[#52565e]"
            >
              This may take 10–30 seconds
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
