import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/auth/Login";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import VehicleList from "./pages/admin/VehicleList";
import VehicleForm from "./pages/admin/VehicleForm";

// Layouts (Los crearemos ahora)

// Placeholder Components (Para que no falle ahora mismo)
const Home = () => (
  <h1 className="text-3xl font-bold text-white">Portada Tesla Style 🏎️</h1>
);
const SaleCatalog = () => <h1 className="text-white">Catálogo Venta</h1>;
const RentCatalog = () => <h1 className="text-white">Catálogo Alquiler</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA 1: WEB PÚBLICA (Estilo Tesla/Audi) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/venta" element={<SaleCatalog />} />
          <Route path="/alquiler" element={<RentCatalog />} />
          <Route
            path="/vehiculo/:id"
            element={<h1 className="text-white">Detalle Coche</h1>}
          />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* RUTA 2: PANEL DE ADMIN/VENTAS (Estilo Dashboard profesional) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Aquí dentro solo entras si tienes token */}
            <Route
              index
              element={
                <Dashboard />
              }
            />
            <Route path="coches" element={<VehicleList />} />
            <Route path="coches/nuevo" element={<VehicleForm />} />
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
