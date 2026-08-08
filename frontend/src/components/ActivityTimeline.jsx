import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  UserCheck,
  RefreshCw,
  MessageCircle,
  Sparkles,
  Paperclip,
} from "lucide-react";
import api from "../utils/api";
import { timeAgo } from "../utils/format";

const actionMeta = {
  created: { icon: PlusCircle, label: "created the ticket", color: "#22C55E" },
  assigned: { icon: UserCheck, label: "assigned the ticket", color: "#6366F1" },
  unassigned: { icon: UserCheck, label: "unassigned the ticket", color: "#94A3B8" },
  status_changed: { icon: RefreshCw, label: "changed the status", color: "#06B6D4" },
  priority_changed: { icon: RefreshCw, label: "changed the priority", color: "#F59E0B" },
  department_changed: { icon: RefreshCw, label: "changed the department", color: "#F59E0B" },
  comment_added: { icon: MessageCircle, label: "commented", color: "#8B5CF6" },
  attachment_added: { icon: Paperclip, label: "added an attachment", color: "#94A3B8" },
  ai_suggestion_generated: { icon: Sparkles, label: "AI generated a suggestion", color: "#8B5CF6" },
  ai_suggestion_overridden: { icon: Sparkles, label: "overrode the AI suggestion", color: "#F59E0B" },
};

export default function ActivityTimeline({ ticketId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(`/tickets/${ticketId}/activity`).then((res) => setLogs(res.data.logs));
  }, [ticketId]);

  if (logs.length === 0) {
    return <p className="text-sm text-text-secondary py-4">No activity yet</p>;
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-5">
        {logs.map((log, i) => {
          const meta = actionMeta[log.action] || actionMeta.status_changed;
          const Icon = meta.icon;
          return (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              <div
                className="absolute -left-6 h-4.5 w-4.5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${meta.color}22`, border: `1px solid ${meta.color}55` }}
              >
                <Icon size={10} style={{ color: meta.color }} />
              </div>
              <p className="text-sm">
                <span className="font-medium">{log.actor?.name || "Someone"}</span>{" "}
                <span className="text-text-secondary">{meta.label}</span>
                {log.meta?.from && log.meta?.to && (
                  <span className="text-text-secondary">
                    {" "}
                    ({log.meta.from} → {log.meta.to})
                  </span>
                )}
              </p>
              <span className="text-xs text-text-secondary">{timeAgo(log.createdAt)}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
