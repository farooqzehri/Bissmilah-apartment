import React, { useState, useEffect } from "react";
import { 
  Save, Layers, Plus, Trash2, Edit3, Check, Eye, EyeOff, 
  HelpCircle, Star, Image as ImageIcon, Sparkles, RefreshCw
} from "lucide-react";
import { HomepageSections, AmenityItem, StatisticItem, GalleryItem, TestimonialItem, FAQItem } from "../../../types/cms";

interface HomepageTabProps {
  homepage: HomepageSections | null;
  onSave: (updates: Partial<HomepageSections>) => Promise<any>;
  onSaveSection: (section: string, data: any) => Promise<any>;
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export const HomepageTab: React.FC<HomepageTabProps> = ({
  homepage,
  onSave,
  onSaveSection,
  isDarkMode,
  onShowToast,
}) => {
  const [activeSectionTab, setActiveSectionTab] = useState<
    "hero" | "about" | "amenities" | "stats" | "gallery" | "testimonials" | "faqs" | "cta"
  >("hero");

  const [formData, setFormData] = useState<HomepageSections | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (homepage) {
      setFormData(JSON.parse(JSON.stringify(homepage)));
    }
  }, [homepage]);

  if (!formData) {
    return <div className="p-8 text-center text-xs font-mono">Loading homepage CMS...</div>;
  }

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onShowToast("All homepage sections updated and live.");
    } catch (err: any) {
      onShowToast("Failed to save homepage: " + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Section subtab buttons
  const sectionTabs = [
    { id: "hero", label: "Hero Banner" },
    { id: "about", label: "About & Legacy" },
    { id: "amenities", label: `Amenities (${formData.amenities.length})` },
    { id: "stats", label: `Statistics (${formData.stats.length})` },
    { id: "gallery", label: `Gallery (${formData.gallery.length})` },
    { id: "testimonials", label: `Testimonials (${formData.testimonials.length})` },
    { id: "faqs", label: `FAQs (${formData.faqs.length})` },
    { id: "cta", label: "CTA Office" },
  ] as const;

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-stone-800 border-stone-200">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            DYNAMIC CONTENT MANAGEMENT
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            Homepage Section CMS
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Directly modify headlines, copy, photos, amenities, verified statistics, and FAQs.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{isSaving ? "Saving..." : "Save Homepage Content"}</span>
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSectionTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-display whitespace-nowrap transition-all cursor-pointer border ${
              activeSectionTab === tab.id
                ? "bg-[#FF9E4A] text-black font-semibold border-[#FF9E4A] shadow-sm"
                : isDarkMode
                ? "bg-stone-900 border-stone-800 text-stone-300 hover:text-white"
                : "bg-white border-stone-200 text-stone-700 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. HERO SECTION */}
      {activeSectionTab === "hero" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Hero Heading Line 1
              </label>
              <input
                type="text"
                value={formData.hero.headingLine1}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, headingLine1: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Hero Heading Line 2 (Italic Accent)
              </label>
              <input
                type="text"
                value={formData.hero.headingLine2}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, headingLine2: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Top Subheading Badge
              </label>
              <input
                type="text"
                value={formData.hero.subheadingBadge}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, subheadingBadge: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Subheading Text
              </label>
              <input
                type="text"
                value={formData.hero.subheadingText}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, subheadingText: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Hero Editorial Description
              </label>
              <textarea
                rows={3}
                value={formData.hero.description}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, description: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Hero Background Image URL
              </label>
              <input
                type="text"
                value={formData.hero.backgroundImage}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, backgroundImage: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Primary Button Text
              </label>
              <input
                type="text"
                value={formData.hero.primaryButtonText}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, primaryButtonText: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Secondary Button Text
              </label>
              <input
                type="text"
                value={formData.hero.secondaryButtonText}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero, secondaryButtonText: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. ABOUT SECTION */}
      {activeSectionTab === "about" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Section Heading
              </label>
              <input
                type="text"
                value={formData.about.heading}
                onChange={(e) => setFormData({
                  ...formData,
                  about: { ...formData.about, heading: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Section Subtitle / Tag
              </label>
              <input
                type="text"
                value={formData.about.subheading}
                onChange={(e) => setFormData({
                  ...formData,
                  about: { ...formData.about, subheading: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                First Paragraph (History & Trust)
              </label>
              <textarea
                rows={3}
                value={formData.about.descriptionP1}
                onChange={(e) => setFormData({
                  ...formData,
                  about: { ...formData.about, descriptionP1: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Second Paragraph (Verification & Guarantees)
              </label>
              <textarea
                rows={3}
                value={formData.about.descriptionP2}
                onChange={(e) => setFormData({
                  ...formData,
                  about: { ...formData.about, descriptionP2: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Haji Saud Zehri Portrait Photo URL
              </label>
              <input
                type="text"
                value={formData.about.ownerImage}
                onChange={(e) => setFormData({
                  ...formData,
                  about: { ...formData.about, ownerImage: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. AMENITIES SECTION */}
      {activeSectionTab === "amenities" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-base">Features & Amenities</h3>
              <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Add, edit, publish or hide features like 24/7 solar backup, tube wells, and security checkpoints.
              </p>
            </div>
            <button
              onClick={() => {
                const newAmenity: AmenityItem = {
                  id: `amenity-${Date.now()}`,
                  name: "New Luxury Feature",
                  description: "Full description of utility, security, or lifestyle perk.",
                  icon: "ShieldCheck",
                  category: "General",
                  order: formData.amenities.length + 1,
                  published: true,
                };
                setFormData({ ...formData, amenities: [...formData.amenities, newAmenity] });
              }}
              className="px-4 py-2 rounded-xl text-xs font-display bg-[#FF9E4A] text-black font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Amenity</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.amenities.map((item, idx) => (
              <div 
                key={item.id}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-[#F9F9F8] border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Feature Name"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...formData.amenities];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, amenities: updated });
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-display border font-medium ${
                        isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g. Legal, Utilities)"
                      value={item.category}
                      onChange={(e) => {
                        const updated = [...formData.amenities];
                        updated[idx].category = e.target.value;
                        setFormData({ ...formData, amenities: updated });
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-mono border ${
                        isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                      }`}
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.published}
                          onChange={(e) => {
                            const updated = [...formData.amenities];
                            updated[idx].published = e.target.checked;
                            setFormData({ ...formData, amenities: updated });
                          }}
                          className="accent-[#FF9E4A]"
                        />
                        <span>{item.published ? "Published" : "Hidden"}</span>
                      </label>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            amenities: formData.amenities.filter((_, i) => i !== idx)
                          });
                        }}
                        className="text-stone-400 hover:text-rose-500 cursor-pointer p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Feature description / legal guarantee details..."
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...formData.amenities];
                    updated[idx].description = e.target.value;
                    setFormData({ ...formData, amenities: updated });
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-display border ${
                    isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. STATISTICS */}
      {activeSectionTab === "stats" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-base">Key Numbers & Track Record</h3>
              <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Real business metrics verified by Haji Saud Zehri.
              </p>
            </div>
            <button
              onClick={() => {
                const newStat: StatisticItem = {
                  id: `stat-${Date.now()}`,
                  label: "Metric Label",
                  value: "100+",
                  subtext: "Short explanation",
                  order: formData.stats.length + 1,
                  published: true,
                };
                setFormData({ ...formData, stats: [...formData.stats, newStat] });
              }}
              className="px-4 py-2 rounded-xl text-xs font-display bg-[#FF9E4A] text-black font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Stat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.stats.map((stat, idx) => (
              <div 
                key={stat.id}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-[#F9F9F8] border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Value (e.g. 100% or 14+)"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...formData.stats];
                      updated[idx].value = e.target.value;
                      setFormData({ ...formData, stats: updated });
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-display font-bold text-[#FF9E4A] border ${
                      isDarkMode ? "bg-stone-950 border-stone-800" : "bg-white border-stone-300"
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stat.published}
                        onChange={(e) => {
                          const updated = [...formData.stats];
                          updated[idx].published = e.target.checked;
                          setFormData({ ...formData, stats: updated });
                        }}
                        className="accent-[#FF9E4A]"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          stats: formData.stats.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-stone-400 hover:text-rose-500 cursor-pointer p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Metric Label (e.g. Registry Verified Units)"
                  value={stat.label}
                  onChange={(e) => {
                    const updated = [...formData.stats];
                    updated[idx].label = e.target.value;
                    setFormData({ ...formData, stats: updated });
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-display font-medium border ${
                    isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />

                <input
                  type="text"
                  placeholder="Subtext / Context"
                  value={stat.subtext}
                  onChange={(e) => {
                    const updated = [...formData.stats];
                    updated[idx].subtext = e.target.value;
                    setFormData({ ...formData, stats: updated });
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                    isDarkMode ? "bg-stone-950 border-stone-800 text-stone-400" : "bg-white border-stone-300 text-stone-600"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TESTIMONIALS */}
      {activeSectionTab === "testimonials" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-base">Client Testimonials</h3>
              <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Real reviews and testimonials from verified buyers across Quetta.
              </p>
            </div>
            <button
              onClick={() => {
                const newTestimonial: TestimonialItem = {
                  id: `test-${Date.now()}`,
                  clientName: "Respected Client Name",
                  location: "Quetta",
                  quote: "Bismillah Real Estate made the entire land transfer transparent and seamless.",
                  rating: 5,
                  propertyTitle: "The Zehri Heights",
                  order: formData.testimonials.length + 1,
                  published: true,
                };
                setFormData({ ...formData, testimonials: [...formData.testimonials, newTestimonial] });
              }}
              className="px-4 py-2 rounded-xl text-xs font-display bg-[#FF9E4A] text-black font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Review</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.testimonials.map((test, idx) => (
              <div 
                key={test.id}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-[#F9F9F8] border-stone-200"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={test.clientName}
                    onChange={(e) => {
                      const updated = [...formData.testimonials];
                      updated[idx].clientName = e.target.value;
                      setFormData({ ...formData, testimonials: updated });
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-display font-medium border ${
                      isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Location / Area in Quetta"
                    value={test.location}
                    onChange={(e) => {
                      const updated = [...formData.testimonials];
                      updated[idx].location = e.target.value;
                      setFormData({ ...formData, testimonials: updated });
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-mono border ${
                      isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Property Purchased"
                      value={test.propertyTitle || ""}
                      onChange={(e) => {
                        const updated = [...formData.testimonials];
                        updated[idx].propertyTitle = e.target.value;
                        setFormData({ ...formData, testimonials: updated });
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-display border ${
                        isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                      }`}
                    />
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          testimonials: formData.testimonials.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-stone-400 hover:text-rose-500 cursor-pointer p-1 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder="Testimonial text / review..."
                  value={test.quote}
                  onChange={(e) => {
                    const updated = [...formData.testimonials];
                    updated[idx].quote = e.target.value;
                    setFormData({ ...formData, testimonials: updated });
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-display border ${
                    isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FAQS */}
      {activeSectionTab === "faqs" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-base">Frequently Asked Questions</h3>
              <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Common questions regarding registry, titles, utilities, and installments.
              </p>
            </div>
            <button
              onClick={() => {
                const newFaq: FAQItem = {
                  id: `faq-${Date.now()}`,
                  question: "New FAQ Question?",
                  answer: "Detailed answer explaining the process.",
                  category: "General",
                  order: formData.faqs.length + 1,
                  published: true,
                };
                setFormData({ ...formData, faqs: [...formData.faqs, newFaq] });
              }}
              className="px-4 py-2 rounded-xl text-xs font-display bg-[#FF9E4A] text-black font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.faqs.map((faq, idx) => (
              <div 
                key={faq.id}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-[#F9F9F8] border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Question..."
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...formData.faqs];
                      updated[idx].question = e.target.value;
                      setFormData({ ...formData, faqs: updated });
                    }}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-display font-medium border ${
                      isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={faq.category}
                    onChange={(e) => {
                      const updated = [...formData.faqs];
                      updated[idx].category = e.target.value;
                      setFormData({ ...formData, faqs: updated });
                    }}
                    className={`w-32 px-3 py-2 rounded-xl text-xs font-mono border ${
                      isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        faqs: formData.faqs.filter((_, i) => i !== idx)
                      });
                    }}
                    className="text-stone-400 hover:text-rose-500 cursor-pointer p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Answer..."
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...formData.faqs];
                    updated[idx].answer = e.target.value;
                    setFormData({ ...formData, faqs: updated });
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-display border leading-relaxed ${
                    isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. GALLERY & CTA */}
      {activeSectionTab === "gallery" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-base">Curated Homepage Gallery</h3>
              <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Architectural showcases highlighted on the homepage.
              </p>
            </div>
            <button
              onClick={() => {
                const newGal: GalleryItem = {
                  id: `gal-${Date.now()}`,
                  title: "Architectural Showcase",
                  altText: "Bismillah Real Estate photo",
                  url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                  category: "Estates",
                  featured: true,
                  order: formData.gallery.length + 1,
                };
                setFormData({ ...formData, gallery: [...formData.gallery, newGal] });
              }}
              className="px-4 py-2 rounded-xl text-xs font-display bg-[#FF9E4A] text-black font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.gallery.map((item, idx) => (
              <div 
                key={item.id}
                className={`p-4 rounded-2xl border flex gap-4 ${
                  isDarkMode ? "bg-stone-900/60 border-stone-800" : "bg-[#F9F9F8] border-stone-200"
                }`}
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-stone-800">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Photo Title"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...formData.gallery];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, gallery: updated });
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-display font-medium border ${
                      isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={item.url}
                    onChange={(e) => {
                      const updated = [...formData.gallery];
                      updated[idx].url = e.target.value;
                      setFormData({ ...formData, gallery: updated });
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                      isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Category"
                      value={item.category}
                      onChange={(e) => {
                        const updated = [...formData.gallery];
                        updated[idx].category = e.target.value;
                        setFormData({ ...formData, gallery: updated });
                      }}
                      className={`w-28 px-2 py-1 rounded-lg text-[11px] font-mono border ${
                        isDarkMode ? "bg-stone-950 border-stone-800" : "bg-white border-stone-300"
                      }`}
                    />
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          gallery: formData.gallery.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-stone-400 hover:text-rose-500 cursor-pointer p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. CTA */}
      {activeSectionTab === "cta" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                CTA Header Badge
              </label>
              <input
                type="text"
                value={formData.cta.badge}
                onChange={(e) => setFormData({
                  ...formData,
                  cta: { ...formData.cta, badge: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Office Location Note
              </label>
              <input
                type="text"
                value={formData.cta.officeLocationNote}
                onChange={(e) => setFormData({
                  ...formData,
                  cta: { ...formData.cta, officeLocationNote: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                CTA Main Headline
              </label>
              <input
                type="text"
                value={formData.cta.heading}
                onChange={(e) => setFormData({
                  ...formData,
                  cta: { ...formData.cta, heading: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                CTA Descriptive Invite
              </label>
              <textarea
                rows={3}
                value={formData.cta.description}
                onChange={(e) => setFormData({
                  ...formData,
                  cta: { ...formData.cta, description: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
