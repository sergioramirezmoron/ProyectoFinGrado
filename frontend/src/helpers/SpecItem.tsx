interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const SpecItem = ({ icon, label, value }: SpecItemProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full stroke-2">
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-slate-900 font-bold text-lg">{value}</p>
    </div>
  );
};
export default SpecItem;
