import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Button from "../components/ui/Button";
import { Select } from "../components/ui/Input";
import TicketCard from "../components/TicketCard";
import NewTicketModal from "../components/NewTicketModal";
import { SkeletonList, EmptyState } from "../components/ui/Skeleton";
import { useSocket } from "../context/SocketContext";

export default function Tickets() {
  const { user } = useAuth();
  const { search } = useOutletContext() || {};
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const { socket } = useSocket();

  const load = async () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (search) params.search = search;
    const res = await api.get("/tickets", { params });
    setTickets(res.data.tickets);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status, priority, search]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on("ticket:new", refresh);
    socket.on("ticket:updated", refresh);
    return () => {
      socket.off("ticket:new", refresh);
      socket.off("ticket:updated", refresh);
    };
  }, [socket, status, priority, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">
          {user?.role === "employee" ? "My Tickets" : "Tickets"}
        </h1>
        {user?.role === "employee" && (
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            New ticket
          </Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-44">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : tickets.length === 0 ? (
        <EmptyState title="No tickets found" description="Try adjusting your filters." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => (
            <TicketCard key={t._id} ticket={t} />
          ))}
        </div>
      )}

      <NewTicketModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
    </div>
  );
}
