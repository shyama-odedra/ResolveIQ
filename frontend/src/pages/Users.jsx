import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, Avatar, Badge } from "../components/ui/Card";
import { Select } from "../components/ui/Input";
import api from "../utils/api";
import { roleLabels } from "../utils/format";

const roleColors = {
  employee: "#94A3B8",
  agent: "#06B6D4",
  manager: "#F59E0B",
  admin: "#8B5CF6",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.get("/users");
    setUsers(res.data.users);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleStatusToggle = async (id, isActive) => {
    try {
      await api.put(`/users/${id}/status`, { isActive: !isActive });
      toast.success(!isActive ? "User activated" : "User deactivated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-secondary text-left">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              users.map((u) => (
                <tr key={u._id} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatar} size={30} />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-text-secondary">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="!py-1.5 !text-xs w-40"
                    >
                      {Object.keys(roleLabels).map((r) => (
                        <option key={r} value={r}>
                          {roleLabels[r]}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={u.isActive ? "#22C55E" : "#EF4444"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleStatusToggle(u._id, u.isActive)}
                      className="text-xs text-primary hover:underline"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
