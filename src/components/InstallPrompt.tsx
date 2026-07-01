import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Delay showing the prompt so it's not instantly annoying
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-28 inset-x-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-full max-w-sm pointer-events-auto flex gap-4 items-start relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
              <Download className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-sm font-bold text-slate-800">
                Install Mushola Nur Hidayah
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tambahkan aplikasi ke layar beranda untuk akses offline dan
                lebih cepat.
              </p>

              <button
                onClick={handleInstallClick}
                className="mt-3 w-full py-2 bg-[#0F4C3A] text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
              >
                Install Sekarang
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
