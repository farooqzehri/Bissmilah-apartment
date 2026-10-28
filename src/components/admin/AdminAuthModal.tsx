import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, KeyRound, ArrowRight, X, Sparkles, RefreshCw } from "lucide-react";
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

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tokenInput = pin.trim();
    if (!tokenInput) {
      setError("Please enter staff authorization PIN (e.g. 786).");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await cmsAuth.login(tokenInput);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid staff passcode. Try '786' or 1-Click access below.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setIsLoading(true);
    setError("");
    try {
      await cmsAuth.login("786", "Haji Saud Staff");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
          className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative text-left ${
            isDarkMode ? "bg-[#181817] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}
        >
          <button
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
            Enter staff passcode to unlock full website content and property management CMS.
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider block text-stone-400">
                Staff Security PIN (Default: 786)
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  placeholder="Enter 786"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
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
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <span>Unlock Admin Panel</span>}
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-5 pt-4 border-t border-stone-200/50 dark:border-stone-800/80">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              disabled={isLoading}
              className={`w-full py-2.5 rounded-full text-xs font-display flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isDarkMode 
                  ? "border-stone-800 hover:bg-stone-900 text-stone-300 hover:text-white" 
                  : "border-stone-200 hover:bg-stone-50 text-stone-700 hover:text-black"
              }`}
            >
              <Sparkles size={13} className="text-[#FF9E4A]" />
              <span>Instant 1-Click Staff Access (Demo)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
