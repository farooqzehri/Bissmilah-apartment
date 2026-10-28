import { useState, useEffect, useCallback } from "react";
import { PropertyItem, CuratedImagePreset } from "../types/property";

const STORAGE_KEY = "bismillah_real_estate_properties_v2";

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

export const INITIAL_PROPERTIES: PropertyItem[] = [
  {
    id: "zehri-heights",
    category: "apartments",
    title: "The Zehri Heights Penthouses (Shandaar Residence)",
    location: "A-1 City, Block C, Quetta",
    price: "PKR 3.4 Crore",
    size: "4,200 Sq. Ft.",
    tag: "Shandaar Flat",
    status: "100% Registry Ready",
    description: "Ultra-luxury duplex penthouse with mountain horizons over Koh-e-Murdar. Features Italian marble floors, high-speed elevator access, 24/7 solar power backup, and gated private entrance.",
    highlights: [
      "Beautiful luxury view of Quetta mountain ranges",
      "Fine marble floors, bright open rooms, and royal decoration",
      "Private direct lift and safe reserved parking spot",
      "Full title deed registered under Haji Saud Zehri supervision"
    ],
    specs: [
      { label: "Bedrooms", value: "4 En-Suite" },
      { label: "Bathrooms", value: "5 Premium" },
      { label: "Format", value: "Duplex Penthouse" },
      { label: "Solar Backup", value: "10kW Hybrid" }
    ],
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],
    featured: true,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-03-15T12:00:00.000Z",
  },
  {
    id: "obsidian-pavilion",
    category: "estates",
    title: "The Obsidian Pavilion (Sunehri Bungalow)",
    location: "Estate Boulevard, A-1 City, Quetta",
    price: "PKR 12.5 Crore",
    size: "1,200 Sq. Yds",
    tag: "Zeenat Palace",
    status: "Available for Assignment",
    description: "Balochistan ke behtareen patharo se bana shandaar sunehra bungalow. Absolute state-of-the-art layout designed for ultimate luxury, year-round winter climate insulation, and timeless family gatherings.",
    highlights: [
      "Beautiful strong stone walls with traditional Balochistan grace",
      "Big open family courtyard and green grassy flower garden",
      "Completely insulated rooms to stay cozy in winter and cool in summer",
      "Sweet-water deep tube well with multi-stage automated filtration"
    ],
    specs: [
      { label: "Type", value: "Private Mansion" },
      { label: "Courtyard", value: "Traditional Lawn" },
      { label: "Security", value: "High Secured Walls" },
      { label: "Parking", value: "6 Vehicles" }
    ],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80"
    ],
    featured: true,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-03-20T12:00:00.000Z",
  },
  {
    id: "executive-scheme",
    category: "schemes",
    title: "A-1 Executive Home Scheme (VVIP Plots)",
    location: "Phase 3 Central, A-1 City, Quetta",
    price: "PKR 5.8 Crore",
    size: "500 Sq. Yds",
    tag: "100% File Ready",
    status: "Ready for Construction",
    description: "Bohot hi shandaar plots jin ke sath immediate safe water, clean electricity, aur premium wide roads connect hain. Direct registry file available without tax disputes.",
    highlights: [
      "100% clear legal paper registry checked and approved",
      "Continuous water supply, secure electricity, and direct internet lines",
      "Strong society compound wall with guard checkpoints",
      "Fast road connectivity directly leading into Quetta City commercial hub"
    ],
    specs: [
      { label: "Registry", value: "Immediate Registry" },
      { label: "Water Sourcing", value: "Sweet Water Well" },
      { label: "Road Width", value: "60 Ft. Wide Carpet" },
      { label: "Possession", value: "Instant Handover" }
    ],
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80"
    ],
    featured: true,
    createdAt: "2026-01-20T10:00:00.000Z",
    updatedAt: "2026-03-22T12:00:00.000Z",
  },
  {
    id: "quetta-valley-suites",
    category: "apartments",
    title: "Quetta Valley Suites (Sundar Flats)",
    location: "Sector A-2 Central, Quetta",
    price: "PKR 2.1 Crore",
    size: "2,600 Sq. Ft.",
    tag: "Modern Flat",
    status: "100% Registry Ready",
    description: "Modern architectural luxury flat designed with double-glazed weather seals, panoramic glass balcony, and uninterrupted utilities.",
    highlights: [
      "Beautiful glass windows with secure locks and family safety",
      "Cozy central heating to stay safe from dry cold winds",
      "Pre-installed premium solar system for continuous power backup",
      "Dedicated basement parking with round-the-clock security surveillance"
    ],
    specs: [
      { label: "Bedrooms", value: "3 Bed Attached" },
      { label: "Terrace Layout", value: "L-Shape Wrap" },
      { label: "Power Backup", value: "Solar Installed" },
      { label: "Registry", value: "Direct Transfer Ready" }
    ],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ],
    featured: false,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-04-01T12:00:00.000Z",
  },
  {
    id: "chiltan-view-estates",
    category: "estates",
    title: "The Chiltan View Crest Mansion (Buland Haveli)",
    location: "Private High-Altitude Belt, Quetta",
    price: "PKR 18.0 Crore",
    size: "2,000 Sq. Yds",
    tag: "Buland Haveli",
    status: "Exclusive Allocation",
    description: "Quetta ka sab se shandaar plot jis ke sath triple high boundary security wall aur paydar green garden shamil hain. Unobstructed view of Chiltan mountain range.",
    highlights: [
      "Great mountain layout directly looking over Chiltan hills",
      "VVIP security fencing around the boundary with full guards list",
      "Big clean sweet-water well inside the house for endless water access",
      "Complete legal clearances verified by Balochistan land revenue office"
    ],
    specs: [
      { label: "Structure", value: "Triple Story Haveli" },
      { label: "Fencing Type", value: "Reinforced Boundary" },
      { label: "Bedrooms", value: "7 Luxury Suites" },
      { label: "Paper Status", value: "100% Tax Free Verified" }
    ],
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    featured: true,
    createdAt: "2026-02-05T10:00:00.000Z",
    updatedAt: "2026-04-05T12:00:00.000Z",
  },
  {
    id: "bismillah-dream-gardens",
    category: "schemes",
    title: "Bismillah Dream Gardens (Dilkash Plots)",
    location: "North Sector Corridor, Quetta",
    price: "PKR 8.5 Crore",
    size: "1,000 Sq. Yds Plot",
    tag: "Dilkash Legacy",
    status: "Limited Plot Listings Left",
    description: "Gated VIP society mein khubsurat plots jin ke side par green trees aur sweet water tube-wells pre-installed hain. Wide 80-foot grand boulevard entrance.",
    highlights: [
      "Sleek wide streets with easy access for cars and guests",
      "Beautiful plant rows, green public gardens, and kids park nearby",
      "Super fast connection to Quetta main highway roads and shopping areas",
      "Direct deed issuance under Haji Saud Zehri personal office"
    ],
    specs: [
      { label: "Dimensions", value: "60 x 150 Frontage" },
      { label: "Sewerage Grid", value: "Complete Layout" },
      { label: "Gas Supply", value: "Pre-Connected Pipelines" },
      { label: "Papers", value: "100% Registry Transfer" }
    ],
    image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    featured: false,
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-04-10T12:00:00.000Z",
  },
  {
    id: "boulevard-commercial",
    category: "commercial",
    title: "Double Road Commercial Frontage (Corner Dukaan & Plaza)",
    location: "Sector B Market, A-1 City, Quetta",
    price: "PKR 9.2 Crore",
    size: "300 Sq. Yds",
    tag: "VVIP Commercial",
    status: "100% Verified Title Deed",
    description: "Dukaan ya shandaar commercial building ke liye double road corner plot. Prime commercial footfall zone with high appreciation potential.",
    highlights: [
      "Direct double road commercial main boulevard access",
      "Approved for multi-story commercial plaza construction",
      "Underground three-phase industrial grade electrical connection",
      "100% verified mutation deed and title transfer"
    ],
    specs: [
      { label: "Frontage", value: "Double Road Corner" },
      { label: "Zoning", value: "Commercial Commercial Plaza" },
      { label: "Electricity", value: "3-Phase Ready" },
      { label: "Handover", value: "Immediate" }
    ],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=80"
    ],
    featured: true,
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-04-15T12:00:00.000Z",
  },
  {
    id: "prime-corner",
    category: "commercial",
    title: "C-Block Central Plaza Commercial (Sunehra Corner)",
    location: "Main Commercial Belt, A-1 City, Quetta",
    price: "PKR 4.5 Crore",
    size: "150 Sq. Yds",
    tag: "VVIP Spot",
    status: "Immediate Registry Transfer",
    description: "VVIP corner plot sports arena aur central mosque ke bilkul sath. Direct gas line ready aur immediate name registry transfer system ready hai.",
    highlights: [
      "Located at high foot-traffic junction of Block C",
      "Ready for immediate shop or office construction",
      "Direct sweet-water supply and gas line connectivity",
      "Clear title certificate endorsed by Haji Saud Zehri"
    ],
    specs: [
      { label: "Type", value: "Corner Commercial" },
      { label: "Frontage", value: "45 Ft. Main Road" },
      { label: "Approval", value: "NOC Issued" },
      { label: "Registry", value: "Instant Transfer" }
    ],
    image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=80",
    gallery: [],
    featured: false,
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-04-20T12:00:00.000Z",
  },
  {
    id: "royal-suite",
    category: "apartments",
    title: "The Royal Summit Penthouse (Shandaar Suite)",
    location: "Tower Alpha, A-1 City, Quetta",
    price: "PKR 4.8 Crore",
    size: "4,600 Sq. Ft.",
    tag: "Penthouse Suite",
    status: "Exclusive Allocation",
    description: "Bohot pyara buland penthouse jo ke 24th floor par hai. Is mein winter se bachnay ke liye safe glazed double-glass lagaye gaye hain aur direct elevator entry shamil hai.",
    highlights: [
      "Safe personal terrace court with sweeping 360-degree mountain views",
      "Direct custom key-card secured elevator entry into penthouse foyer",
      "Imported Italian marble floors and custom woodwork",
      "24/7 continuous solar battery backup system pre-installed"
    ],
    specs: [
      { label: "Bedrooms", value: "4 En-Suite" },
      { label: "Bathrooms", value: "5 Baths" },
      { label: "Floor", value: "24th Floor (Top)" },
      { label: "Direction", value: "North-West Valley" }
    ],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    gallery: [],
    featured: true,
    createdAt: "2026-02-25T10:00:00.000Z",
    updatedAt: "2026-04-25T12:00:00.000Z",
  },
  {
    id: "meridian-flat",
    category: "apartments",
    title: "The Meridian Courtyard Flat (Sunehra Garden Flat)",
    location: "Phase 2 Plaza, A-1 City, Quetta",
    price: "PKR 1.8 Crore",
    size: "2,100 Sq. Ft.",
    tag: "Garden Flat",
    status: "100% Registry Ready",
    description: "Ground floor flat jis ke sath hi ek khubsurat botanical family lawn garden hai. Direct walkable links to clean commercial sector market streets of A-1 City.",
    highlights: [
      "Beautiful boundary courtyard garden reserved for family",
      "Fitted safe gas heaters and thermal ceiling insulation",
      "Immediate name transfer deeds verified by Haji Saud Zehri",
      "High speed optical fiber reliable internet lines connected"
    ],
    specs: [
      { label: "Bedrooms", value: "2 Bed Attached" },
      { label: "Bathrooms", value: "2 Baths" },
      { label: "Floor", value: "Ground Floor" },
      { label: "Garden", value: "Private 400 Sq. Ft." }
    ],
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    gallery: [],
    featured: false,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-04-28T12:00:00.000Z",
  }
];

// Helper to load from localStorage or fallback
const getInitialProperties = (): PropertyItem[] => {
  if (typeof window === "undefined") return INITIAL_PROPERTIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load properties from localStorage", e);
  }
  return INITIAL_PROPERTIES;
};

// Global event bus for in-tab reactive updates across all components
const PROPERTY_CHANGE_EVENT = "bismillah_property_store_change";

export const notifyPropertyChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROPERTY_CHANGE_EVENT));
  }
};

export const useProperties = () => {
  const [properties, setProperties] = useState<PropertyItem[]>(getInitialProperties);

  const reloadProperties = useCallback(() => {
    setProperties(getInitialProperties());
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        reloadProperties();
      }
    };

    const handleCustomChange = () => {
      reloadProperties();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROPERTY_CHANGE_EVENT, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PROPERTY_CHANGE_EVENT, handleCustomChange);
    };
  }, [reloadProperties]);

  const saveProperties = (newProps: PropertyItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProps));
      setProperties(newProps);
      notifyPropertyChange();
    } catch (e) {
      console.error("Error saving properties to localStorage", e);
    }
  };

  const addProperty = (data: Omit<PropertyItem, "id" | "createdAt" | "updatedAt">): PropertyItem => {
    const now = new Date().toISOString();
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const newId = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProperty: PropertyItem = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newProperty, ...properties];
    saveProperties(updated);
    return newProperty;
  };

  const updateProperty = (id: string, updates: Partial<PropertyItem>): boolean => {
    let found = false;
    const now = new Date().toISOString();
    const updated = properties.map((p) => {
      if (p.id === id) {
        found = true;
        return {
          ...p,
          ...updates,
          updatedAt: now,
        };
      }
      return p;
    });

    if (found) {
      saveProperties(updated);
    }
    return found;
  };

  const deleteProperty = (id: string): boolean => {
    const filtered = properties.filter((p) => p.id !== id);
    if (filtered.length !== properties.length) {
      saveProperties(filtered);
      return true;
    }
    return false;
  };

  const resetToDefaults = () => {
    saveProperties(INITIAL_PROPERTIES);
  };

  const getPropertyById = (id: string) => {
    return properties.find((p) => p.id === id);
  };

  return {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    resetToDefaults,
    getPropertyById,
  };
};
