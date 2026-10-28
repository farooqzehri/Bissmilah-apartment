import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Box, Compass, Maximize2, Shield, Sparkles, X } from "lucide-react";
import { PropertyItem } from "../../types/property";
import { useProperties } from "../../utils/propertyStore";

interface CatalogProps {
  isDarkMode: boolean;
  onInquireClick: (propertyTitle: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ isDarkMode, onInquireClick }) => {
  const { properties } = useProperties();
  const [activeCategory, setActiveCategory] = useState<"all" | "apartments" | "estates" | "schemes" | "commercial">("all");
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);

  const categories = [
    { label: "All Properties", value: "all" },
    { label: "Premium Apartments", value: "apartments" },
    { label: "Elite Estates", value: "estates" },
    { label: "Home Schemes", value: "schemes" },
    { label: "Commercial", value: "commercial" },
  ] as const;

  const filteredProperties = activeCategory === "all"
    ? properties
    : properties.filter((p) => p.category === activeCategory);

  return (
    <section 
      id="curation" 
      className={`py-20 md:py-32 border-t relative transition-colors duration-500 ${
        isDarkMode ? "bg-[#111110] border-stone-850 text-[#F7F7F5]" : "bg-[#F7F7F5] border-[#E2E8F0]/45 text-[#1A1A1A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Curation Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="flex flex-col text-left items-start">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF9E4A] animate-pulse" />
              <span className={`font-mono text-[10px] tracking-wider uppercase font-semibold ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/65"}`}>
                BISMILLAH SELECTIONS — LIVE CATALOG
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
              Shandaar <span className="font-serif italic text-[#FF9E4A]">Zameen aur Flats</span>
            </h2>
            <p className={`max-w-md text-xs sm:text-sm font-light mt-3 leading-relaxed ${isDarkMode ? "text-stone-400" : "text-[#1A1A1A]/60"}`}>
              Hamaray paas har kism ki zameen aur flats hain jin ki files bilkul clear aur verified hain. Buy with 100% safety and supreme comfort.
            </p>
          </div>

          {/* Luxury Filtering Navigation Pills - Horizontal scroll on mobile */}
          <div 
            id="catalog-filters" 
            className={`flex items-center gap-2 overflow-x-auto pb-2 pt-2 border-t md:border-t-0 max-w-full no-scrollbar ${
              isDarkMode ? "border-stone-850" : "border-[#E2E8F0]/50"
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value as any)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-display tracking-wide uppercase transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCategory === cat.value
                    ? "bg-[#FF9E4A] text-black font-semibold shadow-md"
                    : isDarkMode 
                      ? "bg-stone-900 border border-stone-800 text-stone-300 hover:border-[#FF9E4A]/30 hover:text-white hover:bg-stone-850"
                      : "bg-white border border-[#E2E8F0] text-stone-700 hover:border-black/20 hover:bg-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curation Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((p, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                key={p.id}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col h-full border ${
                  isDarkMode 
                    ? "bg-[#161615] border-stone-850 hover:border-[#FF9E4A]/40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" 
                    : "bg-white border-[#E2E8F0]/80 shadow-sm hover:shadow-xl hover:border-black/15"
                }`}
                onClick={() => setSelectedProperty(p)}
              >
                {/* Image Showcase Frame */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img
                    src={p.image}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-transform duration-700 ease-in-out scale-100 group-hover:scale-105"
                  />
                  {/* Subtle Top-Right Premium Badge */}
                  <div className={`absolute top-3 right-3 backdrop-blur-md px-3 py-1 rounded-full border font-mono text-[9px] font-medium tracking-wide uppercase ${
                    isDarkMode ? "bg-black/70 border-stone-800 text-stone-200" : "bg-white/80 border-white/40 text-stone-900"
                  }`}>
                    {p.tag}
                  </div>
                  {/* Hover bottom-up gradient veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5">
                    <span className="text-[11px] font-mono tracking-widest text-[#F7F7F5] uppercase flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#FF9E4A]" /> Inspect Specs
                    </span>
                    <ArrowRight size={14} className="text-[#FF9E4A]" />
                  </div>
                </div>

                {/* Property Detail Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between text-left items-start">
                  <div className="w-full">
                    {/* Editorial Numbering & Category */}
                    <div className={`flex items-center justify-between w-full mb-3 pb-1 border-b ${isDarkMode ? "border-stone-850" : "border-stone-100"}`}>
                      <span className={`text-[10px] font-mono uppercase tracking-[0.25em] font-bold ${isDarkMode ? "text-stone-500" : "text-stone-400"}`}>
                        0{idx + 1} • {p.category}
                      </span>
                      <div className="w-6 h-[1.5px] bg-[#FF9E4A]"></div>
                    </div>

                    {/* Location Badge */}
                    <div className="flex items-center gap-1.5 text-[#FF9E4A] font-mono text-[10px] tracking-wider uppercase mb-1.5">
                      <Compass size={11} className="stroke-[1.5] shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>

                    {/* Headline Title */}
                    <h3 className={`text-base sm:text-lg font-display font-medium tracking-tight group-hover:text-[#FF9E4A] transition-colors duration-300 mb-1 leading-snug line-clamp-2 ${
                      isDarkMode ? "text-white" : "text-[#1A1A1A]"
                    }`}>
                      {p.title}
                    </h3>

                    {/* Dimensions & Features */}
                    <div className={`flex items-center gap-2.5 text-xs font-light mt-2 pb-3 border-b w-full ${
                      isDarkMode ? "border-stone-850 text-stone-400" : "border-stone-100 text-stone-500"
                    }`}>
                      <span className="flex items-center gap-1">
                        <Box size={11} className="text-[#FF9E4A]" /> {p.size}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#FF9E4A]/40" />
                      <span className="truncate">{p.specs?.[0]?.value || p.status}</span>
                    </div>
                  </div>

                  {/* Financial Curation Block */}
                  <div className="flex items-center justify-between w-full mt-4 pt-1">
                    <div className="flex flex-col">
                      <span className={`font-mono text-[8px] uppercase tracking-widest leading-none mb-1 ${
                        isDarkMode ? "text-stone-400" : "text-stone-500"
                      }`}>
                        SECURED VALUATION
                      </span>
                      <span className="font-display font-semibold text-[#FF9E4A] text-base sm:text-lg">
                        {p.price}
                      </span>
                    </div>
                    <span className={`text-xs font-display font-medium group-hover:translate-x-1 group-hover:text-[#FF9E4A] transition-all duration-300 flex items-center gap-1 ${
                      isDarkMode ? "text-stone-300" : "text-stone-700"
                    }`}>
                      View Details <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Spec Inspector Overlay / Sliding Drawer Modal for Details */}
        <AnimatePresence>
          {selectedProperty && (
            <div 
              id="inspector-modal-backdrop" 
              onClick={() => setSelectedProperty(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
                id="inspector-modal-content"
                onClick={(e) => e.stopPropagation()}
                className={`max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border my-auto rounded-3xl ${
                  isDarkMode 
                    ? "bg-[#161615] border-stone-800 text-white" 
                    : "bg-white border-[#E2E8F0] text-[#1A1A1A]"
                }`}
              >
                {/* Close Button Anchor */}
                <button
                  onClick={() => setSelectedProperty(null)}
                  className={`absolute top-5 right-5 p-2 rounded-full border transition-all cursor-pointer z-10 ${
                    isDarkMode 
                      ? "hover:bg-stone-850 border-stone-800 text-stone-200 hover:text-white" 
                      : "hover:bg-[#F7F7F5] border-stone-200 text-[#1A1A1A]"
                  }`}
                >
                  <X size={18} />
                </button>

                {/* Grid Layout inside Drawer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start mt-4 text-left">
                  {/* Left Column: Image & Location */}
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden aspect-video relative bg-stone-900 border border-stone-800">
                      <img
                        src={selectedProperty.image}
                        alt={selectedProperty.title}
                        referrerPolicy="no-referrer"
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
                          100% SECURED TITLE RECORD
                        </span>
                        <span className={`font-display text-xs font-light leading-snug ${isDarkMode ? "text-stone-300" : "text-stone-800"}`}>
                          All registry coordinates and ownership deeds certified by Haji Saud Zehri.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Descriptions and Highlights */}
                  <div className="space-y-5">
                    <div>
                      <span className="font-mono text-[10px] tracking-widest text-[#FF9E4A] uppercase font-bold">
                        {selectedProperty.category} Showcase
                      </span>
                      <h3 className={`text-xl sm:text-2xl font-display font-medium tracking-tight mt-1 leading-snug ${
                        isDarkMode ? "text-white" : "text-[#1A1A1A]"
                      }`}>
                        {selectedProperty.title}
                      </h3>
                      <p className={`font-mono text-xs mt-1 flex items-center gap-1 ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                        <Compass size={12} className="text-[#FF9E4A]" />
                        <span>{selectedProperty.location}</span>
                      </p>
                    </div>

                    {/* Overview description if available */}
                    {selectedProperty.description && (
                      <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>
                        {selectedProperty.description}
                      </p>
                    )}

                    {/* Key Specifications Grid */}
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

                    {/* Premium Narrative Points */}
                    {selectedProperty.highlights && selectedProperty.highlights.length > 0 && (
                      <div className="space-y-2.5">
                        <span className={`font-mono text-[9px] tracking-widest uppercase font-semibold ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                          KEY PROPERTY ADVANTAGES
                        </span>
                        <ul className="space-y-2">
                          {selectedProperty.highlights.map((h, idx) => (
                            <li key={idx} className={`flex items-start gap-2.5 text-xs font-light leading-relaxed ${
                              isDarkMode ? "text-stone-300" : "text-stone-700"
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9E4A] mt-1.5 shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Details panel */}
                    <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200/50 dark:border-stone-800/80">
                      <div className="flex-1 text-left w-full sm:w-auto">
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
                        className="text-center px-6 py-3 rounded-full font-display text-xs font-semibold tracking-wider uppercase bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg transition-all w-full sm:w-auto cursor-pointer"
                      >
                        Request Private Booking
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
