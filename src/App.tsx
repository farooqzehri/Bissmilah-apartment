import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CMSProvider, useCMS } from "./utils/cmsContext";
import { Navbar } from "./components/ui/Navbar";
import { AnnouncementBanner } from "./components/ui/AnnouncementBanner";
import { WhatsAppButton } from "./components/ui/WhatsAppButton";
import { MaintenanceOverlay } from "./components/ui/MaintenanceOverlay";
import { Hero } from "./components/sections/Hero";
import { StatsSection } from "./components/sections/StatsSection";
import { Catalog } from "./components/sections/Catalog";
import { AmenitiesSection } from "./components/sections/AmenitiesSection";
import { TestimonialsSection } from "./components/sections/TestimonialsSection";
import { FAQSection } from "./components/sections/FAQSection";
import { CTASection } from "./components/sections/CTASection";
import { Footer } from "./components/sections/Footer";
import { ApartmentsPage } from "./components/pages/ApartmentsPage";
import { PropertiesPage } from "./components/pages/PropertiesPage";
import { AboutPage } from "./components/pages/AboutPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminAuthModal } from "./components/admin/AdminAuthModal";
import { Helmet } from "./components/ui/Helmet";

function MainAppContent() {
  const { settings, isDarkMode, toggleDarkMode } = useCMS();
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Universal Navigation Routing handler
  const handleNavigation = (targetId: string) => {
    if (targetId === "admin") {
      handleOpenAdmin();
      return;
    }

    if (targetId === "home-private-office") {
      setCurrentPage("home");
      setTimeout(() => {
        const element = document.getElementById("private-office");
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - 90,
            behavior: "smooth",
          });
        }
      }, 100);
      return;
    }

    if (["home", "apartments", "properties", "about"].includes(targetId)) {
      setCurrentPage(targetId);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Scroll handling within home views
    if (currentPage !== "home") {
      setCurrentPage("home");
      setTimeout(() => {
        handleScrollToElement(targetId);
      }, 150);
    } else {
      handleScrollToElement(targetId);
    }
  };

  const handleScrollToElement = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      const navbarOffset = 90;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleContactInquiry = (propertyTitle: string = "") => {
    setCurrentPage("home");
    setTimeout(() => {
      const element = document.getElementById("private-office");
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - 90,
          behavior: "smooth",
        });

        // Auto populate inquiry form
        const msgField = document.getElementById("client-note") as HTMLTextAreaElement;
        if (msgField) {
          msgField.value = `Assalamu Alaikum Haji Saud Zehri Sahab, I am interested in inquiring about "${propertyTitle || "Luxury Estate Holdings in A-1 City"}" listing. Please schedule a private briefing.`;
          msgField.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }, 150);
  };

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentPage("admin");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminAuthModalOpen(false);
    setCurrentPage("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const siteTitle = settings?.branding.browserTabTitle || "Bismillah Real Estate | Haji Saud Zehri - Quetta";
  const siteDesc = settings?.branding.shortDescription || "Ultra-luxury, verified real estate curation for Bismillah Real Estate, Quetta, Balochistan, owned by Haji Saud Zehri.";

  return (
    <div
      id="luxury-root"
      className={`min-h-screen relative transition-colors duration-500 selection:bg-[#FF9E4A]/30 ${
        isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"
      }`}
    >
      {/* Top Announcement Banner */}
      <AnnouncementBanner />

      {/* Floating Glassmorphic Navbar */}
      <Navbar
        onNavigate={handleNavigation}
        activeSection={currentPage}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Multi-Screen Content Layout */}
      <main id="main-content">
        <AnimatePresence mode="wait">
          {currentPage === "home" && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Helmet
                title={siteTitle}
                description={siteDesc}
                ogTitle={settings?.branding.websiteName || "Bismillah Real Estate"}
                ogDescription={siteDesc}
                keywords="Bismillah Real Estate, Haji Saud Zehri, Quetta Real Estate, A-1 City Quetta, Plots in Quetta, Flats in Quetta, Balochistan properties, verified zameen, secure properties"
              />

              {/* 1. Hero Section */}
              {settings?.behavior.sectionToggles.hero !== false && (
                <Hero
                  onExploreClick={() => handleScrollToElement("curation")}
                  onBookingClick={() => handleScrollToElement("private-office")}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* 2. Key Statistics Section */}
              {settings?.behavior.sectionToggles.statistics !== false && (
                <StatsSection isDarkMode={isDarkMode} />
              )}

              {/* 3. Live Property Catalog */}
              {settings?.behavior.sectionToggles.propertiesCatalog !== false && (
                <Catalog isDarkMode={isDarkMode} onInquireClick={handleContactInquiry} />
              )}

              {/* 4. Amenities & Utilities */}
              {settings?.behavior.sectionToggles.amenities !== false && (
                <AmenitiesSection isDarkMode={isDarkMode} />
              )}

              {/* 5. Client Testimonials */}
              {settings?.behavior.sectionToggles.testimonials !== false && (
                <TestimonialsSection isDarkMode={isDarkMode} />
              )}

              {/* 6. Frequently Asked Questions */}
              {settings?.behavior.sectionToggles.faq !== false && (
                <FAQSection isDarkMode={isDarkMode} />
              )}

              {/* 7. CTA Office Contact */}
              {settings?.behavior.sectionToggles.ctaBooking !== false && (
                <CTASection isDarkMode={isDarkMode} />
              )}
            </motion.div>
          )}

          {currentPage === "apartments" && (
            <motion.div
              key="apartments-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
            >
              <Helmet
                title={`Premium Apartments & Luxury Flats in Quetta | ${settings?.branding.websiteName || "Bismillah Real Estate"}`}
                description="Discover premium vertical residential apartments & flats in Quetta under the trusted leadership of Haji Saud Zehri. High-security, modern solar backups, and registered titles."
              />
              <ApartmentsPage onContactClick={handleContactInquiry} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {currentPage === "properties" && (
            <motion.div
              key="properties-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
            >
              <Helmet
                title={`Verified Plots, Estates & Home Schemes in Quetta | ${settings?.branding.websiteName || "Bismillah Real Estate"}`}
                description="Browse verified residential plots, commercial shops, and high-yield properties in A-1 City, Quetta with clean ownership files and direct transfer deeds."
              />
              <PropertiesPage onInquireClick={handleContactInquiry} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {currentPage === "about" && (
            <motion.div
              key="about-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
            >
              <Helmet
                title={`About Haji Saud Zehri & Bismillah Real Estate Legacy | Quetta`}
                description="Learn more about Bismillah Real Estate, the legacy of Haji Saud Zehri, and our 100% secure real estate verification standard in Quetta."
              />
              <AboutPage isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {currentPage === "admin" && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
            >
              <Helmet
                title="Admin Property Management Portal | Bismillah Real Estate"
                description="Exclusive management console for Haji Saud Zehri to manage website branding, homepage sections, listings, media assets, and leads."
              />
              <AdminDashboard
                onNavigateHome={() => handleNavigation("home")}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Container */}
      {settings?.behavior.sectionToggles.footer !== false && (
        <Footer onNavigate={handleNavigation} isDarkMode={isDarkMode} />
      )}

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppButton />

      {/* Maintenance Mode Overlay (Allows admin bypass via PIN) */}
      <MaintenanceOverlay
        onOpenAdmin={handleOpenAdmin}
        isDarkMode={isDarkMode}
      />

      {/* Admin Authentication Gate Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <MainAppContent />
    </CMSProvider>
  );
}
