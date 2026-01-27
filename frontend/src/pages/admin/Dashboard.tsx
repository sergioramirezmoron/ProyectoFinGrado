import { Car, DollarSign, Users, ShoppingBag } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

const Dashboard = () => {
  // Estos datos vendrán de tu API (Symfony) en el futuro
  const stats = [
    { title: "Coches en Venta", value: "12", icon: Car, color: "bg-blue-500" },
    { title: "Alquilados hoy", value: "4", icon: ShoppingBag, color: "bg-purple-500" },
    { title: "Ingresos Mes", value: "45.200 €", icon: DollarSign, color: "bg-green-500" },
    { title: "Clientes Activos", value: "89", icon: Users, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
        <p className="text-gray-500">Bienvenido de nuevo al sistema de gestión.</p>
      </div>

      {/* Grid de Estadísticas (Generado dinámicamente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Placeholder para la gráfica */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
        Gráfica de Ventas (Próximamente)
      </div>
    </div>
  );
};

export default Dashboard;