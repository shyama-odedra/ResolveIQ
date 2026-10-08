import { useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, RefreshCw, History, AlertTriangle } from "lucide-react";
import { Card, Badge } from "./ui/Card";
import Button from "./ui/Button";
import AIProcessing from "./AIProcessing";
import api from "../utils/api";
import { priorityColors, priorityLabels } from "../utils/format";

export default function AISuggestionPanel({ ticket, onUpdated }) {
  const [analyzing, setAnalyzing] = useState(false);
  const ai = ticket.aiSuggestion;

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`/tickets/${ticket._id}/analyze`);
      onUpdated?.(res.data.ticket);
      if (res.data.ticket.aiSuggestion?.source !== "gemini") {
        toast.error(res.data.ticket.aiSuggestion?.aiError || "AI analysis unavailable");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const fromAI = ai?.source === "gemini";
  const hasGuidance = fromAI && (ai.likelyCause || ai.suggestions?.length || ai.nextAction);
  const legacy = ai && !fromAI && ai.source === "reused_similar";

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">AI Triage &amp; Resolution Suggestions</h3>
        </div>
        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={runAnalysis} disabled={analyzing}>
          {ai ? "Re-analyze" : "Analyze"}
        </Button>
      </div>

      {analyzing ? (
        <AIProcessing />
      ) : !ai ? (
        <p className="text-sm text-text-secondary">This ticket has not been analyzed yet.</p>
      ) : (
        <div className="space-y-5">
          {/* Priority decision */}
          <div
            className="rounded-lg border bg-bg/60 px-4 py-3 border-l-[3px]"
            style={{ borderLeftColor: priorityColors[ai.priority] }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-text-secondary">AI Triage · Priority</span>
              <Badge color={priorityColors[ai.priority]}>{priorityLabels[ai.priority] || ai.priority}</Badge>
              <span className="ml-auto font-mono text-[10px] uppercase text-text-secondary">
                {fromAI ? "AI Analysis · Gemini" : ai.source === "rules" ? "Keyword Fallback" : "Similar ticket"}
              </span>
            </div>
            {ai.priorityReason && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-secondary mb-0.5">{fromAI ? "AI Reasoning" : "Keyword rule match"}</p>
                <p className="text-sm text-text-primary">{ai.priorityReason}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <Meta label="Category" value={ai.category} />
            <Meta label="Department" value={ai.department} />
            <Meta label="Est. resolution" value={ai.estimatedResolution} />
          </div>

          {hasGuidance ? (
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">AI Resolution Suggestions</h4>
              {ai.likelyCause && (
                <Section title="Likely Cause">
                  <p className="text-sm text-text-primary">{ai.likelyCause}</p>
                </Section>
              )}
              {ai.suggestions?.length > 0 && (
                <Section title="Recommended Steps">
                  <ol className="space-y-2">
                    {ai.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-text-primary">
                        <span className="font-mono text-xs text-primary mt-0.5 w-4 shrink-0">{i + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}
              {ai.nextAction && (
                <Section title="Suggested Next Action">
                  <p className="text-sm font-medium text-text-primary rounded-md bg-primary/[0.06] border border-primary/15 px-3 py-2">
                    {ai.nextAction}
                  </p>
                </Section>
              )}
              {ticket.similarTicketRef?.title && (
                <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <History size={12} /> Also informed by similar resolved ticket: “{ticket.similarTicketRef.title}”
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-md border border-border bg-bg/60 px-3 py-2.5 text-xs text-text-secondary">
              <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
              <span>
                {legacy
                  ? "This ticket was triaged before AI resolution suggestions were available. Click Re-analyze to generate them."
                  : ai.aiError || "AI resolution suggestions are unavailable for this ticket."}{" "}
                {!legacy && "Click Re-analyze to try again."}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-text-secondary text-xs mb-0.5">{label}</p>
      <p className="text-text-primary font-medium truncate">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">{title}</p>
      {children}
    </div>
  );
}
