import React from "react";
import { MessageSquare } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

export const WhatsAppButton: React.FC = () => {
  const { settings } = useCMS();

  if (!settings || !settings.behavior.enableWhatsAppFloating) {
    return null;
  }

  const phone = settings.contact.whatsappNumber || "+923337861928";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const defaultMsg = encodeURIComponent(
    `Assalamu Alaikum Haji Saud Zehri Sahab, I am contacting you through the Bismillah Real Estate website regarding luxury properties and verified plots in Quetta.`
  );

  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${defaultMsg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group select-none"
      title="Direct WhatsApp Chat with Haji Saud Zehri Office"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <MessageSquare size={20} className="fill-white stroke-none" />
      </div>
      <span className="text-xs font-display font-semibold tracking-wide hidden sm:inline">
        WhatsApp Desk
      </span>
      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
    </a>
  );
};
