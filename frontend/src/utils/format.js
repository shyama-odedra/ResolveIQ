export const statusLabels = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const statusColors = {
  open: "#B45309",
  assigned: "#1F4FD1",
  in_progress: "#2D6A8F",
  resolved: "#1E7A4F",
  closed: "#64748B",
};

// Severity scale: restrained red, amber/orange, cobalt, slate.
export const priorityColors = {
  critical: "#B42318",
  high: "#C2410C",
  medium: "#1F4FD1",
  low: "#64748B",
};

export const priorityLabels = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const roleLabels = {
  employee: "Employee",
  agent: "Support Agent",
  manager: "Manager",
  admin: "Admin",
};

export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label} ago`;
  }
  return "just now";
}

export function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Mirrors the server rule in deleteTicket: managers and admins can delete any
// ticket; an employee can delete their own, but only while it is still open.
export function canDeleteTicket(user, ticket) {
  if (!user || !ticket) return false;
  if (["manager", "admin"].includes(user.role)) return true;
  const ownerId = ticket.createdBy?._id || ticket.createdBy;
  return user.role === "employee" && ownerId === user._id && ticket.status === "open";
}
