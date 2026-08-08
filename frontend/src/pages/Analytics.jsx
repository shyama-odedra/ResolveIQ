import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Clock, ShieldCheck } from "lucide-react";
import api from "../utils/api";
import { Card } from "../components/ui/Card";

const PRIORITY_COLORS = { low: "#22C55E", medium: "#F59E0B", high: "#EF4444" };
const DEPT_COLORS = ["#8B5CF6", "#6366F1", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444"];

export default function Analytics() {
  const [perDay, setPerDay] = useState([]);
  const [deptDist, setDeptDist] = useState([]);
  const [priorityDist, setPriorityDist] = useState([]);
  const [resolution, setResolution] = useState(null);
  const [sla, setSla] = useState(null);

  useEffect(() => {
    api.get("/analytics/tickets-per-day").then((r) => setPerDay(r.data.data));
    api.get("/analytics/department-distribution").then((r) => setDeptDist(r.data.data));
    api.get("/analytics/priority-distribution").then((r) => setPriorityDist(r.data.data));
    api.get("/analytics/resolution-time").then((r) => setResolution(r.data));
    api.get("/analytics/sla-performance").then((r) => setSla(r.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Clock size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-text-secondary text-xs">Avg. resolution time</p>
            <p className="text-2xl font-semibold">{resolution ? `${resolution.avgHours}h` : "—"}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center">
            <ShieldCheck size={20} className="text-success" />
          </div>
          <div>
            <p className="text-text-secondary text-xs">SLA met</p>
            <p className="text-2xl font-semibold">{sla ? `${sla.metPercentage}%` : "—"}</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold mb-4">Tickets per day</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={perDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
            <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold mb-4">Department distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={deptDist} dataKey="count" nameKey="department" innerRadius={55} outerRadius={85}>
                {deptDist.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-4">Priority distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priorityDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="priority" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {priorityDist.map((entry, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[entry.priority] || "#8B5CF6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
