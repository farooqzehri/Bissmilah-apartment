import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

export const AnnouncementBanner: React.FC = () => {
  const { settings, announcementDismissed, dismissAnnouncement } = useCMS();

  if (
    !settings ||
    !settings.behavior.announcementBanner.enabled ||
    !settings.behavior.announcementBanner.text ||
    announcementDismissed
  ) {
    return null;
  }

  const { text, actionText, actionUrl } = settings.behavior.announcementBanner;

  return (
    <div className="relative z-50 bg-gradient-to-r from-amber-600 via-[#FF9E4A] to-amber-700 text-black py-2 px-4 shadow-md text-xs font-display">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center">
          <Sparkles size={14} className="shrink-0 animate-pulse text-black" />
          <span className="font-medium tracking-wide">{text}</span>
          {actionText && (
            <a
              href={actionUrl || "#curation"}
              className="inline-flex items-center gap-1 font-bold underline hover:no-underline ml-1 cursor-pointer"
            >
              <span>{actionText}</span>
              <ArrowRight size={12} />
            </a>
          )}
        </div>
        <button
          onClick={dismissAnnouncement}
          className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer shrink-0"
          title="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
