import React from "react";
import { Lock, Phone, MessageSquare, AlertTriangle } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface MaintenanceOverlayProps {
  onOpenAdmin: () => void;
  isDarkMode: boolean;
  isAdminAuthenticated?: boolean;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
  onOpenAdmin,
  isDarkMode,
  isAdminAuthenticated = false,
}) => {
  const { settings } = useCMS();

  // If maintenance mode is off OR admin is authenticated, do not show maintenance overlay
  if (!settings || !settings.behavior.maintenanceMode || isAdminAuthenticated) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors ${
      isDarkMode ? "bg-[#111110] text-white" : "bg-[#F7F7F5] text-stone-900"
    }`}>
      <div className={`max-w-lg w-full p-8 rounded-3xl border text-center space-y-6 shadow-2xl relative ${
        isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"
      }`}>
        <div className="w-16 h-16 rounded-3xl bg-[#FF9E4A]/10 text-[#FF9E4A] flex items-center justify-center mx-auto border border-[#FF9E4A]/20">
          <AlertTriangle size={28} />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            SCHEDULED MAINTENANCE
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium">
            Bismillah Real Estate
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
            {settings.behavior.maintenanceMessage}
          </p>
        </div>

        {/* Direct Contact Points */}
        <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-2 text-xs">
          <div className="flex items-center justify-center gap-2 text-stone-300">
            <Phone size={14} className="text-[#FF9E4A]" />
            <span className="font-mono">{settings.contact.primaryPhone}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-stone-300">
            <MessageSquare size={14} className="text-emerald-500" />
            <span className="font-mono">{settings.contact.whatsappNumber}</span>
          </div>
        </div>

        {/* Staff Access Gate */}
        <div className="pt-2">
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer"
          >
            <Lock size={12} />
            <span>Staff Portal Access</span>
          </button>
        </div>
      </div>
    </div>
  );
};
