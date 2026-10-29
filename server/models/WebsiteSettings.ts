import mongoose, { Schema, Document } from "mongoose";
import { GlobalSettings } from "../types";

export interface IWebsiteSettings extends Document, GlobalSettings {
  createdAt: Date;
  updatedAt: string;
}

const WebsiteSettingsSchema = new Schema(
  {
    branding: {
      websiteName: { type: String, default: "Bismillah Real Estate" },
      businessName: { type: String, default: "Bismillah Real Estate & Builders" },
      tagline: { type: String, default: "Apna Ghar, Apni Zameen — Haji Saud Zehri ki Sarbarahi Mein" },
      shortDescription: { type: String, default: "" },
      companyIntroduction: { type: String, default: "" },
      ownerName: { type: String, default: "Haji Saud Zehri" },
      ownerTitle: { type: String, default: "Founder & Managing Director" },
      ownerQuote: { type: String, default: "" },
      ownerImage: { type: String, default: "" },
      mainLogo: { type: String, default: "" },
      mainLogoPublicId: { type: String, default: "" },
      lightLogo: { type: String, default: "" },
      darkLogo: { type: String, default: "" },
      favicon: { type: String, default: "" },
      faviconPublicId: { type: String, default: "" },
      browserTabTitle: { type: String, default: "Bismillah Real Estate | Haji Saud Zehri — Quetta" },
      copyrightText: { type: String, default: "" },
      footerBrandName: { type: String, default: "BISMILLAH REAL ESTATE" },
      primaryColor: { type: String, default: "#DF9B43" },
      secondaryColor: { type: String, default: "#141413" },
      accentColor: { type: String, default: "#10B981" },
      fontFamily: { type: String, default: "Space Grotesk, sans-serif" },
      borderRadius: { type: String, default: "1rem" },
    },
    contact: {
      primaryPhone: { type: String, default: "+92 333 786 1928" },
      secondaryPhone: { type: String, default: "+92 81 283 4910" },
      whatsappNumber: { type: String, default: "+923337861928" },
      emailAddress: { type: String, default: "hajisaud@bismillahrealestate.pk" },
      officeAddress: { type: String, default: "Bismillah Executive Plaza, Sector A-1 Commercial Double Road, Quetta" },
      city: { type: String, default: "Quetta, Balochistan" },
      googleMapsEmbedUrl: { type: String, default: "" },
      googleMapsDirectionUrl: { type: String, default: "" },
      businessHours: { type: String, default: "Saturday - Thursday: 9:00 AM - 9:00 PM (Friday Closed)" },
      socialLinks: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        youtube: { type: String, default: "" },
        linkedin: { type: String, default: "" },
      },
    },
    behavior: {
      defaultLanguage: { type: String, default: "Urdu / English" },
      defaultCurrency: { type: String, default: "PKR" },
      defaultTimezone: { type: String, default: "Asia/Karachi" },
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { type: String, default: "" },
      announcementBanner: {
        enabled: { type: Boolean, default: true },
        text: { type: String, default: "" },
        actionText: { type: String, default: "" },
        actionUrl: { type: String, default: "" },
        type: { type: String, default: "gold" },
      },
      sectionToggles: {
        hero: { type: Boolean, default: true },
        about: { type: Boolean, default: true },
        amenities: { type: Boolean, default: true },
        propertiesCatalog: { type: Boolean, default: true },
        statistics: { type: Boolean, default: true },
        gallery: { type: Boolean, default: true },
        testimonials: { type: Boolean, default: true },
        faq: { type: Boolean, default: true },
        ctaBooking: { type: Boolean, default: true },
        footer: { type: Boolean, default: true },
      },
      enableWhatsAppFloating: { type: Boolean, default: true },
      enableSocialIcons: { type: Boolean, default: true },
      enableContactForm: { type: Boolean, default: true },
    },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const WebsiteSettingsModel: mongoose.Model<IWebsiteSettings> =
  (mongoose.models.WebsiteSettings as mongoose.Model<IWebsiteSettings>) ||
  mongoose.model<IWebsiteSettings>("WebsiteSettings", WebsiteSettingsSchema);
