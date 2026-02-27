import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Plus,
  Trash2,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import ConfirmModal from "../../helpers/ConfirmModal";

interface Province {
  id: number;
  name: string;
}

const ProvinceManagement = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    province: Province | null;
  }>({
    open: false,
    province: null,
  });

  const fetchProvinces = async () => {
    try {
      const response = await api.get("/provinces");
      const data = response.data.member || [];
      setProvinces(data);
    } catch (error) {
      console.error("Error cargando provincias", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const handleAddProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await api.post("/provinces", { name: newName });
      setProvinces((prev) => [...prev, response.data]);
      setNewName("");
      setMessage({ text: "Provincia añadida correctamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al añadir la provincia.", type: "error" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (province: Province) => {
    setDeleteModal({ open: true, province });
  };

  const handleDeleteConfirmed = async () => {
    const province = deleteModal.province;
    if (!province) return;
    setDeleteModal({ open: false, province: null });

    try {
      await api.delete(`/provinces/${province.id}`);
      setProvinces((prev) => prev.filter((p) => p.id !== province.id));
      setMessage({
        text: `Provincia "${province.name}" eliminada correctamente`,
        type: "success",
      });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 500 || status === 422) {
        setMessage({
          text: `No se puede eliminar "${province.name}" porque está asignada a uno o más vehículos.`,
          type: "error",
        });
      } else {
        setMessage({ text: "Error al eliminar la provincia.", type: "error" });
      }
    }
  };

  const startEdit = (province: Province) => {
    setEditingId(province.id);
    setEditName(province.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: number) => {
    setIsSaving(true);
    try {
      await api.patch(
        `/provinces/${id}`,
        { name: editName },
        { headers: { "Content-Type": "application/merge-patch+json" } },
      );
      setProvinces((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: editName } : p)),
      );
      cancelEdit();
      setMessage({
        text: "Provincia actualizada correctamente",
        type: "success",
      });
    } catch (error) {
      setMessage({ text: "Error al editar la provincia.", type: "error" });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Provincia"
        message={`¿Seguro que quieres eliminar "${deleteModal.province?.name}"? Esta acción no se puede deshacer y podría afectar a los vehículos que la usan.`}
        confirmColor="red"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteModal({ open: false, province: null })}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="text-blue-600" /> Gestión de Provincias
        </h1>
        <p className="text-slate-500 text-sm">
          Gestiona las ubicaciones donde están disponibles los vehículos.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
        <form
          onSubmit={handleAddProvince}
          className="flex flex-wrap items-end gap-4"
        >
          <div className="flex-1 min-w-75 space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">
              Nombre de la Provincia / Ciudad
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Madrid, Barcelona, Valencia..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 h-11.5"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Plus size={20} /> Añadir
              </>
            )}
          </button>
        </form>

        {message.text && (
          <div
            className={`mt-4 flex items-center gap-2 text-sm font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500" />
          </div>
        ) : provinces.length === 0 ? (
          <p className="col-span-full text-center text-slate-400 py-10">
            No hay provincias registradas.
          </p>
        ) : (
          provinces.map((province) =>
            editingId === province.id ? (
              <div
                key={province.id}
                className="bg-white p-4 rounded-2xl border-2 border-blue-300 shadow-md flex items-center gap-2"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(province.id)}
                  disabled={isSaving || !editName.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                key={province.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin size={18} />
                  </div>
                  <span className="font-bold text-slate-700">
                    {province.name}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => startEdit(province)}
                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(province)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
};

export default ProvinceManagement;
