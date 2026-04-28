import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const buildPrompt = (resumeText: string, jobDescription: string) => `
You are an expert resume writer. Tailor the resume below for the job description provided.

INTEGRITY: Never fabricate or exaggerate. Only rewrite what is already in the resume. You may reword, reorder, and strengthen — never invent.

═══════════════════════════════════════════════
REQUIRED OUTPUT FORMAT — copy this structure exactly:
═══════════════════════════════════════════════

Full Name
City, Province • email@example.com • (555) 123-4567

PROFESSIONAL SUMMARY
One to two sentence summary using **bold** for key skills matching the job.

EMPLOYMENT HISTORY
JOB TITLE | Mon YYYY – Mon YYYY
Company Name | City, Province
• Start with an action verb, highlight **key tool or skill** used, quantify if the original has numbers
• Second bullet, same format

EDUCATION
DEGREE OR DIPLOMA | Mon YYYY – Mon YYYY
Institution Name | City, Province

SKILLS
Category: item, item, item
Category: item, item, item

PROJECTS
PROJECT NAME | Mon YYYY – Mon YYYY
• **Tool or skill** — what you built or achieved

═══════════════════════════════════════════════
FORMATTING RULES:
- Section headers: ALL CAPS with no other formatting (EMPLOYMENT HISTORY, EDUCATION, SKILLS, PROJECTS, PROFESSIONAL SUMMARY)
- Pipe character | separates title from date on line 1, and organization from location on line 2
- Bold ONLY using **double asterisks** around important skills, tools, and keywords from the job description
- Bullets start with • and a strong action verb
- Contact info on line 2 ONLY — never repeat name or contact inside a section
- No markdown (#, ##, ---), no HTML, no extra symbols
- Omit any section that has no content from the original resume
═══════════════════════════════════════════════

RESUME TO TAILOR:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY a valid JSON object with no markdown fences and no extra text:
{
  "tailoredResume": "the full rewritten resume using \\n for line breaks",
  "matchedKeywords": ["keyword already in resume that matches job"],
  "missingKeywords": ["important job keyword not in resume"],
  "suggestions": ["short actionable tip 1", "short actionable tip 2", "short actionable tip 3", "short actionable tip 4"],
  "coverLetter": "3 short paragraphs, professional and warm, using only resume content, with \\n\\n between paragraphs"
}
`.trim();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumeText, jobDescription } = req.body ?? {};

  if (!resumeText?.trim() || !jobDescription?.trim()) {
    return res.status(400).json({ error: 'Both resumeText and jobDescription are required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in Vercel environment variables.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(buildPrompt(resumeText, jobDescription));
    const raw = result.response.text().trim();

    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Optimization error:', message);
    return res.status(500).json({ error: message });
  }
}
