import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import { ProtectedRoute } from "./helpers/ProtectedRoute";

// Lazy-loaded pages — cada ruta genera su propio chunk → carga inicial mucho más rápida
const Login          = lazy(() => import("./components/auth/Login"));
const Register       = lazy(() => import("./components/auth/Register"));
const Home           = lazy(() => import("./pages/public/Home"));
const Sold           = lazy(() => import("./pages/public/Sold"));
const Rent           = lazy(() => import("./pages/public/Rent"));
const VehicleDetail  = lazy(() => import("./pages/public/VehicleDetail"));
const Chat           = lazy(() => import("./pages/public/Chat"));
const MyReservations = lazy(() => import("./pages/public/MyReservations"));
const LegalNotice    = lazy(() => import("./pages/public/LegalNotice"));
const PrivacyPolicy  = lazy(() => import("./pages/public/PrivacyPolicy"));
const CookiePolicy   = lazy(() => import("./pages/public/CookiePolicy"));

const Dashboard        = lazy(() => import("./pages/admin/Dashboard"));
const VehicleList      = lazy(() => import("./pages/admin/VehicleList"));
const VehicleForm      = lazy(() => import("./pages/admin/VehicleForm"));
const UserManagement   = lazy(() => import("./pages/admin/UserManagement"));
const ColorManagement  = lazy(() => import("./pages/admin/ColorManagement"));
const ProvinceManagement = lazy(() => import("./pages/admin/ProvinceManagement"));
const ModelManagement  = lazy(() => import("./pages/admin/ModelManagement"));
const BrandManagement  = lazy(() => import("./pages/admin/BrandManagement"));
const AdminReservations = lazy(() => import("./pages/admin/AdminReservations"));
const NotFound         = lazy(() => import("./pages/public/NotFound"));

// Fallback minimalista que respeta el fondo oscuro de la app
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/venta" element={<Sold />} />
          <Route path="/alquiler" element={<Rent />} />

          <Route path="/vehiculo/:id" element={<VehicleDetail />} />
          <Route path="mis-chats" element={<Chat />} />
          <Route path="/mis-reservas" element={<MyReservations />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/aviso-legal" element={<LegalNotice />} />
          <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
          <Route path="/politica-cookies" element={<CookiePolicy />} />
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
          <Route path="/admin/colores" element={<ColorManagement />} />
          <Route path="/admin/ciudades" element={<ProvinceManagement />} />
          <Route path="/admin/marcas" element={<BrandManagement />} />
          <Route path="/admin/modelos" element={<ModelManagement />} />
          <Route path="/admin/reservas" element={<AdminReservations />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
