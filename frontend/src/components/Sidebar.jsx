import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linksByRole = {
  employee: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "My Tickets", icon: Ticket },
  ],
  agent: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "Tickets", icon: Ticket },
  ],
  manager: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "Tickets", icon: Ticket },
    { to: "/analytics", label: "Analytics", icon: Sparkles },
  ],
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "Tickets", icon: Ticket },
    { to: "/analytics", label: "Analytics", icon: Sparkles },
    { to: "/users", label: "Users", icon: Users },
    { to: "/departments", label: "Departments", icon: Building2 },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || linksByRole.employee;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-sidebar">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight text-cream">ResolveIQ</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="relative block">
            {({ isActive }) => (
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-cream"
                    : "text-blush hover:text-cream hover:bg-white/10"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blush hover:text-cream hover:bg-white/10 transition-colors"
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
