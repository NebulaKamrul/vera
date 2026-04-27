import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ParsedResume } from '../lib/parseResume';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: '#1A1815',
    paddingTop: 52,
    paddingBottom: 52,
    paddingHorizontal: 56,
    lineHeight: 1.45,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  contact: {
    fontSize: 9,
    color: '#6B6560',
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  rule: {
    borderBottomWidth: 0.75,
    borderBottomColor: '#E2DAD0',
    marginBottom: 14,
  },
  sectionWrap: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 5,
    color: '#7A5C3E',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
  },
  bullet: {
    width: 11,
    color: '#7A5C3E',
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.45,
  },
  plainLine: {
    fontSize: 10.5,
    lineHeight: 1.45,
    marginBottom: 2,
  },
  boldLine: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    lineHeight: 1.45,
    marginBottom: 1,
  },
});

function SectionContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={i} style={{ height: 4 }} />;

        const isBullet = /^[·•\-–—]/.test(trimmed);
        // Lines that look like job titles / dates (short, no lowercase start) treated as bold
        const isSubheader = !isBullet && trimmed.length < 80 && /[|·]/.test(trimmed);

        if (isBullet) {
          return (
            <View key={i} style={s.bulletRow}>
              <Text style={s.bullet}>·</Text>
              <Text style={s.bulletText}>{trimmed.replace(/^[·•\-–—]\s*/, '')}</Text>
            </View>
          );
        }
        if (isSubheader) {
          return <Text key={i} style={s.boldLine}>{trimmed}</Text>;
        }
        return <Text key={i} style={s.plainLine}>{trimmed}</Text>;
      })}
    </View>
  );
}

export function ResumePDFDocument({ resume }: { resume: ParsedResume }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <Text style={s.name}>{resume.name}</Text>
        <Text style={s.contact}>{resume.contact}</Text>
        <View style={s.rule} />
        {resume.sections.map(section => (
          <View key={section.id} style={s.sectionWrap}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <SectionContent content={section.content} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
