import { useEffect, useState } from "react";

export default function Toast({ id, title, message, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  if (!isVisible) return null;

  const isApproved = title.includes("Approved");
  const isRejected = title.includes("Rejected");

  return (
    <div
      className={`fixed right-4 top-4 z-50 rounded-xl p-4 shadow-lg transition-opacity duration-300 ${
        isApproved
          ? "bg-green-500 text-white"
          : isRejected
            ? "bg-red-500 text-white"
            : "bg-blue-500 text-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {isApproved && <span className="text-xl">✓</span>}
          {isRejected && <span className="text-xl">✗</span>}
          {!isApproved && !isRejected && <span className="text-xl">ℹ</span>}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose(id);
          }}
          className="text-xl hover:opacity-80"
        >
          ×
        </button>
      </div>
    </div>
  );
}
