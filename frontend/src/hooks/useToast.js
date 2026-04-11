import { useRef, useState } from "react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);

  const addToast = (title, message, duration = 5000) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, title, message, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    container: toasts.map((toast) => (
      <div key={toast.id}>
        {/* Toast will be rendered in AppLayout */}
      </div>
    )),
    toasts,
    addToast,
    removeToast,
  };
}

export const useToast = () => {
  return (window.toastManager = window.toastManager || {});
};
