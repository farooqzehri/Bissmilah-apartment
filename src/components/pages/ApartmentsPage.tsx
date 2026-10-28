import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Bath, Bed, Compass, Grid, Maximize, ShieldCheck, Sparkles, X, Shield } from "lucide-react";
import { Button } from "../ui/Button";
import { PropertyItem } from "../../types/property";
import { useProperties } from "../../utils/propertyStore";

interface ApartmentsPageProps {
  onContactClick: (title?: string) => void;
  isDarkMode: boolean;
}

export const ApartmentsPage: React.FC<ApartmentsPageProps> = ({ onContactClick, isDarkMode }) => {
  const { properties } = useProperties();
  const [selectedApartment, setSelectedApartment] = useState<PropertyItem | null>(null);

  const apartments = properties.filter((p) => p.category === "apartments");

  return (
    <div className={`pt-28 sm:pt-36 pb-24 px-4 md:px-8 ${isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"} min-h-screen text-left transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Heading */}
        <div className="border-b border-[#E2E8F0]/30 dark:border-stone-850 pb-10 mb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#FF9E4A] font-bold block mb-3">
            SHANDAAR APARTMENTS — EXQUISITE SUITES
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight leading-none mb-4">
            Premium <span className="italic font-serif text-[#FF9E4A]">Apartments aur Flats</span>
          </h1>
          <p className={`max-w-xl text-xs sm:text-sm font-light leading-relaxed ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>
            Hum aap ko Quetta ke sab se mehfooz vertical residential flats faraham karte hain. All documents are 100% verified under Haji Saud Zehri supervision for your supreme comfort and security.
          </p>
        </div>

        {/* Apartments List */}
        <div className="space-y-12 sm:space-y-16">
          {apartments.map((apt, idx) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
              className={`rounded-3xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-500 ${
                isDarkMode 
                  ? "bg-[#161615] border-stone-850 hover:border-[#FF9E4A]/30 shadow-xl" 
                  : "bg-white border-stone-200 shadow-sm hover:shadow-xl hover:border-stone-300"
              }`}
            >
              {/* Image Column */}
              <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-black min-h-[260px]">
                <img
                  src={apt.image}
                  alt={apt.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-mono text-[#FF9E4A] uppercase tracking-wider font-semibold">
                  {apt.tag}
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-medium flex items-center gap-1">
                  <ShieldCheck size={11} /> {apt.status}
                </div>
              </div>

              {/* Information Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 dark:border-stone-800/80">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                      SUITE #{idx + 1} • {apt.size}
                    </span>
                    <span className="font-display font-semibold text-lg text-[#FF9E4A]">
                      {apt.price}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-display font-medium mt-3 leading-snug">
                    {apt.title}
                  </h2>
                  <p className="font-mono text-xs text-stone-400 mt-1 flex items-center gap-1">
                    <Compass size={12} className="text-[#FF9E4A]" /> {apt.location}
                  </p>

                  <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
                    isDarkMode ? "text-stone-300" : "text-stone-600"
                  }`}>
                    {apt.description}
                  </p>

                  {/* Micro Specs */}
                  {apt.specs && apt.specs.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                      {apt.specs.map((sp, sIdx) => (
                        <div key={sIdx} className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                          <span className="font-mono text-[8px] uppercase tracking-widest text-stone-400 block mb-0.5">
                            {sp.label}
                          </span>
                          <span className="font-display font-semibold text-xs text-[#FF9E4A]">
                            {sp.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Highlights Bullet list */}
                  {apt.highlights && apt.highlights.length > 0 && (
                    <div className="pt-4 space-y-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block font-semibold">
                        LUXURY AMENITIES & FEATURES:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {apt.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2 text-xs font-light">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9E4A] shrink-0" />
                            <span className={`line-clamp-1 ${isDarkMode ? "text-stone-300" : "text-stone-700"}`}>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Inquire CTA */}
                <div className="pt-4 border-t border-stone-200/50 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className={`text-[11px] font-mono ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Title Deed ready for direct mutation.
                  </span>
                  <button
                    onClick={() => onContactClick(apt.title)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Schedule Private Viewing</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
