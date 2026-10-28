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
      case "Zap": return <Zap className="text-[#FF9E4A]" size={22} />;
      case "Droplets": return <Droplets className="text-blue-500" size={22} />;
      case "Lock": return <Lock className="text-emerald-500" size={22} />;
      case "ArrowUpCircle": return <ArrowUpCircle className="text-[#FF9E4A]" size={22} />;
      case "Trees": return <Trees className="text-emerald-600" size={22} />;
      default: return <ShieldCheck className="text-[#FF9E4A]" size={22} />;
    }
  };

  return (
    <section 
      id="amenities-section"
      className={`py-20 md:py-28 border-t relative transition-colors duration-500 ${
        isDarkMode ? "bg-[#111110] border-stone-850 text-[#F7F7F5]" : "bg-[#F7F7F5] border-[#E2E8F0]/40 text-[#1A1A1A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9E4A] animate-pulse" />
            <span className={`font-mono text-[10px] tracking-wider uppercase font-semibold ${
              isDarkMode ? "text-stone-400" : "text-stone-600"
            }`}>
              COMMUNITY & INFRASTRUCTURE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            Features & <span className="font-serif italic text-[#FF9E4A]">Elite Amenities</span>
          </h2>
          <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}>
            Every Bismillah Real Estate development in Quetta is engineered with uninterrupted utilities, sweet-water access, and reinforced safety boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedAmenities.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.5 }}
              className={`p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${
                isDarkMode 
                  ? "bg-[#181817] border-stone-800 hover:border-[#FF9E4A]/40" 
                  : "bg-white border-stone-200 hover:border-[#FF9E4A]/40 shadow-sm"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF9E4A]/10 border border-[#FF9E4A]/20 flex items-center justify-center mb-4">
                {getIcon(item.icon)}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#FF9E4A] block mb-1">
                {item.category}
              </span>
              <h3 className="font-display font-medium text-base mb-2">
                {item.name}
              </h3>
              <p className={`text-xs leading-relaxed ${
                isDarkMode ? "text-stone-400" : "text-stone-600"
              }`}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
