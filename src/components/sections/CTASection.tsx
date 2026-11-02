import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, Calendar, ClipboardCheck, Clock, Contact, MapPin, 
  PhoneCall, ShieldAlert, Sparkles, UserCheck, Compass, CheckCircle2, 
  ArrowUpRight, Phone, MessageSquare
} from "lucide-react";
import { cmsEnquiries } from "../../utils/cmsApi";
import { useCMS } from "../../utils/cmsContext";

interface CTASectionProps {
  isDarkMode?: boolean;
}

export const CTASection: React.FC<CTASectionProps> = ({ isDarkMode = false }) => {
  const { settings, homepage } = useCMS();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    interest: "The Zehri Heights Penthouses (Shandaar Residence)",
    preferredDate: "",
    meetingType: "office", // 'office' | 'onsite' | 'phone'
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setValidationError("Please specify your full name for the showing dossier.");
      return;
    }
    if (!formData.phone.trim()) {
      setValidationError("A direct phone number is required for VIP escort confirmation.");
      return;
    }
    if (!formData.preferredDate) {
      setValidationError("Please select your preferred private showing date.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await cmsEnquiries.submit({
        name: formData.name,
        phone: formData.phone,
        interest: formData.interest,
        preferredDate: formData.preferredDate,
        meetingType: formData.meetingType,
        message: formData.message,
      });

      setAppointmentId(res.token || "BME-" + Math.floor(100000 + Math.random() * 900000).toString());
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err: any) {
      setIsLoading(false);
      setValidationError(err.message || "Failed to submit showing request. Please call our office directly.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      interest: "The Zehri Heights Penthouses (Shandaar Residence)",
      preferredDate: "",
      meetingType: "office",
      message: ""
    });
    setIsSubmitted(false);
    setAppointmentId("");
  };

  const whatsappUrl = `https://wa.me/${(settings?.contact.whatsappNumber || "923337861928").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Assalamu Alaikum Haji Saud Zehri Sahab, I would like to schedule a private walkthrough and title deed review for Bismillah Real Estate properties."
  )}`;

  return (
    <section 
      id="private-office" 
      className={`py-20 sm:py-28 md:py-36 border-t relative overflow-hidden transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#0D0D0C] border-stone-850 text-[#F7F6F2]" 
          : "bg-[#FAF8F5] border-stone-200/80 text-[#141413]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: California Private Showing Office Profile */}
          <div className="lg:col-span-5 text-left space-y-8 lg:sticky lg:top-36">
            
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DF9B43] animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#DF9B43] font-bold uppercase">
                  08 / PRIVATE SHOWING CONCIERGE
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
                Schedule a <span className="font-serif italic font-normal text-[#DF9B43]">Private Showing</span>
              </h2>
            </div>

            <p className={`font-light text-xs sm:text-sm md:text-base leading-relaxed ${
              isDarkMode ? "text-stone-300" : "text-stone-700"
            }`}>
              We welcome you and your family to our executive office at A-1 City. Experience direct portfolio briefing with Haji Saud Zehri, complete legal revenue mutation papers, and accompanied on-site tours.
            </p>

            {/* Address & Timings Pavilion Card */}
            <div className={`p-6 sm:p-7 rounded-3xl border space-y-5 ${
              isDarkMode ? "bg-[#141412] border-white/[0.07] shadow-xl" : "bg-white border-stone-200 shadow-sm"
            }`}>
              <div className="flex items-start gap-3.5">
                <MapPin className="text-[#DF9B43] mt-1 shrink-0" size={18} />
                <div>
                  <span className={`font-mono text-[9px] uppercase tracking-widest block leading-none mb-1 ${
                    isDarkMode ? "text-stone-400" : "text-stone-500"
                  }`}>
                    EXECUTIVE SUITE
                  </span>
                  <span className="font-display font-medium text-sm block">
                    {settings?.contact.officeAddress || "Bismillah Executive Plaza, Sector A-1 Commercial Double Road, Quetta"}
                  </span>
                  <span className={`text-xs font-light block mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Quetta, Balochistan, Pakistan
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-4 border-t dark:border-stone-850 border-stone-100">
                <Clock className="text-[#DF9B43] mt-1 shrink-0" size={18} />
                <div>
                  <span className={`font-mono text-[9px] uppercase tracking-widest block leading-none mb-1 ${
                    isDarkMode ? "text-stone-400" : "text-stone-500"
                  }`}>
                    OFFICE HOURS
                  </span>
                  <span className="font-display font-medium text-xs sm:text-sm block">
                    {settings?.contact.businessHours || "Saturday - Thursday: 9:00 AM - 9:00 PM (Friday Closed)"}
                  </span>
                </div>
              </div>

              {/* Direct Instant Action Links */}
              <div className="pt-4 border-t dark:border-stone-850 border-stone-100 flex flex-wrap gap-3">
                <a
                  href={`tel:${settings?.contact.primaryPhone || "+923337861928"}`}
                  className={`px-4 py-2 rounded-full border text-xs font-mono flex items-center gap-2 transition-colors ${
                    isDarkMode ? "border-stone-800 hover:border-white text-stone-200" : "border-stone-300 hover:border-black text-stone-800"
                  }`}
                >
                  <Phone size={12} className="text-[#DF9B43]" />
                  <span>Call Office</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono flex items-center gap-2 transition-colors"
                >
                  <MessageSquare size={12} />
                  <span>Direct WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: California Concierge Booking Form */}
          <div className="lg:col-span-7">
            <div className={`p-6 sm:p-10 rounded-3xl border text-left shadow-2xl transition-all duration-300 ${
              isDarkMode 
                ? "bg-[#141412] border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)]" 
                : "bg-white border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
            }`}>
              
              {isSubmitted ? (
                <div className="py-12 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#DF9B43] font-bold block mb-1">
                      INVITATION CONFIRMED
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-display font-medium">
                      Showing Dossier Created
                    </h3>
                    <p className={`text-xs sm:text-sm font-light mt-2 max-w-md mx-auto ${
                      isDarkMode ? "text-stone-300" : "text-stone-600"
                    }`}>
                      Shukriya, <span className="font-semibold text-[#DF9B43]">{formData.name}</span>. Your showing file has been registered with priority code:
                    </p>
                  </div>

                  <div className={`inline-block px-6 py-3 rounded-2xl border font-mono text-lg font-bold tracking-widest ${
                    isDarkMode ? "bg-stone-900 border-[#DF9B43]/40 text-[#DF9B43]" : "bg-stone-50 border-[#DF9B43]/40 text-stone-900"
                  }`}>
                    {appointmentId}
                  </div>

                  <p className={`text-xs font-light max-w-sm mx-auto ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Our executive secretary will contact your phone ({formData.phone}) to confirm directions and gate access credentials.
                  </p>

                  <button
                    onClick={resetForm}
                    className="px-8 py-3 rounded-full text-xs font-display tracking-widest uppercase font-semibold bg-[#DF9B43] hover:bg-[#c88532] text-black cursor-pointer transition-colors"
                  >
                    Schedule Another Showing
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#DF9B43] font-bold block mb-1">
                      CONFIDENTIAL SHOWING REQUEST
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-medium tracking-tight">
                      Private Appointment Form
                    </h3>
                    <p className={`text-xs font-light mt-1 ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                      All requests are handled under strict confidentiality.
                    </p>
                  </div>

                  {validationError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono">
                      {validationError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-wider block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Sardar Aurangzeb Zehri"
                        className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#DF9B43] ${
                          isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-900"
                        }`}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-wider block">
                        Direct Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+92 333 1234567"
                        className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#DF9B43] ${
                          isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-900"
                        }`}
                      />
                    </div>

                    {/* Property Interest */}
                    <div className="space-y-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-wider block">
                        Property of Interest
                      </label>
                      <select
                        name="interest"
                        value={formData.interest}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#DF9B43] cursor-pointer ${
                          isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-900"
                        }`}
                      >
                        <option value="The Zehri Heights Penthouses (Shandaar Residence)">
                          The Zehri Heights Duplex Penthouse
                        </option>
                        <option value="The Obsidian Pavilion (Sunehri Bungalow)">
                          The Obsidian Pavilion Walled Estate
                        </option>
                        <option value="Double Road Commercial Frontage (Corner Dukaan & Plaza)">
                          Double Road Commercial Corner Frontage
                        </option>
                        <option value="Bismillah Dream Gardens Masterplan">
                          Bismillah Dream Gardens Plots
                        </option>
                        <option value="General Portfolio Discussion">
                          General Portfolio Discussion
                        </option>
                      </select>
                    </div>

                    {/* Preferred Date */}
                    <div className="space-y-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-wider block">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#DF9B43] cursor-pointer ${
                          isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Meeting Format */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-wider block">
                      Showing Preference Format
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "office", label: "Executive VIP Suite" },
                        { id: "onsite", label: "On-Site Escorted Tour" },
                        { id: "phone", label: "Direct Phone Briefing" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, meetingType: item.id }))}
                          className={`p-3 rounded-xl border text-xs font-display text-center transition-all cursor-pointer ${
                            formData.meetingType === item.id
                              ? "bg-[#DF9B43] text-black font-semibold border-[#DF9B43] shadow-sm"
                              : isDarkMode 
                                ? "bg-stone-900 border-stone-800 text-stone-400 hover:text-white" 
                                : "bg-stone-50 border-stone-200 text-stone-600 hover:text-black"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Note */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider block">
                      Specific Requirements / Notes
                    </label>
                    <textarea
                      id="client-note"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please mention any specific title deed or mutation verification files you would like prepared for review."
                      className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#DF9B43] ${
                        isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-900"
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-full bg-[#DF9B43] hover:bg-[#c88532] text-black font-display font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <span>{isLoading ? "Generating Showing Dossier..." : "Confirm Private Showing"}</span>
                    <ArrowUpRight size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
