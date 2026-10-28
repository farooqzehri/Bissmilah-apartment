import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/ui/Navbar";
import { Hero } from "./components/sections/Hero";
import { Catalog } from "./components/sections/Catalog";
import { CTASection } from "./components/sections/CTASection";
import { Footer } from "./components/sections/Footer";
import { ApartmentsPage } from "./components/pages/ApartmentsPage";
import { PropertiesPage } from "./components/pages/PropertiesPage";
import { AboutPage } from "./components/pages/AboutPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminAuthModal } from "./components/admin/AdminAuthModal";
import { Helmet } from "./components/ui/Helmet";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Sync dark class on document element so Tailwind works optimally across all components
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Universal Navigation Routing handler
  const handleNavigation = (targetId: string) => {
    if (targetId === "admin") {
      handleOpenAdmin();
      return;
    }

    // If navigating to home section blocks
    if (targetId === "home-private-office") {
      setCurrentPage("home");
      setTimeout(() => {
        const element = document.getElementById("private-office");
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - 90,
            behavior: "smooth"
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
        behavior: "smooth"
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
          behavior: "smooth"
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

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
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

  return (
    <div 
      id="luxury-root" 
      className={`min-h-screen relative transition-colors duration-500 selection:bg-[#FF9E4A]/30 ${
        isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"
      }`}
    >
      
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
                title="Bismillah Real Estate | Haji Saud Zehri - Premium Plots & Flats in Quetta"
                description="Bismillah Real Estate under Haji Saud Zehri provides 100% verified registry plots, luxury apartments, and premium home schemes in Quetta, Balochistan. Secure your real estate future today."
                ogTitle="Bismillah Real Estate | Haji Saud Zehri - Premium Quetta Real Estate"
                ogDescription="Find 100% verified plots and premium apartments in Quetta under the trusted leadership of Haji Saud Zehri. Beautiful design, secure registry, top security."
                keywords="Bismillah Real Estate, Haji Saud Zehri, Quetta Real Estate, A-1 City Quetta, Plots in Quetta, Flats in Quetta, Balochistan properties, verified zameen, secure properties"
              />
              <Hero 
                onExploreClick={() => handleScrollToElement("curation")}
                onBookingClick={() => handleScrollToElement("private-office")}
                isDarkMode={isDarkMode}
              />
              <Catalog isDarkMode={isDarkMode} onInquireClick={handleContactInquiry} />
              <CTASection isDarkMode={isDarkMode} />
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
                title="Premium Apartments & Luxury Flats in Quetta | Bismillah Real Estate"
                description="Discover premium vertical residential apartments & flats in Quetta under the trusted leadership of Haji Saud Zehri. High-security, modern solar backups, and registered titles."
                ogTitle="Premium Apartments & Luxury Flats in Quetta"
                ogDescription="Modern luxury apartments in Quetta featuring beautiful mountain views, sound winter insulation, pre-installed solar systems, and verified direct title registry."
                keywords="Apartments in Quetta, Flats in Quetta, Zehri Heights, Quetta Valley Suites, Luxury Penthouse Quetta, Bismillah Apartments"
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
                title="Verified Plots, Estates & Home Schemes in Quetta | Bismillah Real Estate"
                description="Browse verified residential plots, commercial shops, and high-yield properties in A-1 City, Quetta with clean ownership files and direct transfer deeds."
                ogTitle="Verified Plots & Residential Schemes in Quetta"
                ogDescription="Find residential plots, VVIP commercial roadside properties, and beautiful estates with 100% checked registry documents under direct advice of Haji Saud Zehri."
                keywords="Plots in Quetta, Commercial Plots Quetta, Home Schemes Quetta, A-1 City Plots, Bismillah Real Estate, Haji Saud Zehri"
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
                title="About Haji Saud Zehri & Bismillah Real Estate Legacy | Quetta"
                description="Learn more about Bismillah Real Estate, the legacy of Haji Saud Zehri, and our 100% secure real estate verification standard in Quetta."
                ogTitle="The Legacy of Haji Saud Zehri | Bismillah Real Estate"
                ogDescription="Established by Haji Saud Zehri, Bismillah Real Estate is the hallmark of trust, security, and elite development across Quetta & Balochistan."
                keywords="Haji Saud Zehri, Bismillah Real Estate Quetta history, Quetta property authority, Balochistan verified land registry"
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
                description="Exclusive management console for Haji Saud Zehri to create, edit, update, and manage property listings, image integrations, and registry statuses."
                ogTitle="Admin CMS — Bismillah Real Estate"
                ogDescription="Property directory CRUD console with image uploads and real-time synchronization."
                keywords="Admin, Bismillah Real Estate CMS, Manage listings"
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
      <Footer onNavigate={handleNavigation} isDarkMode={isDarkMode} />

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
