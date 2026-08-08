import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { Avatar } from "./ui/Card";
import Button from "./ui/Button";
import api from "../utils/api";
import { useSocket } from "../context/SocketContext";
import { timeAgo } from "../utils/format";

export default function CommentThread({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { socket, joinTicket, leaveTicket } = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/tickets/${ticketId}/comments`).then((res) => setComments(res.data.comments));
    joinTicket(ticketId);
    return () => leaveTicket(ticketId);
  }, [ticketId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (comment) => {
      if (comment.ticket === ticketId || comment.ticket?._id === ticketId) {
        setComments((prev) => [...prev, comment]);
      }
    };
    socket.on("comment:new", handler);
    return () => socket.off("comment:new", handler);
  }, [socket, ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const handleSend = async (e) => {
  e.preventDefault();
  if (!text.trim()) return;
  setSending(true);

  try {
    const res = await api.post(`/tickets/${ticketId}/comments`, {
      text: text.trim(),
    });

    setComments((prev) => [...prev, res.data.comment]);
    setText("");
  } catch (err) {
    toast.error("Failed to post comment");
  } finally {
    setSending(false);
  }
};

  return (
    <div className="flex flex-col">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-sm text-text-secondary py-6 text-center">No comments yet</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <Avatar name={c.author?.name} src={c.author?.avatar} size={30} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{c.author?.name}</span>
                  <span className="text-xs text-text-secondary">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-text-primary mt-0.5">{c.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm placeholder:text-text-secondary/60 focus:border-primary/60 outline-none transition-colors"
        />
        <Button type="submit" size="md" loading={sending} icon={Send}>
          Send
        </Button>
      </form>
    </div>
  );
}
