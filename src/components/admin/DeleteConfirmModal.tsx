import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { PropertyItem } from "../../types/property";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  property: PropertyItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  property,
  onClose,
  onConfirm,
  isDarkMode,
}) => {
  if (!isOpen || !property) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative ${
            isDarkMode ? "bg-[#181817] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full cursor-pointer transition-colors ${
              isDarkMode ? "hover:bg-stone-800 text-stone-400 hover:text-white" : "hover:bg-stone-100 text-stone-500 hover:text-black"
            }`}
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1.5 text-left">
              <h3 className="font-display font-medium text-lg leading-snug">
                Delete Listing?
              </h3>
              <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                Are you sure you want to permanently remove <strong className="font-semibold text-[#FF9E4A]">"{property.title}"</strong> from the Bismillah Real Estate directory?
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-full text-xs font-display uppercase tracking-wider transition-colors cursor-pointer border ${
                isDarkMode ? "border-stone-800 hover:bg-stone-800 text-stone-300" : "border-stone-200 hover:bg-stone-100 text-stone-700"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash2 size={13} />
              <span>Confirm Delete</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
