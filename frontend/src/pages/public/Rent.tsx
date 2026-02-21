import Catalog from "./Catalog";

const Rent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-4">Alquiler de Vehículos</h1>
          <p className="text-slate-300 text-lg">Disfruta de la libertad de conducir los mejores coches.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Catalog mode="RENT" />
      </div>
    </div>
  );
};

export default Rent;