import { useNavigate } from "react-router-dom";
import { Paperclip, MessageSquare } from "lucide-react";
import { Card, Badge, Avatar } from "./ui/Card";
import { statusLabels, statusColors, priorityColors, timeAgo } from "../utils/format";

export default function TicketCard({ ticket }) {
  const navigate = useNavigate();

  return (
    <Card
      hover
      onClick={() => navigate(`/tickets/${ticket._id}`)}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-text-primary truncate">{ticket.title}</h3>
          <p className="text-sm text-text-secondary line-clamp-2 mt-1">{ticket.description}</p>
        </div>
        <Badge color={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
        <div className="flex items-center gap-2">
          <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
          {ticket.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Paperclip size={12} /> {ticket.attachments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">{timeAgo(ticket.createdAt)}</span>
          {ticket.assignedTo && <Avatar name={ticket.assignedTo.name} size={24} />}
        </div>
      </div>
    </Card>
  );
}
