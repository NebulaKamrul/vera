import type { ParsedResume } from '../lib/parseResume';
import type { StyleOptions } from '../types';

function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
      )}
    </>
  );
}

const DATE_RANGE_RE = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*[–—-]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(\d{4}|Present|Current)\b/i;
const SINGLE_DATE_RE = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/i;

type LineKind =
  | { kind: 'empty' }
  | { kind: 'bullet'; text: string }
  | { kind: 'entry'; left: string; right: string }
  | { kind: 'text'; text: string };

function classifyLine(raw: string): LineKind {
  const line = raw.trim();
  if (!line) return { kind: 'empty' };
  if (/^[•\-·*]\s*/.test(line)) return { kind: 'bullet', text: line.replace(/^[•\-·*]\s*/, '') };
  if (line.includes('|')) {
    const parts = line.split('|').map(p => p.trim());
    const dateIdx = parts.findIndex(p => DATE_RANGE_RE.test(p) || SINGLE_DATE_RE.test(p));
    if (dateIdx !== -1) return { kind: 'entry', left: parts.filter((_, i) => i !== dateIdx).join(' · '), right: parts[dateIdx] };
  }
  const tabMatch = line.match(/^(.+?)\s{3,}(.+)$/);
  if (tabMatch && (DATE_RANGE_RE.test(tabMatch[2]) || SINGLE_DATE_RE.test(tabMatch[2]))) return { kind: 'entry', left: tabMatch[1].trim(), right: tabMatch[2].trim() };
  const inlineDate = line.match(/^(.+?)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[–—-]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[–—-]\s*(?:Present|Current)|\d{4}\s*[–—-]\s*(?:\d{4}|Present|Current))$/i);
  if (inlineDate) return { kind: 'entry', left: inlineDate[1].trim(), right: inlineDate[2].trim() };
  return { kind: 'text', text: line };
}

function mergeLines(content: string): string[] {
  const raw = content.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < raw.length) {
    const line = raw[i].trim();
    if (/^[•\-·*]$/.test(line) && i + 1 < raw.length && raw[i + 1].trim()) { out.push(`• ${raw[i + 1].trim()}`); i += 2; }
    else { out.push(raw[i]); i++; }
  }
  return out;
}

function SectionContent({ content, accent, template }: { content: string; accent: string; template: StyleOptions['template'] }) {
  const lines = mergeLines(content);
  const classified = lines.map(classifyLine);

  return (
    <div>
      {classified.map((line, i) => {
        const prevKind = i > 0 ? classified[i - 1].kind : '';
        const isSubtitle = line.kind === 'text' && (prevKind === 'entry' || (prevKind === 'text' && i > 1 && classified[i - 2].kind === 'entry'));

        if (line.kind === 'empty') return <div key={i} style={{ height: template === 'compact' ? '3px' : '5px' }} />;

        if (line.kind === 'bullet') return (
          <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '2px', paddingLeft: '8px' }}>
            <span style={{ flexShrink: 0, color: template === 'modern' ? accent : '#000' }}>•</span>
            <span><RichText text={line.text} /></span>
          </div>
        );

        if (line.kind === 'entry') return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
            <span style={{ fontWeight: 'bold' }}><RichText text={line.left} /></span>
            <span style={{ flexShrink: 0, marginLeft: '10px', fontWeight: 'bold', color: template === 'modern' ? '#555' : '#000' }}>{line.right}</span>
          </div>
        );

        return (
          <div key={i} style={{ marginBottom: isSubtitle ? '3px' : '2px', fontStyle: isSubtitle ? 'italic' : 'normal' }}>
            <RichText text={line.text} />
          </div>
        );
      })}
    </div>
  );
}

export default function ResumePreview({ resume, styleOptions }: { resume: ParsedResume; styleOptions: StyleOptions }) {
  const { template, accentColor, font } = styleOptions;
  const fontFamily = font === 'serif' ? '"Times New Roman", Times, serif' : 'Arial, Helvetica, sans-serif';
  const isClassic = template === 'classic';
  const isModern = template === 'modern';
  const isCompact = template === 'compact';

  return (
    <div style={{
      background: '#fff',
      fontFamily,
      fontSize: '11px',
      lineHeight: isCompact ? '1.35' : '1.45',
      color: '#000',
      padding: isCompact ? '36px 44px' : '48px 52px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
      borderRadius: '4px',
      minHeight: '680px',
    }}>
      {/* ── Header ── */}
      {isCompact ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '0.5px solid #ccc', paddingBottom: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{resume.name || 'Your Name'}</span>
          {resume.contact && <span style={{ fontSize: '9px', color: '#555' }}>{resume.contact}</span>}
        </div>
      ) : isModern ? (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: accentColor, marginBottom: '3px' }}>{resume.name || 'Your Name'}</div>
          {resume.contact && <div style={{ fontSize: '10px', color: '#555' }}>{resume.contact}</div>}
        </div>
      ) : (
        // Classic: centered
        <>
          {resume.contact && <div style={{ textAlign: 'center', fontSize: '10px', color: '#444', marginBottom: '3px' }}>{resume.contact}</div>}
          <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', letterSpacing: '0.04em', marginBottom: '12px' }}>{resume.name || 'Your Name'}</div>
        </>
      )}

      {/* ── Sections ── */}
      {resume.sections.map(section => (
        <div key={section.id} style={{ marginBottom: isCompact ? '8px' : '11px' }}>

          {/* Section header */}
          {isClassic && (
            <div style={{ margin: '6px 0 5px' }}>
              <div style={{ borderTop: '1px solid #000' }} />
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 0' }}>{section.title}</div>
              <div style={{ borderTop: '1px solid #000' }} />
            </div>
          )}
          {isModern && (
            <div style={{ marginBottom: '5px', marginTop: '5px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, paddingBottom: '2px' }}>{section.title}</div>
              <div style={{ borderTop: `1px solid ${accentColor}` }} />
            </div>
          )}
          {isCompact && (
            <div style={{ marginBottom: '3px', marginTop: '3px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor }}>{section.title}</div>
              <div style={{ borderTop: `0.5px solid ${accentColor}`, marginTop: '1px' }} />
            </div>
          )}

          <SectionContent content={section.content} accent={accentColor} template={template} />
        </div>
      ))}
    </div>
  );
}
