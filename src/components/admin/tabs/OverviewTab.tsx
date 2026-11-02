import React from "react";
import { 
  Building2, Users, Image as ImageIcon, ShieldCheck, 
  ArrowUpRight, Plus, ExternalLink, Activity, CheckCircle2, Clock
} from "lucide-react";
import { AdminTab } from "../AdminSidebar";
import { Property, EnquiryLead, MediaItem, GlobalSettings } from "../../../types/cms";

interface OverviewTabProps {
  properties: Property[];
  enquiries: EnquiryLead[];
  media: MediaItem[];
  settings: GlobalSettings | null;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAddProperty: () => void;
  onOpenUploadMedia: () => void;
  isDarkMode: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  properties,
  enquiries,
  media,
  settings,
  onNavigateTab,
  onOpenAddProperty,
  onOpenUploadMedia,
  isDarkMode,
}) => {
  const activeListings = properties.filter((p) => p && p.published !== false).length;
  const newLeads = enquiries.filter((e) => e && e.status === "New").length;
  const verifiedRegistry = properties.filter((p) => p && typeof p.status === "string" && (p.status.includes("Registry") || p.status.includes("Verified"))).length;

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner / Welcome */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
        isDarkMode ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200 shadow-sm"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold">
                CMS BACKEND SYNCHRONIZED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-medium">
              Welcome, <span className="text-[#FF9E4A]">Haji Saud Zehri</span> Team
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
              Full administrative power to configure website branding, edit homepage sections, publish registry-backed properties, and manage incoming private bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddProperty}
              className="px-5 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>New Property</span>
            </button>
            <button
              onClick={onOpenUploadMedia}
              className={`px-5 py-2.5 rounded-full text-xs font-display uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
                isDarkMode 
                  ? "bg-stone-800 hover:bg-stone-700 text-white border-stone-700" 
                  : "bg-stone-100 hover:bg-stone-200 text-black border-stone-300"
              }`}
            >
              <ImageIcon size={14} />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab("properties")}
          className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
            isDarkMode ? "bg-[#181817] border-stone-800 hover:border-[#FF9E4A]" : "bg-white border-stone-200 hover:border-[#FF9E4A] shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400">
              ACTIVE PROPERTIES
            </span>
            <Building2 size={16} className="text-[#FF9E4A]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-light font-display">{properties.length}</span>
            <span className="text-[10px] font-mono text-emerald-500 font-semibold">{activeListings} Live</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab("leads")}
          className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
            isDarkMode ? "bg-[#181817] border-stone-800 hover:border-[#FF9E4A]" : "bg-white border-stone-200 hover:border-[#FF9E4A] shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400">
              INQUIRIES & LEADS
            </span>
            <Users size={16} className="text-[#FF9E4A]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-light font-display text-[#FF9E4A]">{enquiries.length}</span>
            {newLeads > 0 ? (
              <span className="text-[10px] font-mono text-rose-500 font-semibold animate-pulse">{newLeads} New</span>
            ) : (
              <span className="text-[10px] font-mono text-stone-400">All handled</span>
            )}
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab("media")}
          className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
            isDarkMode ? "bg-[#181817] border-stone-800 hover:border-[#FF9E4A]" : "bg-white border-stone-200 hover:border-[#FF9E4A] shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400">
              MEDIA ASSETS
            </span>
            <ImageIcon size={16} className="text-[#FF9E4A]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-light font-display">{media.length}</span>
            <span className="text-[10px] font-mono text-stone-400">Photos</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab("properties")}
          className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
            isDarkMode ? "bg-[#181817] border-stone-800 hover:border-[#FF9E4A]" : "bg-white border-stone-200 hover:border-[#FF9E4A] shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400">
              REGISTRY READY
            </span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-light font-display text-emerald-500">{verifiedRegistry}</span>
            <span className="text-[10px] font-mono text-stone-400">100% Deeds</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Leads + Quick CMS Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Latest Inquiries */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-medium text-base">Latest Private Bookings</h3>
              <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Clients requesting private consultations under Haji Saud Zehri desk.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("leads")}
              className="text-xs font-mono text-[#FF9E4A] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All ({enquiries.length})</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          {enquiries.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No leads registered yet.</p>
          ) : (
            <div className="space-y-3">
              {enquiries.slice(0, 4).map((enq) => (
                <div 
                  key={enq.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                    isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-[#F9F9F8] border-stone-200"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-medium text-xs truncate">
                        {enq.clientName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold ${
                        enq.status === "New" 
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                          : enq.status === "In Review"
                          ? "bg-[#FF9E4A]/10 text-[#FF9E4A] border border-[#FF9E4A]/30"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                      }`}>
                        {enq.status}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-stone-400 block mt-0.5 truncate">
                      {enq.phone} • {enq.propertyInterest}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 shrink-0">
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Settings & Section Status */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border space-y-5 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div>
            <h3 className="font-display font-medium text-base">Public Website Status</h3>
            <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
              Active modules and global behavior toggles.
            </p>
          </div>

          <div className="space-y-3 text-xs font-display">
            <div className="flex items-center justify-between pb-2 border-b dark:border-stone-800 border-stone-200">
              <span className="text-stone-400">Maintenance Mode</span>
              <span className={`font-mono text-[11px] font-semibold ${settings?.behavior.maintenanceMode ? "text-rose-500" : "text-emerald-500"}`}>
                {settings?.behavior.maintenanceMode ? "ENABLED (Public Blocked)" : "Live (Normal Traffic)"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b dark:border-stone-800 border-stone-200">
              <span className="text-stone-400">Announcement Banner</span>
              <span className={`font-mono text-[11px] font-semibold ${settings?.behavior.announcementBanner.enabled ? "text-emerald-500" : "text-stone-400"}`}>
                {settings?.behavior.announcementBanner.enabled ? "Active on Top" : "Hidden"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b dark:border-stone-800 border-stone-200">
              <span className="text-stone-400">Floating WhatsApp Button</span>
              <span className="font-mono text-[11px] text-emerald-500 font-semibold">
                {settings?.behavior.enableWhatsAppFloating ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-400">Office Contact</span>
              <span className="font-mono text-[11px] text-[#FF9E4A] truncate max-w-[160px]">
                {settings?.contact.primaryPhone || "+92 333 786 1928"}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("settings")}
            className="w-full py-2.5 rounded-xl border text-xs font-display uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FF9E4A] hover:text-black hover:border-[#FF9E4A] transition-all cursor-pointer"
          >
            <span>Edit Global Settings</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
