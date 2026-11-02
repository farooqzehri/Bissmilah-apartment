import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, Box, Compass, Maximize2, Shield, Sparkles, X, Check, CheckCircle2, Bed, Bath, Layers, MapPin, Eye } from "lucide-react";
import { PropertyItem } from "../../types/property";
import { useProperties } from "../../utils/propertyStore";

interface CatalogProps {
  isDarkMode: boolean;
  onInquireClick: (propertyTitle: string) => void;
  selectedCategoryFilter?: string;
}

export const Catalog: React.FC<CatalogProps> = ({ 
  isDarkMode, 
  onInquireClick,
  selectedCategoryFilter 
}) => {
  const { properties } = useProperties();
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategoryFilter || "all");
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState<number>(0);

  // Sync prop changes
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setActiveCategory(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const categories = [
    { label: "All Architectural Holdings", value: "all" },
    { label: "Duplex Penthouses", value: "apartments" },
    { label: "Walled Estates", value: "estates" },
    { label: "Commercial Boulevard", value: "commercial" },
    { label: "Masterplanned Schemes", value: "schemes" },
  ] as const;

  const publishedProperties = properties.filter((p) => p.published !== false);
  const filteredProperties = activeCategory === "all"
    ? publishedProperties
    : publishedProperties.filter((p) => p.category === activeCategory);

  const openPropertyModal = (p: PropertyItem) => {
    setSelectedProperty(p);
    setActiveModalImageIndex(0);
  };

  return (
    <section 
      id="curation" 
      className={`py-20 sm:py-28 md:py-36 border-t relative transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#0D0D0C] border-stone-850 text-[#F7F6F2]" 
          : "bg-[#FAF8F5] border-stone-200/80 text-[#141413]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6 pb-6 border-b dark:border-stone-850 border-stone-200">
          <div className="flex flex-col text-left items-start max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#DF9B43] shadow-[0_0_8px_#DF9B43] animate-pulse" />
              <span className={`font-mono text-[10px] tracking-[0.25em] uppercase font-semibold ${
                isDarkMode ? "text-stone-400" : "text-stone-600"
              }`}>
                02 / ARCHITECTURAL PORTFOLIO
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
              Curated <span className="font-serif italic font-normal text-[#DF9B43]">Estates & Residences</span>
            </h2>
            
            <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed ${
              isDarkMode ? "text-stone-400" : "text-stone-600"
            }`}>
              Every property is inspected and certified by Haji Saud Zehri. Delivered with 100% verified Balochistan Land Revenue mutation deeds, independent solar power, and deep sweet-water tube well access.
            </p>
          </div>

          {/* California Segmented Category Switcher */}
          <div 
            id="catalog-filters" 
            className={`flex items-center gap-1.5 p-1 rounded-2xl border overflow-x-auto max-w-full no-scrollbar ${
              isDarkMode 
                ? "bg-[#161614] border-stone-800" 
                : "bg-[#F3EFE8] border-stone-200"
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-display tracking-wider uppercase transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCategory === cat.value
                    ? "bg-[#DF9B43] text-black font-semibold shadow-sm"
                    : isDarkMode 
                      ? "text-stone-400 hover:text-white" 
                      : "text-stone-600 hover:text-black"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* California Luxury Property Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((p, idx) => {
              const galleryImages = [p.image, ...(p.gallery || [])];
              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.7, delay: idx * 0.08 }}
                  key={p.id}
                  className={`group relative rounded-3xl overflow-hidden border flex flex-col transition-all duration-500 ${
                    isDarkMode 
                      ? "bg-[#141412] border-white/[0.07] hover:border-[#DF9B43]/50 shadow-[0_12px_40px_rgba(0,0,0,0.5)]" 
                      : "bg-white border-stone-200 hover:border-black/20 shadow-[0_12px_35px_rgba(0,0,0,0.04)] hover:shadow-xl"
                  }`}
                >
                  {/* Aspect Ratio 16:10 Cinematic Architectural Photo */}
                  <div 
                    onClick={() => openPropertyModal(p)}
                    className="relative aspect-[16/10] overflow-hidden bg-stone-900 cursor-pointer"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />

                    {/* Gradient shadow for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Right Luxury Tag */}
                    <div className="absolute top-4 right-4 backdrop-blur-md px-3.5 py-1.5 rounded-full bg-black/60 border border-white/20 text-white font-mono text-[9px] uppercase tracking-widest font-medium">
                      {p.tag}
                    </div>

                    {/* Top Left Numbering */}
                    <div className="absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-full bg-black/50 border border-white/10 text-stone-300 font-mono text-[9px] uppercase tracking-widest">
                      0{idx + 1}
                    </div>

                    {/* Bottom Image Overlay: Title & Price */}
                    <div className="absolute bottom-4 left-4 right-4 text-left text-white flex items-end justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-[#DF9B43] font-mono text-[10px] tracking-widest uppercase mb-1">
                          <Compass size={11} className="shrink-0" />
                          <span>{p.location}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-display font-medium tracking-tight leading-snug line-clamp-1 group-hover:text-[#DF9B43] transition-colors">
                          {p.title}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-stone-300 block">
                          VALUATION
                        </span>
                        <span className="text-base sm:text-lg font-display font-semibold text-[#DF9B43]">
                          {p.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Specs & Architectural Highlights */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between text-left">
                    <div>
                      {/* Unboxed Metadata Strip */}
                      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-4 border-b text-xs font-mono tracking-wider uppercase ${
                        isDarkMode ? "border-stone-850 text-stone-400" : "border-stone-100 text-stone-600"
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Box size={13} className="text-[#DF9B43]" /> {p.size}
                        </span>
                        <span aria-hidden="true">·</span>
                        {p.bedrooms && (
                          <>
                            <span className="flex items-center gap-1.5">
                              <Bed size={13} className="text-[#DF9B43]" /> {p.bedrooms} Beds
                            </span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        {p.bathrooms && (
                          <>
                            <span className="flex items-center gap-1.5">
                              <Bath size={13} className="text-[#DF9B43]" /> {p.bathrooms} Baths
                            </span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span className="text-emerald-500 font-medium">
                          {p.status}
                        </span>
                      </div>

                      {/* Editorial Description Excerpt */}
                      <p className={`text-xs sm:text-sm font-light leading-relaxed mt-4 line-clamp-2 ${
                        isDarkMode ? "text-stone-300" : "text-stone-700"
                      }`}>
                        {p.description}
                      </p>

                      {/* Spec Badges List */}
                      {p.highlights && p.highlights.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {p.highlights.slice(0, 2).map((h, i) => (
                            <span 
                              key={i} 
                              className={`text-[10px] font-mono px-3 py-1 rounded-lg border ${
                                isDarkMode 
                                  ? "bg-stone-900/60 border-stone-800 text-stone-300" 
                                  : "bg-stone-50 border-stone-200 text-stone-700"
                              }`}
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="mt-6 pt-5 border-t dark:border-stone-850 border-stone-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => openPropertyModal(p)}
                        className={`px-4 py-2.5 rounded-full text-xs font-display tracking-wider uppercase font-medium border flex items-center gap-2 cursor-pointer transition-colors ${
                          isDarkMode 
                            ? "border-stone-750 text-stone-300 hover:text-white hover:border-white" 
                            : "border-stone-300 text-stone-700 hover:text-black hover:border-black"
                        }`}
                      >
                        <Eye size={13} />
                        <span>View Specs</span>
                      </button>

                      <button
                        onClick={() => onInquireClick(p.title)}
                        className="px-5 py-2.5 rounded-full text-xs font-display tracking-widest uppercase font-semibold bg-[#DF9B43] hover:bg-[#c88532] text-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        <span>Schedule Showing</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* High-Fidelity Architectural Dossier Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProperty(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl z-10 text-left my-auto ${
                isDarkMode 
                  ? "bg-[#141412] border-stone-750 text-white" 
                  : "bg-white border-stone-200 text-stone-900"
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer border border-white/20 transition-all"
              >
                <X size={18} />
              </button>

              {/* Main Image with Carousel Selection */}
              <div className="relative aspect-[16/9] w-full bg-stone-900 overflow-hidden">
                <img
                  src={[selectedProperty.image, ...(selectedProperty.gallery || [])][activeModalImageIndex] || selectedProperty.image}
                  alt={selectedProperty.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-[#DF9B43] uppercase block mb-1">
                      {selectedProperty.location}
                    </span>
                    <h2 className="text-xl sm:text-3xl font-display font-medium tracking-tight">
                      {selectedProperty.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] text-stone-300 uppercase tracking-widest block">
                      PURCHASE PRICE
                    </span>
                    <span className="text-xl sm:text-2xl font-display font-semibold text-[#DF9B43]">
                      {selectedProperty.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {selectedProperty.gallery && selectedProperty.gallery.length > 0 && (
                <div className="p-4 flex gap-2 overflow-x-auto border-b dark:border-stone-800 border-stone-200 bg-stone-950/20">
                  {[selectedProperty.image, ...selectedProperty.gallery].map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveModalImageIndex(i)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        activeModalImageIndex === i ? "border-[#DF9B43] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Details & Specs Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Highlights grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl border dark:border-stone-800 border-stone-200 dark:bg-stone-900/50 bg-stone-50">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block">
                      TOTAL AREA
                    </span>
                    <span className="font-display font-semibold text-sm sm:text-base mt-0.5 block">
                      {selectedProperty.size}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block">
                      REGISTRY MUTATION
                    </span>
                    <span className="font-display font-semibold text-sm sm:text-base mt-0.5 block text-emerald-500">
                      {selectedProperty.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block">
                      AVAILABILITY
                    </span>
                    <span className="font-display font-semibold text-sm sm:text-base mt-0.5 block text-[#DF9B43]">
                      {selectedProperty.availability || "Available"}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 block">
                      ZONING
                    </span>
                    <span className="font-display font-semibold text-sm sm:text-base mt-0.5 block">
                      {selectedProperty.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-display font-medium text-sm uppercase tracking-wider text-[#DF9B43] mb-2">
                    Architectural Overview
                  </h4>
                  <p className={`text-xs sm:text-sm font-light leading-relaxed ${
                    isDarkMode ? "text-stone-300" : "text-stone-700"
                  }`}>
                    {selectedProperty.description}
                  </p>
                </div>

                {/* Highlights */}
                {selectedProperty.highlights && selectedProperty.highlights.length > 0 && (
                  <div>
                    <h4 className="font-display font-medium text-sm uppercase tracking-wider text-[#DF9B43] mb-2">
                      Key Highlights & Features
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-light">
                      {selectedProperty.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check size={14} className="text-[#DF9B43] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Direct Action Footer */}
                <div className="pt-6 border-t dark:border-stone-800 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block">
                      DIRECT DESK OF HAJI SAUD ZEHRI
                    </span>
                    <span className="font-display font-medium text-xs">
                      Mutation documents ready for instant physical inspection.
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const title = selectedProperty.title;
                      setSelectedProperty(null);
                      onInquireClick(title);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#DF9B43] hover:bg-[#c88532] text-black font-display font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Request Private Showing</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
