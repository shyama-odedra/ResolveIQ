import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("tf_token");
    if (!user || !token) return;

    const socket = io("/", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(notification.message, { icon: "🔔" });
    });

    socket.on("ticket:new", (ticket) => {
      toast(`New ticket: ${ticket.title}`, { icon: "🎫" });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const joinTicket = (ticketId) => socketRef.current?.emit("joinTicket", ticketId);
  const leaveTicket = (ticketId) => socketRef.current?.emit("leaveTicket", ticketId);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        joinTicket,
        leaveTicket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
