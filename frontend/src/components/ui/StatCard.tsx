import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-transform hover:scale-105 duration-200">
    <div className={`p-3 rounded-full ${color} text-white shadow-md`}>
      <Icon size={20} />
    </div>
    <div className="text-center">
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <h3 className="text-xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default StatCard;