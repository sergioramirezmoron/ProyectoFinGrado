import { useEffect, useState } from "react";
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
import type { Province } from "../../types/provinces";
import {
  createProvince,
  deleteProvince,
  getProvinces,
  updateProvince,
} from "../../services/provinceService";

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
      const response = await getProvinces();
      setProvinces(response.data.member || []);
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
      const response = await createProvince(newName);
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
      await deleteProvince(province.id);
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
      await updateProvince(id, editName);
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Provincia"
        message={`¿Seguro que quieres eliminar "${deleteModal.province?.name}"? Esta acción no se puede deshacer y podría afectar a los vehículos que la usan.`}
        confirmColor="red"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteModal({ open: false, province: null })}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="text-blue-600" /> Gestión de Provincias
        </h1>
        <p className="text-slate-500 text-sm">
          Gestiona las ubicaciones donde están disponibles los vehículos.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl">
        <form
          onSubmit={handleAddProvince}
          className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        >
          <div className="flex-1 space-y-1.5">
            <label className="crud-label">
              Nombre de la Provincia / Ciudad
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Madrid, Barcelona, Valencia..."
              className="crud-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Grid provincias */}
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
  className="bg-white p-4 rounded-2xl border-2 border-blue-300 shadow-md flex items-center gap-2 overflow-hidden"
>
  <input
    type="text"
    value={editName}
    onChange={(e) => setEditName(e.target.value)}
    className="crud-input-sm flex-1 min-w-0"
    autoFocus
  />
  <button
    onClick={() => handleSaveEdit(province.id)}
    disabled={isSaving || !editName.trim()}
    aria-label="Guardar"
    className="btn-inline-save"
  >
    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
  </button>
  <button
    onClick={cancelEdit}
    aria-label="Cancelar"
    className="btn-inline-cancel"
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
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <span className="font-bold text-slate-700">
                    {province.name}
                  </span>
                </div>
                {/* Siempre visible en móvil, hover en desktop */}
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => startEdit(province)}
                    aria-label={`Editar ${province.name}`}
                    className="btn-icon-edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(province)}
                    aria-label={`Eliminar ${province.name}`}
                    className="btn-icon-delete"
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
