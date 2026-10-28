import React from "react";
import { Compass, Landmark, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  isDarkMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, isDarkMode = false }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      id="footer-section"
      className={`pt-24 pb-12 border-t relative transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#090909] text-stone-300 border-stone-850" 
          : "bg-[#1A1A1A] text-[#F7F7F5] border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Top Branding Panel */}
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b items-start ${
          isDarkMode ? "border-stone-850" : "border-white/5"
        }`}>
          
          {/* Logo Frame */}
          <div className="md:col-span-4 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF9E4A] text-[#1A1A1A] flex items-center justify-center">
                <Landmark size={18} className="stroke-[1.5]" />
              </div>
              <div className="flex flex-col text-left">
                <span className={`font-display font-bold text-sm tracking-widest ${isDarkMode ? "text-white" : "text-[#F7F7F5]"}`}>
                  BISMILLAH
                </span>
                <span className="font-mono text-[9px] tracking-[0.25em] text-[#FF9E4A] leading-none">
                  REAL ESTATE
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 font-light leading-relaxed max-w-xs">
              The premier real estate agency and title curation collective in Quetta, Balochistan. Specializing in high-density premium apartments, exclusive walled estates, and secured land schemes.
            </p>

            <div className={`flex items-center gap-2 bg-white/5 border px-3.5 py-2 rounded-xl w-fit ${
              isDarkMode ? "border-stone-800 bg-stone-900" : "border-white/10"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9E4A] animate-pulse" />
              <span className="font-mono text-[10px] text-stone-300">Quetta Site Operations Active</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-2 space-y-4 text-left">
            <span className="font-mono text-[9px] tracking-widest text-stone-500 uppercase font-semibold">
              The Directory
            </span>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => onNavigate("home")}
                  className="text-xs text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer text-left block"
                >
                  Overview Intro
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("apartments")}
                  className="text-xs text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer text-left block"
                >
                  Premium Apartments
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("properties")}
                  className="text-xs text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer text-left block"
                >
                  Elite Land plots
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("about")}
                  className="text-xs text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer text-left block"
                >
                  Vision & Heritage
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("home-private-office")}
                  className="text-xs text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer text-left block"
                >
                  Private Bookings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("admin")}
                  className="text-xs text-[#FF9E4A] hover:text-white transition-colors cursor-pointer text-left block flex items-center gap-1.5"
                >
                  <span>Admin CRUD Console</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Core Leadership & Ownership */}
          <div className="md:col-span-3 space-y-4 text-left">
            <span className="font-mono text-[9px] tracking-widest text-stone-500 uppercase font-semibold">
              Principal Ownership
            </span>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className={`text-xs font-medium leading-normal ${isDarkMode ? "text-stone-200" : "text-[#F7F7F5]"}`}>
                  Haji Saud Zehri
                </span>
                <span className="font-mono text-[9px] text-[#FF9E4A] uppercase tracking-wider block mt-0.5">
                  Managing Director / Founder
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                Supervising complete client portfolio verification, estate zoning permits, and regional masterplanning since inception.
              </p>
            </div>
          </div>

          {/* High-Fidelity Office Details */}
          <div className="md:col-span-3 space-y-4 text-left">
            <span className="font-mono text-[9px] tracking-widest text-stone-500 uppercase font-semibold">
              Direct Channels
            </span>
            <ul className="space-y-3 font-mono text-[11px] text-stone-300 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin size={13} className="text-[#FF9E4A] mt-0.5 shrink-0" />
                <span className="leading-snug text-stone-400">
                  Block C, A-1 City,<br /> Main Double Road, Quetta
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={13} className="text-[#FF9E4A] shrink-0" />
                <a href="tel:+923337827725" className="hover:text-[#FF9E4A] transition-colors">
                  +92 333 7827725
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={13} className="text-[#FF9E4A] shrink-0" />
                <a href="mailto:info@bismillahsaud.com" className="hover:text-[#FF9E4A] transition-colors break-all">
                  info@bismillahsaud.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Panel */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-mono text-[10px] text-stone-500">
            <ShieldCheck size={12} className="text-[#FF9E4A]" />
            <span>Regulated Balochistan Development Code #QE-9002</span>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="font-mono text-[9px] text-stone-500 tracking-wide">
              © {currentYear} BISMILLAH REAL ESTATE PRIVATE CO. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[9px] text-stone-600 font-light">
              Designed under Swiss-style minimalist design mandates. Real estate investments are subject to regional property regulations.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
