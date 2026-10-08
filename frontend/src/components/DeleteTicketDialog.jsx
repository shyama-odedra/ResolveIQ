import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import api from "../utils/api";

// Confirmation step before a ticket is deleted. Calls onDeleted(ticketId) on success.
export default function DeleteTicketDialog({ ticket, open, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tickets/${ticket._id}`);
      toast.success("Ticket deleted");
      onClose();
      onDeleted?.(ticket._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete the ticket");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete this ticket?" maxWidth="max-w-md">
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">"{ticket?.title}"</span> and its
        discussion will be removed from the board. Use this for tickets raised by mistake.
      </p>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} disabled={deleting}>
          Keep ticket
        </Button>
        <Button variant="danger" icon={Trash2} onClick={handleDelete} loading={deleting}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
