import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex text-slate-800">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-2">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer">
            Dashboard
          </div>
          <div className="p-3 hover:bg-gray-50 text-gray-600 rounded-lg font-medium cursor-pointer">
            Gestión Flota
          </div>
          <div className="p-3 hover:bg-gray-50 text-gray-600 rounded-lg font-medium cursor-pointer">
            Chats Clientes
          </div>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;