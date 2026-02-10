import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div
    className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${
      type === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-red-50 border-red-200 text-red-800"
    }`}
  >
    {type === "success" ? (
      <CheckCircle2 size={20} />
    ) : (
      <AlertTriangle size={20} />
    )}
    <p className="text-sm font-medium pr-4">{message}</p>
    <button
      onClick={onClose}
      className="hover:bg-black/5 p-1 rounded-full transition-colors"
    >
      <X size={16} />
    </button>
  </div>
);

export default Toast;