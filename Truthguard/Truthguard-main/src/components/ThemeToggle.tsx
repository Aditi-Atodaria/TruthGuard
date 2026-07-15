'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        relative w-9 h-9 rounded-full flex items-center justify-center
        border border-[#a3a6af]/40 dark:border-[#3a3d42]/70
        bg-white dark:bg-[#1e2025]
        text-[#777b86] dark:text-[#9ba0ab]
        hover:text-[#17191c] dark:hover:text-[#e8e9eb]
        hover:border-[#17191c]/40 dark:hover:border-[#9ba0ab]/50
        transition-all duration-200
      "
    >
      {theme === 'dark' ? (
        <Sun className="h-[15px] w-[15px]" />
      ) : (
        <Moon className="h-[15px] w-[15px]" />
      )}
    </button>
  );
}
