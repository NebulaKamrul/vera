import { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import NavBar from './components/NavBar';
import ResumeStep from './components/ResumeStep';
import JobStep from './components/JobStep';
import ResultsStep from './components/ResultsStep';
import { generateOptimizedResume } from './api/generateResume';
import type { OptimizationResult } from './types';

type Step = 'resume' | 'job' | 'results';

const LOADING_MESSAGES = [
  'reading the role…',
  'finding alignment…',
  'refining your resume…',
  'polishing the details…',
  'almost ready…',
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<Step>('resume');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  const messageIndexRef = useRef(0);

  useEffect(() => {
    if (!isLoading) return;
    messageIndexRef.current = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      messageIndexRef.current = (messageIndexRef.current + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndexRef.current]);
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading]);

  async function handleOptimize() {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setError(null);
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateOptimizedResume(resumeText, jobDescription);
      setResult(output);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col animate-fade-in">
      <NavBar
        step={step}
        hasResults={!!result}
        onStepChange={setStep}
      />

      <main className="flex-1">
        {step === 'resume' && (
          <ResumeStep
            resumeText={resumeText}
            onChange={setResumeText}
            onContinue={() => setStep('job')}
          />
        )}

        {step === 'job' && (
          <JobStep
            jobDescription={jobDescription}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            error={error}
            onChange={setJobDescription}
            onBack={() => setStep('resume')}
            onOptimize={handleOptimize}
          />
        )}

        {step === 'results' && result && (
          <ResultsStep result={result} />
        )}
      </main>

      <footer className="border-t border-border px-8 py-4 text-xs text-stone/40 text-center tracking-wide">
        vera, built to help you move forward · made with love, nebs
      </footer>
    </div>
  );
}
