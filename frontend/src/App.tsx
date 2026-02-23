import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./components/auth/Login";
import { ProtectedRoute } from "./helpers/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import VehicleList from "./pages/admin/VehicleList";
import VehicleForm from "./pages/admin/VehicleForm";
import VehicleDetail from "./pages/public/VehicleDetail";
import Home from "./pages/public/Home";
import Chat from "./pages/public/Chat";
import Register from "./components/auth/Register";
import Rent from "./pages/public/Rent";
import Sold from "./pages/public/Sold";
import UserManagement from "./pages/admin/UserManagement";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/venta" element={<Sold />} />
        <Route path="/alquiler" element={<Rent />} />

        <Route path="/vehiculo/:id" element={<VehicleDetail />} />
        <Route path="mis-chats" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/admin/mensajes" element={<Chat />} />
        <Route path="/admin/usuarios" element={<UserManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
