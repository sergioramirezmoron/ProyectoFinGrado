interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

const SpecItem = ({
  icon,
  label,
  value,
  color,
}: SpecItemProps & { color?: string }) => {
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
      {color && (
        <span
          className="w-3 h-3 rounded-full border border-gray-300 shadow-sm shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <p className="text-slate-900 font-bold text-lg">{value}</p>
    </div>
  );
};
export default SpecItem;
