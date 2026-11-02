import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, FileText, Check, Eye, X, RefreshCw } from "lucide-react";
import { PageContent } from "../../../types/cms";
import { cmsPages } from "../../../utils/cmsApi";
import { FALLBACK_PAGES } from "../../../utils/cmsDefaults";

interface PagesTabProps {
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export const PagesTab: React.FC<PagesTabProps> = ({ isDarkMode, onShowToast }) => {
  const [pages, setPages] = useState<PageContent[]>(FALLBACK_PAGES);
  const [loading, setLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<PageContent> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPages = async (isManual = false) => {
    try {
      setLoading(true);
      const data = await cmsPages.list();
      if (data && data.length > 0) {
        setPages(data);
      }
      if (isManual) {
        onShowToast("CMS pages refreshed.");
      }
    } catch (err: any) {
      console.warn("Pages load notice:", err);
      if (isManual) {
        onShowToast("Notice: Using local cached pages.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingPage({
      title: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
      bodyContent: "",
      published: true,
      showInNav: false,
    });
  };

  const handleOpenEdit = (p: PageContent) => {
    setIsCreating(false);
    setEditingPage({ ...p });
  };

  const handleSavePage = async () => {
    if (!editingPage || !editingPage.title || !editingPage.slug) {
      onShowToast("Title and slug are required.");
      return;
    }

    try {
      if (isCreating) {
        await cmsPages.create(editingPage);
        onShowToast(`Page "${editingPage.title}" created successfully.`);
      } else if (editingPage.id) {
        await cmsPages.update(editingPage.id, editingPage);
        onShowToast(`Page "${editingPage.title}" updated.`);
      }
      setEditingPage(null);
      await fetchPages();
    } catch (err: any) {
      onShowToast("Save failed: " + (err.message || String(err)));
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await cmsPages.delete(id);
      onShowToast(`Page "${title}" deleted.`);
      await fetchPages();
    } catch (err: any) {
      onShowToast("Delete failed: " + (err.message || String(err)));
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-stone-800 border-stone-200">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            CUSTOM PAGES & LEGAL POLICIES
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            Page Content Management
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Create legal policy pages (Privacy Policy, Terms of Registry), custom client briefings, and navigation links.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>Create New Page</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono">Loading pages...</div>
      ) : pages.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"
        }`}>
          <FileText size={36} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-display text-base font-medium">No custom pages created yet</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-medium text-sm">{page.title}</h4>
                  <span className="font-mono text-[10px] text-stone-400">/{page.slug}</span>
                  {page.published ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-mono">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-400 text-[9px] font-mono">
                      Draft
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 line-clamp-1 ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                  {page.metaDescription || page.bodyContent.slice(0, 120)}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleOpenEdit(page)}
                  className={`p-2 rounded-xl border text-xs font-display flex items-center gap-1 cursor-pointer transition-colors ${
                    isDarkMode ? "bg-stone-900 border-stone-800 hover:text-white" : "bg-stone-50 border-stone-200 hover:text-black"
                  }`}
                  title="Edit Page"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeletePage(page.id, page.title)}
                  className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer transition-colors"
                  title="Delete Page"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Form Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className={`w-full max-w-2xl my-auto p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 text-left ${
            isDarkMode ? "bg-[#181817] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-stone-800 border-stone-200">
              <h3 className="font-display font-medium text-lg">
                {isCreating ? "Create CMS Page" : `Edit Page: ${editingPage.title}`}
              </h3>
              <button onClick={() => setEditingPage(null)} className="p-1 text-stone-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-display">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Page Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Terms of Registry"
                    value={editingPage.title || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">URL Slug *</label>
                  <input
                    type="text"
                    placeholder="terms-of-registry"
                    value={editingPage.slug || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Meta SEO Title</label>
                <input
                  type="text"
                  placeholder="Title shown in browser tab and Google search"
                  value={editingPage.metaTitle || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Meta Description</label>
                <input
                  type="text"
                  placeholder="Summary for search engines..."
                  value={editingPage.metaDescription || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Page Body Content (Text or Markdown)</label>
                <textarea
                  rows={8}
                  placeholder="Write the full page content here..."
                  value={editingPage.bodyContent || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, bodyContent: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border leading-relaxed ${isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"}`}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                  <input
                    type="checkbox"
                    checked={editingPage.published !== false}
                    onChange={(e) => setEditingPage({ ...editingPage, published: e.target.checked })}
                    className="accent-[#FF9E4A]"
                  />
                  <span>Published to Public Site</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-stone-800 border-stone-200">
              <button
                onClick={() => setEditingPage(null)}
                className="px-5 py-2 rounded-full text-xs font-display border dark:border-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePage}
                className="px-6 py-2 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] text-black cursor-pointer shadow-lg"
              >
                Save Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
