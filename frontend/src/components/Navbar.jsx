import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui/Card";
import NotificationCenter from "./NotificationCenter";
import { roleLabels } from "../utils/format";

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 panel border-b border-border px-4 md:px-8 py-4 flex items-center gap-4">
      <div className="flex-1 relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          placeholder="Search tickets..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full rounded-xl bg-white border border-border pl-9 pr-4 py-2 text-sm placeholder:text-text-secondary/60 focus:border-primary outline-none transition-colors"
        />
      </div>

      <NotificationCenter />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-blush/40 transition-colors"
        >
          <Avatar name={user?.name} src={user?.avatar} size={32} />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-text-secondary leading-tight">
              {roleLabels[user?.role]}
            </p>
          </div>
          <ChevronDown size={14} className="text-text-secondary" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 panel rounded-xl shadow-soft z-50 overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blush/40 transition-colors"
              >
                Profile settings
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-blush/40 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
