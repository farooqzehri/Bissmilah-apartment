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
import { AboutLegacySection } from "./components/sections/AboutLegacySection";
import { AmenitiesSection } from "./components/sections/AmenitiesSection";
import { GallerySection } from "./components/sections/GallerySection";
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

  // Persist authentication state across page reloads
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("bismillah_admin_token"));
  });

  // Persist current page & respect direct hash URLs (e.g. #admin, #properties)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window === "undefined") return "home";
    const hash = window.location.hash.replace("#", "").trim();
    if (["admin", "apartments", "properties", "about", "home"].includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem("bismillah_current_page");
    if (saved && ["admin", "apartments", "properties", "about", "home"].includes(saved)) {
      return saved;
    }
    return "home";
  });

  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>("all");

  // Sync hash changes dynamically
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").trim();
      if (hash === "admin") {
        const token = localStorage.getItem("bismillah_admin_token");
        if (token) {
          setIsAdminAuthenticated(true);
          setCurrentPage("admin");
          localStorage.setItem("bismillah_current_page", "admin");
        } else {
          setIsAdminAuthModalOpen(true);
        }
      } else if (["home", "apartments", "properties", "about"].includes(hash)) {
        setCurrentPage(hash);
        localStorage.setItem("bismillah_current_page", hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Universal Navigation Routing handler
  const handleNavigation = (targetId: string) => {
    if (targetId === "admin") {
      handleOpenAdmin();
      return;
    }

    if (targetId === "home-private-office") {
      setCurrentPage("home");
      localStorage.setItem("bismillah_current_page", "home");
      window.location.hash = "home";
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
      localStorage.setItem("bismillah_current_page", targetId);
      window.location.hash = targetId === "home" ? "" : targetId;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Scroll handling within home views
    if (currentPage !== "home") {
      setCurrentPage("home");
      localStorage.setItem("bismillah_current_page", "home");
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
    localStorage.setItem("bismillah_current_page", "home");
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
    const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("bismillah_admin_token"));
    if (isAdminAuthenticated || hasToken) {
      setIsAdminAuthenticated(true);
      setCurrentPage("admin");
      localStorage.setItem("bismillah_current_page", "admin");
      window.location.hash = "admin";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminAuthModalOpen(false);
    setCurrentPage("admin");
    localStorage.setItem("bismillah_current_page", "admin");
    window.location.hash = "admin";
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

              {/* 1. California Luxury Hero Section */}
              {settings?.behavior.sectionToggles.hero !== false && (
                <Hero
                  onExploreClick={() => handleScrollToElement("curation")}
                  onBookingClick={() => handleScrollToElement("private-office")}
                  isDarkMode={isDarkMode}
                  onSelectCategory={(cat) => setCatalogCategoryFilter(cat)}
                />
              )}

              {/* 2. Key Verified Benchmarks */}
              {settings?.behavior.sectionToggles.statistics !== false && (
                <StatsSection isDarkMode={isDarkMode} />
              )}

              {/* 3. Curated Estates & Residences Portfolio */}
              {settings?.behavior.sectionToggles.propertiesCatalog !== false && (
                <Catalog 
                  isDarkMode={isDarkMode} 
                  onInquireClick={handleContactInquiry} 
                  selectedCategoryFilter={catalogCategoryFilter}
                />
              )}

              {/* 4. The Foundation of Trust — Founder & Legacy */}
              {settings?.behavior.sectionToggles.about !== false && (
                <AboutLegacySection
                  isDarkMode={isDarkMode}
                  onBookingClick={() => handleScrollToElement("private-office")}
                />
              )}

              {/* 5. The California Living Standard — Amenities & Utilities */}
              {settings?.behavior.sectionToggles.amenities !== false && (
                <AmenitiesSection isDarkMode={isDarkMode} />
              )}

              {/* 6. Visual Monograph — Architectural Perspectives Gallery */}
              {settings?.behavior.sectionToggles.gallery !== false && (
                <GallerySection isDarkMode={isDarkMode} />
              )}

              {/* 7. Client Acclaim & Testimonials */}
              {settings?.behavior.sectionToggles.testimonials !== false && (
                <TestimonialsSection isDarkMode={isDarkMode} />
              )}

              {/* 8. Title & Registry Disclosures FAQ */}
              {settings?.behavior.sectionToggles.faq !== false && (
                <FAQSection isDarkMode={isDarkMode} />
              )}

              {/* 9. Private Showing Concierge & Executive Suite */}
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
        isAdminAuthenticated={isAdminAuthenticated}
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
