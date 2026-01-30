import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./components/auth/Login";
import { ProtectedRoute } from "./helpers/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import VehicleList from "./pages/admin/VehicleList";
import VehicleForm from "./pages/admin/VehicleForm";
import Catalog from "./pages/public/Catalog";
import VehicleDetail from "./pages/public/VehicleDetail";

// Placeholder Components
const Home = () => (
  <h1 className="text-3xl font-bold text-white">Portada Tesla Style 🏎️</h1>
);

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/venta" element={<Catalog mode="SALE" />} />
        <Route path="/alquiler" element={<Catalog mode="RENT" />} />

        <Route path="/vehiculo/:id" element={<VehicleDetail />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="coches" element={<VehicleList />} />
        <Route path="coches/nuevo" element={<VehicleForm />} />
        <Route path="coches/editar/:id" element={<VehicleForm />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
