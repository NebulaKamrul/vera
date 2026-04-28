import { Sparkles, ArrowLeft, FileSearch } from 'lucide-react';

interface Props {
  jobDescription: string;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onChange: (val: string) => void;
  onBack: () => void;
  onOptimize: () => void;
}

export default function JobStep({
  jobDescription,
  isLoading,
  loadingMessage,
  error,
  onChange,
  onBack,
  onOptimize,
}: Props) {
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-14 flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in">
        {/* Scanning icon */}
        <div className="relative w-20 h-24 flex items-center justify-center">
          {/* Document icon */}
          <FileSearch size={72} className="text-espresso/20" strokeWidth={1.2} />
          {/* Scan line sweeping over it */}
          <div className="absolute inset-x-1 top-1 bottom-1 overflow-hidden rounded pointer-events-none">
            <div className="animate-scan w-full h-0.5 bg-gradient-to-r from-transparent via-espresso to-transparent opacity-70" />
          </div>
        </div>

        {/* Cycling message */}
        <div className="text-center">
          <p className="font-serif text-2xl text-charcoal tracking-wide">
            {loadingMessage}<span className="animate-blink">|</span>
          </p>
          <p className="mt-2 text-sm text-stone/50">this usually takes a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-14 animate-fade-in">
      {/* Headline */}
      <div className="mb-10">
        <h1 className="font-serif text-5xl sm:text-6xl text-charcoal tracking-tight leading-tight mb-3">
          the job.
        </h1>
        <p className="text-stone font-light text-lg">
          paste the full job description. the more detail, the better the match.
        </p>
      </div>

      {/* Textarea */}
      <textarea
        value={jobDescription}
        onChange={e => onChange(e.target.value)}
        placeholder="paste the full job posting here…"
        rows={16}
        className="w-full rounded-2xl border border-border bg-white px-6 py-5 text-sm text-charcoal placeholder-stone/50 shadow-card focus:outline-none focus:border-espresso/40 focus:ring-2 focus:ring-espresso/10 transition-all font-light leading-relaxed resize-none"
      />

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-[#8B4513] bg-[#F5E6D8] rounded-xl px-4 py-3 border border-[#E8CDB5]">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-stone hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={14} />
          back
        </button>

        <button
          type="button"
          onClick={onOptimize}
          disabled={!jobDescription.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-espresso text-cream text-sm font-medium hover:bg-espresso-dark active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-card"
        >
          <Sparkles size={14} />
          optimize my resume
        </button>
      </div>
    </div>
  );
}
