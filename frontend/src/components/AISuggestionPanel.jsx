import { Sparkles, History, CheckCircle2 } from "lucide-react";
import { Card, Badge } from "./ui/Card";
import { priorityColors } from "../utils/format";

export default function AISuggestionPanel({ ticket }) {
  const ai = ticket.aiSuggestion;
  if (!ai) return null;

  const isReused = ai.source === "reused_similar";

  return (
    <Card className="border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        {isReused ? (
          <History size={16} className="text-accent" />
        ) : (
          <Sparkles size={16} className="text-primary" />
        )}
        <h3 className="text-sm font-semibold">
          {isReused ? "Matched a similar resolved ticket" : "AI Triage Suggestion"}
        </h3>
      </div>

      {!isReused && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-text-secondary text-xs mb-0.5">Category</p>
            <p className="text-text-primary">{ai.category}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs mb-0.5">Priority</p>
            <Badge color={priorityColors[ai.priority]}>{ai.priority}</Badge>
          </div>
          <div>
            <p className="text-text-secondary text-xs mb-0.5">Department</p>
            <p className="text-text-primary">{ai.department}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs mb-0.5">Est. resolution</p>
            <p className="text-text-primary">{ai.estimatedResolution}</p>
          </div>
        </div>
      )}

      {ai.suggestions?.length > 0 && (
        <div>
          <p className="text-text-secondary text-xs mb-2">
            {isReused ? "Previous resolution steps" : "Suggested troubleshooting"}
          </p>
          <ul className="space-y-1.5">
            {ai.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                <CheckCircle2 size={14} className="text-success mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
