import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import LandingPage from './components/LandingPage';
import { generateOptimizedResume } from './api/generateResume';
import type { OptimizationResult } from './types';

const LOADING_MESSAGES = [
  'reading the role…',
  'finding alignment…',
  'refining your resume…',
  'polishing the details…',
  'almost ready…',
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  const messageIndexRef = useRef(0);
  const outputRef = useRef<HTMLDivElement>(null);

  // Cycle loading messages while loading
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

  async function handleSubmit() {
    if (!resumeText.trim()) {
      setError('please paste your resume before continuing.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('please paste the job description before continuing.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    // Scroll output into view on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    try {
      const output = await generateOptimizedResume(resumeText, jobDescription);
      setResult(output);
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
      <Header />

      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left — Input */}
          <div className="lg:sticky lg:top-8">
            <InputPanel
              resumeText={resumeText}
              jobDescription={jobDescription}
              isLoading={isLoading}
              error={error}
              onResumeChange={setResumeText}
              onJobChange={setJobDescription}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Right — Output */}
          <div ref={outputRef}>
            <OutputPanel
              result={result}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-8 py-4 text-xs text-stone/50 text-center">
       made with love, nebs
      </footer>
    </div>
  );
}
