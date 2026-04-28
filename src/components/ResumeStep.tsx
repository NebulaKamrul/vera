import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, ArrowRight } from 'lucide-react';
import { parseFile } from '../lib/parseFile';

interface Props {
  resumeText: string;
  onChange: (val: string) => void;
  onContinue: () => void;
}

export default function ResumeStep({ resumeText, onChange, onContinue }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  async function processFile(file: File) {
    setParseError(null);
    setIsParsing(true);
    try {
      const text = await parseFile(file);
      if (!text.trim()) {
        setParseError("Couldn't read text from that file. Try pasting directly.");
      } else {
        onChange(text);
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not read the file.');
    } finally {
      setIsParsing(false);
    }
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-14 animate-fade-in">
      {/* Headline */}
      <div className="mb-10">
        <h1 className="font-serif text-5xl sm:text-6xl text-charcoal tracking-tight leading-tight mb-3">
          your resume.
        </h1>
        <p className="text-stone font-light text-lg">
          paste it below, or drop a file: PDF, DOCX, and TXT all work.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl transition-all ${isDragging ? 'ring-2 ring-espresso/40' : ''}`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-parchment/95 border-2 border-dashed border-espresso/50 pointer-events-none">
            <p className="font-serif italic text-xl text-espresso">drop it here</p>
          </div>
        )}
        <textarea
          value={resumeText}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste your resume here — work history, skills, education…"
          rows={16}
          disabled={isParsing}
          className="w-full rounded-2xl border border-border bg-white px-6 py-5 text-sm text-charcoal placeholder-stone/50 shadow-card focus:outline-none focus:border-espresso/40 focus:ring-2 focus:ring-espresso/10 transition-all font-light leading-relaxed disabled:opacity-60 resize-none"
        />
      </div>

      {/* File upload + error */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="flex items-center gap-1.5 text-xs text-stone hover:text-espresso transition-colors disabled:opacity-50"
          >
            <Upload size={12} />
            {isParsing ? 'reading file…' : 'upload file'}
          </button>
          <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleFileInput} />
          {parseError && <p className="text-xs text-[#8B4513]">{parseError}</p>}
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={onContinue}
          disabled={!resumeText.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-espresso text-cream text-sm font-medium hover:bg-espresso-dark active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-card"
        >
          continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
