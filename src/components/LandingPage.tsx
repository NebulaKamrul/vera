import { useState, useEffect } from 'react';

interface Props {
  onStart: () => void;
}

export default function LandingPage({ onStart }: Props) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  function handleStart() {
    setLeaving(true);
    setTimeout(onStart, 420);
  }

  const opacity = leaving ? 'opacity-0' : visible ? 'opacity-100' : 'opacity-0';

  return (
    <div className={`min-h-screen bg-cream flex flex-col transition-opacity duration-500 ease-out ${opacity}`}>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-[480px] w-full flex flex-col items-center gap-10">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="font-serif text-7xl sm:text-8xl text-charcoal tracking-tight leading-none">
              vera
            </h1>
            <p className="text-stone text-sm font-light tracking-widest uppercase">
              make your resume fit the job
            </p>
          </div>

          {/* Divider */}
          <div className="w-10 h-px bg-border" />

          {/* Explanation card */}
          <div className="w-full border border-border rounded-2xl px-8 py-7 flex flex-col gap-4 text-center">
            <p className="text-[1.05rem] font-light leading-[1.75] text-charcoal">
              you found a job you want. your resume is close, but it doesn't
              quite match the job description, and you're not trying to manually
              edit your resume every time.
            </p>
            <p className="text-sm font-light leading-relaxed text-stone">
              vera reads your resume and the job description, then rewrites
              your resume to match.
            </p>
          </div>

          {/* Dictionary card */}
          <div className="w-full border border-border rounded-2xl px-8 py-2 text-left">
            {[
              ['tailored resume', 'rewritten to match the role, in your words'],
              ['keyword match', "see what's there and what's missing"],
              ['suggestions', 'honest tips, yours to act on'],
              ['cover letter', 'short, warm, ready to send'],
            ].map(([term, def], i) => (
              <div
                key={term}
                className={`flex items-baseline gap-6 py-5 ${i !== 0 ? 'border-t border-border' : ''}`}
              >
                <span className="font-serif italic text-charcoal text-[1rem] w-36 shrink-0 leading-snug">
                  {term}
                </span>
                <span className="text-sm text-stone font-light leading-relaxed">
                  {def}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="px-10 py-3.5 rounded-xl bg-espresso text-cream text-sm font-medium tracking-wide hover:bg-espresso-dark active:scale-[0.99] transition-all duration-200 shadow-card"
            >
              get started
            </button>
            <p className="text-xs text-stone/50 tracking-wide">
              no sign-up · no accounts · just results
            </p>
          </div>

        </div>
      </main>

      <footer className="border-t border-border px-8 py-4 text-xs text-stone/40 text-center tracking-wide">
      made with love, nebs
      </footer>
    </div>
  );
}
