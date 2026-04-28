import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ParsedResume } from '../lib/parseResume';
import type { StyleOptions } from '../types';

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

function groupEntries(classified: LineKind[]): LineKind[][] {
  const groups: LineKind[][] = [];
  let current: LineKind[] = [];
  for (const line of classified) {
    if (line.kind === 'entry' && current.length > 0) { groups.push(current); current = [line]; }
    else current.push(line);
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RichText({ text, base, boldFamily }: { text: string; base: any; boldFamily: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) return <Text style={base}>{text}</Text>;
  return (
    <Text style={base}>
      {parts.map((part, i) =>
        part ? (i % 2 === 1 ? <Text key={i} style={{ fontFamily: boldFamily }}>{part}</Text> : <Text key={i}>{part}</Text>) : null
      )}
    </Text>
  );
}

function makeStyles(opts: StyleOptions) {
  const isSerif = opts.font === 'serif';
  const base = isSerif ? 'Times-Roman' : 'Helvetica';
  const bold = isSerif ? 'Times-Bold' : 'Helvetica-Bold';
  const italic = isSerif ? 'Times-Italic' : 'Helvetica-Oblique';
  const accent = opts.accentColor;

  return { base, bold, italic, accent, styles: StyleSheet.create({
    page: { fontFamily: base, fontSize: 10.5, color: '#000', paddingTop: 44, paddingBottom: 44, paddingHorizontal: 48, lineHeight: 1.4 },
    contact: { fontSize: 9.5, color: '#444', textAlign: opts.template === 'classic' ? 'center' : 'left', marginBottom: 3 },
    name: { fontFamily: bold, fontSize: 22, letterSpacing: 0.5, textAlign: opts.template === 'classic' ? 'center' : 'left', marginBottom: opts.template === 'compact' ? 2 : 10, color: opts.template === 'modern' ? accent : '#000' },
    sectionWrap: { marginBottom: opts.template === 'compact' ? 7 : 10 },
    sectionHeaderWrap: { marginBottom: opts.template === 'compact' ? 3 : 5, marginTop: opts.template === 'compact' ? 4 : 6 },
    sectionRuleTop: { borderTopWidth: opts.template === 'classic' ? 0.8 : 0, borderTopColor: accent },
    sectionRuleBottom: { borderTopWidth: 0.8, borderTopColor: opts.template === 'classic' ? '#000' : accent },
    sectionTitle: { fontFamily: bold, fontSize: opts.template === 'compact' ? 9.5 : 10.5, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: opts.template === 'classic' ? 'center' : 'left', paddingVertical: 2, color: opts.template === 'modern' ? accent : '#000' },
    entryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
    entryLeft: { fontFamily: bold, fontSize: 10.5, flex: 1 },
    entryRight: { fontFamily: bold, fontSize: 10.5, flexShrink: 0, marginLeft: 8, color: opts.template === 'modern' ? '#555' : '#000' },
    subtitleRow: { flexDirection: 'row', marginBottom: opts.template === 'compact' ? 2 : 3 },
    subtitleText: { fontFamily: italic, fontSize: 10.5 },
    bulletRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 8 },
    bulletDot: { width: 10, fontSize: 10.5, color: opts.template === 'modern' ? accent : '#000' },
    bulletText: { flex: 1, fontSize: 10.5, lineHeight: 1.4 },
    plainLine: { fontSize: 10.5, lineHeight: 1.4, marginBottom: 2 },
    emptyLine: { height: opts.template === 'compact' ? 2 : 4 },
  })};
}

function SectionContent({ content, opts }: { content: string; opts: StyleOptions }) {
  const { styles, bold, accent } = makeStyles(opts);
  const lines = mergeLines(content);
  const classified = lines.map(classifyLine);
  const groups = groupEntries(classified);
  const allClassified = groups.flat();

  return (
    <View>
      {groups.map((group, gi) => {
        const offset = groups.slice(0, gi).reduce((a, g) => a + g.length, 0);
        return (
          <View key={gi} wrap={false}>
            {group.map((line, i) => {
              const absIdx = offset + i;
              const prevKind = absIdx > 0 ? allClassified[absIdx - 1].kind : '';
              const isSubtitle = line.kind === 'text' && prevKind === 'entry';

              if (line.kind === 'empty') return <View key={i} style={styles.emptyLine} />;
              if (line.kind === 'bullet') return (
                <View key={i} style={styles.bulletRow}>
                  <Text style={{ ...styles.bulletDot, color: opts.template === 'modern' ? accent : '#000' }}>•</Text>
                  <RichText text={line.text} base={styles.bulletText} boldFamily={bold} />
                </View>
              );
              if (line.kind === 'entry') return (
                <View key={i} style={styles.entryRow}>
                  <RichText text={line.left} base={styles.entryLeft} boldFamily={bold} />
                  <Text style={styles.entryRight}>{line.right}</Text>
                </View>
              );
              if (isSubtitle) return <View key={i} style={styles.subtitleRow}><Text style={styles.subtitleText}>{line.text}</Text></View>;
              return <RichText key={i} text={line.text} base={styles.plainLine} boldFamily={bold} />;
            })}
          </View>
        );
      })}
    </View>
  );
}

export function ResumePDFDocument({ resume, styleOptions }: { resume: ParsedResume; styleOptions: StyleOptions }) {
  const { styles, accent } = makeStyles(styleOptions);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {styleOptions.template === 'compact' ? (
          // Compact: name left, contact right on same row
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 4 }}>
            <Text style={styles.name}>{resume.name}</Text>
            {resume.contact && <Text style={{ ...styles.contact, fontSize: 8.5 }}>{resume.contact}</Text>}
          </View>
        ) : (
          <>
            {resume.contact && <Text style={styles.contact}>{resume.contact}</Text>}
            <Text style={styles.name}>{resume.name}</Text>
          </>
        )}

        {resume.sections.map(section => (
          <View key={section.id} style={styles.sectionWrap}>
            <View style={styles.sectionHeaderWrap}>
              <View style={styles.sectionRuleTop} />
              <Text style={{ ...styles.sectionTitle, color: styleOptions.template === 'modern' ? accent : '#000' }}>{section.title}</Text>
              <View style={styles.sectionRuleBottom} />
            </View>
            <SectionContent content={section.content} opts={styleOptions} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
