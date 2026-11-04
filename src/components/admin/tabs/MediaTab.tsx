import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, Search, Filter, Trash2, Edit3, Check, X, 
  AlertTriangle, Copy, ExternalLink, Image as ImageIcon, Sparkles, CheckCircle2
} from "lucide-react";
import { MediaItem } from "../../../types/cms";
import { cmsMedia } from "../../../utils/cmsApi";

interface MediaTabProps {
  media: MediaItem[];
  onRefreshMedia: () => Promise<void>;
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  media,
  onRefreshMedia,
  isDarkMode,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Edit metadata modal
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [replacementBase64, setReplacementBase64] = useState<string | null>(null);
  const [replacementFileName, setReplacementFileName] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  // Delete modal
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [deleteError, setDeleteError] = useState<{ message: string; inUse?: boolean; places?: string[] } | null>(null);
  const [storageStatus, setStorageStatus] = useState<{
    cloudinary?: { configured: boolean; verified?: boolean; cloudName: string; folder: string; hasSpaces?: boolean; error?: string; advice?: string };
    database?: { provider: string; connected: boolean; hasUri?: boolean; error?: string; advice?: string };
  } | null>(null);
  const [isRetryingDb, setIsRetryingDb] = useState(false);
  const [isRetryingCloudinary, setIsRetryingCloudinary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchStatus = () => {
    fetch("/api/media/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStorageStatus({
            cloudinary: data.cloudinary,
            database: data.database,
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRetryMongo = async () => {
    setIsRetryingDb(true);
    try {
      const res = await fetch("/api/media/retry-mongo", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        onShowToast("Connected to MongoDB Atlas successfully!");
      } else {
        onShowToast(data.database?.advice || "Could not connect to MongoDB Atlas. Ensure 0.0.0.0/0 is whitelisted in Atlas Network Access.");
      }
      fetchStatus();
    } catch {
      onShowToast("Failed to test MongoDB connection.");
    } finally {
      setIsRetryingDb(false);
    }
  };

  const handleRetryCloudinary = async () => {
    setIsRetryingCloudinary(true);
    try {
      const res = await fetch("/api/media/retry-cloudinary", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        onShowToast("Connected to Cloudinary CDN successfully!");
      } else {
        onShowToast(data.cloudinary?.advice || data.cloudinary?.error || "Could not authenticate with Cloudinary.");
      }
      fetchStatus();
    } catch {
      onShowToast("Failed to test Cloudinary connection.");
    } finally {
      setIsRetryingCloudinary(false);
    }
  };

  const categories = ["all", "Apartments", "Estates", "Schemes", "Commercial", "General"];

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`Processing 1 of ${files.length}...`);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`);

        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 15MB limit.`);
        }

        const base64Data = await readFileAsDataUrl(file);

        await cmsMedia.upload({
          base64Data,
          fileName: file.name,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          category: selectedCategory !== "all" ? selectedCategory : "General",
        });
      }

      await onRefreshMedia();
      onShowToast(`Successfully uploaded ${files.length} image(s).`);
    } catch (err: any) {
      onShowToast("Upload failed: " + (err.message || String(err)));
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAltText(item.altText);
    setEditCaption(item.caption);
    setEditCategory(item.category);
    setReplacementBase64(null);
    setReplacementFileName(null);
  };

  const handleReplacementSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      onShowToast("Replacement image exceeds 15MB limit.");
      return;
    }
    const base64 = await readFileAsDataUrl(file);
    setReplacementBase64(base64);
    setReplacementFileName(file.name);
    onShowToast(`Replacement image selected: ${file.name}`);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      if (replacementBase64) {
        onShowToast("Uploading replacement image to Cloudinary...");
        await cmsMedia.replaceAsset(editingItem.id, {
          base64Data: replacementBase64,
          fileName: replacementFileName || undefined,
        });
      }
      await cmsMedia.updateMetadata(editingItem.id, {
        title: editTitle,
        altText: editAltText,
        caption: editCaption,
        category: editCategory,
      });
      await onRefreshMedia();
      onShowToast(`Updated "${editingItem.fileName}" successfully.`);
      setEditingItem(null);
      setReplacementBase64(null);
      setReplacementFileName(null);
    } catch (err: any) {
      onShowToast("Update failed: " + (err.message || String(err)));
    }
  };

  const handleOpenDelete = (item: MediaItem) => {
    setDeleteItem(item);
    setDeleteError(null);
  };

  const handleConfirmDelete = async (force = false) => {
    if (!deleteItem) return;
    try {
      await cmsMedia.delete(deleteItem.id, force);
      await onRefreshMedia();
      onShowToast(`Deleted "${deleteItem.fileName}".`);
      setDeleteItem(null);
      setDeleteError(null);
    } catch (err: any) {
      if (err.inUse) {
        setDeleteError({
          message: err.message,
          inUse: true,
          places: err.places,
        });
      } else {
        onShowToast("Delete failed: " + (err.message || String(err)));
        setDeleteItem(null);
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    onShowToast("Image URL copied to clipboard.");
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-stone-800 border-stone-200">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            PERSISTENT MEDIA STORAGE
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            Media Library & Images
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Upload photos, manage alt descriptions, and protect images against accidental deletion while in active use.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#DF9B43] hover:bg-[#c88532] text-black shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Upload size={14} className="stroke-[2.5]" />
            <span>{isUploading ? "Uploading..." : "Upload to Cloudinary / Storage"}</span>
          </button>
        </div>
      </div>

      {/* Cloudinary & MongoDB Atlas Live Status Indicator */}
      <div className={`p-4 rounded-2xl border space-y-3 text-xs font-mono ${
        isDarkMode ? "bg-[#141412] border-stone-800" : "bg-stone-50 border-stone-200"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Cloudinary Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                storageStatus?.cloudinary?.verified 
                  ? "bg-sky-400 animate-pulse" 
                  : (storageStatus?.cloudinary?.error ? "bg-amber-400" : (storageStatus?.cloudinary?.configured ? "bg-sky-400" : "bg-stone-500"))
              }`} />
              <span className={`font-semibold ${
                storageStatus?.cloudinary?.verified 
                  ? "text-sky-500" 
                  : (storageStatus?.cloudinary?.error ? "text-amber-500" : "text-sky-500")
              }`}>
                {storageStatus?.cloudinary?.verified 
                  ? "Cloudinary CDN Active" 
                  : (storageStatus?.cloudinary?.error ? "Cloudinary Setup Attention" : "Cloudinary Ready")}
              </span>
              <span className={isDarkMode ? "text-stone-400" : "text-stone-500"}>
                ({storageStatus?.cloudinary?.cloudName || "Credentials in Secrets"})
              </span>
            </div>

            <span aria-hidden="true" className="text-stone-500">·</span>

            {/* Database Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                storageStatus?.database?.connected 
                  ? "bg-emerald-500 animate-pulse" 
                  : (storageStatus?.database?.hasUri ? "bg-amber-400 animate-pulse" : "bg-emerald-400")
              }`} />
              <span className={`font-semibold ${
                storageStatus?.database?.connected 
                  ? "text-emerald-500" 
                  : (storageStatus?.database?.hasUri ? "text-amber-500" : "text-emerald-500")
              }`}>
                Database: {storageStatus?.database?.provider || "Local Resilient"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {storageStatus?.cloudinary?.configured && !storageStatus?.cloudinary?.verified && (
              <button
                type="button"
                onClick={handleRetryCloudinary}
                disabled={isRetryingCloudinary}
                className="px-3 py-1 rounded-lg text-[11px] font-sans font-semibold bg-sky-500 hover:bg-sky-600 text-black cursor-pointer transition-all disabled:opacity-50"
              >
                {isRetryingCloudinary ? "Testing Cloudinary..." : "Retry Cloudinary"}
              </button>
            )}
            {storageStatus?.database?.hasUri && !storageStatus?.database?.connected && (
              <button
                type="button"
                onClick={handleRetryMongo}
                disabled={isRetryingDb}
                className="px-3 py-1 rounded-lg text-[11px] font-sans font-semibold bg-[#FF9E4A] hover:bg-[#e88a35] text-black cursor-pointer transition-all disabled:opacity-50"
              >
                {isRetryingDb ? "Testing Connection..." : "Retry Atlas Connection"}
              </button>
            )}
            <span className="text-[11px] text-stone-400">
              Max 15MB · Auto WebP/AVIF Optimization
            </span>
          </div>
        </div>

        {/* Cloudinary Setup Alert Note if needed */}
        {storageStatus?.cloudinary?.configured && !storageStatus?.cloudinary?.verified && storageStatus?.cloudinary?.error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-300 text-[11px] font-sans flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-400">
                Action Required: Cloudinary Cloud Name Misconfigured
              </div>
              <div className={isDarkMode ? "text-stone-300" : "text-stone-600"}>
                {storageStatus?.cloudinary?.advice || "Cloudinary Cloud Names cannot contain spaces. Copy the exact 'Cloud Name' from your Cloudinary Console under Product Environment Credentials."}
              </div>
              <div className="text-[10px] text-stone-400 font-mono">
                {storageStatus?.cloudinary?.error} · Images will safely upload to server disk storage until corrected.
              </div>
            </div>
          </div>
        )}

        {/* Database IP Whitelist Alert Note if needed */}
        {storageStatus?.database?.hasUri && !storageStatus?.database?.connected && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-300 text-[11px] font-sans flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-400">
                Action Required: Whitelist IP in MongoDB Atlas
              </div>
              <div className={isDarkMode ? "text-stone-300" : "text-stone-600"}>
                {storageStatus?.database?.advice || "Cloud deployment containers require 0.0.0.0/0 in Atlas Network Access. Log in to MongoDB Atlas Console → Security → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)."}
              </div>
              <div className="text-[10px] text-stone-400 font-mono">
                System is running smoothly on local storage with zero downtime. Click &ldquo;Retry Atlas Connection&rdquo; after whitelisting.
              </div>
            </div>
          </div>
        )}
      </div>

      {uploadProgress && (
        <div className="p-3.5 rounded-2xl bg-[#FF9E4A]/10 border border-[#FF9E4A]/30 text-xs font-mono flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9E4A] animate-ping" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
          <input
            type="text"
            placeholder="Search images by name, title, or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
              isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
            }`}
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-display capitalize transition-all cursor-pointer border ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#FF9E4A] text-black font-semibold border-[#FF9E4A]"
                  : isDarkMode ? "bg-stone-900 border-stone-800 text-stone-400 hover:text-white" : "bg-white border-stone-200 text-stone-700 hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"
        }`}>
          <ImageIcon size={36} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-display text-base font-medium">No media files found</h3>
          <p className={`text-xs mt-1 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Upload photos from your computer or phone to start populating your media library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all ${
                isDarkMode ? "bg-[#181817] border-stone-800 hover:border-stone-700" : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
              }`}
            >
              {/* Image Preview */}
              <div className="aspect-square relative overflow-hidden bg-black">
                <img
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Active Usage Badge */}
                {item.usageCount !== undefined && item.usageCount > 0 ? (
                  <span className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold">
                    In use ({item.usageCount})
                  </span>
                ) : (
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-stone-400 px-2 py-0.5 rounded-md text-[9px] font-mono">
                    Unused
                  </span>
                )}

                {/* Quick overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCopyUrl(item.url);
                    }}
                    className="p-2 rounded-xl bg-white text-black hover:bg-[#FF9E4A] transition-colors cursor-pointer"
                    title="Copy Image URL"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenEdit(item);
                    }}
                    className="p-2 rounded-xl bg-white text-black hover:bg-[#FF9E4A] transition-colors cursor-pointer"
                    title="Edit Metadata"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenDelete(item);
                    }}
                    className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Caption & Metadata */}
              <div className="p-3">
                <span className="font-display font-medium text-xs truncate block" title={item.title}>
                  {item.title}
                </span>
                <span className="font-mono text-[9px] text-stone-400 block truncate mt-0.5">
                  {item.category} • {(item.sizeBytes / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md p-6 rounded-3xl border text-left shadow-2xl space-y-4 ${
            isDarkMode ? "bg-[#181817] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-stone-800 border-stone-200">
              <h3 className="font-display font-medium text-base">Edit Image Metadata</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-stone-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Image Preview & Asset Replacement */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-stone-800 group">
              <img
                src={replacementBase64 || editingItem.url}
                alt={editAltText}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  onChange={handleReplacementSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#FF9E4A] text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-[#e88a35]"
                >
                  <Upload size={13} />
                  <span>{replacementBase64 ? "Change Replacement" : "Replace Image File"}</span>
                </button>
                {replacementFileName && (
                  <span className="text-[10px] text-white/90 font-mono truncate max-w-xs">
                    New: {replacementFileName}
                  </span>
                )}
              </div>
            </div>

            {replacementBase64 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-400 flex items-center justify-between">
                <span>New asset staged (will upload to Cloudinary & update DB)</span>
                <button
                  type="button"
                  onClick={() => {
                    setReplacementBase64(null);
                    setReplacementFileName(null);
                  }}
                  className="text-stone-400 hover:text-white text-xs underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs font-display">
              <div>
                <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Caption</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t dark:border-stone-800 border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setReplacementBase64(null);
                  setReplacementFileName(null);
                }}
                className="px-4 py-2 rounded-full text-xs font-display border dark:border-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] text-black cursor-pointer shadow-md hover:bg-[#e88a35]"
              >
                {replacementBase64 ? "Save & Replace Asset" : "Save Metadata"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (with in-use reference detection) */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md p-6 rounded-3xl border text-left shadow-2xl space-y-4 ${
            isDarkMode ? "bg-[#181817] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-display font-medium text-base">Delete Media Asset?</h3>
                <p className="text-xs text-stone-400">{deleteItem.fileName}</p>
              </div>
            </div>

            {/* In-Use warning check */}
            {deleteError && deleteError.inUse ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-2 text-xs">
                <span className="font-semibold block font-display">
                  Image is in active use across the website!
                </span>
                <p>{deleteError.message}</p>
                <div className="max-h-28 overflow-y-auto space-y-1 pt-1 font-mono text-[10px]">
                  {deleteError.places?.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] pt-1 text-stone-300">
                  Deleting will cause broken images in these listings unless replaced.
                </p>
              </div>
            ) : (
              <p className={`text-xs leading-relaxed ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>
                Are you sure you want to remove this image from the server? This action cannot be undone.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t dark:border-stone-800 border-stone-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteItem(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-full text-xs font-display border dark:border-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              {deleteError && deleteError.inUse ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirmDelete(true);
                  }}
                  className="px-5 py-2 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-rose-600 text-white cursor-pointer"
                >
                  Force Delete Anyway
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirmDelete(false);
                  }}
                  className="px-5 py-2 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-rose-500 text-white cursor-pointer"
                >
                  Delete Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
