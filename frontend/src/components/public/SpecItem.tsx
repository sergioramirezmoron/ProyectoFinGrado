interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

const SpecItem = ({ icon, label, value, color }: SpecItemProps) => {
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

      <div className="flex items-center gap-2.5">
        {color && (
          <span
            className="w-4 h-4 rounded-full shrink-0 shadow-sm ring-1 ring-slate-200 border border-white"
            style={{ backgroundColor: color }}
            title={String(value)}
          />
        )}
        <p className="text-slate-900 font-bold text-lg leading-none pt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
};

export default SpecItem;
