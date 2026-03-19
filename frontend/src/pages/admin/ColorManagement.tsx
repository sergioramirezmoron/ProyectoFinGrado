import { useEffect, useState } from "react";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from "../../services/colorService";
import type { Color } from "../../types/color";
import ConfirmModal from "../../helpers/ConfirmModal";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const FALLBACK_COLOR = "#cccccc";

const ColorManagement = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("#3b82f6");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    color: Color | null;
  }>({
    open: false,
    color: null,
  });

  const fetchColors = async () => {
    try {
      const response = await getColors();
      setColors(response.data.member || []);
    } catch (error) {
      console.error("Error cargando colores", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await createColor(newName, newCode);
      setColors((prev) => [...prev, response.data]);
      setNewName("");
      setNewCode("#3b82f6");
      setMessage({ text: "Color añadido correctamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al añadir el color.", type: "error" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (color: Color) => {
    setDeleteModal({ open: true, color });
  };

  const handleDeleteConfirmed = async () => {
    const color = deleteModal.color;
    if (!color) return;
    setDeleteModal({ open: false, color: null });
    try {
      await deleteColor(color.id);
      setColors((prev) => prev.filter((c) => c.id !== color.id));
      setMessage({
        text: `Color "${color.name}" eliminado correctamente`,
        type: "success",
      });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 500 || status === 422) {
        setMessage({
          text: `No se puede eliminar "${color.name}" porque está asignado a uno o más vehículos.`,
          type: "error",
        });
      } else {
        setMessage({ text: "Error al eliminar el color.", type: "error" });
      }
    }
  };

  const startEdit = (color: Color) => {
    setEditingId(color.id);
    setEditName(color.name);
    setEditCode(color.hexCode ?? FALLBACK_COLOR);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCode("");
  };

  const handleSaveEdit = async (id: number) => {
    setIsSaving(true);
    try {
      await updateColor(id, editName, editCode);
      setColors((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, name: editName, hexCode: editCode } : c,
        ),
      );
      cancelEdit();
      setMessage({ text: "Color actualizado correctamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al editar el color.", type: "error" });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Color"
        message={`¿Seguro que quieres eliminar "${deleteModal.color?.name}"? Esta acción no se puede deshacer y podría afectar a los vehículos que lo usan.`}
        confirmColor="red"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteModal({ open: false, color: null })}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Palette className="text-blue-600" /> Gestión de Colores
        </h1>
        <p className="text-slate-500 text-sm">
          Añade, edita o elimina los colores disponibles para la flota.
        </p>
      </div>

      {/* Formulario añadir */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl">
        <form
          onSubmit={handleAddColor}
          className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        >
          <div className="flex-1 space-y-1.5">
            <label className="crud-label">
              Nombre del Color
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Rojo Ferrari"
              className="crud-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="crud-label">
              Tono
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <input
                type="color"
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <span className="text-sm font-mono text-slate-600 uppercase">
                {newCode}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            } animate-in fade-in slide-in-from-top-1`}
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

      {/* Grid de colores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500" />
          </div>
        ) : (
          colors.map((color) =>
            editingId === color.id ? (
              // Tarjeta en modo edición
              <div
                key={color.id}
                className="bg-white p-4 rounded-2xl border-2 border-blue-300 shadow-md flex flex-col gap-3"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="crud-input-sm w-full"
                />
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <input
                    type="color"
                    className="w-7 h-7 rounded cursor-pointer bg-transparent"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                  />
                  <span className="text-xs font-mono text-slate-500 uppercase">
                    {editCode}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(color.id)}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <>
                        <Check size={14} /> Guardar
                      </>
                    )}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold py-1.5 rounded-lg transition-all"
                  >
                    <X size={14} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Tarjeta normal — botones siempre visibles en móvil
              <div
                key={color.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border border-slate-200 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: color.hexCode ?? FALLBACK_COLOR }}
                  />
                  <div>
                    <p className="font-bold text-slate-800">{color.name}</p>
                    <p className="text-xs font-mono text-slate-400 uppercase">
                      {color.hexCode ?? "Sin color"}
                    </p>
                  </div>
                </div>
                {/* En móvil siempre visibles, en desktop solo al hacer hover */}
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => startEdit(color)}
                    aria-label={`Editar ${color.name}`}
                    className="btn-icon-edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(color)}
                    aria-label={`Eliminar ${color.name}`}
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

export default ColorManagement;
