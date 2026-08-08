import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Paperclip, ArrowLeft, ImageIcon } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Card, Badge, Avatar } from "../components/ui/Card";
import { Select } from "../components/ui/Input";
import Button from "../components/ui/Button";
import AISuggestionPanel from "../components/AISuggestionPanel";
import CommentThread from "../components/CommentThread";
import ActivityTimeline from "../components/ActivityTimeline";
import {
  statusLabels,
  statusColors,
  priorityColors,
  timeAgo,
} from "../utils/format";

const NEXT_STATUS = {
  open: ["assigned"],
  assigned: ["in_progress", "open"],
  in_progress: ["resolved"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const canManage = ["agent", "manager", "admin"].includes(user?.role);

  const load = async () => {
    const res = await api.get(`/tickets/${id}`);
    setTicket(res.data.ticket);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (canManage) {
      api.get("/users", { params: { role: "agent" } }).then((res) => setAgents(res.data.users));
    }
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (updated) => {
      if (updated._id === id) setTicket(updated);
    };
    socket.on("ticket:updated", handler);
    return () => socket.off("ticket:updated", handler);
  }, [socket, id]);

  const handleAssign = async (agentId) => {
    try {
      await api.put(`/tickets/${id}/assign`, { agentId });
      toast.success("Ticket assigned");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tickets/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${statusLabels[newStatus]}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      await api.put(`/tickets/${id}/priority`, { priority });
      toast.success("Priority updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update priority");
    }
  };

  if (loading || !ticket) {
    return <div className="skeleton h-64 rounded-xl2" />;
  }

  const nextOptions = NEXT_STATUS[ticket.status] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl font-semibold">{ticket.title}</h1>
              <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
            </div>
            <p className="text-text-primary/90 whitespace-pre-wrap">{ticket.description}</p>

            {ticket.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {ticket.attachments.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                  >
                    {a.mimeType?.startsWith("image") ? (
                      <ImageIcon size={12} />
                    ) : (
                      <Paperclip size={12} />
                    )}
                    {a.filename}
                  </a>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-border text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Avatar name={ticket.createdBy?.name} size={24} />
                <span>{ticket.createdBy?.name}</span>
              </div>
              <span>·</span>
              <span>{timeAgo(ticket.createdAt)}</span>
            </div>
          </Card>

          <AISuggestionPanel ticket={ticket} />

          <Card>
            <h3 className="text-sm font-semibold mb-4">Discussion</h3>
            <CommentThread ticketId={ticket._id} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold mb-4">Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-text-secondary text-xs mb-1">Priority</p>
                {canManage ? (
                  <Select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                ) : (
                  <Badge color={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                )}
              </div>

              {canManage && (
                <div>
                  <p className="text-text-secondary text-xs mb-1">Assigned to</p>
                  <Select
                    value={ticket.assignedTo?._id || ""}
                    onChange={(e) => handleAssign(e.target.value)}
                  >
                    <option value="" style={{backgroundColor: "#1e1b2e", color:"white"}}>Unassigned</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}
                        style={{backgroundColor: "#1e1b2e", color:"white"}}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {canManage && nextOptions.length > 0 && (
                <div>
                  <p className="text-text-secondary text-xs mb-2">Move to</p>
                  <div className="flex flex-wrap gap-2">
                    {nextOptions.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(s)}
                      >
                        {statusLabels[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {ticket.slaDeadline && (
                <div>
                  <p className="text-text-secondary text-xs mb-1">SLA deadline</p>
                  <p>{new Date(ticket.slaDeadline).toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-4">Activity</h3>
            <ActivityTimeline ticketId={ticket._id} />
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
