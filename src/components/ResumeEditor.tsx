import { useState, useRef } from 'react';
import { type ParsedResume, type ResumeSection } from '../lib/parseResume';
import type { StyleOptions } from '../types';
import { Download, Copy, GripVertical, ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface Props {
  resume: ParsedResume;
  suggestions: string[];
  styleOptions: StyleOptions;
  onChange: (resume: ParsedResume) => void;
}

async function downloadAsPDF(resume: ParsedResume, styleOptions: StyleOptions) {
  const { pdf } = await import('@react-pdf/renderer');
  const { ResumePDFDocument } = await import('./ResumePDF');
  const React = await import('react');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(React.createElement(ResumePDFDocument, { resume, styleOptions }) as any).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name || 'resume'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAsTxt(resume: ParsedResume) {
  const lines = [resume.name, resume.contact, '', ...resume.sections.flatMap(s => [s.title, s.content, ''])];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name || 'resume'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function SectionCard({
  section,
  isCollapsed,
  isDragOver,
  onToggleCollapse,
  onChange,
  onDelete,
  onTitleChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  section: ResumeSection;
  isCollapsed: boolean;
  isDragOver: boolean;
  onToggleCollapse: () => void;
  onChange: (content: string) => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`border rounded-xl bg-white shadow-card overflow-hidden animate-fade-in transition-all ${
        isDragOver ? 'border-espresso/60 ring-2 ring-espresso/20' : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-parchment/40">
        {/* Drag handle */}
        <div className="cursor-grab active:cursor-grabbing text-stone/30 hover:text-stone/60 transition-colors shrink-0">
          <GripVertical size={14} />
        </div>

        {/* Title */}
        {editingTitle ? (
          <input
            autoFocus
            value={section.title}
            onChange={e => onTitleChange(e.target.value.toUpperCase())}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
            className="flex-1 text-[10px] font-medium tracking-widest text-stone uppercase bg-transparent border-b border-espresso/30 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-left text-[10px] font-medium tracking-widest text-stone uppercase hover:text-espresso transition-colors"
          >
            {section.title}
          </button>
        )}

        {/* Actions */}
        <button
          type="button"
          onClick={onDelete}
          className="text-[10px] text-stone/30 hover:text-red-400 transition-colors shrink-0 px-1"
        >
          remove
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="text-stone/40 hover:text-stone transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      {/* Content — hidden when collapsed */}
      {!isCollapsed && (
        <textarea
          value={section.content}
          onChange={e => onChange(e.target.value)}
          rows={Math.max(3, section.content.split('\n').length + 1)}
          className="w-full px-4 py-3 text-sm text-charcoal font-light leading-relaxed bg-transparent outline-none resize-none"
          placeholder="Add content here…"
        />
      )}
    </div>
  );
}

export default function ResumeEditor({ resume, suggestions, styleOptions, onChange }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleDragStart(id: string) { dragId.current = id; }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id); }
  function handleDragEnd() { dragId.current = null; setDragOverId(null); }
  function handleDrop(targetId: string) {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) { handleDragEnd(); return; }
    const secs = [...resume.sections];
    const from = secs.findIndex(s => s.id === fromId);
    const to = secs.findIndex(s => s.id === targetId);
    secs.splice(to, 0, secs.splice(from, 1)[0]);
    onChange({ ...resume, sections: secs });
    handleDragEnd();
  }

  function updateSection(id: string, content: string) {
    onChange({ ...resume, sections: resume.sections.map(s => s.id === id ? { ...s, content } : s) });
  }
  function updateSectionTitle(id: string, title: string) {
    onChange({ ...resume, sections: resume.sections.map(s => s.id === id ? { ...s, title } : s) });
  }
  function deleteSection(id: string) {
    onChange({ ...resume, sections: resume.sections.filter(s => s.id !== id) });
  }
  function addSection() {
    const newSection: ResumeSection = { id: crypto.randomUUID(), title: 'NEW SECTION', content: '' };
    onChange({ ...resume, sections: [...resume.sections, newSection] });
  }

  function incorporateSuggestion(index: number, text: string) {
    const note = `• ${text}`;
    const targetId =
      resume.sections.find(s => /experience|skills|summary/i.test(s.title))?.id ??
      resume.sections[resume.sections.length - 1]?.id;
    if (targetId) {
      onChange({
        ...resume,
        sections: resume.sections.map(s =>
          s.id === targetId ? { ...s, content: s.content + (s.content ? '\n' : '') + note } : s
        ),
      });
      setCollapsed(prev => { const next = new Set(prev); next.delete(targetId); return next; });
    }
    setAddedSuggestions(prev => new Set(prev).add(index));
  }

  async function handleDownloadPDF() {
    setIsGeneratingPDF(true);
    try { await downloadAsPDF(resume, styleOptions); }
    finally { setIsGeneratingPDF(false); }
  }

  function handleCopy() {
    const text = [resume.name, resume.contact, '', ...resume.sections.flatMap(s => [s.title, s.content, ''])].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Name + contact */}
      <div className="border border-border rounded-xl bg-white shadow-card px-4 py-4 flex flex-col gap-2">
        <input
          value={resume.name}
          onChange={e => onChange({ ...resume, name: e.target.value })}
          placeholder="Full name"
          className="font-serif text-lg text-charcoal bg-transparent outline-none border-b border-transparent focus:border-border transition-colors"
        />
        <input
          value={resume.contact}
          onChange={e => onChange({ ...resume, contact: e.target.value })}
          placeholder="email · phone · city"
          className="text-sm text-stone font-light bg-transparent outline-none border-b border-transparent focus:border-border transition-colors"
        />
      </div>

      {/* Sections — draggable + collapsible */}
      {resume.sections.map(section => (
        <SectionCard
          key={section.id}
          section={section}
          isCollapsed={collapsed.has(section.id)}
          isDragOver={dragOverId === section.id}
          onToggleCollapse={() => toggleCollapse(section.id)}
          onChange={content => updateSection(section.id, content)}
          onTitleChange={title => updateSectionTitle(section.id, title)}
          onDelete={() => deleteSection(section.id)}
          onDragStart={() => handleDragStart(section.id)}
          onDragOver={e => handleDragOver(e, section.id)}
          onDrop={() => handleDrop(section.id)}
          onDragEnd={handleDragEnd}
        />
      ))}

      {/* Add section */}
      <button
        type="button"
        onClick={addSection}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-stone/60 hover:text-espresso hover:border-espresso/40 transition-all"
      >
        <Plus size={13} />
        add section
      </button>

      {/* AI suggestions */}
      {suggestions.length > 0 && (
        <div className="border border-espresso/20 rounded-xl bg-parchment/40 p-4">
          <p className="text-[10px] font-medium text-stone uppercase tracking-widest mb-3">
            ai suggestions — click to add
          </p>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => incorporateSuggestion(i, s)}
                  disabled={addedSuggestions.has(i)}
                  className={`shrink-0 mt-0.5 text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    addedSuggestions.has(i)
                      ? 'border-green-300 text-green-700 bg-green-50 cursor-default'
                      : 'border-espresso/30 text-espresso hover:bg-espresso hover:text-cream'
                  }`}
                >
                  {addedSuggestions.has(i) ? '✓' : '+'}
                </button>
                <span className="text-xs text-charcoal font-light leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download */}
      <div className="flex gap-2 pt-1 flex-wrap">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
        >
          <Copy size={11} />
          {copied ? 'copied ✓' : 'copy text'}
        </button>
        <button
          type="button"
          onClick={() => downloadAsTxt(resume)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-stone hover:text-espresso hover:border-espresso/40 transition-all"
        >
          <Download size={11} />
          .txt
        </button>
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-espresso text-cream hover:bg-espresso-dark transition-all disabled:opacity-50"
        >
          <Download size={11} />
          {isGeneratingPDF ? 'generating…' : 'download PDF'}
        </button>
      </div>
    </div>
  );
}
