import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruthGuard — Real-Time Fact Checking",
  description:
    "Verify news articles, social media posts, and text claims against real sources. AI-powered misinformation detection with source credibility scoring.",
  keywords: ["fact check", "fake news", "misinformation", "verification", "news credibility", "truth guard"],
  openGraph: {
    title: "TruthGuard — Know What's Real Before You Share",
    description: "AI-powered real-time misinformation detection. Paste any claim and get an instant credibility verdict with sources.",
    type: "website",
    siteName: "TruthGuard",
  },
  twitter: {
    card: "summary_large_image",
    title: "TruthGuard — Real-Time Fact Checking",
    description: "Verify news articles, social media posts, and text claims against real sources.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistMono.variable} antialiased min-h-screen`}
        style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-primary)' }}
      >
        <ThemeProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
