import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface FAQSectionProps {
  isDarkMode: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ isDarkMode }) => {
  const { homepage, settings } = useCMS();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (
    !settings?.behavior.sectionToggles.faq ||
    !homepage ||
    !homepage.faqs ||
    homepage.faqs.length === 0
  ) {
    return null;
  }

  const published = homepage.faqs.filter((f) => f.published !== false);
  if (published.length === 0) return null;

  return (
    <section 
      id="faq-section"
      className={`py-20 sm:py-28 md:py-36 border-t relative transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#090908] border-stone-850 text-[#F7F6F2]" 
          : "bg-[#F5F2EB] border-stone-200/80 text-[#141413]"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-left">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#DF9B43] animate-pulse" />
            <span className={`font-mono text-[10px] tracking-[0.25em] uppercase font-semibold ${
              isDarkMode ? "text-stone-400" : "text-stone-600"
            }`}>
              07 / TITLE & REGISTRY DISCLOSURES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
            Clear Answers on <span className="font-serif italic font-normal text-[#DF9B43]">Registry & Land</span>
          </h2>

          <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}>
            Everything you need to know about Government of Balochistan Revenue mutations, sweet-water connections, and title deed transfer under Haji Saud Zehri.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {published.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isDarkMode 
                    ? "bg-[#141412] border-white/[0.07] hover:border-[#DF9B43]/30" 
                    : "bg-white border-stone-200 shadow-sm hover:border-black/20"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#DF9B43] font-bold">
                      0{idx + 1}
                    </span>
                    <span className="font-display font-medium text-sm sm:text-base leading-snug">
                      {item.question}
                    </span>
                  </div>

                  <div className={`p-2 rounded-full border transition-transform duration-300 shrink-0 ${
                    isOpen 
                      ? "rotate-180 bg-[#DF9B43] text-black border-[#DF9B43]" 
                      : isDarkMode ? "border-stone-800 text-stone-400" : "border-stone-300 text-stone-600"
                  }`}>
                    <ChevronDown size={14} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm font-light leading-relaxed border-t dark:border-stone-800/80 border-stone-100">
                    <p className={`pl-7 ${isDarkMode ? "text-stone-300" : "text-stone-700"}`}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
