import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Upload, Image as ImageIcon, Sparkles, Plus, Trash2, 
  Check, Layers, MapPin, Tag, DollarSign, CheckCircle2, Shield
} from "lucide-react";
import { PropertyItem, PropertyCategory, PropertySpec } from "../../types/property";
import { CURATED_IMAGE_PRESETS } from "../../utils/propertyStore";
import { cmsMedia } from "../../utils/cmsApi";

interface PropertyFormModalProps {
  isOpen: boolean;
  propertyToEdit: PropertyItem | null;
  onClose: () => void;
  onSave: (data: Omit<PropertyItem, "id" | "createdAt" | "updatedAt">) => void;
  isDarkMode: boolean;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  propertyToEdit,
  onClose,
  onSave,
  isDarkMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("apartments");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState("100% Registry Ready");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imagePublicId, setImagePublicId] = useState<string | undefined>();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [specs, setSpecs] = useState<PropertySpec[]>([
    { label: "Bedrooms", value: "4 En-Suite" },
    { label: "Bathrooms", value: "4 Baths" },
  ]);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Image tab mode: "preset" | "url" | "upload"
  const [imageMode, setImageMode] = useState<"preset" | "url" | "upload">("preset");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (propertyToEdit) {
      setTitle(propertyToEdit.title);
      setCategory(propertyToEdit.category);
      setPrice(propertyToEdit.price);
      setLocation(propertyToEdit.location);
      setSize(propertyToEdit.size);
      setTag(propertyToEdit.tag || "Premium");
      setStatus(propertyToEdit.status || "100% Registry Ready");
      setDescription(propertyToEdit.description || "");
      setImage(propertyToEdit.image);
      setImagePublicId(propertyToEdit.imagePublicId);
      setGallery(propertyToEdit.gallery || []);
      setHighlights(propertyToEdit.highlights?.length ? propertyToEdit.highlights : [""]);
      setSpecs(propertyToEdit.specs?.length ? propertyToEdit.specs : [{ label: "", value: "" }]);
      setFeatured(!!propertyToEdit.featured);
      setPublished(propertyToEdit.published !== false);
    } else {
      // Default new listing pre-fill
      setTitle("");
      setCategory("apartments");
      setPrice("PKR 2.5 Crore");
      setLocation("A-1 City, Block C, Quetta");
      setSize("2,500 Sq. Ft.");
      setTag("Shandaar Flat");
      setStatus("100% Registry Ready");
      setDescription("A-1 City Quetta mein shandaar luxury property jis ke sath mukammal legal registry documents hain.");
      setImage(CURATED_IMAGE_PRESETS[0].url);
      setImagePublicId(undefined);
      setGallery([]);
      setHighlights([
        "Mukammal legal registry aur certified title transfer",
        "Sweet water supply aur 24/7 solar backup battery",
        "High security boundary wall aur gate surveillance"
      ]);
      setSpecs([
        { label: "Format", value: "Luxury Residence" },
        { label: "Registry", value: "Direct Deed Ready" },
        { label: "Possession", value: "Immediate" }
      ]);
      setFeatured(false);
      setPublished(true);
    }
    setErrors({});
  }, [propertyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size must be under 8MB" }));
      e.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Choose a JPEG, PNG, WebP, AVIF, or GIF image." }));
      e.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Unable to read the selected image."));
        };
        reader.onerror = () => reject(new Error("Unable to read the selected image."));
        reader.readAsDataURL(file);
      });
      const uploaded = await cmsMedia.upload({
        base64Data,
        fileName: file.name,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category,
      });
      setImage(uploaded.url);
      setImagePublicId(uploaded.cloudinaryPublicId);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.image;
        return copy;
      });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        image: err instanceof Error ? err.message : "Image upload failed.",
      }));
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  // Dynamic spec management
  const handleSpecChange = (index: number, field: "label" | "value", val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const addSpec = () => {
    setSpecs([...specs, { label: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index));
    }
  };

  // Dynamic highlights management
  const handleHighlightChange = (index: number, val: string) => {
    const updated = [...highlights];
    updated[index] = val;
    setHighlights(updated);
  };

  const addHighlight = () => {
    setHighlights([...highlights, ""]);
  };

  const removeHighlight = (index: number) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validation
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Property title is required.";
    if (!price.trim()) newErrors.price = "Price / valuation is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!size.trim()) newErrors.size = "Size or area measurement is required.";
    if (!image.trim()) newErrors.image = "A main property photograph is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cleanedHighlights = highlights.map((h) => h.trim()).filter(Boolean);
    const cleanedSpecs = specs.filter((s) => s.label.trim() && s.value.trim());

    onSave({
      title: title.trim(),
      category,
      price: price.trim(),
      location: location.trim(),
      size: size.trim(),
      tag: tag.trim() || "Exclusive",
      status: status.trim() || "100% Registry Ready",
      description: description.trim(),
      image: image.trim(),
      imagePublicId,
      gallery,
      highlights: cleanedHighlights.length > 0 ? cleanedHighlights : ["Verified legal documents under Haji Saud Zehri supervision."],
      specs: cleanedSpecs.length > 0 ? cleanedSpecs : [{ label: "Registry", value: "Verified Deed" }],
      featured,
      published,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
          className={`w-full max-w-4xl my-auto rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] ${
            isDarkMode ? "bg-[#161615] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}
        >
          {/* Header */}
          <div className={`p-6 sm:px-8 border-b flex items-center justify-between shrink-0 ${
            isDarkMode ? "border-stone-800 bg-[#1A1A19]" : "border-stone-200 bg-[#FAFAFA]"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF9E4A]/10 text-[#FF9E4A] flex items-center justify-center border border-[#FF9E4A]/30">
                <Layers size={20} />
              </div>
              <div className="text-left">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
                  HAJI SAUD ZEHRI — PROPERTY CMS
                </span>
                <h2 className="text-lg sm:text-xl font-display font-medium">
                  {propertyToEdit ? "Edit Property Listing" : "Add New Luxury Property"}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isDarkMode ? "hover:bg-stone-800 text-stone-400 hover:text-white" : "hover:bg-stone-200 text-stone-600 hover:text-black"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body - Scrollable */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-8 text-left">
            
            {/* Section 1: Main Image Selection & Upload */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-stone-900/40 border-stone-800" : "bg-[#F9F9F8] border-stone-200"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <label className="font-display font-medium text-sm flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#FF9E4A]" />
                    <span>Property Showcase Image</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Select from verified high-res luxury presets, enter an image URL, or upload directly from your device.
                  </p>
                </div>

                {/* Tabs for Image Mode */}
                <div className={`flex rounded-xl p-1 border self-start sm:self-auto ${
                  isDarkMode ? "bg-stone-950 border-stone-800" : "bg-stone-200/60 border-stone-300"
                }`}>
                  <button
                    type="button"
                    onClick={() => setImageMode("preset")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all cursor-pointer ${
                      imageMode === "preset"
                        ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
                        : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all cursor-pointer ${
                      imageMode === "url"
                        ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
                        : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all cursor-pointer flex items-center gap-1 ${
                      imageMode === "upload"
                        ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
                        : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
                    }`}
                  >
                    <Upload size={12} />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Curated Presets Grid */}
              {imageMode === "preset" && (
                <div className="space-y-3">
                  <span className={`font-mono text-[10px] uppercase tracking-wider block ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                    Click to pick architectural photo:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-1">
                    {CURATED_IMAGE_PRESETS.map((p) => {
                      const isSelected = image === p.url;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setImage(p.url);
                            setImagePublicId(undefined);
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.image;
                              return copy;
                            });
                          }}
                          className={`group relative rounded-xl overflow-hidden aspect-video cursor-pointer border-2 transition-all ${
                            isSelected
                              ? "border-[#FF9E4A] shadow-md ring-2 ring-[#FF9E4A]/30 scale-[1.02]"
                              : isDarkMode ? "border-stone-800 hover:border-stone-600" : "border-stone-300 hover:border-stone-400"
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                            <span className="font-mono text-[8px] text-white tracking-tight line-clamp-1">
                              {p.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#FF9E4A] text-black flex items-center justify-center shadow-md">
                              <Check size={12} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode 2: Direct Image URL */}
              {imageMode === "url" && (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setImagePublicId(undefined);
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.image;
                        return copy;
                      });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-[#FF9E4A] transition-colors ${
                      isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <p className={`text-[11px] ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Tip: Use Unsplash, Cloudinary, or any HTTPS image link.
                  </p>
                </div>
              )}

              {/* Mode 3: Local File Upload */}
              {imageMode === "upload" && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    disabled={isUploadingImage}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDarkMode
                        ? "border-stone-800 hover:border-[#FF9E4A]/60 bg-stone-950/60"
                        : "border-stone-300 hover:border-[#FF9E4A]/60 bg-white"
                    }`}
                  >
                    <Upload size={24} className="mx-auto text-[#FF9E4A] mb-2" />
                    <span className="font-display font-medium text-xs block">
                      {isUploadingImage
                        ? "Uploading image to Cloudinary..."
                        : "Click to choose image from your computer or phone"}
                    </span>
                    <span className={`text-[10px] font-mono mt-1 block ${isDarkMode ? "text-stone-500" : "text-stone-400"}`}>
                      PNG, JPG, WEBP up to 8MB
                    </span>
                  </div>
                </div>
              )}

              {/* Active Image Preview Box */}
              {image && (
                <div className="mt-4 pt-4 border-t border-stone-200/50 dark:border-stone-800/80 flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-stone-800 relative">
                    <img
                      src={image}
                      alt="Selected preview"
                      className="w-full h-full object-cover"
                      onError={() => setErrors((prev) => ({ ...prev, image: "Image failed to load. Please verify the URL." }))}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Image Ready
                    </span>
                    <p className={`text-xs font-mono truncate mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                      {image.startsWith("data:") ? "Local Device File (Base64)" : image}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {errors.image && (
                <p className="text-xs text-rose-500 font-mono mt-2">{errors.image}</p>
              )}
            </div>

            {/* Section 2: Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-display text-xs font-medium uppercase tracking-wider">
                  Property Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Zehri Heights Penthouses (Shandaar Flat)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
                {errors.title && <p className="text-xs text-rose-500 font-mono">{errors.title}</p>}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-display text-xs font-medium uppercase tracking-wider">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors cursor-pointer ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                >
                  <option value="apartments">Apartments & Flats</option>
                  <option value="estates">Elite Estates & Haveli</option>
                  <option value="schemes">Home & Plot Schemes</option>
                  <option value="commercial">Commercial & Dukaan</option>
                </select>
              </div>

              {/* Price / Valuation */}
              <div className="space-y-1.5">
                <label className="font-display text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <span>Price / Valuation (PKR)</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PKR 3.8 Crore or PKR 85 Lakh"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
                {errors.price && <p className="text-xs text-rose-500 font-mono">{errors.price}</p>}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="font-display text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={12} className="text-[#FF9E4A]" />
                  <span>Exact Location in Quetta</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-1 City, Block C, Main Double Road, Quetta"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
                {errors.location && <p className="text-xs text-rose-500 font-mono">{errors.location}</p>}
              </div>

              {/* Size / Area */}
              <div className="space-y-1.5">
                <label className="font-display text-xs font-medium uppercase tracking-wider">
                  Dimensions / Size <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 Sq. Yds or 3,400 Sq. Ft."
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
                {errors.size && <p className="text-xs text-rose-500 font-mono">{errors.size}</p>}
              </div>

              {/* Badge Tag */}
              <div className="space-y-1.5">
                <label className="font-display text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} className="text-[#FF9E4A]" />
                  <span>Card Badge Tag</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shandaar Flat, 100% File Ready, VVIP Corner"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>

              {/* Legal Registry Status */}
              <div className="space-y-1.5">
                <label className="font-display text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} className="text-[#FF9E4A]" />
                  <span>Registry Status</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Registry Ready, Immediate Possession"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Listing Overview & Description
              </label>
              <textarea
                rows={3}
                placeholder="Write full details about the plot, scheme, apartment specifications, and legal status..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] transition-colors leading-relaxed ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            {/* Section 3: Key Specifications (Dynamic Key/Value Pairs) */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-stone-900/40 border-stone-800" : "bg-[#F9F9F8] border-stone-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="font-display font-medium text-sm block">
                    Property Specifications
                  </label>
                  <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Key technical and architectural values (e.g., Bedrooms, Power Backup, Water Sourcing, Road Width).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSpec}
                  className="px-3 py-1.5 rounded-lg text-xs font-display bg-[#FF9E4A]/10 text-[#FF9E4A] hover:bg-[#FF9E4A]/20 border border-[#FF9E4A]/30 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>Add Spec</span>
                </button>
              </div>

              <div className="space-y-3">
                {specs.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Label (e.g. Bedrooms)"
                      value={sp.label}
                      onChange={(e) => handleSpecChange(idx, "label", e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                        isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 4 En-Suite)"
                      value={sp.value}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                        isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                      }`}
                    />
                    {specs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpec(idx)}
                        className="p-2 text-stone-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Highlights / Merits */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-stone-900/40 border-stone-800" : "bg-[#F9F9F8] border-stone-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="font-display font-medium text-sm block">
                    Salient Features & Merits
                  </label>
                  <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Bullet points detailing unique legal guarantees, views, or advantages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="px-3 py-1.5 rounded-lg text-xs font-display bg-[#FF9E4A]/10 text-[#FF9E4A] hover:bg-[#FF9E4A]/20 border border-[#FF9E4A]/30 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>Add Feature</span>
                </button>
              </div>

              <div className="space-y-3">
                {highlights.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9E4A] shrink-0" />
                    <input
                      type="text"
                      placeholder="Feature bullet point (e.g. Continuous sweet water tube-well)"
                      value={h}
                      onChange={(e) => handleHighlightChange(idx, e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                        isDarkMode ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                      }`}
                    />
                    {highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHighlight(idx)}
                        className="p-2 text-stone-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Visibility & Showcase Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-stone-200/50 dark:border-stone-800/80">
                <div>
                  <span className="font-display text-xs font-medium block">
                    Listing Status (Live on Website)
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Publish immediately to front page catalog.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#10B981] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-stone-200/50 dark:border-stone-800/80">
                <div>
                  <span className="font-display text-xs font-medium block">
                    Showcase on Home Featured
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                    Feature directly in highlighted home portfolio.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#FF9E4A] cursor-pointer"
                />
              </div>
            </div>

            {/* Actions Bar inside scrollable */}
            <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-end gap-3 ${
              isDarkMode ? "border-stone-800" : "border-stone-200"
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`w-full sm:w-auto px-6 py-3 rounded-full text-xs font-display uppercase tracking-wider transition-colors cursor-pointer border ${
                  isDarkMode ? "border-stone-800 hover:bg-stone-800 text-stone-300" : "border-stone-200 hover:bg-stone-100 text-stone-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploadingImage}
                className="w-full sm:w-auto px-8 py-3 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>{propertyToEdit ? "Update Property" : "Publish Property"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
