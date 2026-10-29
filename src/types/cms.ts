export interface BrandSettings {
  websiteName: string;
  businessName: string;
  tagline: string;
  shortDescription: string;
  companyIntroduction: string;
  ownerName: string;
  ownerTitle: string;
  ownerQuote: string;
  ownerImage: string;
  mainLogo: string;
  lightModeLogo?: string;
  darkModeLogo?: string;
  favicon?: string;
  browserTabTitle: string;
  copyrightText: string;
  footerBrandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface ContactSettings {
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  emailAddress: string;
  officeAddress: string;
  city: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionUrl: string;
  businessHours: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface BehaviorSettings {
  defaultLanguage: string;
  defaultCurrency: string;
  defaultTimezone: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcementBanner: {
    enabled: boolean;
    text: string;
    actionText?: string;
    actionUrl?: string;
    type: "info" | "gold" | "alert";
  };
  sectionToggles: {
    hero: boolean;
    about: boolean;
    amenities: boolean;
    propertiesCatalog: boolean;
    statistics: boolean;
    gallery: boolean;
    testimonials: boolean;
    faq: boolean;
    ctaBooking: boolean;
    footer: boolean;
  };
  enableWhatsAppFloating: boolean;
  enableSocialIcons: boolean;
  enableContactForm: boolean;
}

export interface GlobalSettings {
  branding: BrandSettings;
  contact: ContactSettings;
  behavior: BehaviorSettings;
  updatedAt: string;
}

export interface AmenityItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  published: boolean;
}

export interface StatisticItem {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  subtext: string;
  order: number;
  published: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  altText: string;
  url: string;
  category: string;
  featured: boolean;
  order: number;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  location: string;
  quote: string;
  avatar?: string;
  rating: number;
  propertyTitle?: string;
  order: number;
  published: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

export interface HomepageSections {
  hero: {
    headingLine1: string;
    headingLine2: string;
    subheadingBadge: string;
    subheadingText: string;
    description: string;
    backgroundImage: string;
    overlayOpacity: number;
    primaryButtonText: string;
    primaryButtonAction: string;
    secondaryButtonText: string;
    secondaryButtonAction: string;
    published: boolean;
  };
  about: {
    badge: string;
    heading: string;
    subheading: string;
    descriptionP1: string;
    descriptionP2: string;
    ownerName: string;
    ownerTitle: string;
    ownerImage: string;
    published: boolean;
  };
  amenities: AmenityItem[];
  stats: StatisticItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
  cta: {
    badge: string;
    heading: string;
    description: string;
    officeLocationNote: string;
    backgroundImage?: string;
    published: boolean;
  };
  updatedAt: string;
}

export type PropertyCategory = "apartments" | "estates" | "schemes" | "commercial";
export type AvailabilityStatus = "Available" | "Reserved" | "Sold" | "Rented" | "Unavailable";

export interface PropertySpec {
  label: string;
  value: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  category: PropertyCategory;
  price: string;
  numericPrice?: number;
  currency: string;
  location: string;
  city: string;
  area: string;
  googleMapsUrl?: string;
  size: string;
  coveredAreaUnit: string;
  tag: string;
  status: string;
  availability: AvailabilityStatus;
  published: boolean;
  featured: boolean;
  bedrooms?: number | string;
  bathrooms?: number | string;
  floorNumber?: string;
  totalFloors?: string;
  furnishingStatus?: "Furnished" | "Semi-Furnished" | "Unfurnished" | "N/A";
  description: string;
  fullOverview?: string;
  image: string;
  gallery: string[];
  imageCaptions?: { [url: string]: string };
  imageAltTexts?: { [url: string]: string };
  highlights: string[];
  specs: PropertySpec[];
  amenities?: string[];
  imagePublicId?: string;
  galleryPublicIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  title: string;
  altText: string;
  caption: string;
  uploadedAt: string;
  usageCount?: number;
  cloudinaryPublicId?: string;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  bodyContent: string;
  published: boolean;
  showInNav: boolean;
  navOrder: number;
  updatedAt: string;
}

export interface EnquiryLead {
  id: string;
  token: string;
  clientName: string;
  phone: string;
  email?: string;
  propertyInterest: string;
  preferredDate: string;
  meetingType: string;
  clientNote?: string;
  status: "New" | "Contacted" | "In Review" | "Closed" | "Archived";
  internalNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
  performedBy: string;
}

export interface DatabaseSchema {
  settings: GlobalSettings;
  homepage: HomepageSections;
  properties: Property[];
  media: MediaItem[];
  pages: PageContent[];
  enquiries: EnquiryLead[];
  auditLogs: AuditLog[];
}
