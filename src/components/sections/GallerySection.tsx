import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Maximize2, X, Sparkles, Compass } from "lucide-react";
import { useCMS } from "../../utils/cmsContext";
import { GalleryItem } from "../../types/cms";

interface GallerySectionProps {
  isDarkMode: boolean;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ isDarkMode }) => {
  const { homepage, settings } = useCMS();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  if (
    !settings?.behavior.sectionToggles.gallery ||
    !homepage ||
    !homepage.gallery ||
    homepage.gallery.length === 0
  ) {
    return null;
  }

  const galleryItems = homepage.gallery;
  const categories = ["all", ...Array.from(new Set(galleryItems.map((g) => g.category)))];

  const filtered = activeCategory === "all"
    ? galleryItems
    : galleryItems.filter((g) => g.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section 
      id="gallery-section"
      className={`py-20 sm:py-28 md:py-36 border-t relative transition-colors duration-500 ${
        isDarkMode 
          ? "bg-[#090908] border-stone-850 text-[#F7F6F2]" 
          : "bg-[#F5F2EB] border-stone-200/80 text-[#141413]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 text-left">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6 pb-6 border-b dark:border-stone-850 border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#DF9B43] animate-pulse" />
              <span className={`font-mono text-[10px] tracking-[0.25em] uppercase font-semibold ${
                isDarkMode ? "text-stone-400" : "text-stone-600"
              }`}>
                05 / VISUAL MONOGRAPH
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
              Architectural <span className="font-serif italic font-normal text-[#DF9B43]">Perspectives</span>
            </h2>

            <p className={`text-xs sm:text-sm font-light mt-3 leading-relaxed max-w-xl ${
              isDarkMode ? "text-stone-400" : "text-stone-600"
            }`}>
              Explore elevation perspectives, interior foyer marble, mountain view balconies, and roadside commercial landmarks built under Haji Saud Zehri leadership.
            </p>
          </div>

          {/* Category Tabs */}
          <div className={`flex items-center gap-1.5 p-1 rounded-2xl border overflow-x-auto max-w-full ${
            isDarkMode ? "bg-[#161614] border-stone-800" : "bg-[#EAE6DF] border-stone-300"
          }`}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-display uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#DF9B43] text-black font-semibold shadow-sm"
                    : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-black"
                }`}
              >
                {cat === "all" ? "All Frames" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className={`group relative rounded-3xl overflow-hidden border aspect-[4/5] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 ${
                  isDarkMode ? "border-stone-800 bg-stone-900" : "border-stone-200 bg-white"
                }`}
              >
                <img
                  src={item.url}
                  alt={item.altText || item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={14} />
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-left text-white">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#DF9B43] block mb-0.5">
                    {item.category}
                  </span>
                  <h3 className="font-display font-medium text-sm sm:text-base leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="font-light text-xs text-stone-300 mt-0.5 line-clamp-1">
                    {item.altText}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxItem(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden border border-stone-700 shadow-2xl z-10 bg-black text-left"
            >
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer border border-white/20"
              >
                <X size={18} />
              </button>

              <div className="relative max-h-[75vh] flex items-center justify-center bg-black">
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.altText}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>

              <div className="p-5 sm:p-6 bg-[#111110] text-white flex items-center justify-between border-t border-stone-800">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#DF9B43] uppercase block">
                    {lightboxItem.category} · HAJI SAUD ZEHRI ARCHIVE
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-medium mt-0.5">
                    {lightboxItem.title}
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    {lightboxItem.altText}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block">
                    STATUS
                  </span>
                  <span className="font-display text-xs text-stone-300">
                    Verified Revenue Plot
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
