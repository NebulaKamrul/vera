import { useState } from 'react';
import { parseResume, type ParsedResume, type ResumeSection } from '../lib/parseResume';

interface Props {
  rawText: string;
  suggestions: string[];
}

async function downloadAsPDF(resume: ParsedResume) {
  const { pdf } = await import('@react-pdf/renderer');
  const { ResumePDFDocument } = await import('./ResumePDF');
  const React = await import('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(React.createElement(ResumePDFDocument, { resume }) as any).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name || 'resume'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAsTxt(resume: ParsedResume) {
  const lines = [
    resume.name,
    resume.contact,
    '',
    ...resume.sections.flatMap(s => [s.title, s.content, '']),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name || 'resume'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Section card ───────────────────────────────────────────────────────────

function SectionCard({
  section,
  onChange,
  onDelete,
  onTitleChange,
}: {
  section: ResumeSection;
  onChange: (content: string) => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);

  return (
    <div className="border border-border rounded-xl bg-white shadow-card overflow-hidden animate-fade-in">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-parchment/50">
        {editingTitle ? (
          <input
            autoFocus
            value={section.title}
            onChange={e => onTitleChange(e.target.value.toUpperCase())}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
            className="text-xs font-medium tracking-widest text-stone uppercase bg-transparent border-b border-espresso/30 outline-none w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            className="text-xs font-medium tracking-widest text-stone uppercase hover:text-espresso transition-colors"
          >
            {section.title}
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="text-stone/40 hover:text-red-400 transition-colors text-xs ml-3 shrink-0"
          title="Remove section"
        >
          remove
        </button>
      </div>

      {/* Editable content */}
      <textarea
        value={section.content}
        onChange={e => onChange(e.target.value)}
        rows={Math.max(3, section.content.split('\n').length + 1)}
        className="w-full px-5 py-4 text-sm text-charcoal font-light leading-relaxed bg-transparent outline-none resize-none"
        placeholder="Add content here…"
      />
    </div>
  );
}

// ─── Main editor ────────────────────────────────────────────────────────────

export default function ResumeEditor({ rawText, suggestions }: Props) {
  const [resume, setResume] = useState<ParsedResume>(() => parseResume(rawText));
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  function updateSection(id: string, content: string) {
    setResume(r => ({ ...r, sections: r.sections.map(s => s.id === id ? { ...s, content } : s) }));
  }

  function updateSectionTitle(id: string, title: string) {
    setResume(r => ({ ...r, sections: r.sections.map(s => s.id === id ? { ...s, title } : s) }));
  }

  function deleteSection(id: string) {
    setResume(r => ({ ...r, sections: r.sections.filter(s => s.id !== id) }));
  }

  function addSection() {
    const newSection: ResumeSection = {
      id: crypto.randomUUID(),
      title: 'NEW SECTION',
      content: '',
    };
    setResume(r => ({ ...r, sections: [...r.sections, newSection] }));
  }

  function incorporateSuggestion(index: number, text: string) {
    const note = `· ${text}`;
    // Try to find an experience or relevant section to append to
    const targetId = resume.sections.find(s =>
      /experience|skills|summary/i.test(s.title)
    )?.id ?? resume.sections[resume.sections.length - 1]?.id;

    if (targetId) {
      setResume(r => ({
        ...r,
        sections: r.sections.map(s =>
          s.id === targetId
            ? { ...s, content: s.content + (s.content ? '\n' : '') + note }
            : s
        ),
      }));
    } else {
      addSection();
    }
    setAddedSuggestions(prev => new Set(prev).add(index));
  }

  async function handleDownloadPDF() {
    setIsGeneratingPDF(true);
    try {
      await downloadAsPDF(resume);
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handleCopy() {
    const text = [resume.name, resume.contact, '', ...resume.sections.flatMap(s => [s.title, s.content, ''])].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-charcoal">tailored resume</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
          >
            {copied ? 'copied ✓' : 'copy'}
          </button>
          <button
            type="button"
            onClick={() => downloadAsTxt(resume)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
          >
            .txt
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="text-xs px-3 py-1.5 rounded-lg bg-espresso text-cream hover:bg-espresso-dark transition-all disabled:opacity-50"
          >
            {isGeneratingPDF ? 'generating…' : 'download PDF'}
          </button>
        </div>
      </div>

      {/* Name + contact */}
      <div className="border border-border rounded-xl bg-white shadow-card px-5 py-4 flex flex-col gap-2">
        <input
          value={resume.name}
          onChange={e => setResume(r => ({ ...r, name: e.target.value }))}
          placeholder="Full name"
          className="font-serif text-xl text-charcoal bg-transparent outline-none border-b border-transparent focus:border-border transition-colors"
        />
        <input
          value={resume.contact}
          onChange={e => setResume(r => ({ ...r, contact: e.target.value }))}
          placeholder="email · phone · linkedin"
          className="text-sm text-stone font-light bg-transparent outline-none border-b border-transparent focus:border-border transition-colors"
        />
      </div>

      {/* Sections */}
      {resume.sections.map(section => (
        <SectionCard
          key={section.id}
          section={section}
          onChange={content => updateSection(section.id, content)}
          onTitleChange={title => updateSectionTitle(section.id, title)}
          onDelete={() => deleteSection(section.id)}
        />
      ))}

      {/* Add section */}
      <button
        type="button"
        onClick={addSection}
        className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-stone/60 hover:text-espresso hover:border-espresso/40 transition-all"
      >
        + add section
      </button>

      {/* Suggestions to incorporate */}
      {suggestions.length > 0 && (
        <div className="border border-border rounded-xl bg-white shadow-card p-5">
          <p className="text-xs font-medium text-stone uppercase tracking-widest mb-4">
            suggestions — click to add to resume
          </p>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => incorporateSuggestion(i, s)}
                  disabled={addedSuggestions.has(i)}
                  className={`shrink-0 mt-0.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                    addedSuggestions.has(i)
                      ? 'border-green-300 text-green-700 bg-green-50 cursor-default'
                      : 'border-espresso/30 text-espresso hover:bg-espresso hover:text-cream'
                  }`}
                >
                  {addedSuggestions.has(i) ? 'added ✓' : '+ add'}
                </button>
                <span className="text-sm text-charcoal font-light leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
