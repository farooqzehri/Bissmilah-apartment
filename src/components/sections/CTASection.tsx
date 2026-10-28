import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, Calendar, ClipboardCheck, Clock, Contact, MapPin, 
  PhoneCall, ShieldAlert, Sparkles, UserCheck, Compass 
} from "lucide-react";

interface CTASectionProps {
  isDarkMode?: boolean;
}

export const CTASection: React.FC<CTASectionProps> = ({ isDarkMode = false }) => {
  // Form submission states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    interest: "apartments",
    preferredDate: "",
    meetingType: "office", // 'office' | 'advisor'
    message: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple luxury inputs validation
    if (!formData.name.trim()) {
      setValidationError("Please specify your name for the invitation.");
      return;
    }
    if (!formData.phone.trim()) {
      setValidationError("A direct contact phone number is required.");
      return;
    }
    if (!formData.preferredDate) {
      setValidationError("Please select your preferred private meeting date.");
      return;
    }

    setIsLoading(true);

    // Mimic secure server submission duration
    setTimeout(() => {
      // Generate unique token
      const randomToken = "BME-" + Math.floor(100000 + Math.random() * 900000).toString();
      setAppointmentId(randomToken);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      interest: "apartments",
      preferredDate: "",
      meetingType: "office",
      message: ""
    });
    setIsSubmitted(false);
    setAppointmentId("");
  };

  return (
    <section 
      id="private-office" 
      className={`py-24 md:py-32 border-t relative overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-[#111110] border-stone-850 text-[#F7F7F5]" : "bg-[#F7F7F5] border-[#E2E8F0]/40 text-[#1A1A1A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Panel: High End Editorial Invite */}
          <div className="lg:col-span-5 text-left space-y-8 lg:sticky lg:top-32">
            
            <div className="flex flex-col items-start gap-3">
              <span className="font-mono text-[10px] tracking-widest text-[#FF9E4A] font-bold uppercase flex items-center gap-1.5">
                <Building2 size={12} /> PRIVATE OFFICE — MEHFOOZ RABTA
              </span>
              <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-[1.12]">
                Khush-Aamdeed.
              </h2>
            </div>

            <p className={`font-light text-sm md:text-base leading-relaxed ${isDarkMode ? "text-stone-300" : "text-[#1A1A1A]/70"}`}>
              Hum aap ko aur aap ki family ko apnay Quetta office mein khush-aamdeed kehte hain. Experience luxury real estate with 100% verified registry files and clear ownership guide.
            </p>

            {/* Local Geography Details Card */}
            <div className={`p-6 border space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.01)] ${
              isDarkMode ? "bg-stone-900 border-stone-800" : "bg-white border-[#E2E8F0]/40"
            }`}>
              <div className="flex items-start gap-3.5">
                <Compass className="text-[#FF9E4A] mt-1 shrink-0" size={18} />
                <div>
                  <span className={`font-mono text-[9px] uppercase tracking-widest block leading-none mb-1 ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/40"}`}>
                    OFFICE ADDRESS (SUITE ADDRESS)
                  </span>
                  <span className={`font-display font-medium text-sm ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
                    A-1 City, Block C, Main Double Road
                  </span>
                  <span className={`font-display text-xs block mt-0.5 ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/60"}`}>
                    Quetta, Balochistan, Pakistan
                  </span>
                </div>
              </div>

              <div className={`flex items-start gap-3.5 pt-4 border-t ${isDarkMode ? "border-stone-800" : "border-[#E2E8F0]/25"}`}>
                <Clock className="text-[#FF9E4A] mt-1 shrink-0" size={18} />
                <div>
                  <span className={`font-mono text-[9px] uppercase tracking-widest block leading-none mb-1 ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/40"}`}>
                    OFFICE TIMINGS (MULAQAT KA WAQT)
                  </span>
                  <span className={`font-display font-medium text-xs ${isDarkMode ? "text-stone-200" : "text-[#1A1A1A]"}`}>
                    Monday – Friday: 10:00 AM – 4:00 PM
                  </span>
                  <span className={`font-display text-[11px] block mt-0.5 ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/55"}`}>
                    Saturdays are reserved for big property bookings.
                  </span>
                </div>
              </div>
            </div>

            {/* Visionary Leadership Signature block */}
            <div className={`pt-4 border-t flex flex-col items-start gap-2.5 ${isDarkMode ? "border-stone-800" : "border-[#E2E8F0]/30"}`}>
              <span className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/40"}`}>
                AUTHORITY & GOVERNANCE
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-serif text-sm italic border border-white">
                  SZ
                </div>
                <div className="flex flex-col text-left">
                  <span className={`font-serif italic font-normal text-sm ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
                    Haji Saud Zehri
                  </span>
                  <span className={`font-mono text-[9px] tracking-wider uppercase ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/60"}`}>
                    Managing Partner & Founder
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Conversion Form */}
          <div className={`lg:col-span-7 p-6 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.015)] relative min-h-[480px] flex flex-col justify-center border ${
            isDarkMode ? "bg-stone-900 border-stone-800" : "bg-white border-[#E2E8F0]/40"
          }`}>
            
            <AnimatePresence mode="wait">
              
              {/* Form loader spinner */}
              {isLoading && (
                <motion.div
                  key="form-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 rounded-3xl z-20 flex flex-col items-center justify-center gap-4 ${
                    isDarkMode ? "bg-stone-950/90 text-white" : "bg-white/80 backdrop-blur-sm text-[#1A1A1A]"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full border-2 border-t-[#FF9E4A] border-r-transparent border-b-[#1A1A1A] border-l-transparent animate-spin" />
                  <span className="font-mono text-xs tracking-widest uppercase">
                    Securing private slot...
                  </span>
                </motion.div>
              )}

              {/* SUCCESS STATE */}
              {isSubmitted ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                  className="space-y-6 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FF9E4A]/15 text-[#FF9E4A] flex items-center justify-center mb-4">
                    <ClipboardCheck size={24} className="stroke-[1.5]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-2xl font-light tracking-tight ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
                      Invitation Secured Successfully
                    </h3>
                    <p className={`text-xs md:text-sm font-light leading-relaxed ${isDarkMode ? "text-stone-300" : "text-[#1A1A1A]/60"}`}>
                      Thank you, <span className="font-semibold text-[#FF9E4A]">{formData.name}</span>. Your private consultation request has been cataloged under our priority folder. An advisor will contact you within 2 business hours.
                    </p>
                  </div>

                  {/* Booking Receipt card */}
                  <div className={`p-6 border space-y-3 font-mono text-[11px] ${
                    isDarkMode ? "bg-stone-950 border-stone-850 text-stone-200" : "bg-[#F7F7F5] border-[#E2E8F0]/50 text-[#1A1A1A]/80"
                  }`}>
                    <div className={`flex justify-between border-b pb-2 ${isDarkMode ? "border-stone-850" : "border-[#E2E8F0]/40"}`}>
                      <span className="opacity-50 uppercase font-medium">Invitation Code</span>
                      <span className="font-bold text-[#FF9E4A]">{appointmentId}</span>
                    </div>

                    <div className={`flex justify-between border-b pb-2 ${isDarkMode ? "border-stone-850" : "border-[#E2E8F0]/40"}`}>
                      <span className="opacity-50 uppercase">Desired Category</span>
                      <span className="font-semibold uppercase">{formData.interest}</span>
                    </div>

                    <div className={`flex justify-between border-b pb-2 ${isDarkMode ? "border-stone-850" : "border-[#E2E8F0]/40"}`}>
                      <span className="opacity-50 uppercase">Scheduled Date</span>
                      <span>{formData.preferredDate}</span>
                    </div>

                    <div className="flex justify-between pt-1">
                      <span className="opacity-50 uppercase">Meeting Format</span>
                      <span className="uppercase">
                        {formData.meetingType === "office" ? "Office Suite (Quetta)" : "Digital Advisor Video"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    <button
                      onClick={resetForm}
                      className={`px-6 py-2.5 rounded-full border transition-all text-xs font-display uppercase tracking-wider cursor-pointer w-full sm:w-auto text-center ${
                        isDarkMode 
                          ? "border-stone-700 text-stone-300 hover:border-stone-500" 
                          : "border-[#E2E8F0]/80 text-[#1A1A1A]/70 hover:border-[#1A1A1A]/20"
                      }`}
                    >
                      Book Another Slot
                    </button>
                    <a
                      href="tel:+923337827725"
                      className="px-6 py-2.5 rounded-full bg-[#FF9E4A] text-black hover:bg-white hover:text-black transition-all text-xs font-display font-medium uppercase tracking-wider cursor-pointer w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall size={12} /> Call Direct Advisor
                    </a>
                  </div>
                </motion.div>
              ) : (
                /* INTAKE FORM STATE */
                <motion.form
                  key="intake-form"
                  onSubmit={handleFormSubmit}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1">
                    <span className={`font-mono text-[9px] tracking-widest uppercase ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/40"}`}>
                      RABTA FORUM — EASY CONTACT
                    </span>
                    <h3 className={`text-xl md:text-2xl font-light tracking-tight ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
                      Meeting Book Karen
                    </h3>
                  </div>

                  {/* Form validation alert banner */}
                  {validationError && (
                    <div className="p-3.5 rounded-xl bg-orange-50/10 border border-[#FF9E4A]/30 text-xs text-orange-200 flex items-center gap-2 font-display">
                      <ShieldAlert size={14} className="text-[#FF9E4A] shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name-input" className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                        Aap Ka Name * (Full Name)
                      </label>
                      <input
                        id="name-input"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Farooq Ahmed"
                        className={`w-full px-4 py-3 border text-xs font-display placeholder:text-stone-400 focus:outline-none focus:border-[#FF9E4A] transition-all ${
                          isDarkMode 
                            ? "bg-[#111110] border-stone-800 text-white focus:bg-stone-950" 
                            : "bg-[#F7F7F5]/40 border-[#E2E8F0] text-[#1A1A1A] focus:bg-white"
                        }`}
                      />
                    </div>

                    {/* Direct Contact Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone-input" className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                        Mobile Number * (Phone)
                      </label>
                      <input
                        id="phone-input"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 0333 7827725"
                        className={`w-full px-4 py-3 border text-xs font-display placeholder:text-stone-400 focus:outline-none focus:border-[#FF9E4A] transition-all ${
                          isDarkMode 
                            ? "bg-[#111110] border-stone-800 text-white focus:bg-stone-950" 
                            : "bg-[#F7F7F5]/40 border-[#E2E8F0] text-[#1A1A1A] focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Property Curation Category Selection */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="interest-select" className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                        Kis Cheez Mein Interest Hai? (Property Choice)
                      </label>
                      <select
                        id="interest-select"
                        name="interest"
                        value={formData.interest}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border text-xs font-display focus:outline-none focus:border-[#FF9E4A] transition-all cursor-pointer appearance-none ${
                          isDarkMode 
                            ? "bg-[#111110] border-stone-800 text-white focus:bg-stone-950" 
                            : "bg-[#F7F7F5]/40 border-[#E2E8F0] text-[#1A1A1A] focus:bg-white"
                        }`}
                      >
                        <option value="apartments">Premium Apartments / Flats</option>
                        <option value="estates">Elite Estates (Bungalow Plots)</option>
                        <option value="schemes">Luxury Home Schemes (Family Plots)</option>
                        <option value="commercial">Commercial Roadside Plots (Dukaan)</option>
                      </select>
                    </div>

                    {/* Meeting Format Picker */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="preferredDate" className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                        Mulaqat ki Date * (Meeting Date)
                      </label>
                      <input
                        id="preferredDate"
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border text-xs font-display focus:outline-none focus:border-[#FF9E4A] transition-all cursor-pointer ${
                          isDarkMode 
                            ? "bg-[#111110] border-stone-800 text-white focus:bg-stone-950" 
                            : "bg-[#F7F7F5]/40 border-[#E2E8F0] text-[#1A1A1A] focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Dual CTA Path Picker */}
                  <div className="flex flex-col gap-1.5">
                    <span className={`font-mono text-[8px] uppercase tracking-widest mb-1.5 block ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                      Mulaqat Ka Tariqa (Select Format)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Office Meeting Path */}
                      <div
                        id="format-office"
                        onClick={() => setFormData(prev => ({ ...prev, meetingType: "office" }))}
                        className={`p-4 cursor-pointer transition-all flex items-start gap-3 border ${
                          formData.meetingType === "office"
                            ? "border-[#FF9E4A] bg-[#FF9E4A]/5 text-[#FF9E4A]"
                            : isDarkMode
                              ? "border-stone-800 bg-stone-900/45 text-stone-300 hover:border-stone-700"
                              : "border-[#E2E8F0] bg-[#F7F7F5]/20 hover:border-black/20 text-[#1A1A1A]"
                        }`}
                      >
                        <Building2 size={16} className="mt-0.5" />
                        <div className="flex flex-col text-left">
                          <span className="font-display font-medium text-xs leading-none">Quetta Office Mulaqat</span>
                          <span className={`font-display text-[10px] mt-1 leading-snug ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                            Office aakar milen aur physical papers check karen.
                          </span>
                        </div>
                      </div>

                      {/* Call Advisor Path */}
                      <div
                        id="format-advisor"
                        onClick={() => setFormData(prev => ({ ...prev, meetingType: "advisor" }))}
                        className={`p-4 cursor-pointer transition-all flex items-start gap-3 border ${
                          formData.meetingType === "advisor"
                            ? "border-[#FF9E4A] bg-[#FF9E4A]/5 text-[#FF9E4A]"
                            : isDarkMode
                              ? "border-stone-800 bg-stone-900/45 text-stone-300 hover:border-stone-700"
                              : "border-[#E2E8F0] bg-[#F7F7F5]/20 hover:border-black/20 text-[#1A1A1A]"
                        }`}
                      >
                        <UserCheck size={16} className="mt-0.5" />
                        <div className="flex flex-col text-left">
                          <span className="font-display font-medium text-xs leading-none">Phone Par Rabta</span>
                          <span className={`font-display text-[10px] mt-1 leading-snug ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                            Phone call par advice aur details maloom karen.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Private message context */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="client-note" className={`font-mono text-[9px] uppercase tracking-widest ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/50"}`}>
                      Extra Requirements (Koi Khaas Baat?)
                    </label>
                    <textarea
                      id="client-note"
                      name="message"
                      rows={2}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="e.g. Mukammal boundary wall, corner plot ya road-frontage chahiye..."
                      className={`w-full px-4 py-3 border text-xs font-display placeholder:text-stone-400 focus:outline-none focus:border-[#FF9E4A] transition-all resize-none ${
                        isDarkMode 
                          ? "bg-[#111110] border-stone-800 text-white focus:bg-stone-950" 
                          : "bg-[#F7F7F5]/40 border-[#E2E8F0] text-[#1A1A1A] focus:bg-white"
                      }`}
                    />
                  </div>

                  {/* Primary CTA Submit Anchor */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#FF9E4A] text-black hover:bg-white hover:text-black font-display font-semibold text-xs tracking-wider uppercase transition-all duration-500 cursor-pointer flex items-center justify-center gap-2 shadow-sm mt-2 focus:outline-none focus:ring-1 focus:ring-[#FF9E4A]"
                  >
                    <span>
                      {formData.meetingType === "office" 
                        ? "Book My Private Meeting (Office)" 
                        : "Call Advisor Now (Phone)"}
                    </span>
                    <Sparkles size={13} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
