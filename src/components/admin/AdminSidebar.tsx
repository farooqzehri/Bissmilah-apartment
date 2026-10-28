import React from "react";
import { 
  LayoutDashboard, Settings, Layers, Building2, Image as ImageIcon, 
  FileText, Users, ShieldAlert, ArrowLeft, ExternalLink, LogOut, Sparkles
} from "lucide-react";

export type AdminTab = 
  | "overview" 
  | "settings" 
  | "homepage" 
  | "properties" 
  | "media" 
  | "pages" 
  | "leads" 
  | "audit";

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  unseenLeadsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  onLogout,
  isDarkMode,
  unseenLeadsCount = 0,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "settings", label: "Global Settings", icon: Settings },
    { id: "homepage", label: "Homepage CMS", icon: Layers },
    { id: "properties", label: "Properties & Flats", icon: Building2 },
    { id: "media", label: "Media Library", icon: ImageIcon },
    { id: "pages", label: "Pages & Content", icon: FileText },
    { id: "leads", label: "Booking Leads", icon: Users, badge: unseenLeadsCount },
    { id: "audit", label: "Security & Audit", icon: ShieldAlert },
  ];

  return (
    <aside className={`w-full lg:w-64 shrink-0 rounded-3xl border p-4 sm:p-5 flex flex-col justify-between transition-colors ${
      isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
    }`}>
      <div className="space-y-6">
        {/* Back Link */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Exit to Public Site</span>
        </button>

        {/* Brand Banner */}
        <div className="border-b pb-4 dark:border-stone-800 border-stone-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold">
              ADMIN CMS CONTROL
            </span>
          </div>
          <h2 className="text-base font-display font-medium mt-1">
            Haji Saud Zehri
          </h2>
          <span className="text-[11px] text-stone-400 font-mono block">
            Bismillah Real Estate
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-display tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FF9E4A] text-black font-semibold shadow-md"
                    : isDarkMode
                    ? "text-stone-300 hover:bg-stone-900 hover:text-white"
                    : "text-stone-700 hover:bg-stone-100 hover:text-black"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-black" : "text-[#FF9E4A]"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? "bg-black text-[#FF9E4A]" : "bg-[#FF9E4A] text-black"
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 mt-6 border-t dark:border-stone-800 border-stone-200 space-y-2">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display transition-colors cursor-pointer text-rose-500 hover:bg-rose-500/10`}
        >
          <LogOut size={14} />
          <span>Lock Admin Session</span>
        </button>
      </div>
    </aside>
  );
};
