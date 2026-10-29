import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GlobalSettings, HomepageSections, Property } from "../types/cms";
import { cmsSettings, cmsHomepage, cmsProperties } from "./cmsApi";
import { FALLBACK_SETTINGS, FALLBACK_HOMEPAGE, FALLBACK_PROPERTIES } from "./cmsDefaults";

interface CMSContextType {
  settings: GlobalSettings | null;
  homepage: HomepageSections;
  properties: Property[];
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  announcementDismissed: boolean;
  dismissAnnouncement: () => void;
  refreshSettings: () => Promise<void>;
  refreshHomepage: () => Promise<void>;
  refreshProperties: () => Promise<void>;
  updateSettings: (updates: Partial<GlobalSettings>) => Promise<GlobalSettings>;
  updateHomepage: (updates: Partial<HomepageSections>) => Promise<HomepageSections>;
  updateHomepageSection: (section: string, data: any) => Promise<any>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GlobalSettings | null>(FALLBACK_SETTINGS);
  const [homepage, setHomepage] = useState<HomepageSections>(FALLBACK_HOMEPAGE);
  const [properties, setProperties] = useState<Property[]>(FALLBACK_PROPERTIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bismillah_theme");
      if (saved) return saved === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [announcementDismissed, setAnnouncementDismissed] = useState<boolean>(false);

  // Sync dark class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("bismillah_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("bismillah_theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
  };

  const refreshSettings = useCallback(async () => {
    try {
      const data = await cmsSettings.get();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load CMS settings", err);
    }
  }, []);

  const refreshHomepage = useCallback(async () => {
    try {
      const data = await cmsHomepage.get();
      setHomepage(data);
    } catch (err) {
      console.error("Failed to load CMS homepage", err);
    }
  }, []);

  const refreshProperties = useCallback(async () => {
    try {
      const res = await cmsProperties.list({ limit: 100 });
      setProperties(res.data);
    } catch (err) {
      console.error("Failed to load CMS properties", err);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.allSettled([refreshSettings(), refreshHomepage(), refreshProperties()]);
      setIsLoading(false);
    };
    initData();
  }, [refreshSettings, refreshHomepage, refreshProperties]);

  const updateSettings = async (updates: Partial<GlobalSettings>): Promise<GlobalSettings> => {
    const updated = await cmsSettings.update(updates);
    setSettings(updated);
    return updated;
  };

  const updateHomepage = async (updates: Partial<HomepageSections>): Promise<HomepageSections> => {
    const updated = await cmsHomepage.update(updates);
    setHomepage(updated);
    return updated;
  };

  const updateHomepageSection = async (section: string, data: any): Promise<any> => {
    const updated = await cmsHomepage.updateSection(section, data);
    setHomepage((prev) => ({
      ...prev,
      [section]: updated !== undefined ? updated : data,
      updatedAt: new Date().toISOString(),
    }));
    return updated;
  };

  return (
    <CMSContext.Provider
      value={{
        settings,
        homepage,
        properties,
        isLoading,
        isDarkMode,
        toggleDarkMode,
        announcementDismissed,
        dismissAnnouncement,
        refreshSettings,
        refreshHomepage,
        refreshProperties,
        updateSettings,
        updateHomepage,
        updateHomepageSection,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextType => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};
