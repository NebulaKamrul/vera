import { useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, Mail, FileText, Copy, Download } from 'lucide-react';
import type { OptimizationResult, StyleOptions } from '../types';
import { parseResume, type ParsedResume } from '../lib/parseResume';
import ResumeEditor from './ResumeEditor';
import ResumePreview from './ResumePreview';
import StylePanel from './StylePanel';

type Tab = 'resume' | 'keywords' | 'cover';

const resultTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'resume',   label: 'tailored resume', icon: <FileText size={13} /> },
  { id: 'keywords', label: 'keywords',         icon: <CheckCircle2 size={13} /> },
  { id: 'cover',    label: 'cover letter',     icon: <Mail size={13} /> },
];

function downloadTxt(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResultsStep({ result }: { result: OptimizationResult }) {
  const [tab, setTab] = useState<Tab>('resume');
  const [resume, setResume] = useState<ParsedResume>(() => parseResume(result.tailoredResume));
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    template: 'classic',
    accentColor: '#111111',
    font: 'serif',
  });
  const [coverCopied, setCoverCopied] = useState(false);

  function handleCoverCopy() {
    navigator.clipboard.writeText(result.coverLetter).then(() => {
      setCoverCopied(true);
      setTimeout(() => setCoverCopied(false), 2000);
    });
  }

  return (
    <div className="animate-fade-in">

      {/* ── Header + tabs ── */}
      <div className="max-w-4xl mx-auto px-8 pt-14 pb-0">
        <div className="mb-8">
          <h1 className="font-serif text-5xl sm:text-6xl text-charcoal tracking-tight leading-tight mb-3">
            results.
          </h1>
          <p className="text-stone font-light text-lg">
            your resume, tailored. edit anything before you download.
          </p>
        </div>
        <div className="flex gap-1 border-b border-border">
          {resultTabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 -mb-px transition-all ${
                tab === t.id
                  ? 'border-espresso text-charcoal font-medium'
                  : 'border-transparent text-stone hover:text-charcoal'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Resume tab ── */}
      {tab === 'resume' && (
        <div className="px-6 py-8">
          <div className="max-w-[1400px] mx-auto">
            <StylePanel options={styleOptions} onChange={setStyleOptions} />
            <div className="flex gap-6 items-start">
              {/* Left: editor */}
              <div className="w-[42%] min-w-0">
                <ResumeEditor
                  resume={resume}
                  suggestions={result.suggestions}
                  styleOptions={styleOptions}
                  onChange={setResume}
                />
              </div>
              {/* Right: live preview */}
              <div className="w-[58%] min-w-0 sticky top-6">
                <p className="text-[10px] text-stone/40 uppercase tracking-widest mb-2 text-center">
                  live preview
                </p>
                <ResumePreview resume={resume} styleOptions={styleOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Keywords tab ── */}
      {tab === 'keywords' && (
        <div className="max-w-4xl mx-auto px-8 py-8 flex flex-col gap-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={16} className="text-keyword-match-text" />
              <p className="text-xs font-medium text-stone uppercase tracking-widest">already in your resume</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.map(kw => (
                <span key={kw} className="text-xs px-3 py-1.5 rounded-full bg-keyword-match text-keyword-match-text font-medium">{kw}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={16} className="text-keyword-miss-text" />
              <p className="text-xs font-medium text-stone uppercase tracking-widest">missing — add if true</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map(kw => (
                <span key={kw} className="text-xs px-3 py-1.5 rounded-full bg-keyword-miss text-keyword-miss-text font-medium">{kw}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-espresso" />
              <p className="text-xs font-medium text-stone uppercase tracking-widest">suggestions</p>
            </div>
            <div className="flex flex-col gap-3">
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex gap-3 text-sm text-charcoal font-light leading-relaxed">
                  <span className="text-espresso shrink-0 mt-0.5">·</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Cover letter tab ── */}
      {tab === 'cover' && (
        <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
          <div className="bg-white border border-border rounded-2xl shadow-card px-8 py-7">
            <pre className="text-sm text-charcoal font-light leading-relaxed whitespace-pre-wrap font-sans">
              {result.coverLetter}
            </pre>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleCoverCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
            >
              <Copy size={11} />
              {coverCopied ? 'copied ✓' : 'copy'}
            </button>
            <button
              type="button"
              onClick={() => downloadTxt(result.coverLetter, 'cover-letter.txt')}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
            >
              <Download size={11} />
              download .txt
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
