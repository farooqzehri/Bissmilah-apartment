import React, { useState } from "react";
import { motion } from "motion/react";
import { Hero3D } from "../ui/Hero3D";
import { ArrowDown, ArrowUpRight, Compass, ShieldCheck, Sparkles, Trophy, MapPin, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface HeroProps {
  onExploreClick: () => void;
  onBookingClick: () => void;
  isDarkMode: boolean;
  onSelectCategory?: (category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onExploreClick, 
  onBookingClick, 
  isDarkMode,
  onSelectCategory 
}) => {
  const { homepage, settings } = useCMS();
  const heroData = homepage?.hero;

  const [selectedTypology, setSelectedTypology] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSelectCategory && selectedTypology !== "all") {
      onSelectCategory(selectedTypology);
    }
    onExploreClick();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: [0.16, 1, 0.3, 1], duration: 1.1 },
    },
  };

  return (
    <section 
      id="hero-section"
      className={`relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between overflow-hidden pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 selection:bg-[#DF9B43]/30 transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#0D0D0C] text-[#F7F6F2]" 
          : "bg-[#FAF8F5] text-[#141413]"
      }`}
    >
      {/* 3D Architectural wireframe canvas in background */}
      <Hero3D />

      {/* Sunlit California Coastal Gradient Aura */}
      <div 
        aria-hidden="true" 
        className={`absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] pointer-events-none -z-10 transition-opacity duration-700 ${
          isDarkMode 
            ? "bg-gradient-to-bl from-[#DF9B43]/12 via-[#DF9B43]/5 to-transparent opacity-80" 
            : "bg-gradient-to-bl from-[#E5A95B]/25 via-[#F3E5D0]/40 to-transparent opacity-90"
        }`} 
      />

      <div className="max-w-7xl mx-auto w-full relative z-10 my-auto">
        {/* Main Grid: Left Grand Editorial Title & Right Architectural Glass Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: California Architectural Headline */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col text-left items-start"
          >
            {/* Editorial Kicker - Anti-Pill, Typographic Spacing */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 text-[10px] sm:text-[11px] font-mono tracking-[0.28em] uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-[#DF9B43] shadow-[0_0_12px_#DF9B43] animate-pulse" />
              <span className="text-[#DF9B43] font-semibold">
                {heroData?.subheadingBadge || "CALIFORNIA MODERN ARCHITECTURE"}
              </span>
              <span aria-hidden="true" className={isDarkMode ? "text-stone-700" : "text-stone-300"}>/</span>
              <span className={`tracking-[0.2em] ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                QUETTA, BALOCHISTAN
              </span>
            </motion.div>

            {/* Grand Architectural Headline */}
            <motion.h1 
              variants={itemVariants}
              className={`text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-light tracking-[-0.04em] leading-[0.98] mb-6 sm:mb-8 ${
                isDarkMode ? "text-white" : "text-[#141413]"
              }`}
            >
              {heroData?.headingLine1 || "Curated Living."}
              <br />
              <span className="font-serif italic font-normal text-[#DF9B43]">
                {heroData?.headingLine2 || "Secured Legacy."}
              </span>
            </motion.h1>

            {/* Editorial Subtitle */}
            <motion.p 
              variants={itemVariants}
              className={`max-w-xl text-sm sm:text-base md:text-lg leading-relaxed font-light mb-8 sm:mb-10 ${
                isDarkMode ? "text-stone-300/90" : "text-stone-700"
              }`}
            >
              {heroData?.description || "Led by Haji Saud Zehri. Specializing in high-density duplex penthouses, private walled estates, and prime commercial plots — delivered with 100% verified Balochistan Land Revenue mutation and uninterrupted solar utilities."}
            </motion.p>

            {/* Action Buttons & Trust Signature */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto"
            >
              <button
                onClick={onExploreClick}
                className="px-8 py-4 rounded-full text-xs sm:text-sm font-display tracking-widest uppercase font-semibold bg-[#DF9B43] hover:bg-[#c88532] text-black shadow-[0_10px_30px_rgba(223,155,67,0.25)] flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer hover:translate-y-[-1px]"
              >
                <span>{heroData?.primaryButtonText || "Explore Portfolio"}</span>
                <ArrowDown size={15} />
              </button>

              <button
                onClick={onBookingClick}
                className={`px-8 py-4 rounded-full text-xs sm:text-sm font-display tracking-widest uppercase font-medium border transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer ${
                  isDarkMode 
                    ? "border-white/20 text-white hover:bg-white hover:text-black" 
                    : "border-stone-300 text-stone-800 hover:bg-[#141413] hover:text-white"
                }`}
              >
                <span>{heroData?.secondaryButtonText || "Private Showing"}</span>
                <ArrowUpRight size={15} />
              </button>
            </motion.div>

            {/* Clean Unboxed Metadata Badges */}
            <motion.div
              variants={itemVariants}
              className={`mt-8 sm:mt-10 flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase ${
                isDarkMode ? "text-stone-400" : "text-stone-500"
              }`}
            >
              <span className="flex items-center gap-1.5 text-[#DF9B43]">
                <CheckCircle2 size={13} /> 100% Mutation Ready
              </span>
              <span aria-hidden="true">·</span>
              <span>24/7 Solar Microgrid</span>
              <span aria-hidden="true">·</span>
              <span>Sweet Tube Well Aquifers</span>
              <span aria-hidden="true">·</span>
              <span>Gated Biometric Society</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Architectural Hero Dossier Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.3, delay: 0.35 }}
            className="lg:col-span-5 relative"
          >
            {/* The Main Hero Architectural Image Card */}
            <div className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-all duration-500 ${
              isDarkMode 
                ? "bg-[#161614]/85 border-white/[0.09] shadow-[0_20px_60px_rgba(0,0,0,0.6)]" 
                : "bg-white/85 border-stone-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
            }`}>
              
              {/* Image Frame with Aspect Ratio 16:11 */}
              <div className="relative aspect-[16/11] overflow-hidden bg-stone-900">
                <img
                  src={heroData?.backgroundImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                  alt="California Style Luxury Residence"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                />
                
                {/* Subtle Ambient Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Top Corner Architectural Tag */}
                <div className="absolute top-4 left-4 backdrop-blur-md px-3.5 py-1.5 rounded-full bg-black/60 border border-white/20 text-white font-mono text-[9px] uppercase tracking-widest">
                  Featured Landmark · 2026
                </div>

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-4 left-4 right-4 text-left text-white">
                  <span className="text-[10px] font-mono tracking-widest text-[#DF9B43] uppercase block mb-0.5">
                    HAJI SAUD ZEHRI SELECTION
                  </span>
                  <h3 className="text-lg sm:text-xl font-display font-medium tracking-tight">
                    The Zehri Heights Duplex Penthouse
                  </h3>
                  <p className="text-xs text-stone-300 font-light mt-0.5 flex items-center gap-2">
                    <span>A-1 City, Block C, Quetta</span>
                    <span>·</span>
                    <span className="text-[#DF9B43] font-medium">PKR 3.4 Crore</span>
                  </p>
                </div>
              </div>

              {/* Lower Spec & Certified Status Strip */}
              <div className={`p-5 sm:p-6 text-left border-t ${
                isDarkMode ? "border-stone-800 bg-[#121210]/95" : "border-stone-200/60 bg-[#FAF8F5]/90"
              }`}>
                <div className="grid grid-cols-3 gap-3 divide-x dark:divide-stone-800 divide-stone-200">
                  <div className="pr-2">
                    <span className={`block font-mono text-[9px] uppercase tracking-wider ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                      COVERED AREA
                    </span>
                    <span className="font-display font-semibold text-sm sm:text-base mt-0.5 block">
                      4,200 <span className="text-xs font-light">Sq Ft</span>
                    </span>
                  </div>

                  <div className="px-3">
                    <span className={`block font-mono text-[9px] uppercase tracking-wider ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                      HORIZON
                    </span>
                    <span className="font-display font-semibold text-sm sm:text-base mt-0.5 block truncate">
                      Murdar Range
                    </span>
                  </div>

                  <div className="pl-3">
                    <span className={`block font-mono text-[9px] uppercase tracking-wider ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                      REGISTRY
                    </span>
                    <span className="font-display font-semibold text-xs sm:text-sm mt-0.5 block text-emerald-500 truncate">
                      100% Mutation
                    </span>
                  </div>
                </div>

                {/* Direct Walkthrough Trigger */}
                <div className="mt-4 pt-3.5 border-t dark:border-stone-800/80 border-stone-200 flex items-center justify-between">
                  <span className={`text-xs font-light ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                    Title deeds filed at Revenue Directorate
                  </span>
                  <button
                    onClick={onBookingClick}
                    className="text-xs font-display tracking-wider uppercase font-semibold text-[#DF9B43] hover:text-[#c88532] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Inspect File</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative Subtle Stamp Badge Floating in Corner */}
            <div className={`absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 backdrop-blur-xl p-3.5 rounded-2xl border shadow-xl flex items-center gap-3 text-left ${
              isDarkMode 
                ? "bg-[#181816]/90 border-stone-700/60 text-white" 
                : "bg-white/95 border-stone-200/80 text-stone-900"
            }`}>
              <div className="w-9 h-9 rounded-full bg-[#DF9B43]/15 border border-[#DF9B43]/30 flex items-center justify-center text-[#DF9B43]">
                <ShieldCheck size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#DF9B43] font-bold">
                  HAJI SAUD ZEHRI
                </span>
                <span className="font-display font-semibold text-xs">
                  Direct Mutation Handover
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* California Real Estate Concierge Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.1, delay: 0.5 }}
          className="mt-12 sm:mt-16 w-full"
        >
          <form
            onSubmit={handleQuickSearch}
            className={`p-3 sm:p-4 rounded-3xl border backdrop-blur-xl shadow-xl transition-all duration-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center ${
              isDarkMode 
                ? "bg-[#161614]/80 border-white/[0.08]" 
                : "bg-white/90 border-stone-200/80"
            }`}
          >
            {/* Field 1: Property Typology */}
            <div className="lg:col-span-4 px-3 sm:px-4 py-2 text-left flex flex-col">
              <label className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Property Typology
              </label>
              <select
                value={selectedTypology}
                onChange={(e) => setSelectedTypology(e.target.value)}
                className={`bg-transparent font-display text-xs sm:text-sm font-medium mt-1 focus:outline-none cursor-pointer ${
                  isDarkMode ? "text-white" : "text-stone-900"
                }`}
              >
                <option value="all" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  All Architectural Holdings
                </option>
                <option value="apartments" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  Luxury Penthouses & Apartments
                </option>
                <option value="estates" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  Private Walled Estates & Haveli
                </option>
                <option value="commercial" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  Double Road Commercial Frontages
                </option>
                <option value="schemes" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  Masterplanned Home Schemes
                </option>
              </select>
            </div>

            {/* Field 2: Region / Sector */}
            <div className={`lg:col-span-3 px-3 sm:px-4 py-2 text-left flex flex-col border-t sm:border-t-0 sm:border-l ${
              isDarkMode ? "border-stone-800" : "border-stone-200"
            }`}>
              <label className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Prime Location
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className={`bg-transparent font-display text-xs sm:text-sm font-medium mt-1 focus:outline-none cursor-pointer ${
                  isDarkMode ? "text-white" : "text-stone-900"
                }`}
              >
                <option value="all" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  All Quetta Prime Zones
                </option>
                <option value="a1" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  A-1 City, Block C
                </option>
                <option value="chiltan" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  Chiltan View Estates
                </option>
                <option value="double-road" className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-black"}>
                  Sector B Double Road
                </option>
              </select>
            </div>

            {/* Field 3: Verified Registry Guarantee */}
            <div className={`lg:col-span-3 px-3 sm:px-4 py-2 text-left flex flex-col border-t lg:border-t-0 lg:border-l ${
              isDarkMode ? "border-stone-800" : "border-stone-200"
            }`}>
              <label className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Title Registry Status
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className={`font-display text-xs sm:text-sm font-medium ${isDarkMode ? "text-stone-200" : "text-stone-800"}`}>
                  100% Mutation Verified
                </span>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-2 pt-2 sm:pt-0">
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#DF9B43] hover:bg-[#c88532] text-black font-display font-semibold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
              >
                <span>Find Property</span>
                <ArrowDown size={14} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="w-full max-w-7xl mx-auto pt-6 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase opacity-60">
        <span>01 / ARCHITECTURAL MONOGRAPH</span>
        <button 
          onClick={onExploreClick}
          className="flex items-center gap-1.5 hover:text-[#DF9B43] transition-colors cursor-pointer"
        >
          <span>Scroll to Portfolio</span>
          <ArrowDown size={11} />
        </button>
      </div>
    </section>
  );
};
