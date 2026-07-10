'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Type, Loader2, Upload, ArrowRight, Search } from 'lucide-react';
import type { InputType, VerifyResponse } from '@/types';

interface InputFormProps {
  onResult: (result: VerifyResponse) => void;
  onLoading: (loading: boolean) => void;
  onStep: (step: string) => void;
  onError: (error: string | null) => void;
}

export default function InputForm({ onResult, onLoading, onStep, onError }: InputFormProps) {
  const [urlInput, setUrlInput]   = useState('');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('text');

  const handleSubmit = async (input: string, type: InputType) => {
    if (!input.trim()) return;
    setIsLoading(true); onLoading(true); onError(null);
    try {
      onStep('Extracting claims...');
      await new Promise((r) => setTimeout(r, 800));
      onStep('Searching sources...');
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, type }),
      });
      onStep('Analyzing evidence...');
      await new Promise((r) => setTimeout(r, 500));
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }
      const result: VerifyResponse = await response.json();
      onStep('Generating verdict...');
      await new Promise((r) => setTimeout(r, 400));
      onResult(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false); onLoading(false); onStep('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true); onLoading(true); onError(null); onStep('Reading screenshot...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        onStep('Extracting text from image...');
        const ocrResponse = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
        if (!ocrResponse.ok) throw new Error('Failed to extract text from image');
        const { text } = await ocrResponse.json();
        if (!text || text.trim().length < 10)
          throw new Error('Could not read any text from the screenshot. Try a clearer image.');
        onStep('Verifying extracted text...');
        await handleSubmit(text, 'text');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process image');
      setIsLoading(false); onLoading(false); onStep('');
    }
  };

  // Shared class fragments
  const cardCls = "rounded-[24px] p-6 md:p-8 bg-white dark:bg-[#1e2025]";
  const inputCls = "w-full rounded-[16px] text-[16px] tracking-[-0.009em] focus:outline-none transition-colors " +
    "border border-[#a3a6af]/40 dark:border-[#3a3d42]/70 " +
    "bg-[#f7f7f8] dark:bg-[#222429] " +
    "text-[#17191c] dark:text-[#e8e9eb] " +
    "placeholder:text-[#a3a6af] dark:placeholder:text-[#52565e] " +
    "focus:border-[#17191c] dark:focus:border-[#8a8e99]";
  const ctaBtnCls = "w-full h-12 rounded-full text-[15px] font-[450] tracking-[-0.009em] flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
    "bg-[#17191c] dark:bg-[#e8e9eb] text-white dark:text-[#141618] hover:bg-[#2c2f34] dark:hover:bg-[#d0d2d6]";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
      <div className={cardCls} style={{ boxShadow: 'var(--shadow-card)' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full gap-1 rounded-2xl p-1 mb-6 h-auto bg-[#f7f7f8] dark:bg-[#222429]">
            {[
              { value: 'text',       icon: Type,   labelFull: 'Paste Text',  labelShort: 'Text' },
              { value: 'url',        icon: Link,   labelFull: 'Paste URL',   labelShort: 'URL' },
              { value: 'screenshot', icon: Upload, labelFull: 'Screenshot',  labelShort: 'Image' },
            ].map(({ value, icon: Icon, labelFull, labelShort }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-[14px] tracking-[-0.009em] font-[450] rounded-xl transition-all
                           data-[state=active]:bg-white dark:data-[state=active]:bg-[#1e2025]
                           data-[state=active]:text-[#17191c] dark:data-[state=active]:text-[#e8e9eb]
                           data-[state=active]:shadow-sm
                           text-[#777b86] dark:text-[#8a8e99]"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{labelFull}</span>
                <span className="sm:hidden">{labelShort}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Text tab */}
          <TabsContent value="text" className="space-y-4">
            <div>
              <label className="block text-[14px] font-[450] tracking-[-0.009em] mb-2 text-[#777b86] dark:text-[#8a8e99]">
                Paste a claim, WhatsApp forward, or any text
              </label>
              <textarea
                placeholder="e.g., 'Scientists discover that drinking coffee doubles your lifespan'"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                disabled={isLoading}
                className={`${inputCls} px-4 py-3 resize-none`}
              />
            </div>
            <button onClick={() => handleSubmit(textInput, 'text')} disabled={isLoading || !textInput.trim()} className={ctaBtnCls}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</> : <><Search className="h-4 w-4" />Check Now<ArrowRight className="h-4 w-4 ml-auto" /></>}
            </button>
          </TabsContent>

          {/* URL tab */}
          <TabsContent value="url" className="space-y-4">
            <div>
              <label className="block text-[14px] font-[450] tracking-[-0.009em] mb-2 text-[#777b86] dark:text-[#8a8e99]">
                Paste a news article or social media URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/article..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isLoading}
                className={`${inputCls} h-12 px-4`}
              />
            </div>
            <button onClick={() => handleSubmit(urlInput, 'url')} disabled={isLoading || !urlInput.trim()} className={ctaBtnCls}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</> : <><Search className="h-4 w-4" />Check Now<ArrowRight className="h-4 w-4 ml-auto" /></>}
            </button>
          </TabsContent>

          {/* Screenshot tab */}
          <TabsContent value="screenshot" className="space-y-4">
            <div>
              <label className="block text-[14px] font-[450] tracking-[-0.009em] mb-2 text-[#777b86] dark:text-[#8a8e99]">
                Upload a screenshot of the claim
              </label>
              <input type="file" id="screenshot-input" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isLoading} />
              <label
                htmlFor="screenshot-input"
                className="flex flex-col items-center justify-center w-full h-32 rounded-[16px] cursor-pointer transition-colors
                           border-2 border-dashed border-[#a3a6af]/40 dark:border-[#3a3d42]/70
                           bg-[#f7f7f8] dark:bg-[#222429]
                           hover:border-[#17191c] dark:hover:border-[#8a8e99]"
              >
                <Upload className="h-6 w-6 mb-2 text-[#a3a6af] dark:text-[#52565e]" />
                <span className="text-[14px] tracking-[-0.009em] text-[#777b86] dark:text-[#8a8e99]">Click to upload or drag and drop</span>
                <span className="text-[13px] mt-1 tracking-[-0.009em] text-[#a3a6af] dark:text-[#52565e]">PNG, JPG, WebP up to 10MB</span>
              </label>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
