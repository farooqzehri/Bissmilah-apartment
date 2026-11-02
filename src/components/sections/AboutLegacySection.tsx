import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Award, ArrowUpRight, CheckCircle2, FileText, Landmark } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";

interface AboutLegacySectionProps {
  isDarkMode: boolean;
  onBookingClick: () => void;
}

export const AboutLegacySection: React.FC<AboutLegacySectionProps> = ({ 
  isDarkMode, 
  onBookingClick 
}) => {
  const { homepage, settings } = useCMS();
  const aboutData = homepage?.about;

  if (aboutData?.published === false) return null;

  return (
    <section 
      id="legacy-section"
      className={`py-20 sm:py-28 md:py-36 border-t relative overflow-hidden transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#090908] border-stone-850 text-[#F7F6F2]" 
          : "bg-[#F5F2EB] border-stone-200/80 text-[#141413]"
      }`}
    >
      {/* Subtle California Sunlight Glow in Background */}
      <div 
        aria-hidden="true" 
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none -z-10 ${
          isDarkMode ? "bg-[#DF9B43]/10" : "bg-[#DF9B43]/20"
        }`} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Section Marker */}
        <div className="flex items-center gap-2 mb-8 sm:mb-12">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DF9B43]" />
          <span className={`font-mono text-[10px] tracking-[0.25em] uppercase font-semibold ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}>
            03 / THE FOUNDATION OF TRUST
          </span>
        </div>

        {/* Two-Column Asymmetrical California Editorial Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: High-Fashion Portrait & Revenue Board Accreditation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.1 }}
            className="lg:col-span-5 relative"
          >
            {/* The Main Founder Portrait Card */}
            <div className={`relative rounded-3xl overflow-hidden border shadow-2xl ${
              isDarkMode 
                ? "bg-[#141412] border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.6)]" 
                : "bg-white border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
            }`}>
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-900">
                <img
                  src={aboutData?.ownerImage || settings?.branding.ownerImage || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"}
                  alt={aboutData?.ownerName || "Haji Saud Zehri"}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top filter grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                />
                
                {/* Gradient Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-5 left-5 right-5 text-left text-white">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#DF9B43] block mb-1">
                    FOUNDER & MANAGING DIRECTOR
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-medium tracking-tight">
                    {aboutData?.ownerName || "Haji Saud Zehri"}
                  </h3>
                  <p className="text-xs text-stone-300 font-light mt-0.5">
                    Guiding 22+ years of ethical real estate development in Quetta.
                  </p>
                </div>
              </div>

              {/* Founder's Personal Urdu Quote Strip */}
              <div className={`p-5 sm:p-6 text-left border-t ${
                isDarkMode ? "border-stone-800 bg-[#121210]" : "border-stone-200/60 bg-[#FAF8F5]"
              }`}>
                <p className="font-serif italic text-xs sm:text-sm leading-relaxed text-[#DF9B43]">
                  "{settings?.branding.ownerQuote || "Hum sirf zameen nahi bechty, hum aap ka khwab banatay hain. 100% legal registry aur mehfooz zameen ke sath apna ghar banayen."}"
                </p>
              </div>
            </div>

            {/* Floating Revenue Board Verification Badge */}
            <div className={`absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-6 backdrop-blur-xl p-4 rounded-2xl border shadow-xl flex items-center gap-3.5 text-left max-w-xs ${
              isDarkMode 
                ? "bg-[#181816]/95 border-stone-700/60 text-white" 
                : "bg-white/95 border-stone-200/90 text-stone-900"
            }`}>
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                <Landmark size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-500 font-bold">
                  OFFICIALLY REGISTERED
                </span>
                <span className="font-display font-semibold text-xs leading-tight">
                  Balochistan Land Revenue Directorate
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Legacy Prose */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.1, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col text-left items-start space-y-6"
          >
            <div>
              <span className="text-[#DF9B43] font-mono text-[10px] tracking-[0.25em] uppercase font-bold block mb-2">
                {aboutData?.badge || "LEGACY & FIDELITY"}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
                {aboutData?.heading || "Haji Saud Zehri ki Sarbarahi Mein Bismillah Real Estate"}
              </h2>
              <p className={`font-serif italic text-base sm:text-lg mt-3 text-[#DF9B43]`}>
                {aboutData?.subheading || "100% Legal Registry aur Mehfooz Zameen ki Tareekh"}
              </p>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm font-light leading-relaxed ${
              isDarkMode ? "text-stone-300" : "text-stone-700"
            }`}>
              <p>
                {aboutData?.descriptionP1 || "Bismillah Real Estate ki bunyad Haji Saud Zehri ne rakhi thi. Hamara maqsad Quetta ke logon ko behtareen aur legal registry wale premium plots aur schemes faraham karna hai takay aap ka sarmaya bilkul mehfooz rahay."}
              </p>
              <p>
                {aboutData?.descriptionP2 || "Hum har plot, apartment aur home scheme ki documents file ko khud check kartay hain. Hum se zameen khareedna bilkul safe aur aasan hai. Hamaray har client ko mukammal legal verification aur safety guaranteed di jati hai."}
              </p>
            </div>

            {/* 3 Pillars of Stewardship */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 border-t dark:border-stone-850 border-stone-200">
              <div className="flex flex-col space-y-1">
                <span className="font-mono text-xs text-[#DF9B43] font-bold">01 / TITLES</span>
                <span className="font-display font-medium text-xs sm:text-sm">Direct Mutation</span>
                <span className={`text-[11px] font-light leading-snug ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  Zero litigation history across all residential schemes.
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="font-mono text-xs text-[#DF9B43] font-bold">02 / NATURE</span>
                <span className="font-display font-medium text-xs sm:text-sm">Sweet Aquifers</span>
                <span className={`text-[11px] font-light leading-snug ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  Dedicated deep-bore tube wells in every sector.
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="font-mono text-xs text-[#DF9B43] font-bold">03 / POWER</span>
                <span className="font-display font-medium text-xs sm:text-sm">Solar Microgrid</span>
                <span className={`text-[11px] font-light leading-snug ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  Hybrid pre-installed backup for continuous living.
                </span>
              </div>
            </div>

            {/* Direct Consultation Button */}
            <div className="pt-4">
              <button
                onClick={onBookingClick}
                className="px-8 py-4 rounded-full text-xs sm:text-sm font-display tracking-widest uppercase font-semibold bg-[#DF9B43] hover:bg-[#c88532] text-black shadow-lg flex items-center gap-2 cursor-pointer transition-all duration-300"
              >
                <span>Request Private Consultation</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
