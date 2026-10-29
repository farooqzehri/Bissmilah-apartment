import React from "react";
import { motion } from "motion/react";
import { useCMS } from "../../utils/cmsContext";
import { ShieldCheck, Sparkles } from "lucide-react";

interface StatsSectionProps {
  isDarkMode: boolean;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ isDarkMode }) => {
  const { homepage, settings } = useCMS();

  if (
    !settings?.behavior.sectionToggles.statistics ||
    !homepage ||
    !homepage.stats ||
    homepage.stats.length === 0
  ) {
    return null;
  }

  const publishedStats = homepage.stats.filter((s) => s.published !== false);
  if (publishedStats.length === 0) return null;

  return (
    <section 
      id="stats-section"
      className={`py-16 sm:py-20 md:py-24 border-t border-b relative transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#090908] border-stone-850 text-[#F7F6F2]" 
          : "bg-[#F5F2EB] border-stone-200/70 text-[#141413]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Section Index Marker */}
        <div className="flex items-center justify-between mb-10 sm:mb-12 border-b pb-4 dark:border-stone-850 border-stone-200">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DF9B43]" />
            <span className={`font-mono text-[10px] tracking-[0.25em] uppercase font-semibold ${
              isDarkMode ? "text-stone-400" : "text-stone-600"
            }`}>
              VERIFIED ARCHITECTURAL BENCHMARKS
            </span>
          </div>
          <span className={`font-mono text-[10px] tracking-widest uppercase ${
            isDarkMode ? "text-stone-500" : "text-stone-400"
          }`}>
            GOVT. OF BALOCHISTAN REVENUE ACCREDITED
          </span>
        </div>

        {/* 4-Column Minimalist Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 divide-y lg:divide-y-0 lg:divide-x dark:divide-stone-800/80 divide-stone-200">
          {publishedStats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
              className={`flex flex-col text-left space-y-2 pt-6 lg:pt-0 ${
                idx > 0 ? "lg:pl-8 xl:pl-10" : ""
              }`}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl md:text-6xl font-light font-display tracking-tight text-[#DF9B43]">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-xl sm:text-2xl font-light text-[#DF9B43] font-display">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <h3 className="font-display font-medium text-xs sm:text-sm tracking-wide leading-snug">
                {stat.label}
              </h3>
              <p className={`text-[11px] sm:text-xs font-light leading-relaxed max-w-xs ${
                isDarkMode ? "text-stone-400" : "text-stone-600"
              }`}>
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
