import { useEffect, useState } from "react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../services/brandService";
import type { Brand } from "../../types/brand";
import ConfirmModal from "../../helpers/ConfirmModal";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";

const BrandManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    brand: Brand | null;
  }>({
    open: false,
    brand: null,
  });

  const fetchBrands = async () => {
    try {
      const response = await getBrands();
      setBrands(response.data.member || []);
    } catch (error) {
      console.error("Error cargando marcas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await createBrand(newName);
      setBrands((prev) => [...prev, response.data]);
      setNewName("");
      setMessage({ text: "Marca añadida correctamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al añadir la marca.", type: "error" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (brand: Brand) => {
    setDeleteModal({ open: true, brand });
  };

  const handleDeleteConfirmed = async () => {
    const brand = deleteModal.brand;
    if (!brand) return;
    setDeleteModal({ open: false, brand: null });
    try {
      await deleteBrand(brand.id);
      setBrands((prev) => prev.filter((b) => b.id !== brand.id));
      setMessage({
        text: `Marca "${brand.name}" eliminada correctamente`,
        type: "success",
      });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 500 || status === 422) {
        setMessage({
          text: `No se puede eliminar "${brand.name}" porque tiene modelos o vehículos asociados.`,
          type: "error",
        });
      } else {
        setMessage({ text: "Error al eliminar la marca.", type: "error" });
      }
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setEditName(brand.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: number) => {
    setIsSaving(true);
    try {
      await updateBrand(id, editName);
      setBrands((prev) =>
        prev.map((b) => (b.id === id ? { ...b, name: editName } : b)),
      );
      cancelEdit();
      setMessage({ text: "Marca actualizada correctamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al editar la marca.", type: "error" });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Marca"
        message={`¿Seguro que quieres eliminar "${deleteModal.brand?.name}"? Esta acción no se puede deshacer y eliminará todos los modelos asociados.`}
        confirmColor="red"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteModal({ open: false, brand: null })}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Tag className="text-blue-600" /> Gestión de Marcas
        </h1>
        <p className="text-slate-500 text-sm">
          Añade, edita o elimina las marcas de vehículos disponibles.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl">
        <form
          onSubmit={handleAddBrand}
          className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        >
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">
              Nombre de la Marca
            </label>
            <input
              type="text"
              required
              placeholder="Ej: BMW, Audi, Mercedes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={newName}
              maxLength={20}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500" />
          </div>
        ) : brands.length === 0 ? (
          <p className="col-span-full text-center text-slate-400 py-10">
            No hay marcas registradas.
          </p>
        ) : (
          brands.map((brand) =>
            editingId === brand.id ? (
              <div
                key={brand.id}
                className="bg-white p-4 rounded-2xl border-2 border-blue-300 shadow-md flex items-center gap-2 overflow-hidden"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={20}
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(brand.id)}
                  disabled={isSaving || !editName.trim()}
                  aria-label="Guardar"
                  className="shrink-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
                <button
                  onClick={cancelEdit}
                  aria-label="Cancelar"
                  className="shrink-0 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                key={brand.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Tag size={16} />
                  </div>
                  <span className="font-bold text-slate-700">{brand.name}</span>
                </div>
                {/* Siempre visible en móvil, hover en desktop */}
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => startEdit(brand)}
                    aria-label={`Editar ${brand.name}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(brand)}
                    aria-label={`Eliminar ${brand.name}`}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

export default BrandManagement;
