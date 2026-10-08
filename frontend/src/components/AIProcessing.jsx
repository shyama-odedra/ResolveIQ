// Shown only while a real AI request is in flight. The three labels describe
// what the single backend call does; no artificial timing is added.
const STEPS = ["Analyzing Ticket", "Classifying Priority", "Generating Resolution Suggestions"];

export default function AIProcessing() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-3" role="status" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-primary mb-2.5">
        {STEPS.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-primary/40">→</span>}
            {s}
          </span>
        ))}
      </div>
      <div className="ai-progress" />
    </div>
  );
}
