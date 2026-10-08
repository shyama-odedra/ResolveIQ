import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Card, Avatar } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import api from "../utils/api";
import { roleLabels } from "../utils/format";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put("/auth/profile", { name });
      updateUser(res.data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put("/auth/change-password", passwords);
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} src={user?.avatar} size={56} />
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-text-secondary">
              {user?.email} · {roleLabels[user?.role]}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" loading={savingProfile}>
            Save profile
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-4">Change password</h3>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
            }
            required
          />
          <Input
            label="New password"
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            required
          />
          <Button type="submit" loading={savingPassword}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
