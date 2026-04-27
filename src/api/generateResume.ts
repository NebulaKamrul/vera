import type { OptimizationResult } from '../types';

// ─── Mock fallback (used in local dev when /api/optimize isn't running) ────
function buildMockResponse(resumeText: string): OptimizationResult {
  const hasContent = resumeText.trim().length > 20;

  const tailoredResume = hasContent
    ? `${resumeText.trim()}\n\n─────────────────────────────────────\nvera: deploy to Vercel and add your GEMINI_API_KEY to see a real rewrite.\n─────────────────────────────────────`
    : `JANE DOE
(555) 123-4567 · jane@email.com · linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Dependable and organized professional with 5+ years of experience in customer
service and administrative support. Known for clear communication, careful
record-keeping, and a calm, helpful presence with clients and colleagues alike.

EXPERIENCE

Customer Service Associate · Maple & Co.  |  2019 – Present
· Handled 50+ customer inquiries daily, maintaining a 97% satisfaction rate
· Coordinated scheduling and appointment management for a team of 8
· Maintained accurate data entry in company records and CRM system
· Resolved billing discrepancies and escalated complex cases as needed

Administrative Assistant · Sunrise Services  |  2017 – 2019
· Supported daily office operations and provided executive assistance
· Processed and organized confidential client documents
· Assisted with onboarding materials for 15+ new hires

EDUCATION
Associate Degree, Business Administration · Lakeview College  |  2017

SKILLS
Microsoft Office · Customer Relationship Management · Data Entry
Scheduling & Calendar Management · Team Collaboration · Written Communication`;

  return {
    tailoredResume,
    matchedKeywords: ['customer service', 'scheduling', 'data entry', 'team collaboration', 'communication'],
    missingKeywords: ['CRM software', 'performance metrics', 'conflict resolution', 'KPI reporting'],
    suggestions: [
      'Mention scheduling experience if you have managed calendars or appointments.',
      'Include any data entry or record-keeping experience you may have, even informal.',
      'Add customer service language and specific examples where possible.',
      'List any software tools you are comfortable with (Excel, Google Sheets, etc.).',
      'Quantify your impact wherever you can — numbers stand out to hiring managers.',
    ],
    coverLetter: `Dear Hiring Manager,

I am writing to express my sincere interest in this position. With my background in customer service and administrative support, I am confident I can contribute meaningfully to your team from day one.

Over the past several years I have developed strong skills in scheduling, record-keeping, and working directly with clients. I take pride in approaching every task with care and attention to detail.

I would welcome the opportunity to bring that same dedication to your organization. Thank you sincerely for your time and consideration.

Warm regards,
[Your Name]

─────────────────────────────────────
vera: deploy to Vercel and add GEMINI_API_KEY to generate a real cover letter.
─────────────────────────────────────`,
  };
}

// ─── Main exported function ────────────────────────────────────────────────
export async function generateOptimizedResume(
  resumeText: string,
  jobDescription: string
): Promise<OptimizationResult> {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    // 404 means the serverless function isn't running (local Vite dev) — use mock
    if (response.status === 404) {
      await new Promise(r => setTimeout(r, 3000));
      return buildMockResponse(resumeText);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? 'Something went wrong. Please try again.');
    }

    return response.json() as Promise<OptimizationResult>;
  } catch (err) {
    // Network error — server completely unreachable
    if (err instanceof TypeError) {
      await new Promise(r => setTimeout(r, 3000));
      return buildMockResponse(resumeText);
    }
    throw err;
  }
}
