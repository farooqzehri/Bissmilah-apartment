import React, { useState, useMemo } from "react";
import { 
  Building2, Plus, Search, Edit3, Trash2, ShieldCheck, 
  Sparkles, MapPin, Tag, List, LayoutGrid, RotateCcw, Check, Eye, EyeOff
} from "lucide-react";
import { Property, PropertyCategory, AvailabilityStatus } from "../../../types/cms";

interface PropertiesTabProps {
  properties: Property[];
  onOpenCreate: () => void;
  onOpenEdit: (prop: Property) => void;
  onOpenDelete: (prop: Property) => void;
  onToggleFeatured: (prop: Property) => void;
  onTogglePublished: (prop: Property) => void;
  onChangeAvailability: (prop: Property, status: AvailabilityStatus) => void;
  onResetDefaults: () => void;
  isDarkMode: boolean;
}

export const PropertiesTab: React.FC<PropertiesTabProps> = ({
  properties,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onToggleFeatured,
  onTogglePublished,
  onChangeAvailability,
  onResetDefaults,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | PropertyCategory>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<"all" | AvailabilityStatus>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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
      const matchesAvail = selectedAvailability === "all" || p.availability === selectedAvailability;
      return matchesSearch && matchesCat && matchesAvail;
    });
  }, [properties, searchQuery, selectedCategory, selectedAvailability]);

  return (
    <div className="space-y-6 text-left">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b dark:border-stone-800 border-stone-200">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            PORTFOLIO DIRECTORY
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            Property & Apartment Management ({properties.length})
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Manage listings, availability states (Available/Reserved/Sold/Rented), registry statuses, and gallery photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onResetDefaults}
            className={`px-4 py-2.5 rounded-full text-xs font-display tracking-wider uppercase border flex items-center gap-2 transition-all cursor-pointer ${
              isDarkMode 
                ? "bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700" 
                : "bg-white border-stone-200 text-stone-600 hover:text-black hover:border-stone-300"
            }`}
            title="Reset sample properties to initial records"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-6 py-2.5 rounded-full text-xs font-display tracking-wider uppercase font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

          {/* Availability Filter Chips */}
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-display border cursor-pointer ${
              isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
            }`}
          >
            <option value="all">All States</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
            <option value="Unavailable">Unavailable</option>
          </select>

          {/* View mode */}
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

      {/* Property Showcase (Table or Grid) */}
      {filteredProperties.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"}`}>
          <Building2 size={36} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-display text-base font-medium">No properties match your filter</h3>
        </div>
      ) : viewMode === "table" ? (
        <div className={`rounded-3xl border overflow-hidden hidden md:block ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                  isDarkMode ? "border-stone-800 text-stone-400 bg-stone-900/40" : "border-stone-200 text-stone-500 bg-[#F9F9F8]"
                }`}>
                  <th className="p-4 pl-6">Property</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Valuation</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Registry</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Live</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50 dark:divide-stone-800/80 text-xs">
                {filteredProperties.map((prop) => (
                  <tr 
                    key={prop.id}
                    className={`transition-colors ${isDarkMode ? "hover:bg-stone-900/50" : "hover:bg-stone-50"}`}
                  >
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
                          <span className="font-mono text-[10px] text-stone-400 mt-0.5 block truncate">
                            {prop.size} • {prop.location}
                          </span>
                        </div>
                      </div>
                    </td>

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

                    <td className="p-4 font-display font-semibold text-sm text-[#FF9E4A]">
                      {prop.price}
                    </td>

                    <td className="p-4">
                      <select
                        value={prop.availability || "Available"}
                        onChange={(e) => onChangeAvailability(prop, e.target.value as AvailabilityStatus)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono border dark:bg-stone-900 dark:border-stone-800 cursor-pointer"
                      >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                        <option value="Rented">Rented</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-[10px] text-emerald-500 flex items-center gap-1">
                        <ShieldCheck size={12} className="shrink-0" />
                        <span className="truncate">{prop.status}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => onToggleFeatured(prop)}
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

                    <td className="p-4">
                      <button
                        onClick={() => onTogglePublished(prop)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          prop.published !== false
                            ? "text-emerald-500 bg-emerald-500/10"
                            : "text-stone-400 bg-stone-500/10"
                        }`}
                        title={prop.published !== false ? "Listing is Live" : "Draft / Hidden"}
                      >
                        {prop.published !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenEdit(prop)}
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
                          onClick={() => onOpenDelete(prop)}
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
      ) : (
        /* Mobile or Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
              }`}
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
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
                  {prop.availability || "Available"}
                </div>
              </div>

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

                <div className="pt-3 border-t border-stone-200/50 dark:border-stone-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFeatured(prop)}
                      className={`text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer ${
                        prop.featured ? "text-[#FF9E4A]" : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <Sparkles size={13} />
                      <span>{prop.featured ? "Featured" : "Feature"}</span>
                    </button>
                    <button
                      onClick={() => onTogglePublished(prop)}
                      className={`text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer ${
                        prop.published !== false ? "text-emerald-500" : "text-stone-400"
                      }`}
                    >
                      {prop.published !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{prop.published !== false ? "Live" : "Draft"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEdit(prop)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-display flex items-center gap-1 cursor-pointer ${
                        isDarkMode ? "bg-stone-900 border-stone-800 text-stone-300 hover:text-white" : "bg-stone-50 border-stone-200 text-stone-700 hover:text-black"
                      }`}
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onOpenDelete(prop)}
                      className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-display flex items-center gap-1 cursor-pointer"
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
      )}
    </div>
  );
};
