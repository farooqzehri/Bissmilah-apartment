import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, Plus, Search, Edit3, Trash2, ArrowUpRight, 
  RotateCcw, ShieldCheck, Home, Eye, CheckCircle2, Sparkles, 
  MapPin, Tag, Filter, LayoutGrid, List, Check, ArrowLeft
} from "lucide-react";
import { PropertyItem, PropertyCategory } from "../../types/property";
import { useProperties } from "../../utils/propertyStore";
import { PropertyFormModal } from "./PropertyFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface AdminDashboardProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
  isDarkMode,
}) => {
  const { properties, addProperty, updateProperty, deleteProperty, resetToDefaults } = useProperties();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | PropertyCategory>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<PropertyItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.price.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [properties, searchQuery, selectedCategory]);

  // Statistics
  const stats = useMemo(() => {
    const total = properties.length;
    const apartments = properties.filter((p) => p.category === "apartments").length;
    const estates = properties.filter((p) => p.category === "estates").length;
    const schemes = properties.filter((p) => p.category === "schemes").length;
    const commercial = properties.filter((p) => p.category === "commercial").length;
    return { total, apartments, estates, schemes, commercial };
  }, [properties]);

  // CRUD Handlers
  const handleOpenCreate = () => {
    setPropertyToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prop: PropertyItem) => {
    setPropertyToEdit(prop);
    setIsFormOpen(true);
  };

  const handleSaveProperty = (data: Omit<PropertyItem, "id" | "createdAt" | "updatedAt">) => {
    if (propertyToEdit) {
      updateProperty(propertyToEdit.id, data);
      showToast(`Updated "${data.title}" successfully.`);
    } else {
      addProperty(data);
      showToast(`Created new listing "${data.title}".`);
    }
    setIsFormOpen(false);
    setPropertyToEdit(null);
  };

  const handleOpenDelete = (prop: PropertyItem) => {
    setPropertyToDelete(prop);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (propertyToDelete) {
      deleteProperty(propertyToDelete.id);
      showToast(`Removed "${propertyToDelete.title}".`);
    }
    setIsDeleteModalOpen(false);
    setPropertyToDelete(null);
  };

  const handleResetCatalog = () => {
    if (window.confirm("Are you sure you want to reset all listings to factory default properties? Any custom items will be restored.")) {
      resetToDefaults();
      showToast("Property catalog reset to initial records.");
    }
  };

  const handleToggleFeatured = (prop: PropertyItem) => {
    updateProperty(prop.id, { featured: !prop.featured });
    showToast(
      !prop.featured 
        ? `Added "${prop.title}" to Featured showcase.`
        : `Removed "${prop.title}" from Featured showcase.`
    );
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-4 md:px-8 text-left transition-colors duration-500 ${
      isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"
    }`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 sm:right-8 z-50 px-5 py-3 rounded-2xl bg-[#1A1A1A] text-white border border-[#FF9E4A]/40 shadow-2xl flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-[#FF9E4A] text-black flex items-center justify-center">
              <Check size={14} className="stroke-[3]" />
            </div>
            <span className="text-xs font-display">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Control Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2E8F0]/30 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-stone-400 hover:text-[#FF9E4A] transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} />
                <span>Return to Client Website</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl sm:text-4xl font-light tracking-tight">
                Haji Saud Zehri <span className="font-serif italic text-[#FF9E4A]">Admin CMS</span>
              </h1>
            </div>
            <p className={`text-xs sm:text-sm font-light mt-1.5 max-w-xl ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
              Full Real Estate Directory CRUD Management with real-time image uploads, category assignments, and immediate website synchronization.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetCatalog}
              className={`px-4 py-2.5 rounded-full text-xs font-display tracking-wider uppercase border flex items-center gap-2 transition-all cursor-pointer ${
                isDarkMode 
                  ? "bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700" 
                  : "bg-white border-stone-200 text-stone-600 hover:text-black hover:border-stone-300"
              }`}
              title="Reset sample properties to initial state"
            >
              <RotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-6 py-2.5 rounded-full text-xs font-display tracking-wider uppercase font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Analytics & Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
            <span className={`font-mono text-[9px] uppercase tracking-widest block ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
              TOTAL LISTINGS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-light font-display">{stats.total}</span>
              <span className="font-mono text-[10px] text-emerald-500 font-semibold">Active</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
            <span className={`font-mono text-[9px] uppercase tracking-widest block ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
              APARTMENTS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-light font-display text-[#FF9E4A]">{stats.apartments}</span>
              <span className="font-mono text-[10px] text-stone-400">Flats</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
            <span className={`font-mono text-[9px] uppercase tracking-widest block ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
              ELITE ESTATES
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-light font-display text-[#FF9E4A]">{stats.estates}</span>
              <span className="font-mono text-[10px] text-stone-400">Haveli</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
            <span className={`font-mono text-[9px] uppercase tracking-widest block ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
              HOME SCHEMES
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-light font-display text-[#FF9E4A]">{stats.schemes}</span>
              <span className="font-mono text-[10px] text-stone-400">Plots</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border col-span-2 sm:col-span-1 ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
            <span className={`font-mono text-[9px] uppercase tracking-widest block ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
              COMMERCIAL
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-light font-display text-[#FF9E4A]">{stats.commercial}</span>
              <span className="font-mono text-[10px] text-stone-400">Plazas</span>
            </div>
          </div>
        </div>

        {/* Filter and View Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 scale-90" size={16} />
            <input
              type="text"
              placeholder="Search by title, location, tag or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-all ${
                isDarkMode 
                  ? "bg-stone-900 border-stone-800 text-white placeholder:text-stone-500" 
                  : "bg-white border-stone-200 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {/* Category Filter Chips */}
            <div className={`flex rounded-xl p-1 border shrink-0 ${
              isDarkMode ? "bg-stone-900 border-stone-800" : "bg-stone-200/60 border-stone-300"
            }`}>
              {[
                { label: "All", value: "all" },
                { label: "Apartments", value: "apartments" },
                { label: "Estates", value: "estates" },
                { label: "Schemes", value: "schemes" },
                { label: "Commercial", value: "commercial" },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
                      : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* View Switcher: Table vs Cards */}
            <div className={`hidden sm:flex rounded-xl p-1 border shrink-0 ${
              isDarkMode ? "bg-stone-900 border-stone-800" : "bg-stone-200/60 border-stone-300"
            }`}>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
                    : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
                }`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
                    : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Listing Showcase (Table or Grid) */}
        {filteredProperties.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"}`}>
            <Building2 size={36} className="mx-auto text-stone-400 mb-3" />
            <h3 className="font-display text-base font-medium">No properties match your filter</h3>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
              Try altering your search keywords or category selection.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="mt-4 px-4 py-2 rounded-full text-xs font-display uppercase tracking-wider bg-[#FF9E4A] text-black font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            {viewMode === "table" ? (
              <div className={`rounded-3xl border overflow-hidden hidden md:block ${
                isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                        isDarkMode ? "border-stone-800 text-stone-400 bg-stone-900/40" : "border-stone-200 text-stone-500 bg-[#F9F9F8]"
                      }`}>
                        <th className="p-4 pl-6">Property / Photo</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Valuation</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Legal Status</th>
                        <th className="p-4">Featured</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/50 dark:divide-stone-800/80 text-xs">
                      {filteredProperties.map((prop) => (
                        <tr 
                          key={prop.id}
                          className={`transition-colors ${isDarkMode ? "hover:bg-stone-900/50" : "hover:bg-stone-50"}`}
                        >
                          {/* Image & Title */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-stone-800 relative group">
                                <img
                                  src={prop.image}
                                  alt={prop.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <span className="font-display font-medium text-sm leading-snug line-clamp-1 block">
                                  {prop.title}
                                </span>
                                <span className="font-mono text-[10px] text-stone-400 mt-0.5 block">
                                  {prop.size} • Tag: {prop.tag}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold ${
                              prop.category === "apartments"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : prop.category === "estates"
                                ? "bg-[#FF9E4A]/10 text-[#FF9E4A] border border-[#FF9E4A]/20"
                                : prop.category === "schemes"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                            }`}>
                              {prop.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="p-4 font-display font-semibold text-sm text-[#FF9E4A]">
                            {prop.price}
                          </td>

                          {/* Location */}
                          <td className="p-4 max-w-[200px]">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-400 truncate">
                              <MapPin size={12} className="text-[#FF9E4A] shrink-0" />
                              <span className="truncate">{prop.location}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className="font-mono text-[10px] text-emerald-500 flex items-center gap-1">
                              <ShieldCheck size={12} className="shrink-0" />
                              <span className="truncate">{prop.status}</span>
                            </span>
                          </td>

                          {/* Featured Switch */}
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleFeatured(prop)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                prop.featured
                                  ? "text-[#FF9E4A] bg-[#FF9E4A]/10 hover:bg-[#FF9E4A]/20"
                                  : "text-stone-400 hover:text-stone-300"
                              }`}
                              title={prop.featured ? "Featured on Home" : "Make Featured"}
                            >
                              <Sparkles size={16} />
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(prop)}
                                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                  isDarkMode
                                    ? "bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-[#FF9E4A]"
                                    : "bg-white border-stone-200 text-stone-700 hover:text-black hover:border-[#FF9E4A]"
                                }`}
                                title="Edit Listing"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(prop)}
                                className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                title="Delete Listing"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Mobile / Tablet Cards Grid View (Always active on mobile or when grid selected) */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${viewMode === "table" ? "md:hidden" : ""}`}>
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                    isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
                  }`}
                >
                  {/* Image banner */}
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-white">
                        {prop.category}
                      </span>
                      {prop.featured && (
                        <span className="bg-[#FF9E4A] text-black px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-[#FF9E4A]">
                      {prop.tag}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/50 dark:border-stone-800/80">
                        <span className="font-display font-semibold text-base text-[#FF9E4A]">
                          {prop.price}
                        </span>
                        <span className="font-mono text-[9px] text-stone-400">
                          {prop.size}
                        </span>
                      </div>
                      <h3 className="font-display font-medium text-sm mt-2 line-clamp-2">
                        {prop.title}
                      </h3>
                      <p className="font-mono text-[10px] text-stone-400 mt-1 flex items-center gap-1 truncate">
                        <MapPin size={11} className="text-[#FF9E4A] shrink-0" />
                        <span className="truncate">{prop.location}</span>
                      </p>
                    </div>

                    {/* Registry Status */}
                    <div className="pt-2 flex items-center justify-between font-mono text-[10px] text-emerald-500">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={12} /> {prop.status}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-stone-200/50 dark:border-stone-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleFeatured(prop)}
                        className={`text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer ${
                          prop.featured ? "text-[#FF9E4A]" : "text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        <Sparkles size={13} />
                        <span>{prop.featured ? "Featured" : "Feature"}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(prop)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-display flex items-center gap-1 transition-colors cursor-pointer ${
                            isDarkMode ? "bg-stone-900 border-stone-800 text-stone-300 hover:text-white" : "bg-stone-50 border-stone-200 text-stone-700 hover:text-black"
                          }`}
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleOpenDelete(prop)}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-display flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Property Create / Edit Form Modal */}
      <PropertyFormModal
        isOpen={isFormOpen}
        propertyToEdit={propertyToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setPropertyToEdit(null);
        }}
        onSave={handleSaveProperty}
        isDarkMode={isDarkMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        property={propertyToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPropertyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
