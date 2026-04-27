import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { parseFile } from '../lib/parseFile';

interface Props {
  resumeText: string;
  jobDescription: string;
  isLoading: boolean;
  error: string | null;
  onResumeChange: (val: string) => void;
  onJobChange: (val: string) => void;
  onSubmit: () => void;
}

export default function InputPanel({
  resumeText,
  jobDescription,
  isLoading,
  error,
  onResumeChange,
  onJobChange,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  async function processFile(file: File) {
    setParseError(null);
    setIsParsing(true);
    try {
      const text = await parseFile(file);
      if (!text.trim()) {
        setParseError("couldn't read text from that file. try pasting directly.");
      } else {
        onResumeChange(text);
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'could not read the file.');
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
    // Only clear if leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  const canSubmit = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Resume section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-charcoal">your resume</h2>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="text-xs text-stone hover:text-espresso transition-colors underline underline-offset-2 disabled:opacity-50"
          >
            {isParsing ? 'reading…' : 'upload file'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Drop zone wrapper */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl transition-all ${
            isDragging
              ? 'ring-2 ring-espresso/40 bg-parchment'
              : ''
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-parchment/90 border-2 border-dashed border-espresso/40 pointer-events-none">
              <p className="font-serif text-lg text-espresso">drop your resume here</p>
            </div>
          )}
          <textarea
            value={resumeText}
            onChange={e => onResumeChange(e.target.value)}
            placeholder="paste your resume here, or drag and drop a PDF, DOCX, or TXT file…"
            rows={14}
            disabled={isParsing}
            className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm text-charcoal placeholder-stone/60 shadow-card focus:outline-none focus:border-espresso/40 focus:ring-2 focus:ring-espresso/10 transition-all font-light leading-relaxed disabled:opacity-60"
          />
        </div>

        {parseError && (
          <p className="text-xs text-[#8B4513]">{parseError}</p>
        )}
        <p className="text-xs text-stone/60">
          drag and drop, or upload. PDF, DOCX, and TXT supported.
        </p>
      </section>

      {/* Job description section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-xl text-charcoal">the job</h2>
        <textarea
          value={jobDescription}
          onChange={e => onJobChange(e.target.value)}
          placeholder="paste the full job description here. the more detail, the better the match…"
          rows={10}
          className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm text-charcoal placeholder-stone/60 shadow-card focus:outline-none focus:border-espresso/40 focus:ring-2 focus:ring-espresso/10 transition-all font-light leading-relaxed"
        />
      </section>

      {/* Validation / API error */}
      {error && (
        <p className="text-sm text-[#8B4513] bg-[#F5E6D8] rounded-lg px-4 py-3 border border-[#E8CDB5]">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !canSubmit}
        className="
          w-full rounded-xl px-6 py-4 text-sm font-medium tracking-wide transition-all
          bg-espresso text-cream
          hover:bg-espresso-dark active:scale-[0.99]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-espresso
          shadow-card
        "
      >
        {isLoading ? 'working…' : 'optimize my resume'}
      </button>

      {!canSubmit && !isLoading && (
        <p className="text-xs text-stone/60 text-center -mt-4">
          fill in both fields to continue
        </p>
      )}
    </div>
  );
}
