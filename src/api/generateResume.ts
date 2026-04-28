import type { OptimizationResult } from '../types';

// ─── Mock fallback (used in local dev when /api/optimize isn't running) ────
function buildMockResponse(resumeText: string): OptimizationResult {
  const hasContent = resumeText.trim().length > 20;

  const tailoredResume = hasContent
    ? `Jane Doe
Toronto, ON • jane@email.com • (555) 123-4567

PROFESSIONAL SUMMARY
**Customer service professional** with 5+ years of experience in **client relations** and **administrative support**. Known for clear communication, careful record-keeping, and a calm presence with clients and colleagues.

EMPLOYMENT HISTORY
CUSTOMER SERVICE ASSOCIATE | Jan 2019 – Present
Maple & Co. | Toronto, ON
• Handled **50+ daily client inquiries**, maintaining a **97% satisfaction rate**
• Managed **scheduling and appointment coordination** for a team of 8
• Maintained accurate records in **CRM system** with zero data loss incidents
• Resolved billing discrepancies and escalated complex cases to senior staff

ADMINISTRATIVE ASSISTANT | Mar 2017 – Dec 2018
Sunrise Services | Toronto, ON
• Supported daily office operations and provided **executive-level assistance**
• Processed and organized confidential client documents following compliance guidelines
• Assisted with onboarding materials and orientation for 15+ new hires

EDUCATION
ASSOCIATE DEGREE, BUSINESS ADMINISTRATION | 2017
Lakeview College | Lakeview, ON

SKILLS
Customer Relations: CRM software, conflict resolution, client satisfaction tracking
Administration: Microsoft Office 365, data entry, calendar management
Communication: written correspondence, team collaboration, reporting

─────────────────────────────────────
vera: add your GEMINI_API_KEY in Vercel to see a real AI rewrite of your resume.
─────────────────────────────────────`
    : `Jane Doe
Toronto, ON • jane@email.com • (555) 123-4567

PROFESSIONAL SUMMARY
**Customer service professional** with 5+ years of experience in **client relations** and **administrative support**. Known for clear communication, careful record-keeping, and a calm presence with clients and colleagues.

EMPLOYMENT HISTORY
CUSTOMER SERVICE ASSOCIATE | Jan 2019 – Present
Maple & Co. | Toronto, ON
• Handled **50+ daily client inquiries**, maintaining a **97% satisfaction rate**
• Managed **scheduling and appointment coordination** for a team of 8
• Maintained accurate records in **CRM system** with zero data loss incidents

ADMINISTRATIVE ASSISTANT | Mar 2017 – Dec 2018
Sunrise Services | Toronto, ON
• Supported daily office operations and provided **executive-level assistance**
• Processed and organized confidential client documents
• Assisted with onboarding materials for 15+ new hires

EDUCATION
ASSOCIATE DEGREE, BUSINESS ADMINISTRATION | 2017
Lakeview College | Lakeview, ON

SKILLS
Customer Relations: CRM software, conflict resolution, satisfaction tracking
Administration: Microsoft Office 365, data entry, calendar management`;

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
