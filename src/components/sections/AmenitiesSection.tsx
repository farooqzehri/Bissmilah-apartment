import React from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, Zap, Droplets, Lock, ArrowUpCircle, Trees, 
  Sparkles, CheckCircle2, Building, Home, Award
} from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface AmenitiesSectionProps {
  isDarkMode: boolean;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ isDarkMode }) => {
  const { homepage, settings } = useCMS();

  if (
    !settings?.behavior.sectionToggles.amenities ||
    !homepage ||
    !homepage.amenities ||
    homepage.amenities.length === 0
  ) {
    return null;
  }

  const publishedAmenities = homepage.amenities.filter((a) => a.published !== false);
  if (publishedAmenities.length === 0) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap": return <Zap className="text-[#DF9B43]" size={22} />;
      case "Droplets": return <Droplets className="text-[#DF9B43]" size={22} />;
      case "Lock": return <Lock className="text-[#DF9B43]" size={22} />;
      case "ArrowUpCircle": return <ArrowUpCircle className="text-[#DF9B43]" size={22} />;
      case "Trees": return <Trees className="text-[#DF9B43]" size={22} />;
      default: return <ShieldCheck className="text-[#DF9B43]" size={22} />;
    }
  };

  return (
    <section 
      id="amenities-section"
      className={`py-20 sm:py-28 md:py-36 border-t relative transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#0D0D0C] border-stone-850 text-[#F7F6F2]" 
          : "bg-[#FAF8F5] border-stone-200/80 text-[#141413]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 text-left">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#DF9B43] animate-pulse" />
            <span className={`font-mono text-[10px] tracking-[0.25em] uppercase font-semibold ${
              isDarkMode ? "text-stone-400" : "text-stone-600"
            }`}>
              04 / INFRASTRUCTURAL EXCELLENCE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
            The California <span className="font-serif italic font-normal text-[#DF9B43]">Living Standard</span>
          </h2>

          <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}>
            Designed for Quetta's climate and topography: pre-installed solar microgrid systems, deep sweet-water aquifers, and reinforced perimeter security under direct estate governance.
          </p>
        </div>

        {/* 6 Pavilion Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {publishedAmenities.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.5 }}
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between ${
                isDarkMode 
                  ? "bg-[#141412] border-white/[0.07] hover:border-[#DF9B43]/50 shadow-[0_8px_30px_rgba(0,0,0,0.4)]" 
                  : "bg-white border-stone-200 hover:border-black/20 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#DF9B43]/10 border border-[#DF9B43]/20 flex items-center justify-center">
                    {getIcon(item.icon)}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#DF9B43]">
                    0{idx + 1}
                  </span>
                </div>

                <span className={`font-mono text-[9px] uppercase tracking-widest block mb-1 ${
                  isDarkMode ? "text-stone-400" : "text-stone-500"
                }`}>
                  {item.category}
                </span>

                <h3 className="font-display font-medium text-base sm:text-lg mb-2 tracking-tight">
                  {item.name}
                </h3>

                <p className={`text-xs leading-relaxed font-light ${
                  isDarkMode ? "text-stone-300" : "text-stone-600"
                }`}>
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t dark:border-stone-850 border-stone-100 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-emerald-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Standard Included
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
