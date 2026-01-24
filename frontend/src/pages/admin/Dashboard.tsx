import { Car, DollarSign, Users, ShoppingBag } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-full ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
        <p className="text-gray-500">Bienvenido de nuevo al sistema de gestión.</p>
      </div>

      {/* Grid de Estadísticas (Datos falsos por ahora) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Coches en Venta" value="12" icon={Car} color="bg-blue-500" />
        <StatCard title="Alquilados hoy" value="4" icon={ShoppingBag} color="bg-purple-500" />
        <StatCard title="Ingresos Mes" value="45.200 €" icon={DollarSign} color="bg-green-500" />
        <StatCard title="Clientes Activos" value="89" icon={Users} color="bg-orange-500" />
      </div>

      {/* Aquí pondremos la tabla de últimos movimientos luego */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
        Gráfica de Ventas (Próximamente)
      </div>
    </div>
  );
};

export default Dashboard;