import React, { useState, useEffect } from "react";
import { 
  Check, Save, Globe, Phone, Palette, Sliders, Shield, AlertTriangle, 
  MapPin, Clock, MessageSquare, ExternalLink, RefreshCw
} from "lucide-react";
import { GlobalSettings } from "../../../types/cms";

interface SettingsTabProps {
  settings: GlobalSettings | null;
  onSave: (updates: Partial<GlobalSettings>) => Promise<any>;
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSave,
  isDarkMode,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<GlobalSettings | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"branding" | "contact" | "behavior">("branding");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  if (!formData) {
    return <div className="p-8 text-center text-xs font-mono">Loading settings...</div>;
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onShowToast("Global website settings updated and published successfully.");
    } catch (err: any) {
      onShowToast("Error saving settings: " + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-stone-800 border-stone-200">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            ADMINISTRATION CONSOLE
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            Global Website Settings
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Configure branding, telephone & WhatsApp contact points, announcement banners, and section toggles.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-semibold bg-[#FF9E4A] hover:bg-[#ff8e30] text-black shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{isSaving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className={`flex rounded-2xl p-1 border w-fit ${
        isDarkMode ? "bg-stone-900 border-stone-800" : "bg-stone-200/60 border-stone-300"
      }`}>
        <button
          onClick={() => setActiveSubTab("branding")}
          className={`px-4 py-2 rounded-xl text-xs font-display flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "branding"
              ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
              : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
          }`}
        >
          <Palette size={14} />
          <span>Branding & Appearance</span>
        </button>
        <button
          onClick={() => setActiveSubTab("contact")}
          className={`px-4 py-2 rounded-xl text-xs font-display flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "contact"
              ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
              : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
          }`}
        >
          <Phone size={14} />
          <span>Contact & Socials</span>
        </button>
        <button
          onClick={() => setActiveSubTab("behavior")}
          className={`px-4 py-2 rounded-xl text-xs font-display flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "behavior"
              ? "bg-[#FF9E4A] text-black font-semibold shadow-sm"
              : isDarkMode ? "text-stone-400 hover:text-white" : "text-stone-700 hover:text-black"
          }`}
        >
          <Sliders size={14} />
          <span>Behavior & Sections</span>
        </button>
      </div>

      {/* Tab 1: Branding */}
      {activeSubTab === "branding" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Website Display Name
              </label>
              <input
                type="text"
                value={formData.branding.websiteName}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, websiteName: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Formal Business Name
              </label>
              <input
                type="text"
                value={formData.branding.businessName}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, businessName: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Brand Tagline
              </label>
              <input
                type="text"
                value={formData.branding.tagline}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, tagline: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Owner / Managing Partner Name
              </label>
              <input
                type="text"
                value={formData.branding.ownerName}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, ownerName: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Owner Title
              </label>
              <input
                type="text"
                value={formData.branding.ownerTitle}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, ownerTitle: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Owner Guiding Quote
              </label>
              <textarea
                rows={2}
                value={formData.branding.ownerQuote}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, ownerQuote: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Primary Brand Color (Gold / Accent)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    branding: { ...formData.branding, primaryColor: e.target.value }
                  })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={formData.branding.primaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    branding: { ...formData.branding, primaryColor: e.target.value }
                  })}
                  className={`flex-1 px-4 py-2 rounded-xl text-xs font-mono border ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Copyright Text
              </label>
              <input
                type="text"
                value={formData.branding.copyrightText}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, copyrightText: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Info */}
      {activeSubTab === "contact" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Primary Phone Number
              </label>
              <input
                type="text"
                value={formData.contact.primaryPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, primaryPhone: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                WhatsApp Hotline (International Format with Country Code)
              </label>
              <input
                type="text"
                placeholder="+923337861928"
                value={formData.contact.whatsappNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, whatsappNumber: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Official Email Address
              </label>
              <input
                type="email"
                value={formData.contact.emailAddress}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, emailAddress: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Business & Consultation Hours
              </label>
              <input
                type="text"
                value={formData.contact.businessHours}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, businessHours: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Physical Office Address
              </label>
              <input
                type="text"
                value={formData.contact.officeAddress}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, officeAddress: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-display text-xs font-medium uppercase tracking-wider">
                Google Maps Embed URL
              </label>
              <input
                type="text"
                value={formData.contact.googleMapsEmbedUrl}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, googleMapsEmbedUrl: e.target.value }
                })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-[#FF9E4A] ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            </div>

            {/* Social media links */}
            <div className="md:col-span-2 pt-4 border-t dark:border-stone-800 border-stone-200">
              <h4 className="font-display text-xs font-semibold mb-3 uppercase tracking-wider text-stone-400">
                Social Media Profiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Facebook URL"
                  value={formData.contact.socialLinks.facebook || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: {
                      ...formData.contact,
                      socialLinks: { ...formData.contact.socialLinks, facebook: e.target.value }
                    }
                  })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Instagram URL"
                  value={formData.contact.socialLinks.instagram || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: {
                      ...formData.contact,
                      socialLinks: { ...formData.contact.socialLinks, instagram: e.target.value }
                    }
                  })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Website Behavior & Sections */}
      {activeSubTab === "behavior" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-8 ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          {/* Maintenance Mode */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display font-medium text-sm flex items-center gap-2 text-amber-500">
                  <AlertTriangle size={16} />
                  <span>Maintenance Mode</span>
                </span>
                <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  When enabled, visitors see a maintenance screen. Staff can still access admin via PIN.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.behavior.maintenanceMode}
                onChange={(e) => setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, maintenanceMode: e.target.checked }
                })}
                className="w-5 h-5 accent-[#FF9E4A] cursor-pointer"
              />
            </div>
            {formData.behavior.maintenanceMode && (
              <textarea
                rows={2}
                placeholder="Maintenance notice message for visitors..."
                value={formData.behavior.maintenanceMessage}
                onChange={(e) => setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, maintenanceMessage: e.target.value }
                })}
                className={`w-full px-3 py-2 rounded-xl text-xs font-display border ${
                  isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                }`}
              />
            )}
          </div>

          {/* Announcement Banner */}
          <div className="p-5 rounded-2xl border dark:border-stone-800 border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display font-medium text-sm block">
                  Top Announcement Banner
                </span>
                <p className={`text-xs ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                  Displays a prominent top banner across public pages for new schemes or urgent updates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.behavior.announcementBanner.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  behavior: {
                    ...formData.behavior,
                    announcementBanner: { ...formData.behavior.announcementBanner, enabled: e.target.checked }
                  }
                })}
                className="w-5 h-5 accent-[#FF9E4A] cursor-pointer"
              />
            </div>
            {formData.behavior.announcementBanner.enabled && (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Banner announcement message..."
                  value={formData.behavior.announcementBanner.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    behavior: {
                      ...formData.behavior,
                      announcementBanner: { ...formData.behavior.announcementBanner, text: e.target.value }
                    }
                  })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-display border ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                  }`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Action Button Label (e.g. View Scheme)"
                    value={formData.behavior.announcementBanner.actionText || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      behavior: {
                        ...formData.behavior,
                        announcementBanner: { ...formData.behavior.announcementBanner, actionText: e.target.value }
                      }
                    })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-display border ${
                      isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Target URL (e.g. #curation)"
                    value={formData.behavior.announcementBanner.actionUrl || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      behavior: {
                        ...formData.behavior,
                        announcementBanner: { ...formData.behavior.announcementBanner, actionUrl: e.target.value }
                      }
                    })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-display border ${
                      isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Visibility Toggles */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">
              Homepage Sections Visibility
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(formData.behavior.sectionToggles).map(([secKey, isEnabled]) => (
                <label 
                  key={secKey}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    isDarkMode ? "bg-stone-900/40 border-stone-800 hover:bg-stone-900" : "bg-[#F9F9F8] border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span className="font-mono text-xs uppercase tracking-wider capitalize">
                    {secKey.replace(/([A-Z])/g, " $1")}
                  </span>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      behavior: {
                        ...formData.behavior,
                        sectionToggles: {
                          ...formData.behavior.sectionToggles,
                          [secKey]: e.target.checked,
                        }
                      }
                    })}
                    className="w-4 h-4 accent-[#FF9E4A]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* WhatsApp Floating Widget Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border dark:border-stone-800 border-stone-200">
            <div>
              <span className="font-display font-medium text-xs block">
                Enable Floating WhatsApp Quick Chat Button
              </span>
              <p className={`text-[11px] ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                Displays a bottom-right WhatsApp quick direct chat button on all public pages.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.behavior.enableWhatsAppFloating}
              onChange={(e) => setFormData({
                ...formData,
                behavior: { ...formData.behavior, enableWhatsAppFloating: e.target.checked }
              })}
              className="w-5 h-5 accent-[#FF9E4A] cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
