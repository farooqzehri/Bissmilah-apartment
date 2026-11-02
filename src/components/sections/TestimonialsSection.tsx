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
              06 / CLIENT ACCLAIM
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
            The Architecture <span className="font-serif italic font-normal text-[#DF9B43]">of Confidence</span>
          </h2>

          <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}>
            Hear from distinguished estate owners, tribal elders, and corporate executives who secured verified title deeds directly under Haji Saud Zehri supervision.
          </p>
        </div>

        {/* Testimonials 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {published.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`p-7 sm:p-8 rounded-3xl border flex flex-col justify-between space-y-6 ${
                isDarkMode 
                  ? "bg-[#141412] border-white/[0.07] shadow-xl" 
                  : "bg-white border-stone-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#DF9B43]">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-[#DF9B43]" />
                    ))}
                  </div>
                  <Quote size={18} className="text-[#DF9B43]/40" />
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed font-serif italic ${
                  isDarkMode ? "text-stone-300" : "text-stone-700"
                }`}>
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-5 border-t dark:border-stone-850 border-stone-100 flex items-center justify-between">
                <div>
                  <span className="font-display font-semibold text-xs sm:text-sm block">
                    {item.clientName}
                  </span>
                  <span className={`font-mono text-[9px] uppercase tracking-wider block mt-0.5 ${
                    isDarkMode ? "text-stone-400" : "text-stone-500"
                  }`}>
                    {item.location} · {item.propertyTitle}
                  </span>
                </div>

                <span className="font-mono text-[9px] tracking-widest uppercase text-emerald-500 font-semibold">
                  Verified Owner
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
