import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Box, Compass, Filter, MapPin, Search, ShieldCheck, Sparkles, X, Shield, ArrowRight } from "lucide-react";
import { PropertyItem, PropertyCategory } from "../../types/property";
import { useProperties } from "../../utils/propertyStore";

interface PropertiesPageProps {
  onInquireClick: (propertyTitle: string) => void;
  isDarkMode: boolean;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onInquireClick, isDarkMode }) => {
  const { properties } = useProperties();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | PropertyCategory>("all");
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);

  const filteredProperties = properties.filter((prop) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      prop.title.toLowerCase().includes(q) ||
      prop.location.toLowerCase().includes(q) ||
      prop.description.toLowerCase().includes(q) ||
      prop.price.toLowerCase().includes(q) ||
      prop.tag.toLowerCase().includes(q);

    const matchesType = selectedType === "all" || prop.category === selectedType;
    return matchesSearch && matchesType && prop.published !== false;
  });

  return (
    <div className={`pt-28 sm:pt-36 pb-24 px-4 md:px-8 ${isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"} min-h-screen text-left transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Title */}
        <div className="border-b border-[#E2E8F0]/30 dark:border-stone-850 pb-10 mb-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#FF9E4A] font-bold block mb-3">
            VERIFIED PLOTS & ESTATES — HAR QISM KI ZAMEEN
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight leading-none mb-4">
            Elite <span className="italic font-serif text-[#FF9E4A]">Estates aur Home Schemes</span>
          </h1>
          <p className={`max-w-xl text-xs sm:text-sm font-light leading-relaxed ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>
            Haji Saud Zehri ki direct tasdeeq ke sath safe zameen ki Registry Deeds. Hamaray paas har kism ke commercial, residential plans, aur premium schemes shamil hain.
          </p>
        </div>

        {/* Searching and Dynamic Filtering Control Column */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          
          {/* Custom Minimal Search input field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 scale-90" size={16} />
            <input
              type="text"
              placeholder="Search zameen by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-xs font-display focus:outline-none border transition-all ${
                isDarkMode 
                  ? "bg-[#1A1A1A] border-stone-800 text-white placeholder:text-stone-500 focus:border-[#FF9E4A]" 
                  : "bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#FF9E4A]"
              }`}
            />
          </div>

          {/* Filter Navigation Pills - Mobile Responsive Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <Filter size={13} className="text-stone-400 hidden sm:block shrink-0" />
            {[
              { label: "All Properties", value: "all" },
              { label: "Estates / Haveli", value: "estates" },
              { label: "Home Schemes", value: "schemes" },
              { label: "Commercial", value: "commercial" },
              { label: "Apartments", value: "apartments" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setSelectedType(btn.value as any)}
                className={`px-4 py-2 rounded-full text-xs font-display uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedType === btn.value
                    ? "bg-[#FF9E4A] text-black font-semibold shadow-md"
                    : isDarkMode
                      ? "bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
                      : "bg-white border border-stone-200 text-stone-700 hover:border-black/20"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"}`}>
            <p className="font-display text-sm">No properties found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedType("all"); }}
              className="mt-3 px-4 py-2 rounded-full text-xs font-display uppercase bg-[#FF9E4A] text-black font-semibold cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((prop, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`group border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col justify-between h-full cursor-pointer ${
                    isDarkMode 
                      ? "bg-[#161615] border-stone-800 shadow-[0_5px_30px_rgba(0,0,0,0.2)] hover:border-[#FF9E4A]/40" 
                      : "bg-white border-stone-200 shadow-sm hover:shadow-xl hover:border-stone-900/20"
                  }`}
                >
                  <div>
                    {/* Photo frame */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-black">
                      <img
                        src={prop.image}
                        alt={prop.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {prop.tag}
                      </div>
                      <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-[#FF9E4A] text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {prop.category}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 sm:p-6 space-y-3.5">
                      {/* Top numbering / separator bar */}
                      <div className={`flex items-center justify-between pb-2 border-b ${isDarkMode ? "border-stone-850" : "border-stone-100"}`}>
                        <span className="text-[10px] font-mono tracking-widest text-[#FF9E4A] font-bold">
                          REG-0{idx + 10}
                        </span>
                        <span className="font-mono text-[9px] text-emerald-500 uppercase flex items-center gap-1 font-semibold truncate">
                          <ShieldCheck size={11} className="shrink-0" /> {prop.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className={`text-lg font-display font-medium tracking-tight group-hover:text-[#FF9E4A] transition-colors duration-300 line-clamp-2 ${
                          isDarkMode ? "text-white" : "text-[#1A1A1A]"
                        }`}>
                          {prop.title}
                        </h3>
                        <p className={`font-mono text-[10px] uppercase flex items-center gap-1 truncate ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                          <MapPin size={11} className="text-[#FF9E4A] shrink-0" /> {prop.location}
                        </p>
                      </div>

                      <p className={`text-xs font-light leading-relaxed line-clamp-2 ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                        {prop.description}
                      </p>
                    </div>
                  </div>

                  {/* Foot valuation container */}
                  <div className={`p-5 sm:p-6 pt-0 mt-auto flex items-end justify-between border-t ${isDarkMode ? "border-stone-850" : "border-stone-100"}`}>
                    <div className="space-y-0.5">
                      <span className={`font-mono text-[8px] uppercase tracking-widest block ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                        SECURED VALUE
                      </span>
                      <span className="text-base font-bold text-[#FF9E4A] font-display">{prop.price}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right font-mono text-[10px]">
                      <span className={`block ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>{prop.size}</span>
                      <span className="text-xs font-display flex items-center gap-1 text-[#FF9E4A] group-hover:translate-x-1 transition-transform">
                        Details <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal Inspector */}
        <AnimatePresence>
          {selectedProperty && (
            <div 
              onClick={() => setSelectedProperty(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className={`max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border my-auto rounded-3xl ${
                  isDarkMode ? "bg-[#161615] border-stone-800 text-white" : "bg-white border-[#E2E8F0] text-[#1A1A1A]"
                }`}
              >
                <button
                  onClick={() => setSelectedProperty(null)}
                  className={`absolute top-5 right-5 p-2 rounded-full border transition-all cursor-pointer z-10 ${
                    isDarkMode ? "hover:bg-stone-850 border-stone-800 text-stone-200" : "hover:bg-[#F7F7F5] border-stone-200 text-[#1A1A1A]"
                  }`}
                >
                  <X size={18} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start mt-4 text-left">
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden aspect-video relative bg-stone-900 border border-stone-800">
                      <img
                        src={selectedProperty.image}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono text-[#FF9E4A] uppercase tracking-wider">
                        {selectedProperty.tag}
                      </div>
                    </div>
                    <div className={`border p-4 rounded-2xl flex items-center gap-3 ${
                      isDarkMode ? "bg-stone-900/50 border-stone-800" : "bg-[#F7F7F5] border-stone-200"
                    }`}>
                      <Shield size={20} className="text-[#FF9E4A] shrink-0" />
                      <div className="flex flex-col">
                        <span className={`font-mono text-[9px] tracking-wider uppercase font-semibold ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                          100% REGISTRY TRANSFER GUARANTEE
                        </span>
                        <span className={`font-display text-xs font-light leading-snug ${isDarkMode ? "text-stone-300" : "text-stone-800"}`}>
                          Direct transfer deeds approved under Haji Saud Zehri personal office.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <span className="font-mono text-[10px] tracking-widest text-[#FF9E4A] uppercase font-bold">
                        {selectedProperty.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-medium tracking-tight mt-1 leading-snug">
                        {selectedProperty.title}
                      </h3>
                      <p className={`font-mono text-xs mt-1 flex items-center gap-1 ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                        <Compass size={12} className="text-[#FF9E4A]" />
                        <span>{selectedProperty.location}</span>
                      </p>
                    </div>

                    <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>
                      {selectedProperty.description}
                    </p>

                    {selectedProperty.specs && selectedProperty.specs.length > 0 && (
                      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 py-3 border-y ${isDarkMode ? "border-stone-800" : "border-stone-200"}`}>
                        {selectedProperty.specs.map((sp, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className={`font-mono text-[8px] uppercase tracking-widest leading-none mb-1 ${
                              isDarkMode ? "text-stone-400" : "text-stone-500"
                            }`}>
                              {sp.label}
                            </span>
                            <span className={`font-display text-xs font-semibold ${isDarkMode ? "text-[#FF9E4A]" : "text-stone-900"}`}>
                              {sp.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200/50 dark:border-stone-800/80">
                      <div>
                        <span className={`font-mono text-[8px] uppercase tracking-widest leading-none block mb-1 ${
                          isDarkMode ? "text-stone-400" : "text-stone-500"
                        }`}>
                          VALUATION IN PKR
                        </span>
                        <span className="font-display text-xl sm:text-2xl font-bold text-[#FF9E4A]">
                          {selectedProperty.price}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProperty(null);
                          onInquireClick(selectedProperty.title);
                        }}
                        className="px-6 py-3 rounded-full font-display text-xs font-semibold tracking-wider uppercase bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg transition-all w-full sm:w-auto cursor-pointer"
                      >
                        Inquire Directly
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
