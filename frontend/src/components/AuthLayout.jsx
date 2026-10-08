import { Inbox, Gauge, UserCheck, Wrench, CheckCircle2 } from "lucide-react";

// The ResolveIQ lifecycle, rendered as a live-looking product panel.
const stages = [
  { icon: Inbox, label: "New Ticket", meta: "Checkout returns 502 for EU customers", tag: "INC-4821" },
  { icon: Gauge, label: "AI Triage", meta: "Priority: Critical · Payments · Engineering", tag: "0.9s", ai: true },
  { icon: UserCheck, label: "Assigned", meta: "Routed to on-call payments engineer", tag: "SLA 1h" },
  { icon: Wrench, label: "In Progress", meta: "Gateway timeout traced to expired cert", tag: "14m" },
  { icon: CheckCircle2, label: "Resolved", meta: "Certificate rotated, payments recovered", tag: "38m", done: true },
];

function WorkflowVisual() {
  return (
    <div className="relative rounded-lg border border-cream/10 bg-cream/[0.03] p-5">
      <div className="flex items-center justify-between mb-5 font-mono text-[11px] text-cream/50">
        <span>TICKET LIFECYCLE</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> live
        </span>
      </div>

      <div className="relative">
        {/* rail */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-cream/15">
          <span className="flow-pulse absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-[#5B8CFF] shadow-[0_0_0_4px_rgba(91,140,255,0.18)]" />
        </div>

        <ol className="space-y-3">
          {stages.map(({ icon: Icon, label, meta, tag, ai, done }) => (
            <li key={label} className="relative flex items-center gap-3">
              <span
                className={`relative z-10 h-8 w-8 shrink-0 rounded-md border flex items-center justify-center ${
                  ai
                    ? "bg-primary border-primary text-white"
                    : done
                    ? "bg-[#1E7A4F] border-[#1E7A4F] text-white"
                    : "bg-sidebar border-cream/20 text-cream/80"
                }`}
              >
                <Icon size={15} />
              </span>
              <div
                className={`flex-1 min-w-0 rounded-md border px-3 py-2 ${
                  ai ? "border-primary/60 bg-primary/10" : "border-cream/10 bg-cream/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-cream">{label}</span>
                  <span className="font-mono text-[10px] text-cream/50">{tag}</span>
                </div>
                <p className="text-xs text-cream/60 truncate">
                  {ai ? (
                    <>
                      Priority:{" "}
                      <span className="rounded-sm bg-[#B42318] px-1 py-px text-[10px] font-semibold text-white">
                        CRITICAL
                      </span>{" "}
                      · Payments · Engineering
                    </>
                  ) : (
                    meta
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// Shared shell for the login and register pages.
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-bg">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar flow-grid text-cream px-14 py-12">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center font-mono text-sm font-semibold text-white">
            R
          </div>
          <span className="font-semibold text-lg tracking-tight">ResolveIQ</span>
        </div>

        <div className="max-w-lg w-full">
          <p className="font-mono text-xs text-[#8FB0FF] mb-3">ENTERPRISE SERVICE DESK</p>
          <h2 className="text-[34px] font-semibold leading-[1.15] tracking-tight mb-3">
            From first report to resolution, triaged in seconds.
          </h2>
          <p className="text-sm text-cream/60 mb-8 max-w-md">
            Every ticket is classified by urgency, routed to the right team and paired with
            resolution guidance the moment it arrives.
          </p>
          <WorkflowVisual />
        </div>

        <p className="font-mono text-[11px] text-cream/40">© ResolveIQ · SLA-aware support operations</p>
      </div>

      <div className="flex items-center justify-center p-6">{children}</div>
    </div>
  );
}
