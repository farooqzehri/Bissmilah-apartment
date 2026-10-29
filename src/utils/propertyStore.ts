import { useState, useEffect, useCallback } from "react";
import { Property, CuratedImagePreset } from "../types/property";
import { cmsProperties } from "./cmsApi";
import { FALLBACK_PROPERTIES } from "./cmsDefaults";

export const CURATED_IMAGE_PRESETS: CuratedImagePreset[] = [
  {
    id: "preset-mansion-1",
    label: "Grand Stone Bungalow (Quetta Valley)",
    category: "estates",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-mansion-2",
    label: "Buland Crest Haveli with Garden",
    category: "estates",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-mansion-3",
    label: "Private Walled Luxury Estate",
    category: "estates",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-apt-1",
    label: "The Zehri Heights Penthouse",
    category: "apartments",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-apt-2",
    label: "Royal Summit Penthouse with Mountain View",
    category: "apartments",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-apt-3",
    label: "Sunehra Botanical Ground Flat",
    category: "apartments",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-scheme-1",
    label: "A-1 Executive Commercial & Home Scheme Plots",
    category: "schemes",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-scheme-2",
    label: "Bismillah Dream Gardens Green Plots",
    category: "schemes",
    url: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-comm-1",
    label: "Double Road Commercial Frontage",
    category: "commercial",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "preset-comm-2",
    label: "Central Plaza Double Road Corner",
    category: "commercial",
    url: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=80",
  },
];

const PROPERTY_CHANGE_EVENT = "bismillah_property_store_change";

export const notifyPropertyChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROPERTY_CHANGE_EVENT));
  }
};

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>(FALLBACK_PROPERTIES);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cmsProperties.list({ limit: 100, includeUnpublished: true });
      setProperties(res.data);
    } catch (err) {
      console.error("Failed to fetch properties from server", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();

    const handleCustomChange = () => {
      fetchProperties();
    };

    window.addEventListener(PROPERTY_CHANGE_EVENT, handleCustomChange);
    return () => {
      window.removeEventListener(PROPERTY_CHANGE_EVENT, handleCustomChange);
    };
  }, [fetchProperties]);

  const addProperty = async (data: Partial<Property>): Promise<Property> => {
    const created = await cmsProperties.create(data);
    await fetchProperties();
    notifyPropertyChange();
    return created;
  };

  const updateProperty = async (id: string, updates: Partial<Property>): Promise<boolean> => {
    try {
      await cmsProperties.update(id, updates);
      await fetchProperties();
      notifyPropertyChange();
      return true;
    } catch (err) {
      console.error("Failed to update property", err);
      return false;
    }
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    try {
      await cmsProperties.delete(id);
      await fetchProperties();
      notifyPropertyChange();
      return true;
    } catch (err) {
      console.error("Failed to delete property", err);
      return false;
    }
  };

  const resetToDefaults = async () => {
    try {
      await cmsProperties.resetDefaults();
      await fetchProperties();
      notifyPropertyChange();
    } catch (err) {
      console.error("Failed to reset properties", err);
    }
  };

  const getPropertyById = (id: string) => {
    return properties.find((p) => p.id === id || p.slug === id);
  };

  return {
    properties,
    loading,
    addProperty,
    updateProperty,
    deleteProperty,
    resetToDefaults,
    getPropertyById,
    reloadProperties: fetchProperties,
  };
};
