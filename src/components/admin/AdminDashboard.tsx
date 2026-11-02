import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowLeft } from "lucide-react";
import { AdminSidebar, AdminTab } from "./AdminSidebar";
import { OverviewTab } from "./tabs/OverviewTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { HomepageTab } from "./tabs/HomepageTab";
import { PropertiesTab } from "./tabs/PropertiesTab";
import { MediaTab } from "./tabs/MediaTab";
import { PagesTab } from "./tabs/PagesTab";
import { LeadsTab } from "./tabs/LeadsTab";
import { AuditTab } from "./tabs/AuditTab";
import { PropertyFormModal } from "./PropertyFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useCMS } from "../../utils/cmsContext";
import { useProperties } from "../../utils/propertyStore";
import { Property, AvailabilityStatus } from "../../types/cms";
import { cmsAuth, cmsEnquiries, cmsMedia } from "../../utils/cmsApi";

interface AdminDashboardProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
  isDarkMode,
}) => {
  const { settings, homepage, updateSettings, updateHomepage, updateHomepageSection } = useCMS();
  const { properties, addProperty, updateProperty, deleteProperty, resetToDefaults } = useProperties();

  const [currentTab, setCurrentTab] = useState<AdminTab>("overview");
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Property Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadAdminAuxData = async () => {
    try {
      const [leadsRes, mediaRes] = await Promise.allSettled([
        cmsEnquiries.list(),
        cmsMedia.list(),
      ]);
      if (leadsRes.status === "fulfilled") setEnquiries(leadsRes.value);
      if (mediaRes.status === "fulfilled") setMedia(mediaRes.value);
    } catch (e) {
      console.error("Auxiliary admin data error", e);
    }
  };

  useEffect(() => {
    loadAdminAuxData();
  }, []);

  const handleLogout = async () => {
    try {
      await cmsAuth.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    localStorage.removeItem("bismillah_current_page");
    window.location.hash = "";
    onNavigateHome();
  };

  // Property handlers
  const handleOpenCreate = () => {
    setPropertyToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prop: Property) => {
    setPropertyToEdit(prop);
    setIsFormOpen(true);
  };

  const handleSaveProperty = async (data: any) => {
    try {
      if (propertyToEdit) {
        await updateProperty(propertyToEdit.id, data);
        showToast(`Updated "${data.title}" successfully.`);
      } else {
        await addProperty(data);
        showToast(`Created new listing "${data.title}".`);
      }
      setIsFormOpen(false);
      setPropertyToEdit(null);
    } catch (err: any) {
      showToast("Error saving property: " + (err.message || String(err)));
    }
  };

  const handleOpenDelete = (prop: Property) => {
    setPropertyToDelete(prop);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (propertyToDelete) {
      await deleteProperty(propertyToDelete.id);
      showToast(`Removed "${propertyToDelete.title}".`);
    }
    setIsDeleteModalOpen(false);
    setPropertyToDelete(null);
  };

  const handleToggleFeatured = async (prop: Property) => {
    await updateProperty(prop.id, { featured: !prop.featured });
    showToast(!prop.featured ? `Featured "${prop.title}".` : `Unfeatured "${prop.title}".`);
  };

  const handleTogglePublished = async (prop: Property) => {
    const isCurrentlyPublished = prop.published !== false;
    await updateProperty(prop.id, { published: !isCurrentlyPublished });
    showToast(!isCurrentlyPublished ? `Listing "${prop.title}" is now Live.` : `Listing "${prop.title}" is now Hidden.`);
  };

  const handleChangeAvailability = async (prop: Property, status: AvailabilityStatus) => {
    await updateProperty(prop.id, { availability: status });
    showToast(`"${prop.title}" status changed to ${status}.`);
  };

  const handleResetCatalog = async () => {
    if (window.confirm("Are you sure you want to restore initial factory listings? Any custom entries will be reset.")) {
      await resetToDefaults();
      showToast("Property catalog reset to initial records.");
    }
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-4 md:px-8 text-left transition-colors duration-500 ${
      isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"
    }`}>
      {/* Toast Feedback */}
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

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Modular Left Sidebar */}
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onNavigateHome={onNavigateHome}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          unseenLeadsCount={enquiries.filter((e) => e.status === "New").length}
        />

        {/* Tab Content Display */}
        <div className="flex-1 w-full min-w-0">
          {currentTab === "overview" && (
            <OverviewTab
              properties={properties}
              enquiries={enquiries}
              media={media}
              settings={settings}
              onNavigateTab={setCurrentTab}
              onOpenAddProperty={handleOpenCreate}
              onOpenUploadMedia={() => setCurrentTab("media")}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === "settings" && (
            <SettingsTab
              settings={settings}
              onSave={updateSettings}
              isDarkMode={isDarkMode}
              onShowToast={showToast}
            />
          )}

          {currentTab === "homepage" && (
            <HomepageTab
              homepage={homepage}
              onSave={updateHomepage}
              onSaveSection={updateHomepageSection}
              isDarkMode={isDarkMode}
              onShowToast={showToast}
            />
          )}

          {currentTab === "properties" && (
            <PropertiesTab
              properties={properties}
              onOpenCreate={handleOpenCreate}
              onOpenEdit={handleOpenEdit}
              onOpenDelete={handleOpenDelete}
              onToggleFeatured={handleToggleFeatured}
              onTogglePublished={handleTogglePublished}
              onChangeAvailability={handleChangeAvailability}
              onResetDefaults={handleResetCatalog}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === "media" && (
            <MediaTab
              media={media}
              onRefreshMedia={async () => {
                const data = await cmsMedia.list();
                setMedia(data);
              }}
              isDarkMode={isDarkMode}
              onShowToast={showToast}
            />
          )}

          {currentTab === "pages" && (
            <PagesTab
              isDarkMode={isDarkMode}
              onShowToast={showToast}
            />
          )}

          {currentTab === "leads" && (
            <LeadsTab
              enquiries={enquiries}
              onRefreshLeads={async () => {
                const data = await cmsEnquiries.list();
                setEnquiries(data);
              }}
              isDarkMode={isDarkMode}
              onShowToast={showToast}
            />
          )}

          {currentTab === "audit" && (
            <AuditTab
              isDarkMode={isDarkMode}
              onShowToast={showToast}
            />
          )}
        </div>
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
