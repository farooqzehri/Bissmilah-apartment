import React from "react";
import { motion } from "motion/react";
import { Hero3D } from "../ui/Hero3D";
import { Button } from "../ui/Button";
import { ArrowDown, CornerDownRight, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface HeroProps {
  onExploreClick: () => void;
  onBookingClick: () => void;
  isDarkMode: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onBookingClick, isDarkMode }) => {
  const { homepage } = useCMS();
  const heroData = homepage?.hero;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: [0.16, 1, 0.3, 1], duration: 1.2 },
    },
  };

  return (
    <section 
      id="hero-section"
      className={`relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 sm:pt-32 md:pt-36 pb-16 px-4 md:px-8 selection:bg-[#FF9E4A]/30 transition-colors duration-500 ${
        isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"
      }`}
    >
      {/* Absolute canvas container layered beautifully behind text */}
      <Hero3D />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pointer-events-none">
        
        {/* Core Editorial Copy Panel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`lg:col-span-7 flex flex-col text-left items-start pointer-events-auto relative p-5 sm:p-8 md:p-12 rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-500 ${
            isDarkMode 
              ? "bg-[#111110]/55 border-white/[0.08] dark:border-stone-800/60" 
              : "bg-white/55 border-white/60 shadow-xl"
          }`}
        >
          {/* Elegant background image with "little blur" and high-contrast overlay */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img 
              src={heroData?.backgroundImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"} 
              alt="Bismillah Real Estate Background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-115 blur-[8px] brightness-[0.85] dark:brightness-[0.35] transition-all duration-500"
            />
            {/* Glass refraction style color filters */}
            <div className={`absolute inset-0 ${
              isDarkMode 
                ? "bg-gradient-to-br from-black/65 via-stone-950/75 to-stone-900/85" 
                : "bg-gradient-to-br from-white/75 via-white/85 to-[#F7F7F5]/75"
            }`} />
          </div>

          {/* Elite Ownership Tag */}
          <motion.div 
            variants={itemVariants}
            className="mb-3 sm:mb-4 inline-block pointer-events-auto"
          >
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-[#FF9E4A] font-bold border-[#FF9E4A] pb-0.5 block">
              {heroData?.subheadingBadge || "APNA GHAR, APNI ZAMEEN"}
            </span>
            <span className={`text-[8px] sm:text-[9px] font-mono tracking-widest uppercase mt-1 block ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
              {heroData?.subheadingText || "Haji Saud Zehri ki Sarbarahi Mein — Shandaar Aur Mehfooz Sazaawat"}
            </span>
          </motion.div>

          {/* Luxury Typography Headline */}
          <motion.h1 
            variants={itemVariants}
            className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-[-0.04em] mb-6 sm:mb-8 ${
              isDarkMode ? "text-white" : "text-[#1A1A1A]"
            }`}
          >
            {heroData?.headingLine1 || "Bismillah"}
            <br />
            <span className={`italic font-serif font-normal ${isDarkMode ? "text-[#FF9E4A]" : "text-[#1A1A1A]"}`}>
              {heroData?.headingLine2 || "Real Estate."}
            </span>
          </motion.h1>

          {/* Subtitle / Paragraph */}
          <motion.p 
            variants={itemVariants}
            className={`max-w-xl text-sm sm:text-base md:text-lg leading-relaxed font-light mb-8 sm:mb-10 italic ${
              isDarkMode ? "text-stone-300" : "text-[#1A1A1A]/80"
            }`}
          >
            {heroData?.description || "Quetta ke sab se qabil-e-etemaad idaray se premium plots, apartments, aur exclusive plots. Hum aap ko mukammal legal registry verification aur modern sahuliyat ke sath zameen faraham karte hain."}
          </motion.p>

          {/* Elegant Staggered Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto"
          >
            <Button variant="primary" size="lg" onClick={onExploreClick} className="w-full sm:w-auto justify-center">
              {heroData?.primaryButtonText || "Explore Plots & Flats"}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onBookingClick} 
              className={`w-full sm:w-auto justify-center ${
                isDarkMode 
                  ? "border-white/20 text-white hover:bg-white hover:text-black" 
                  : "border-stone-300 text-stone-800 hover:bg-stone-900 hover:text-white"
              }`}
            >
              {heroData?.secondaryButtonText || "Private Office"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Right side floating specs */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.5, delay: 0.6 }}
          className="lg:col-span-5 flex flex-col gap-6 sm:gap-8 pointer-events-auto"
        >
          {/* Interactive Specs arranged cleanly */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 text-left">
            <div id="spec-experience" className={`p-4 rounded-2xl border flex items-start gap-3.5 backdrop-blur-md ${
              isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-white/80 border-stone-200 shadow-sm"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[#FF9E4A] border shrink-0 ${
                isDarkMode ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
              }`}>
                <Trophy size={14} className="stroke-[1.5]" />
              </div>
              <div className="flex flex-col">
                <span className={`font-mono text-[9px] uppercase tracking-wider ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  HAJI SAUD ZEHRI LEGACY
                </span>
                <span className={`font-display font-medium text-xs mt-0.5 ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
                  Quetta's Most Trusted Name
                </span>
                <span className={`text-[10px] mt-1 font-light ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  Supervising premier masterplans and registry title guarantees.
                </span>
              </div>
            </div>

            <div id="spec-security" className={`p-4 rounded-2xl border flex items-start gap-3.5 backdrop-blur-md ${
              isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-white/80 border-stone-200 shadow-sm"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[#FF9E4A] border shrink-0 ${
                isDarkMode ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
              }`}>
                <ShieldCheck size={14} className="stroke-[1.5]" />
              </div>
              <div className="flex flex-col">
                <span className={`font-mono text-[9px] uppercase tracking-wider ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  QANOONI TASDEEQ
                </span>
                <span className={`font-display font-medium text-xs mt-0.5 ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
                  100% Verified Registry Deeds
                </span>
                <span className={`text-[10px] mt-1 font-light ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  Clean transfer deed files without any tax liabilities.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
