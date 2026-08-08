import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import api from "../utils/api";
import { useSocket } from "../context/SocketContext";
import { timeAgo } from "../utils/format";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, setNotifications, unreadCount, setUnreadCount } = useSocket();

  useEffect(() => {
    api.get("/notifications").then((res) => {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    });
  }, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2.5 bg-white/5 border border-border hover:bg-white/10 transition-colors"
      >
        <Bell size={18} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-danger text-[10px] font-bold flex items-center justify-center text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 glass-panel rounded-xl2 shadow-soft z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-medium text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-text-secondary">
                    You're all caught up
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 border-b border-border/50 last:border-0 ${
                        n.read ? "opacity-60" : ""
                      }`}
                    >
                      <p className="text-sm text-text-primary">{n.message}</p>
                      <span className="text-xs text-text-secondary">{timeAgo(n.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
