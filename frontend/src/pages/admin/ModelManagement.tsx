import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import {
  Plus,
  Trash2,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import ConfirmModal from "../../helpers/ConfirmModal";

interface Brand {
  id: number;
  "@id": string;
  name: string;
}

interface Model {
  id: number;
  name: string;
  brand: {
    "@id": string;
    name: string;
  };
}

const ModelManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrandIri, setSelectedBrandIri] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filterBrandIri, setFilterBrandIri] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; model: Model | null }>({
    open: false,
    model: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, modelsRes] = await Promise.all([
          api.get("/brands"),
          api.get("/models?itemsPerPage=200"),
        ]);
        setBrands(brandsRes.data.member || []);
        setModels(modelsRes.data.member || []);
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modelos filtrados por marca seleccionada en el listado
  const filteredModels = useMemo(() => {
    if (!filterBrandIri) return models;
    return models.filter((m) => m.brand["@id"] === filterBrandIri);
  }, [models, filterBrandIri]);

  // Modelos agrupados por marca
  const groupedModels = useMemo(() => {
    const groups: Record<string, { brandName: string; models: Model[] }> = {};
    filteredModels.forEach((m) => {
      const key = m.brand["@id"];
      if (!groups[key]) groups[key] = { brandName: m.brand.name, models: [] };
      groups[key].models.push(m);
    });
    return Object.values(groups).sort((a, b) =>
      a.brandName.localeCompare(b.brandName)
    );
  }, [filteredModels]);

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await api.post("/models", {
        name: newName,
        brand: selectedBrandIri, // IRI de la marca
      });
      setModels((prev) => [...prev, response.data]);
      setNewName("");
      setMessage({ text: "Modelo añadido correctamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al añadir el modelo.", type: "error" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (model: Model) => {
    setDeleteModal({ open: true, model });
  };

  const handleDeleteConfirmed = async () => {
    const model = deleteModal.model;
    if (!model) return;
    setDeleteModal({ open: false, model: null });

    try {
      await api.delete(`/models/${model.id}`);
      setModels((prev) => prev.filter((m) => m.id !== model.id));
      setMessage({ text: `Modelo "${model.name}" eliminado correctamente`, type: "success" });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 500 || status === 422) {
        setMessage({
          text: `No se puede eliminar "${model.name}" porque tiene vehículos asociados.`,
          type: "error",
        });
      } else {
        setMessage({ text: "Error al eliminar el modelo.", type: "error" });
      }
    }
  };

  const startEdit = (model: Model) => {
    setEditingId(model.id);
    setEditName(model.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: number) => {
    setIsSaving(true);
    try {
      await api.patch(
        `/models/${id}`,
        { name: editName },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, name: editName } : m))
      );
      cancelEdit();
      setMessage({ text: "Modelo actualizado correctamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al editar el modelo.", type: "error" });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Modelo"
        message={`¿Seguro que quieres eliminar "${deleteModal.model?.name}"? Esta acción no se puede deshacer y podría afectar a los vehículos que lo usan.`}
        confirmColor="red"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteModal({ open: false, model: null })}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Layers className="text-blue-600" /> Gestión de Modelos
        </h1>
        <p className="text-slate-500 text-sm">
          Selecciona una marca y añade sus modelos disponibles.
        </p>
      </div>

      {/* FORMULARIO DE CREACIÓN */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
        <form onSubmit={handleAddModel} className="flex flex-wrap items-end gap-4">

          {/* Selector de marca */}
          <div className="space-y-1.5 min-w-[180px]">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">
              Marca
            </label>
            <div className="relative">
              <select
                required
                value={selectedBrandIri}
                onChange={(e) => setSelectedBrandIri(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-9 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              >
                <option value="">Seleccionar marca</option>
                {brands.map((b) => (
                  <option key={b.id} value={b["@id"]}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Nombre del modelo */}
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">
              Nombre del Modelo
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Serie 3, A4, Clase C..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newName.trim() || !selectedBrandIri}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 h-[46px]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <><Plus size={20} /> Añadir</>
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

      {/* FILTRO DEL LISTADO */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-500">Filtrar por marca:</span>
        <div className="relative">
          <select
            value={filterBrandIri}
            onChange={(e) => setFilterBrandIri(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 shadow-sm"
          >
            <option value="">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b.id} value={b["@id"]}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-400">
          {filteredModels.length} modelo{filteredModels.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* LISTADO AGRUPADO POR MARCA */}
      {loading ? (
        <div className="py-10 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-500" />
        </div>
      ) : groupedModels.length === 0 ? (
        <p className="text-center text-slate-400 py-10">No hay modelos registrados.</p>
      ) : (
        <div className="space-y-6">
          {groupedModels.map((group) => (
            <div key={group.brandName}>
              {/* Cabecera de grupo */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
                  {group.brandName}
                </span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {group.models.length}
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Grid de modelos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.models.map((model) =>
                  editingId === model.id ? (
                    // — MODO EDICIÓN —
                    <div
                      key={model.id}
                      className="bg-white p-3 rounded-2xl border-2 border-blue-300 shadow-md flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(model.id)}
                        disabled={isSaving || !editName.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Check size={14} />
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    // — MODO NORMAL —
                    <div
                      key={model.id}
                      className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Layers size={14} />
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">
                          {model.name}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => startEdit(model)}
                          className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(model)}
                          className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelManagement;
