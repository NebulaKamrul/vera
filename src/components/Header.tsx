export default function Header() {
  return (
    <header className="border-b border-border bg-cream px-8 py-5 flex items-baseline gap-4">
      <h1 className="font-serif text-3xl tracking-tight text-charcoal">vera</h1>
      <span className="text-stone text-sm font-light hidden sm:inline">
        make your resume fit the job.
      </span>
    </header>
  );
}
