export interface ResumeSection {
  id: string;
  title: string;
  content: string;
}

export interface ParsedResume {
  name: string;
  contact: string;
  sections: ResumeSection[];
}

const SECTION_HEADERS = [
  'PROFESSIONAL SUMMARY', 'SUMMARY', 'PROFILE', 'OBJECTIVE', 'ABOUT',
  'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT HISTORY', 'PROFESSIONAL EXPERIENCE',
  'EDUCATION', 'ACADEMIC BACKGROUND',
  'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'KEY SKILLS',
  'CERTIFICATIONS', 'CERTIFICATES', 'LICENSES', 'CREDENTIALS',
  'AWARDS', 'ACHIEVEMENTS', 'ACCOMPLISHMENTS', 'HONOURS', 'HONORS',
  'VOLUNTEER', 'VOLUNTEERING', 'COMMUNITY',
  'LANGUAGES', 'REFERENCES', 'PROJECTS',
];

function isSectionHeader(line: string): boolean {
  const upper = line.trim().toUpperCase();
  if (!upper) return false;
  if (SECTION_HEADERS.some(h => upper === h || upper.startsWith(h))) return true;
  // Heuristic: short ALL-CAPS line (must contain at least one letter) with no sentence-ending punctuation
  if (/[A-Z]/.test(upper) && upper === line.trim() && line.trim().length < 45 && !/[.!?,]$/.test(line.trim())) return true;
  return false;
}

export function parseResume(text: string): ParsedResume {
  const raw = text.split('\n');
  const lines = raw.map(l => l.trim());

  const nonEmpty = lines.filter(Boolean);
  if (nonEmpty.length === 0) return { name: '', contact: '', sections: [] };

  const name = nonEmpty[0] ?? '';

  // Look for a contact line with email or phone pattern in first 4 lines
  const contactLine = nonEmpty.slice(1, 4).find(l =>
    l.includes('@') || /\d{3}[\s.\-]?\d{3}[\s.\-]?\d{4}/.test(l)
  ) ?? nonEmpty[1] ?? '';

  const sections: ResumeSection[] = [];
  let current: ResumeSection | null = null;
  let headerDone = false;

  for (const line of lines) {
    if (!headerDone && (line === name || line === contactLine || !line)) continue;

    if (isSectionHeader(line)) {
      headerDone = true;
      if (current) sections.push(current);
      current = { id: crypto.randomUUID(), title: line, content: '' };
    } else if (current) {
      current.content += (current.content ? '\n' : '') + line;
    } else {
      // Content before any recognizable header — treat as summary
      headerDone = true;
      current = { id: crypto.randomUUID(), title: 'SUMMARY', content: line };
    }
  }

  if (current) sections.push(current);

  // Trim trailing blank lines from each section
  for (const s of sections) {
    s.content = s.content.trim();
  }

  return { name, contact: contactLine, sections };
}
