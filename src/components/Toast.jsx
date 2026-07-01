import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, opts = {}) => {
    const id = ++idRef.current;
    const toast = { id, message, type: opts.type || 'success', icon: opts.icon || null };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), opts.duration || 3200);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-white border-l-4 border-green-600 rounded-xl shadow-2xl px-4 py-3 animate-[slideIn_0.25s_ease-out]"
          >
            <span className="text-2xl leading-none flex-shrink-0">{t.icon || <CheckCircle2 className="w-6 h-6 text-green-600" />}</span>
            <p className="text-sm text-gray-800 font-medium flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
