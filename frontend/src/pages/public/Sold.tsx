import Catalog from "./Catalog";

const Sold = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-4">Venta de Vehículos</h1>
          <p className="text-slate-300 text-lg">Descubre nuestra selección de coches premium.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Catalog mode="SALE" />
      </div>
    </div>
  );
};

export default Sold;