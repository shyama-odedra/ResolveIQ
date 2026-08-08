import { Inbox } from "lucide-react";

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl2 p-5 space-y-3">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-4">
        <Icon size={24} className="text-text-secondary" />
      </div>
      <h3 className="text-text-primary font-medium mb-1">{title}</h3>
      {description && <p className="text-text-secondary text-sm max-w-sm">{description}</p>}
    </div>
  );
}
