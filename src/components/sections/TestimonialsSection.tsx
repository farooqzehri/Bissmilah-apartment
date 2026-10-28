import React from "react";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface TestimonialsSectionProps {
  isDarkMode: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ isDarkMode }) => {
  const { homepage, settings } = useCMS();

  if (
    !settings?.behavior.sectionToggles.testimonials ||
    !homepage ||
    !homepage.testimonials ||
    homepage.testimonials.length === 0
  ) {
    return null;
  }

  const published = homepage.testimonials.filter((t) => t.published !== false);
  if (published.length === 0) return null;

  return (
    <section 
      id="testimonials-section"
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
              VERIFIED CLIENT REVIEWS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            Buyer Trust & <span className="font-serif italic text-[#FF9E4A]">Testimonials</span>
          </h2>
          <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}>
            Hear from distinguished property owners who secured their files and residential land directly through Haji Saud Zehri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {published.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between space-y-6 ${
                isDarkMode 
                  ? "bg-[#181817] border-stone-800 shadow-lg" 
                  : "bg-white border-stone-200 shadow-sm"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#FF9E4A]">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[#FF9E4A]" />
                  ))}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed italic ${
                  isDarkMode ? "text-stone-300" : "text-stone-700"
                }`}>
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t dark:border-stone-800 border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-display font-semibold text-sm block">
                    {item.clientName}
                  </span>
                  <span className="font-mono text-[10px] text-stone-400 block mt-0.5">
                    {item.location} • {item.propertyTitle}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FF9E4A]/10 flex items-center justify-center text-[#FF9E4A]">
                  <Quote size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
