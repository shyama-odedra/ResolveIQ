import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import api from "../utils/api";
import { EmptyState } from "../components/ui/Skeleton";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data.departments);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/departments", { name, description });
      toast.success("Department created");
      setName("");
      setDescription("");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create department");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      toast.success("Department deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Departments</h1>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          New department
        </Button>
      </div>

      {!loading && departments.length === 0 ? (
        <EmptyState title="No departments yet" description="Create one to start routing tickets." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <Card key={d._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{d.name}</h3>
                  {d.description && (
                    <p className="text-sm text-text-secondary mt-1">{d.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(d._id)}
                  className="text-text-secondary hover:text-danger transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New department">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
