import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
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
      className={`py-20 md:py-28 border-t relative transition-colors duration-500 ${
        isDarkMode ? "bg-[#111110] border-stone-850 text-[#F7F7F5]" : "bg-[#F7F7F5] border-[#E2E8F0]/40 text-[#1A1A1A]"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-left">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block mb-2">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            Clear Answers on <span className="font-serif italic text-[#FF9E4A]">Registry & Land</span>
          </h2>
          <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}>
            Everything you need to know about title deed mutations, utilities, and booking procedures in Quetta.
          </p>
        </div>

        <div className="space-y-3">
          {published.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDarkMode 
                    ? "bg-[#181817] border-stone-800" 
                    : "bg-white border-stone-200 shadow-sm"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-medium text-sm sm:text-base leading-snug">
                    {item.question}
                  </span>
                  <div className={`p-1.5 rounded-full border transition-transform duration-300 shrink-0 ${
                    isOpen ? "rotate-180 bg-[#FF9E4A] text-black border-[#FF9E4A]" : "dark:border-stone-800 border-stone-300"
                  }`}>
                    <ChevronDown size={14} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm font-light leading-relaxed border-t dark:border-stone-800/80 border-stone-200/60">
                    <p className={isDarkMode ? "text-stone-300" : "text-stone-600"}>
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
