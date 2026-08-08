import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import TicketCard from "../components/TicketCard";
import NewTicketModal from "../components/NewTicketModal";
import { SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/Skeleton";

const statCards = [
  { key: "open", label: "Open", icon: AlertCircle, color: "#F59E0B" },
  { key: "assigned", label: "Assigned", icon: Ticket, color: "#6366F1" },
  { key: "inProgress", label: "In Progress", icon: Clock, color: "#06B6D4" },
  { key: "resolved", label: "Resolved", icon: CheckCircle2, color: "#22C55E" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const canSeeAnalytics = ["manager", "admin"].includes(user?.role);

  const loadTickets = async () => {
    const res = await api.get("/tickets");
    setTickets(res.data.tickets.slice(0, 6));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadTickets(),
      canSeeAnalytics ? api.get("/analytics/summary").then((r) => setSummary(r.data)) : null,
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {user?.role === "employee" ? "Your dashboard" : "Overview"}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Welcome back, {user?.name.split(" ")[0]}
          </p>
        </div>
        {user?.role === "employee" && (
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            New ticket
          </Button>
        )}
      </div>

      {canSeeAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ key, label, icon: Icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="relative overflow-hidden">
                <div
                  className="absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30"
                  style={{ backgroundColor: color }}
                />
                <div className="flex items-center justify-between relative">
                  <div>
                    <p className="text-text-secondary text-xs mb-1">{label}</p>
                    <p className="text-2xl font-semibold">
                      {summary ? summary[key] ?? 0 : "—"}
                    </p>
                  </div>
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}22` }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium mb-4">
          {user?.role === "employee" ? "Your recent tickets" : "Recent tickets"}
        </h2>
        {loading ? (
          <SkeletonList count={3} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description={
              user?.role === "employee"
                ? "Create your first support ticket and let AI triage it for you."
                : "No tickets have come in yet."
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((t) => (
              <TicketCard key={t._id} ticket={t} />
            ))}
          </div>
        )}
      </div>

      <NewTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => loadTickets()}
      />
    </div>
  );
}
