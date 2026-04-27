import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const buildPrompt = (resumeText: string, jobDescription: string) => `
You are a professional resume consultant helping a real person tailor their resume to a specific job.

STRICT RULES — never break these:
- Do NOT invent, fabricate, or exaggerate any experience, skills, certifications, or education.
- Only use information that already exists in the resume.
- You may reword, reorder, and clarify — but never add things that aren't there.
- If a required skill is missing, note it as a suggestion, not as something already on the resume.

YOUR TASK:
1. Rewrite the resume to better match the job description using ATS-friendly language and clear bullet points.
2. Identify keywords from the job description already present in the resume.
3. Identify important keywords from the job description missing from the resume.
4. Write 4–6 short, honest, actionable suggestions (e.g. "add scheduling experience if you have it").
5. Write a short, warm, professional cover letter based only on what is in the resume.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation. Exactly this shape:
{
  "tailoredResume": "full rewritten resume as plain text with line breaks",
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "coverLetter": "full cover letter as plain text with line breaks"
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
