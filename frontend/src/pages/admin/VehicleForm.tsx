import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Info,
} from "lucide-react";
import {
  loadFormOptions,
  getVehicle,
  createVehicle,
  updateVehicle,
  uploadVehicleImage,
  deleteVehicleImage,
} from "../../services/vehicleService";
import { buildImageUrl } from "../../utils/vehicleImages";
import type {
  VehicleModel as Model,
  FormOptions,
  VehicleFormData,
  Vehicle,
  SelectOption,
} from "../../types/vehicle";

interface EntityWithId {
  "@id"?: string;
}

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
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
  const [existingImages, setExistingImages] = useState<{ iri: string; url: string; main: boolean }[]>([]);
  const [removedIRIs, setRemovedIRIs] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [
          brandsRes,
          fuelsRes,
          transmissionsRes,
          badgesRes,
          provincesRes,
          bodyTypesRes,
          modelsRes,
          colorsRes,
        ] = await loadFormOptions();

        const get = (res: { data: { member: SelectOption[] } }) =>
          res.data.member || [];

        setOptions({
          brands: get(brandsRes),
          fuels: get(fuelsRes),
          transmissions: get(transmissionsRes),
          badges: get(badgesRes),
          provinces: get(provincesRes),
          bodyTypes: get(bodyTypesRes),
          colors: get(colorsRes),
        });
        setAllModels(get(modelsRes) as Model[]);

        if (isEditMode && id) {
          const response = await getVehicle(id);
          const vehicle = response.data as Vehicle;

          const getIRI = (obj: EntityWithId | null | undefined): string =>
            obj?.["@id"] ?? "";

          setFormData({
            brand: getIRI(vehicle.brand),
            model: getIRI(vehicle.model),
            type: vehicle.type,
            status: vehicle.status,
            description: vehicle.description || "",
            fuelType: getIRI(vehicle.fuelType),
            transmission: getIRI(vehicle.transmission),
            bodyType: getIRI(vehicle.bodyType),
            enviromentalBadge: getIRI(vehicle.enviromentalBadge),
            province: getIRI(vehicle.province),
            color: getIRI(vehicle.color),
            year: vehicle.year,
            kilometres: vehicle.kilometres,
            power: vehicle.power,
            displacement: vehicle.displacement || 0,
            doors: vehicle.doors || 5,
            owners: vehicle.owners || 1,
            price: vehicle.price ? vehicle.price.toString() : "",
            dailyPrice: vehicle.dailyPrice ? vehicle.dailyPrice.toString() : "",
          });

          if (vehicle.vehicleImages?.length > 0) {
            setExistingImages(vehicle.vehicleImages.map((img) => ({
              iri: img["@id"],
              url: buildImageUrl(img.imageUrl),
              main: img.main,
            })));
          }
        }
      } catch (error) {
        throw new Error(`Error cargando opciones ${error}`);
      } finally {
        setLoading(false);
        setDataReady(true);
      }
    };

    initData();
  }, [id, isEditMode]);

  useEffect(() => {
    if (!formData.brand || allModels.length === 0) {
      setFilteredModels([]);
      return;
    }
    setFilteredModels(
      allModels.filter((m) => {
        const modelBrandIRI =
          typeof m.brand === "string" ? m.brand : m.brand?.["@id"];
        return modelBrandIRI === formData.brand;
      }),
    );
  }, [formData.brand, allModels]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      name === "brand"
        ? { ...prev, [name]: value, model: "" }
        : { ...prev, [name]: value },
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setNewPreviews((prev) => [
        ...prev,
        ...filesArray.map((f) => URL.createObjectURL(f)),
      ]);
    }
  };

  const removeImage = (index: number) => {
    const existingCount = existingImages.length;
    if (index < existingCount) {
      setRemovedIRIs((prev) => [...prev, existingImages[index].iri]);
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingCount;
      setSelectedFiles((prev) => prev.filter((_, i) => i !== newIndex));
      setNewPreviews((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Eliminar explícitamente las imágenes borradas por el usuario
      for (const iri of removedIRIs) {
        await deleteVehicleImage(iri);
      }

      // 2. Subir nuevas imágenes de forma secuencial (garantiza orden correcto para isMain)
      const hasExistingMain = existingImages.some((img) => img.main);
      const newUploadedImageIRIs: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const res = await uploadVehicleImage(selectedFiles[i], !hasExistingMain && i === 0);
        const iri = res.data["@id"] ?? `/api/vehicle_images/${res.data.id}`;
        if (!iri) throw new Error("ID de imagen no devuelto por el servidor.");
        newUploadedImageIRIs.push(iri);
      }

      const allImageIRIs = [...existingImages.map((img) => img.iri), ...newUploadedImageIRIs];

      const cleanValue = (val: string) =>
        val && val.trim() !== "" ? val : undefined;

      const vehiclePayload = {
        brand: formData.brand,
        model: formData.model,
        description: formData.description,
        status: formData.status,
        type: formData.type,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        bodyType: cleanValue(formData.bodyType),
        enviromentalBadge: cleanValue(formData.enviromentalBadge),
        province: cleanValue(formData.province),
        color: cleanValue(formData.color),
        year: parseInt(formData.year.toString()),
        kilometres: parseInt(formData.kilometres.toString()),
        power: parseInt(formData.power.toString()),
        doors: parseInt(formData.doors.toString()),
        owners: parseInt(formData.owners.toString()),
        displacement: formData.displacement
          ? parseInt(formData.displacement.toString())
          : null,
        vehicleImages: allImageIRIs,
        dailyPrice:
          formData.type === "RENT" && formData.dailyPrice
            ? formData.dailyPrice.toString()
            : null,
        price:
          formData.type === "SALE" && formData.price
            ? formData.price.toString()
            : null,
      };

      if (isEditMode && id) {
        await updateVehicle(id, vehiclePayload);
      } else {
        await createVehicle(vehiclePayload);
      }

      navigate("/admin/coches");
    } catch (error) {
      console.error(error);
      alert("Error al guardar. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white";
  const labelClass = "text-sm font-semibold text-gray-700 mb-1 block";

  if (isEditMode && !dataReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-6">
      <div className="flex items-center justify-between border-b pb-6 border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Completa la ficha técnica para añadir el vehículo a la flota.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/coches")}
          className="p-3 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors shadow-sm border border-transparent hover:border-gray-200"
        >
          <X size={28} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-3 gap-8"
      >
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Car size={24} />
              </div>
              Datos del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Marca *</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Seleccionar marca...</option>
                  {options.brands.map((b) => (
                    <option key={b.id} value={b["@id"]}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Modelo *</label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                  disabled={!formData.brand}
                >
                  <option value="">
                    {!formData.brand
                      ? "Elige marca primero..."
                      : "Seleccionar modelo..."}
                  </option>
                  {filteredModels.map((m) => (
                    <option key={m.id} value={m["@id"]}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Carrocería</label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Seleccionar...</option>
                  {options.bodyTypes.map((b) => (
                    <option key={b.id} value={b["@id"]}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Color</label>
                <div className="relative">
                  <Palette
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className={`${inputClass} pl-10`}
                  >
                    <option value="">Seleccionar...</option>
                    {options.colors.map((c) => (
                      <option key={c.id} value={c["@id"]}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Provincia *</label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className={`${inputClass} pl-10`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {options.provinces.map((b) => (
                      <option key={b.id} value={b["@id"]}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Etiqueta DGT</label>
                <select
                  name="enviromentalBadge"
                  value={formData.enviromentalBadge}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Seleccionar...</option>
                  {options.badges.map((b) => (
                    <option key={b.id} value={b["@id"]}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Settings size={24} />
              </div>
              Motor y Mecánica
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2">
                <label className={labelClass}>Combustible *</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {options.fuels.map((b) => (
                    <option key={b.id} value={b["@id"]}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Cambio *</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {options.transmissions.map((b) => (
                    <option key={b.id} value={b["@id"]}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>CV</label>
                <input
                  type="number"
                  name="power"
                  value={formData.power}
                  placeholder="150"
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>CC</label>
                <input
                  type="number"
                  name="displacement"
                  value={formData.displacement}
                  placeholder="2000"
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Año</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Km</label>
                <input
                  type="number"
                  name="kilometres"
                  value={formData.kilometres}
                  placeholder="0"
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Dueños</label>
                <input
                  type="number"
                  name="owners"
                  value={formData.owners}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={inputClass}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Puertas</label>
                <input
                  type="number"
                  name="doors"
                  value={formData.doors}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={inputClass}
                  min="2"
                  max="10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <Info size={24} />
              </div>
              Descripción del Vendedor
            </h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={inputClass}
              placeholder="Describe el estado detallado, historial de mantenimiento, extras destacados..."
            ></textarea>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Banknote size={24} />
              </div>
              Venta / Alquiler
            </h3>

            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "SALE" })}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all shadow-sm ${formData.type === "SALE" ? "bg-white text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Venta
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "RENT" })}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all shadow-sm ${formData.type === "RENT" ? "bg-white text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Alquiler
              </button>
            </div>

            <div className="mb-6">
              <label className={labelClass}>
                Precio {formData.type === "SALE" ? "Total" : "por Día"} (€)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name={formData.type === "SALE" ? "price" : "dailyPrice"}
                  value={
                    formData.type === "SALE"
                      ? formData.price
                      : formData.dailyPrice
                  }
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-4 pl-4 text-2xl font-bold text-gray-900 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none bg-blue-50/30"
                  placeholder="0"
                  required
                />
                <span className="absolute right-4 top-4 text-gray-400 font-bold text-xl">
                  €
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <ImageIcon size={24} />
              </div>
              Fotografías
            </h3>

            <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer block mb-6 group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Arrastra fotos o haz{" "}
                <span className="text-purple-600 underline">click aquí</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Máximo 5MB por imagen
              </p>
            </label>

            {(existingImages.length > 0 || newPreviews.length > 0) && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  ...existingImages.map((img) => ({ url: img.url, main: img.main })),
                  ...newPreviews.map((url, i) => ({
                    url,
                    main: !existingImages.some((img) => img.main) && i === 0,
                  })),
                ].map(({ url, main }, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 shadow-sm"
                  >
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {main && (
                      <span className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm z-10">
                        PORTADA
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500 hover:text-white shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                Guardando...
              </span>
            ) : (
              <>
                <Save size={24} />{" "}
                {isEditMode ? "ACTUALIZAR VEHÍCULO" : "PUBLICAR VEHÍCULO"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
