import { useState } from 'react';
import type { OptimizationResult } from '../types';
import ResumeEditor from './ResumeEditor';

// ─── Shared copy + download utilities ─────────────────────────────────────

function useCopyButton() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  return { copiedKey, copy };
}

function downloadTxt(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Small reusable pieces ─────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="font-serif text-xl text-charcoal mb-4">{children}</h3>
  );
}

function ActionBar({
  onCopy,
  copied,
  onDownload,
}: {
  onCopy: () => void;
  copied: boolean;
  onDownload?: () => void;
}) {
  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
      <button
        type="button"
        onClick={onCopy}
        className="text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
      >
        {copied ? 'copied ✓' : 'copy'}
      </button>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          className="text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
        >
          download .txt
        </button>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6 animate-fade-in">
      {children}
    </div>
  );
}

// ─── Result sections ───────────────────────────────────────────────────────

function KeywordMatch({ matched, missing }: {
  matched: string[];
  missing: string[];
}) {
  return (
    <Card>
      <SectionTitle>keyword match</SectionTitle>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-medium text-stone uppercase tracking-widest mb-2.5">
            present in your resume
          </p>
          <div className="flex flex-wrap gap-2">
            {matched.map(kw => (
              <span
                key={kw}
                className="text-xs px-2.5 py-1 rounded-full bg-keyword-match text-keyword-match-text font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-stone uppercase tracking-widest mb-2.5">
            missing... worth adding if true
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map(kw => (
              <span
                key={kw}
                className="text-xs px-2.5 py-1 rounded-full bg-keyword-miss text-keyword-miss-text font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}


function CoverLetter({ text, copyKey, copiedKey, copy }: {
  text: string;
  copyKey: string;
  copiedKey: string | null;
  copy: (text: string, key: string) => void;
}) {
  return (
    <Card>
      <SectionTitle>cover letter</SectionTitle>
      <pre className="text-sm text-charcoal font-light leading-relaxed whitespace-pre-wrap font-sans">
        {text}
      </pre>
      <ActionBar
        onCopy={() => copy(text, copyKey)}
        copied={copiedKey === copyKey}
        onDownload={() => downloadTxt(text, 'cover-letter.txt')}
      />
    </Card>
  );
}

// ─── Loading state ─────────────────────────────────────────────────────────

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-4">
      <p className="font-serif text-2xl text-charcoal tracking-wide">
        {message}
        <span className="animate-blink">|</span>
      </p>
      <p className="text-xs text-stone">this usually takes a few seconds</p>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-3 opacity-60">
      <p className="font-serif text-2xl text-charcoal">your results will appear here</p>
      <p className="text-sm text-stone text-center max-w-xs leading-relaxed">
        paste your resume and the job description on the left, then click
        &ldquo;optimize my resume&rdquo;
      </p>
    </div>
  );
}

// ─── Main output panel ─────────────────────────────────────────────────────

interface Props {
  result: OptimizationResult | null;
  isLoading: boolean;
  loadingMessage: string;
}

export default function OutputPanel({ result, isLoading, loadingMessage }: Props) {
  const { copiedKey, copy } = useCopyButton();

  if (isLoading) return <LoadingState message={loadingMessage} />;
  if (!result) return <EmptyState />;

  return (
    <div className="flex flex-col gap-6">
      <ResumeEditor
        rawText={result.tailoredResume}
        suggestions={result.suggestions}
      />
      <KeywordMatch
        matched={result.matchedKeywords}
        missing={result.missingKeywords}
      />
      <CoverLetter
        text={result.coverLetter}
        copyKey="cover"
        copiedKey={copiedKey}
        copy={copy}
      />
    </div>
  );
}
