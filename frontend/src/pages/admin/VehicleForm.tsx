import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  X,
  Car,
  Banknote,
  Upload,
  Image as ImageIcon,
  MapPin,
  Settings,
  Palette,
  Info
} from "lucide-react";
import api from "../../api/axios";
import { AxiosError } from "axios";

// --- TIPOS E INTERFACES ---

interface SelectOption {
  id: number;
  "@id": string;
  name: string;
}

interface Model extends SelectOption {
  brand: string | { "@id": string };
}

interface FormOptions {
  brands: SelectOption[];
  fuels: SelectOption[];
  transmissions: SelectOption[];
  badges: SelectOption[];
  provinces: SelectOption[];
  bodyTypes: SelectOption[];
  colors: SelectOption[];
}

interface VehicleFormData {
  brand: string;
  model: string;
  price: string;
  dailyPrice: string;
  year: number;
  kilometres: number;
  power: number;
  displacement: number;
  doors: number;
  type: "SALE" | "RENT";
  status: string;
  description: string;
  fuelType: string;
  transmission: string;
  enviromentalBadge: string;
  province: string;
  bodyType: string;
  color: string;
  owners: number;
}

interface Violation {
  propertyPath: string;
  message: string;
}

interface HydraResponse<T> {
  "hydra:member"?: T[];
  member?: T[];
}

const VehicleForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [options, setOptions] = useState<FormOptions>({
    brands: [],
    fuels: [],
    transmissions: [],
    badges: [],
    provinces: [],
    bodyTypes: [],
    colors: [],
  });

  const [allModels, setAllModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);

  const [formData, setFormData] = useState<VehicleFormData>({
    brand: "",
    model: "",
    price: "",
    dailyPrice: "",
    year: new Date().getFullYear(),
    kilometres: 0,
    power: 100,
    displacement: 1000,
    doors: 5,
    type: "SALE",
    status: "AVAILABLE",
    description: "",
    fuelType: "",
    transmission: "",
    enviromentalBadge: "",
    province: "",
    bodyType: "",
    color: "",
    owners: 1,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // 1. CARGA DE DATOS ROBUSTA (Solución al problema de que no cargan las marcas)
  useEffect(() => {
    const fetchOptions = async () => {
      // Helper para que si falla UNA cosa (ej: colores), no rompa TODO el formulario
      const load = async (url: string) => {
        try {
          const res = await api.get<HydraResponse<SelectOption>>(url);
          return res.data.member || res.data["hydra:member"] || [];
        } catch (err) {
          console.warn(`⚠️ Aviso: No se pudo cargar ${url}`, err);
          return []; // Devolvemos array vacío para seguir funcionando
        }
      };

      try {
        const [
          brandsData,
          fuelsData,
          transmissionsData,
          badgesData,
          provincesData,
          bodyTypesData,
          modelsData,
          colorsData,
        ] = await Promise.all([
          load("/brands"),
          load("/fuels"),
          load("/transmissions"),
          load("/enviromental_badges"),
          load("/provinces"),
          load("/body_types"),
          load("/models"),
          load("/colors"),
        ]);

        setOptions({
          brands: brandsData,
          fuels: fuelsData,
          transmissions: transmissionsData,
          badges: badgesData,
          provinces: provincesData,
          bodyTypes: bodyTypesData,
          colors: colorsData,
        });

        setAllModels(modelsData as Model[]);
      } catch (error) {
        console.error("Error crítico cargando opciones:", error);
      }
    };
    fetchOptions();
  }, []);

  // 2. FILTRAR MODELOS
  useEffect(() => {
    if (!formData.brand) {
      setFilteredModels([]);
      return;
    }
    const filtered = allModels.filter((m) => {
      const modelBrandIRI = typeof m.brand === "string" ? m.brand : m.brand?.["@id"];
      return modelBrandIRI === formData.brand;
    });
    setFilteredModels(filtered);
  }, [formData.brand, allModels]);

  // 3. HANDLERS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "brand") return { ...prev, [name]: value, model: "" };
      return { ...prev, [name]: value };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 4. SUBIDA DE IMAGEN
  const uploadImage = async (file: File, isMain: boolean) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("main", isMain ? "1" : "0");

    const response = await api.post("/vehicle_images", formDataUpload);

    if (response.data["@id"]) return response.data["@id"];
    if (response.data.id) return `/api/vehicle_images/${response.data.id}`;
    
    throw new Error("ID de imagen no devuelto por el servidor.");
  };

  // 5. ENVÍO FINAL (Solución al problema del Alquiler)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imagePromises = selectedFiles.map((file, index) => uploadImage(file, index === 0));
      const uploadedImageIRIs = await Promise.all(imagePromises);

      const cleanValue = (val: string) => (val && val.trim() !== "" ? val : undefined);

      // LÓGICA DE PRECIOS CORREGIDA PARA SYMFONY
      let finalDailyPrice = undefined;
      let finalPrice = undefined;

      if (formData.type === "RENT") {
          // ALQUILER: Se envía como STRING (porque en BD es Decimal/String)
          finalDailyPrice = formData.dailyPrice ? formData.dailyPrice.toString() : undefined;
          finalPrice = undefined;
      } else {
          // VENTA: Se envía como FLOAT (porque en BD es Float)
          finalPrice = formData.price ? parseFloat(formData.price) : undefined;
          finalDailyPrice = undefined;
      }

      const vehiclePayload = {
        brand: formData.brand,
        model: formData.model,
        description: formData.description,
        status: formData.status,
        type: formData.type,
        fuelType: formData.fuelType, 
        transmission: formData.transmission,
        
        // Relaciones opcionales limpias
        bodyType: cleanValue(formData.bodyType),
        enviromentalBadge: cleanValue(formData.enviromentalBadge),
        province: cleanValue(formData.province),
        color: cleanValue(formData.color),
        
        // Números
        year: parseInt(formData.year.toString()),
        kilometres: parseInt(formData.kilometres.toString()),
        power: parseInt(formData.power.toString()),
        doors: parseInt(formData.doors.toString()),
        owners: parseInt(formData.owners.toString()),
        displacement: formData.displacement ? parseInt(formData.displacement.toString()) : null,
        
        vehicleImages: uploadedImageIRIs,
        
        // Precios listos para Symfony
        dailyPrice: finalDailyPrice,
        price: finalPrice,
      };

      console.log("Enviando Payload:", vehiclePayload); 

      await api.post("/vehicles", vehiclePayload);

      alert("¡Vehículo creado con éxito!");
      navigate("/admin/coches");

    } catch (err) {
      const error = err as AxiosError<{ "hydra:description": string; violations?: Violation[] }>;
      console.error("Error al guardar:", error);

      let errorMessage = error.response?.data?.["hydra:description"] || "Revisa los datos del formulario.";
      if (error.response?.data?.violations) {
        errorMessage = "Faltan datos obligatorios:\n" + error.response.data.violations.map((v) => `- ${v.propertyPath}: ${v.message}`).join("\n");
      }
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white";
  const labelClass = "text-sm font-semibold text-gray-700 mb-1 block";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6 border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registrar Nuevo Vehículo</h1>
          <p className="text-gray-500 text-sm mt-1">Completa la ficha técnica para añadir el vehículo a la flota.</p>
        </div>
        <button onClick={() => navigate("/admin/coches")} className="p-3 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors shadow-sm border border-transparent hover:border-gray-200">
          <X size={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Tarjeta: Datos Generales */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Car size={24} /></div>
              Datos del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Marca *</label>
                <select name="brand" onChange={handleChange} className={inputClass} required>
                  <option value="">Seleccionar marca...</option>
                  {options.brands.map((b) => (<option key={b.id} value={b["@id"]}>{b.name}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Modelo *</label>
                <select name="model" onChange={handleChange} className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`} required disabled={!formData.brand} value={formData.model}>
                  <option value="">{!formData.brand ? "Elige marca primero..." : "Seleccionar modelo..."}</option>
                  {filteredModels.map((m) => (<option key={m.id} value={m["@id"]}>{m.name}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Carrocería</label>
                <select name="bodyType" onChange={handleChange} className={inputClass}>
                  <option value="">Seleccionar...</option>
                  {options.bodyTypes.map((b) => (<option key={b.id} value={b["@id"]}>{b.name}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Color</label>
                <div className="relative">
                  <Palette className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <select name="color" onChange={handleChange} className={`${inputClass} pl-10`}>
                    <option value="">Seleccionar...</option>
                    {options.colors.map((c) => (<option key={c.id} value={c["@id"]}>{c.name}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Provincia *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <select name="province" onChange={handleChange} className={`${inputClass} pl-10`} required>
                    <option value="">Seleccionar...</option>
                    {options.provinces.map((b) => (<option key={b.id} value={b["@id"]}>{b.name}</option>))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta: Motor y Mecánica */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Settings size={24} /></div>
              Motor y Mecánica
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2">
                <label className={labelClass}>Combustible *</label>
                <select name="fuelType" onChange={handleChange} className={inputClass} required>
                  <option value="">Seleccionar...</option>
                  {options.fuels.map((b) => (<option key={b.id} value={b["@id"]}>{b.name}</option>))}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Cambio *</label>
                <select name="transmission" onChange={handleChange} className={inputClass} required>
                  <option value="">Seleccionar...</option>
                  {options.transmissions.map((b) => (<option key={b.id} value={b["@id"]}>{b.name}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>CV</label>
                <input type="number" name="power" placeholder="150" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>CC</label>
                <input type="number" name="displacement" placeholder="2000" onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Año</label>
                <input type="number" name="year" defaultValue={2024} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Km</label>
                <input type="number" name="kilometres" placeholder="0" onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Dueños</label>
                <input type="number" name="owners" value={formData.owners} onChange={handleChange} className={inputClass} min="1" required />
              </div>
              <div>
                <label className={labelClass}>Puertas</label>
                <input type="number" name="doors" value={formData.doors} onChange={handleChange} className={inputClass} min="2" max="5" required />
              </div>
            </div>
          </div>

          {/* Tarjeta: Descripción */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><Info size={24} /></div>
              Descripción del Vendedor
            </h3>
            <textarea name="description" onChange={handleChange} rows={5} className={inputClass} placeholder="Describe el estado detallado, historial de mantenimiento, extras destacados..."></textarea>
          </div>
        </div>

        {/* COLUMNA LATERAL */}
        <div className="space-y-8">
          
          {/* Tarjeta: Tipo y Precio */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-600"><Banknote size={24} /></div>
              Venta / Alquiler
            </h3>

            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
              <button type="button" onClick={() => setFormData({ ...formData, type: "SALE" })} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all shadow-sm ${formData.type === "SALE" ? "bg-white text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>Venta</button>
              <button type="button" onClick={() => setFormData({ ...formData, type: "RENT" })} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all shadow-sm ${formData.type === "RENT" ? "bg-white text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}>Alquiler</button>
            </div>

            <div className="mb-6">
              <label className={labelClass}>Precio {formData.type === "SALE" ? "Total" : "por Día"} (€)</label>
              <div className="relative">
                <input 
                    type="number" 
                    name={formData.type === "SALE" ? "price" : "dailyPrice"} 
                    value={formData.type === "SALE" ? formData.price : formData.dailyPrice}
                    onChange={handleChange} 
                    className="w-full p-4 pl-4 text-2xl font-bold text-gray-900 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none bg-blue-50/30" 
                    placeholder="0" 
                    required 
                />
                <span className="absolute right-4 top-4 text-gray-400 font-bold text-xl">€</span>
              </div>
            </div>

            <div>
              <label className={labelClass}>Etiqueta DGT</label>
              <select name="enviromentalBadge" onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar...</option>
                {options.badges.map((b) => (<option key={b.id} value={b["@id"]}>{b.name}</option>))}
              </select>
            </div>
          </div>

          {/* Tarjeta: Fotos */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><ImageIcon size={24} /></div>
              Fotografías
            </h3>
            
            <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer block mb-6 group">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-600 font-medium">Arrastra fotos o haz <span className="text-purple-600 underline">click aquí</span></p>
              <p className="text-xs text-gray-400 mt-2">Máximo 5MB por imagen</p>
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 shadow-sm">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    {index === 0 && <span className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm z-10">PORTADA</span>}
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500 hover:text-white shadow-md"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Guardando...</span>
            ) : (
              <><Save size={24} /> PUBLICAR VEHÍCULO</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;