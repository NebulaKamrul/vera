import { FileText, Briefcase, Sparkles } from 'lucide-react';

type Step = 'resume' | 'job' | 'results';

interface Props {
  step: Step;
  hasResults: boolean;
  onStepChange: (s: Step) => void;
}

const tabs: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'resume', label: 'your resume', icon: <FileText size={14} /> },
  { id: 'job',    label: 'the job',     icon: <Briefcase size={14} /> },
  { id: 'results',label: 'results',     icon: <Sparkles size={14} /> },
];

export default function NavBar({ step, hasResults, onStepChange }: Props) {
  return (
    <header className="border-b border-border bg-cream px-8 pt-5 pb-0">
      <div className="max-w-4xl mx-auto">
        {/* Logo row */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-serif text-2xl text-charcoal tracking-tight">vera</span>
          <span className="text-xs text-stone/50 font-light hidden sm:block">
            make your resume fit the job.
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1">
          {tabs.map(tab => {
            const disabled = tab.id === 'results' && !hasResults;
            const active = step === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onStepChange(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-all
                  ${active
                    ? 'border-espresso text-charcoal font-medium'
                    : disabled
                      ? 'border-transparent text-stone/30 cursor-not-allowed'
                      : 'border-transparent text-stone hover:text-charcoal hover:border-border'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
