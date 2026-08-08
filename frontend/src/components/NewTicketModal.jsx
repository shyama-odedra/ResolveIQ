import { useState } from "react";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Input, Textarea } from "./ui/Input";
import api from "../utils/api";

export default function NewTicketModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const reset = () => {
    setTitle("");
    setDescription("");
    setFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      files.forEach((f) => formData.append("attachments", f));

      const res = await api.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Ticket created — AI is analyzing it");
      reset();
      onCreated?.(res.data.ticket);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New ticket" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g. Outlook crashes after Windows update"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          rows={5}
          placeholder="Describe the issue in as much detail as possible — our AI will suggest a category, priority, and troubleshooting steps."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div>
          <span className="text-sm text-text-secondary mb-1.5 block">
            Attachments (PNG, JPG, PDF)
          </span>
          <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-4 cursor-pointer hover:bg-white/5 transition-colors text-sm text-text-secondary">
            <Upload size={16} />
            Click to upload screenshots
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-white/5 border border-border rounded-lg px-2.5 py-1 text-xs"
                >
                  {f.name}
                  <button type="button" onClick={() => removeFile(i)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
