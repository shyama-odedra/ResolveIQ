import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DeleteTicketDialog from "./DeleteTicketDialog";
import { Card, Badge, Avatar } from "./ui/Card";
import {
  statusLabels,
  statusColors,
  priorityColors,
  timeAgo,
  canDeleteTicket,
} from "../utils/format";

export default function TicketCard({ ticket, onDeleted }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canDelete = canDeleteTicket(user, ticket);

  return (
    <>
      <Card
        hover
        onClick={() => navigate(`/tickets/${ticket._id}`)}
        className="cursor-pointer border-l-[3px]"
        style={{ borderLeftColor: priorityColors[ticket.priority] || "#E3DED4" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-text-primary truncate tracking-tight">
              {ticket.title}
            </h3>
            <p className="text-sm text-text-secondary line-clamp-2 mt-1">
              {ticket.description}
            </p>
          </div>
          <Badge color={priorityColors[ticket.priority]}>
            {ticket.priority}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Badge color={statusColors[ticket.status]}>
              {statusLabels[ticket.status]}
            </Badge>
            {ticket.attachments?.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Paperclip size={12} /> {ticket.attachments.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">
              {timeAgo(ticket.createdAt)}
            </span>
            {ticket.assignedTo && (
              <Avatar name={ticket.assignedTo.name} size={24} />
            )}
            {canDelete && (
              <button
                type="button"
                title="Delete ticket"
                aria-label="Delete ticket"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
                className="rounded-lg p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Kept outside the Card: the card's hover transform would otherwise
        shift this fixed-position dialog, and clicks would open the ticket. */}
      <DeleteTicketDialog
        ticket={ticket}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onDeleted={onDeleted}
      />
    </>
  );
}
