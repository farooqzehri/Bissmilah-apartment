import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, KeyRound, ArrowRight, X, RefreshCw } from "lucide-react";
import { cmsAuth } from "../../utils/cmsApi";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode: boolean;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDarkMode,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const passcode = pin.trim();
    if (!passcode) {
      setError("Please enter your configured staff passcode.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await cmsAuth.login(passcode);
      if (res?.token) {
        localStorage.setItem("bismillah_current_page", "admin");
        window.location.hash = "admin";
        onSuccess();
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative text-left ${
            isDarkMode ? "bg-[#181817] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full cursor-pointer transition-colors ${
              isDarkMode ? "hover:bg-stone-800 text-stone-400 hover:text-white" : "hover:bg-stone-100 text-stone-500 hover:text-black"
            }`}
          >
            <X size={18} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#FF9E4A]/10 text-[#FF9E4A] flex items-center justify-center border border-[#FF9E4A]/20 mb-4">
            <Lock size={22} />
          </div>

          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block mb-1">
            MANAGEMENT CONSOLE
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            Haji Saud Zehri Staff Login
          </h2>
          <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
            Enter the staff passcode configured by your site administrator to access the property management CMS.
          </p>

          {/* Form container using div to completely prevent native browser reload */}
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider block text-stone-400">
                Staff Security Passcode
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  placeholder="Enter your passcode"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleVerify(e);
                    }
                  }}
                  autoFocus
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono tracking-widest border focus:outline-none focus:border-[#FF9E4A] ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>
              {error && <p className="text-xs text-rose-500 font-mono mt-1">{error}</p>}
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full py-3 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <span>Unlock Admin Panel</span>}
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
