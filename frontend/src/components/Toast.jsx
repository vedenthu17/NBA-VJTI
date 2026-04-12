import { useEffect, useState } from "react";

export default function Toast({ id, title, message, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const isRejected = title.includes("Rejected");

  useEffect(() => {
    if (isRejected) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration, isRejected]);

  if (!isVisible) return null;

  const isApproved = title.includes("Approved");

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-xl p-4 shadow-lg transition-opacity duration-300 ${
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
