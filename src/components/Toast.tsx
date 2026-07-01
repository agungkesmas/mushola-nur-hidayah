import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Info, AlertTriangle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type: "success" | "info" | "warning" | "notification";
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const iconMap = {
            success: <Check className="w-5 h-5 text-emerald-600" />,
            info: <Info className="w-5 h-5 text-blue-600" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
            notification: (
              <Bell className="w-5 h-5 text-teal-600 animate-bounce" />
            ),
          };

          const bgMap = {
            success: "bg-emerald-50 border-emerald-200",
            info: "bg-blue-50 border-blue-200",
            warning: "bg-amber-50 border-amber-200",
            notification: "bg-teal-50 border-teal-200",
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl border shadow-lg flex gap-3 items-start pointer-events-auto ${bgMap[toast.type]}`}
            >
              <div className="p-1 rounded-lg bg-white/80 border border-black/5 flex-shrink-0">
                {iconMap[toast.type]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {toast.body}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
