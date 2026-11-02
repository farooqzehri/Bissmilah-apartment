import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, ArrowRight, Menu, X, Landmark, Sun, Moon, ShieldCheck, Lock, Sparkles } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface NavbarProps {
  onNavigate: (pageId: string) => void;
  activeSection: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  activeSection, 
  isDarkMode, 
  toggleDarkMode,
  onOpenAdmin
}) => {
  const { settings } = useCMS();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Apartments", id: "apartments" },
    { label: "Properties", id: "properties" },
    { label: "About Us", id: "about" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 1 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? "py-2.5 px-3 sm:px-6 md:px-8" 
            : "py-4 sm:py-6 px-3 sm:px-6 md:px-8"
        }`}
      >
        <div 
          id="navbar-container"
          className={`max-w-7xl mx-auto flex items-center justify-between rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-500 border ${
            isScrolled
              ? isDarkMode
                ? "bg-[#111110]/85 backdrop-blur-md border-stone-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                : "bg-[#F7F7F5]/85 backdrop-blur-md border-[#E2E8F0]/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
              : isDarkMode
                ? "bg-[#111110]/50 backdrop-blur-sm border-stone-800/40"
                : "bg-white/40 backdrop-blur-sm border-white/40"
          }`}
        >
          {/* Brand Logo & Typography */}
          <div 
            id="navbar-brand"
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
            onClick={() => onNavigate("home")}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              isDarkMode 
                ? "bg-[#DF9B43] text-[#0D0D0C]" 
                : "bg-[#141413] text-white group-hover:bg-[#DF9B43] group-hover:text-black"
            }`}>
              <Landmark size={17} className="stroke-[1.5]" />
            </div>
            <div className="flex flex-col text-left">
              <span className={`font-display font-bold text-xs sm:text-sm tracking-widest leading-none ${
                isDarkMode ? "text-white" : "text-[#141413]"
              }`}>
                {settings?.branding.websiteName?.split(" ")[0] || "BISMILLAH"}
              </span>
              <span className={`font-mono text-[8px] sm:text-[9px] tracking-[0.25em] leading-none mt-1 ${
                isDarkMode ? "text-[#DF9B43]" : "text-stone-500"
              }`}>
                ESTATE COLLECTIVE
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`font-display text-xs tracking-widest uppercase transition-colors duration-300 relative py-1 cursor-pointer ${
                    isActive
                      ? isDarkMode ? "text-[#DF9B43] font-semibold" : "text-[#141413] font-semibold"
                      : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-black"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#DF9B43]"
                      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Admin CMS link */}
            <button
              onClick={onOpenAdmin}
              className={`font-display text-xs tracking-widest uppercase transition-colors duration-300 relative py-1 flex items-center gap-1.5 cursor-pointer ${
                activeSection === "admin"
                  ? "text-[#DF9B43] font-semibold"
                  : isDarkMode ? "text-stone-400 hover:text-[#DF9B43]" : "text-stone-600 hover:text-[#DF9B43]"
              }`}
            >
              <Lock size={12} className="text-[#DF9B43]" />
              <span>Admin CMS</span>
              {activeSection === "admin" && (
                <motion.span
                  layoutId="navUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#DF9B43]"
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
                />
              )}
            </button>
          </nav>

          {/* Signature Action Badges */}
          <div id="navbar-actions" className="hidden lg:flex items-center gap-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-[#181816] text-[#DF9B43] border-stone-800 hover:text-white"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
              }`}
              title={isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
            >
              {isDarkMode ? <Sun size={14} className="stroke-[1.5]" /> : <Moon size={14} className="stroke-[1.5]" />}
            </button>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-[10px] ${
              isDarkMode 
                ? "bg-stone-900 border-stone-800 text-stone-300" 
                : "bg-white/80 border-stone-200 text-stone-700"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% REGISTRY READY</span>
            </div>
            
            <button
              onClick={() => onNavigate("home-private-office")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-display text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer bg-[#DF9B43] hover:bg-[#c88532] text-black shadow-md hover:shadow-lg"
            >
              <span>Private Showing</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Mobile and Tablet Right Bar */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick Admin Access Button */}
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                activeSection === "admin"
                  ? "bg-[#FF9E4A] text-black border-[#FF9E4A]"
                  : isDarkMode
                  ? "bg-stone-900 text-stone-300 border-stone-800"
                  : "bg-white text-stone-700 border-stone-200"
              }`}
              title="Admin CMS"
            >
              <Lock size={14} />
            </button>

            {/* Quick Dark Toggle for Mobile/Tablet */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                isDarkMode 
                  ? "bg-stone-900 text-[#FF9E4A] border-stone-800" 
                  : "bg-white text-stone-700 border-stone-200"
              }`}
              title={isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Mobile/Tablet Navigation Trigger */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full border cursor-pointer ${
                isDarkMode 
                  ? "bg-stone-950 border-stone-800 text-white" 
                  : "bg-white border-[#E2E8F0] text-[#1A1A1A]"
              }`}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Floating Mobile/Tablet Glassmorphic Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className={`fixed inset-x-0 top-[72px] sm:top-[76px] z-40 mx-3 sm:mx-4 lg:hidden rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 border ${
              isDarkMode 
                ? "bg-[#111110]/95 backdrop-blur-xl border-stone-800 text-white" 
                : "bg-[#F7F7F5]/95 backdrop-blur-xl border-[#E2E8F0] text-[#1A1A1A]"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDarkMode ? "border-stone-800" : "border-[#E2E8F0]/60"
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#FF9E4A]" />
                <span className="font-mono text-[10px]">A-1 City, Quetta, Balochistan</span>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#FF9E4A] text-black font-semibold">
                Haji Saud Zehri
              </span>
            </div>

            <div id="mobile-menu-links" className="flex flex-col gap-3 text-left">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(link.id);
                  }}
                  className={`font-display text-base font-light py-2 border-b flex items-center justify-between cursor-pointer ${
                    activeSection === link.id ? "text-[#FF9E4A] font-medium" : ""
                  } ${isDarkMode ? "border-stone-800/80" : "border-[#E2E8F0]/40"}`}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={14} className="text-[#FF9E4A] opacity-70" />
                </button>
              ))}

              {/* Admin Portal in Mobile Menu */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className={`font-display text-base font-light py-2 border-b flex items-center justify-between cursor-pointer ${
                  activeSection === "admin" ? "text-[#FF9E4A] font-medium" : ""
                } ${isDarkMode ? "border-stone-800/80" : "border-[#E2E8F0]/40"}`}
              >
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-[#FF9E4A]" />
                  <span>Admin CRUD Console</span>
                </div>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-[#FF9E4A]/20 text-[#FF9E4A] font-semibold border border-[#FF9E4A]/30">
                  Staff
                </span>
              </button>
            </div>

            {/* Mobile/Tablet Dark Mode Switch */}
            <div className={`flex items-center justify-between py-2 border-t border-b ${
              isDarkMode ? "border-stone-800" : "border-[#E2E8F0]/60"
            }`}>
              <div className="flex flex-col text-left">
                <span className={`font-mono text-[9px] uppercase tracking-wider ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/60"}`}>
                  Visual Appearance
                </span>
                <span className={`font-display font-medium text-xs ${isDarkMode ? "text-stone-200" : "text-[#1A1A1A]"}`}>
                  {isDarkMode ? "Dark Mode: Cozy & Sleek" : "Light Mode: Airy & Royal"}
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`py-1.5 px-3 rounded-full border text-xs font-display flex items-center gap-2 transition-all cursor-pointer ${
                  isDarkMode 
                    ? "bg-[#1A1A1A] text-[#FF9E4A] border-stone-800" 
                    : "bg-white text-stone-700 border-stone-200"
                }`}
              >
                {isDarkMode ? (
                  <>
                    <Sun size={12} className="text-[#FF9E4A]" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={12} className="text-stone-700" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>

            <div id="mobile-menu-cta" className="flex flex-col gap-2.5 mt-1">
              <a
                href="tel:+923337827725"
                className={`w-full py-2.5 rounded-full text-center font-display text-xs tracking-wider uppercase font-light flex items-center justify-center gap-2 shadow-sm border ${
                  isDarkMode 
                    ? "bg-[#1A1A1A] border-stone-800 text-stone-300" 
                    : "bg-white border-[#E2E8F0] text-[#1A1A1A]"
                }`}
              >
                <Phone size={12} className="text-[#FF9E4A]" />
                <span>Call Advisor (+92 333 7827725)</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("home-private-office");
                }}
                className="w-full py-2.5 rounded-full bg-[#FF9E4A] hover:bg-[#ff8e30] text-black text-center font-display text-xs tracking-wider uppercase font-semibold cursor-pointer shadow-md"
              >
                Schedule Private Meeting
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
