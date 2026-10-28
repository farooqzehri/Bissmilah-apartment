import React from "react";
import { motion } from "motion/react";
import { useCMS } from "../../utils/cmsContext";

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
      className={`py-16 md:py-24 border-t border-b relative transition-colors duration-500 ${
        isDarkMode ? "bg-[#0E0E0D] border-stone-850 text-[#F7F7F5]" : "bg-[#F3F3F1] border-[#E2E8F0]/50 text-[#1A1A1A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {publishedStats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col text-left space-y-1.5"
            >
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl md:text-6xl font-light font-display tracking-tight text-[#FF9E4A]">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-xl font-light text-[#FF9E4A] font-display">{stat.suffix}</span>
                )}
              </div>
              <span className="font-display font-medium text-xs sm:text-sm tracking-wide">
                {stat.label}
              </span>
              <span className={`text-[11px] font-mono leading-snug ${
                isDarkMode ? "text-stone-400" : "text-stone-500"
              }`}>
                {stat.subtext}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
