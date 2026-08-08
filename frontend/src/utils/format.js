export const statusLabels = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const statusColors = {
  open: "#F59E0B",
  assigned: "#6366F1",
  in_progress: "#06B6D4",
  resolved: "#22C55E",
  closed: "#94A3B8",
};

export const priorityColors = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
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
