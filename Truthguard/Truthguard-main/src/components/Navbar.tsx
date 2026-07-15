'use client';

import Link from 'next/link';
import { History, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkCls = "text-[15px] font-[450] tracking-[-0.009em] transition-colors duration-150 " +
    "text-[#17191c] hover:text-[#4c4c4c] dark:text-[#e8e9eb] dark:hover:text-[#b0b3bb]";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#a3a6af]/20 dark:border-[#3a3d42]/60"
      style={{ backgroundColor: 'var(--surface-nav)' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[15px] font-[500] tracking-[-0.009em] text-[#17191c] dark:text-[#e8e9eb]">
              TruthGuard
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={`${linkCls} px-3 py-1.5 rounded-full`}>
              Verify
            </Link>
            <Link href="/dashboard" className={`${linkCls} px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
              <History className="h-3.5 w-3.5" />
              History
            </Link>
          </div>

          {/* Desktop right: theme toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#17191c] dark:text-[#e8e9eb] p-1 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#a3a6af]/20 dark:border-[#3a3d42]/60 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block text-[15px] text-[#17191c] dark:text-[#e8e9eb] px-3 py-2 rounded-xl font-[450] tracking-[-0.009em]
                         hover:bg-[#f7f7f8] dark:hover:bg-[#1e2025] transition-colors"
            >
              Verify Claims
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-[15px] text-[#17191c] dark:text-[#e8e9eb] px-3 py-2 rounded-xl font-[450] tracking-[-0.009em]
                         hover:bg-[#f7f7f8] dark:hover:bg-[#1e2025] transition-colors"
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
