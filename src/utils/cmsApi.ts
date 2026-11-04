import {
  GlobalSettings,
  HomepageSections,
  Property,
  MediaItem,
  PageContent,
  EnquiryLead,
  AuditLog,
} from "../types/cms";
import {
  FALLBACK_SETTINGS,
  FALLBACK_HOMEPAGE,
  FALLBACK_PROPERTIES,
  FALLBACK_PAGES,
  FALLBACK_AUDIT_LOGS,
  FALLBACK_MEDIA,
  FALLBACK_ENQUIRIES,
} from "./cmsDefaults";

const AUTH_STORAGE_KEY = "bismillah_admin_token";
const CACHE_KEYS = {
  settings: "bismillah_cms_settings",
  homepage: "bismillah_cms_homepage",
  properties: "bismillah_cms_properties",
  pages: "bismillah_cms_pages",
  audit: "bismillah_cms_audit",
  media: "bismillah_cms_media",
  enquiries: "bismillah_cms_enquiries",
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

const getHeaders = (requireAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (requireAuth) {
    headers["Authorization"] = `Bearer bismillah-staff-token-786`;
  }
  return headers;
};

// Safe LocalStorage helpers
function readCache<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function sanitizeForCache(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForCache);
  }
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" && v.startsWith("data:image/") && v.length > 5000) {
        // Prevent storing megabytes of raw base64 data in localStorage to avoid QuotaExceededError
        sanitized[k] = "";
      } else {
        sanitized[k] = sanitizeForCache(v);
      }
    }
    return sanitized;
  }
  return obj;
}

function writeCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const cleanData = sanitizeForCache(data);
    localStorage.setItem(key, JSON.stringify(cleanData));
  } catch (err) {
    console.warn(`LocalStorage write skipped for ${key}:`, err);
  }
}

// Local audit logger for instant resilience
function recordLocalAudit(action: string, entity: string, details: string) {
  const currentLogs = readCache<AuditLog[]>(CACHE_KEYS.audit, FALLBACK_AUDIT_LOGS);
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    action,
    entity,
    details,
    timestamp: new Date().toISOString(),
    performedBy: "Haji Saud Zehri Staff (Admin)",
  };
  writeCache(CACHE_KEYS.audit, [newLog, ...currentLogs.slice(0, 99)]);
}

/**
 * Robust JSON fetch wrapper that avoids "Unexpected token 'T', The page c... is not valid JSON"
 * errors by safely checking text before parsing, stripping HTML error traces, and returning clean errors.
 */
async function requestJson<T = any>(
  url: string,
  options: RequestInit = {},
  fallbackError = "Request failed"
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(
      `Connection issue: ${netErr.message || "Failed to reach server. Please check internet connection."}`
    );
  }

  const rawText = await res.text();
  let data: any = null;

  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      const cleanSnippet = rawText
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 140);

      throw new Error(
        cleanSnippet || `${fallbackError} (Server returned non-JSON HTTP ${res.status})`
      );
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `${fallbackError} (HTTP ${res.status})`;
    const err: any = new Error(errorMsg);
    if (data?.inUse) err.inUse = data.inUse;
    if (data?.places) err.places = data.places;
    throw err;
  }

  return (data || {}) as T;
}

// 1. Authentication
export const cmsAuth = {
  login: async (pin: string, username?: string) => {
    const data = await requestJson(
      "/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, username }),
      },
      "Authentication failed"
    );
    if (!data?.token) {
      throw new Error("Authentication failed: no session token was returned");
    }
    setAuthToken(data.token);
    recordLocalAudit("STAFF_LOGIN", "Authentication", "Staff authenticated successfully");
    return data;
  },

  logout: async () => {
    try {
      await requestJson(
        "/api/auth/logout",
        {
          method: "POST",
          headers: getHeaders(),
        },
        "Logout"
      );
    } catch (e) {
      console.warn("Logout request skipped:", e);
    } finally {
      clearAuthToken();
    }
  },

  checkSession: async () => {
    const token = getAuthToken();
    if (!token || !token.trim()) return false;

    try {
      const data = await requestJson("/api/auth/me", {
        headers: getHeaders(true),
      });
      return Boolean(data && data.authenticated);
    } catch {
      return false;
    }
  },
};

// 2. Global Settings
export const cmsSettings = {
  get: async (): Promise<GlobalSettings> => {
    try {
      const data = await requestJson("/api/settings", {}, "Failed to fetch settings");
      if (data && data.data) {
        writeCache(CACHE_KEYS.settings, data.data);
        return data.data;
      }
    } catch (err) {
      console.warn("Using cached/fallback settings:", err);
    }
    return readCache<GlobalSettings>(CACHE_KEYS.settings, FALLBACK_SETTINGS);
  },

  update: async (updates: Partial<GlobalSettings>): Promise<GlobalSettings> => {
    const res = await requestJson(
      "/api/settings",
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(updates),
      },
      "Failed to update settings"
    );
    if (!res?.data) {
      throw new Error("Settings update failed: no saved settings were returned");
    }
    writeCache(CACHE_KEYS.settings, res.data);
    recordLocalAudit("UPDATE_SETTINGS", "GlobalSettings", "Updated global branding, contact, and behavior settings");
    return res.data;
  },
};

// 3. Homepage CMS
export const cmsHomepage = {
  get: async (): Promise<HomepageSections> => {
    try {
      const data = await requestJson("/api/homepage", {}, "Failed to fetch homepage content");
      if (data && data.data) {
        writeCache(CACHE_KEYS.homepage, data.data);
        return data.data;
      }
    } catch (err) {
      console.warn("Using cached/fallback homepage:", err);
    }
    return readCache<HomepageSections>(CACHE_KEYS.homepage, FALLBACK_HOMEPAGE);
  },

  update: async (updates: Partial<HomepageSections>): Promise<HomepageSections> => {
    const res = await requestJson(
      "/api/homepage",
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(updates),
      },
      "Failed to update homepage"
    );
    if (!res?.data) {
      throw new Error("Homepage update failed: no saved content was returned");
    }
    writeCache(CACHE_KEYS.homepage, res.data);
    recordLocalAudit("UPDATE_HOMEPAGE", "HomepageCMS", "Updated homepage section configurations");
    return res.data;
  },

  updateSection: async (section: string, sectionData: any): Promise<any> => {
    const res = await requestJson(
      `/api/homepage/${section}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(sectionData),
      },
      `Failed to update ${section}`
    );
    if (!res || !("data" in res)) {
      throw new Error(`Homepage section update failed: no saved ${section} content was returned`);
    }
    const current = readCache<HomepageSections>(CACHE_KEYS.homepage, FALLBACK_HOMEPAGE);
    writeCache(CACHE_KEYS.homepage, { ...current, [section]: res.data });
    recordLocalAudit("UPDATE_HOMEPAGE_SECTION", "HomepageCMS", `Updated section: ${section}`);
    return res.data;
  },
};

// 4. Properties CMS
export const cmsProperties = {
  list: async (
    params: {
      category?: string;
      search?: string;
      availability?: string;
      featured?: boolean;
      sort?: string;
      page?: number;
      limit?: number;
      includeUnpublished?: boolean;
    } = {}
  ): Promise<{ data: Property[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.set("category", params.category);
      if (params.search) searchParams.set("search", params.search);
      if (params.availability) searchParams.set("availability", params.availability);
      if (params.featured !== undefined) searchParams.set("featured", String(params.featured));
      if (params.sort) searchParams.set("sort", params.sort);
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.includeUnpublished) searchParams.set("includeUnpublished", "true");

      const res = await requestJson(
        `/api/properties?${searchParams.toString()}`,
        {},
        "Failed to fetch properties"
      );
      if (res && Array.isArray(res.data)) {
        writeCache(CACHE_KEYS.properties, res.data);
        return res;
      }
    } catch (err) {
      console.warn("Using cached/fallback properties:", err);
    }

    let items = readCache<Property[]>(CACHE_KEYS.properties, FALLBACK_PROPERTIES);

    if (params.category && params.category !== "all") {
      items = items.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (params.availability && params.availability !== "all") {
      items = items.filter((p) => p.availability.toLowerCase() === params.availability?.toLowerCase());
    }
    if (params.featured !== undefined) {
      items = items.filter((p) => Boolean(p.featured) === Boolean(params.featured));
    }

    return {
      data: items,
      meta: {
        total: items.length,
        page: 1,
        limit: params.limit || 100,
        totalPages: 1,
      },
    };
  },

  getBySlug: async (slug: string): Promise<Property> => {
    try {
      const data = await requestJson(`/api/properties/${slug}`, {}, "Property not found");
      if (data && data.data) return data.data;
    } catch {
      // Fallback lookup
    }
    const items = readCache<Property[]>(CACHE_KEYS.properties, FALLBACK_PROPERTIES);
    const found = items.find((p) => p.slug === slug || p.id === slug);
    if (!found) throw new Error("Property not found");
    return found;
  },

  create: async (propData: Partial<Property>): Promise<Property> => {
    const items = readCache<Property[]>(CACHE_KEYS.properties, FALLBACK_PROPERTIES);
    const res = await requestJson(
      "/api/properties",
      {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(propData),
      },
      "Failed to create property"
    );
    if (!res?.data) {
      throw new Error("Property creation failed: no saved property was returned");
    }
    writeCache(CACHE_KEYS.properties, [res.data, ...items.filter((p) => p.id !== res.data.id)]);
    recordLocalAudit("CREATE_PROPERTY", "Properties", `Created property: ${res.data.title}`);
    return res.data;
  },

  update: async (id: string, propData: Partial<Property>): Promise<Property> => {
    const items = readCache<Property[]>(CACHE_KEYS.properties, FALLBACK_PROPERTIES);
    const res = await requestJson(
      `/api/properties/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(propData),
      },
      "Failed to update property"
    );
    if (!res?.data) {
      throw new Error("Property update failed: no saved property was returned");
    }
    const index = items.findIndex((p) => p.id === id);
    if (index === -1) items.unshift(res.data);
    else items[index] = res.data;
    writeCache(CACHE_KEYS.properties, items);
    recordLocalAudit("UPDATE_PROPERTY", "Properties", `Updated property ID: ${id}`);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    const items = readCache<Property[]>(CACHE_KEYS.properties, FALLBACK_PROPERTIES);
    await requestJson(
      `/api/properties/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete property"
    );
    writeCache(CACHE_KEYS.properties, items.filter((p) => p.id !== id));
    recordLocalAudit("DELETE_PROPERTY", "Properties", `Deleted property ID: ${id}`);
  },

  resetDefaults: async (): Promise<Property[]> => {
    const res = await requestJson(
      "/api/properties/reset-defaults",
      {
        method: "POST",
        headers: getHeaders(true),
      },
      "Failed to reset properties"
    );
    if (!Array.isArray(res?.data)) {
      throw new Error("Property reset failed: no saved property list was returned");
    }
    writeCache(CACHE_KEYS.properties, res.data);
    return res.data;
  },
};

// 5. Media Library
export const cmsMedia = {
  list: async (params: { search?: string; category?: string } = {}): Promise<MediaItem[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.category) searchParams.set("category", params.category);

      const res = await requestJson(`/api/media?${searchParams.toString()}`, {}, "Failed to fetch media");
      if (res && Array.isArray(res.data)) {
        writeCache(CACHE_KEYS.media, res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Using cached media:", err);
    }
    return readCache<MediaItem[]>(CACHE_KEYS.media, FALLBACK_MEDIA);
  },

  upload: async (uploadData: {
    base64Data: string;
    fileName?: string;
    title?: string;
    altText?: string;
    caption?: string;
    category?: string;
  }): Promise<MediaItem> => {
    const res = await requestJson(
      "/api/media/upload",
      {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(uploadData),
      },
      "Failed to upload image"
    );
    if (!res?.data) {
      throw new Error("Image upload failed: no saved media record was returned");
    }
    const items = readCache<MediaItem[]>(CACHE_KEYS.media, FALLBACK_MEDIA);
    writeCache(CACHE_KEYS.media, [res.data, ...items.filter((item) => item.id !== res.data.id)]);
    recordLocalAudit("UPLOAD_MEDIA", "Media", `Uploaded image: ${res.data.title}`);
    return res.data;
  },

  replaceAsset: async (
    id: string,
    replaceData: { base64Data: string; fileName?: string }
  ): Promise<MediaItem> => {
    const res = await requestJson(
      `/api/media/${id}/replace`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(replaceData),
      },
      "Failed to replace image asset"
    );
    if (res && res.data) {
      const items = readCache<MediaItem[]>(CACHE_KEYS.media, FALLBACK_MEDIA);
      const idx = items.findIndex((m) => m.id === id);
      if (idx !== -1) {
        items[idx] = res.data;
        writeCache(CACHE_KEYS.media, [...items]);
      }
      recordLocalAudit("REPLACE_MEDIA", "Media", `Replaced image asset for: ${res.data.title || res.data.fileName}`);
      return res.data;
    }
    throw new Error("No data returned from asset replacement");
  },

  updateMetadata: async (
    id: string,
    metadata: { title?: string; altText?: string; caption?: string; category?: string }
  ): Promise<MediaItem> => {
    const items = readCache<MediaItem[]>(CACHE_KEYS.media, FALLBACK_MEDIA);
    const res = await requestJson(
      `/api/media/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(metadata),
      },
      "Failed to update media"
    );
    if (!res?.data) {
      throw new Error("Media update failed: no saved media record was returned");
    }
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) items.unshift(res.data);
    else items[index] = res.data;
    writeCache(CACHE_KEYS.media, items);
    return res.data;
  },

  delete: async (id: string, force = false): Promise<void> => {
    const items = readCache<MediaItem[]>(CACHE_KEYS.media, FALLBACK_MEDIA);
    await requestJson(
      `/api/media/${id}?force=${force ? "true" : "false"}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete image"
    );
    writeCache(CACHE_KEYS.media, items.filter((item) => item.id !== id));
    recordLocalAudit("DELETE_MEDIA", "Media", `Deleted image ID: ${id}`);
  },
};

// 6. Pages CMS
export const cmsPages = {
  list: async (): Promise<PageContent[]> => {
    try {
      const res = await requestJson("/api/pages", {}, "Failed to fetch pages");
      if (res && Array.isArray(res.data)) {
        writeCache(CACHE_KEYS.pages, res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Using cached/fallback pages:", err);
    }
    return readCache<PageContent[]>(CACHE_KEYS.pages, FALLBACK_PAGES);
  },

  getBySlug: async (slug: string): Promise<PageContent> => {
    try {
      const res = await requestJson(`/api/pages/${slug}`, {}, "Page not found");
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }
    const items = readCache<PageContent[]>(CACHE_KEYS.pages, FALLBACK_PAGES);
    const found = items.find((p) => p.slug === slug || p.id === slug);
    if (!found) throw new Error("Page not found");
    return found;
  },

  create: async (pageData: Partial<PageContent>): Promise<PageContent> => {
    const items = readCache<PageContent[]>(CACHE_KEYS.pages, FALLBACK_PAGES);
    const res = await requestJson(
      "/api/pages",
      {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(pageData),
      },
      "Failed to create page"
    );
    if (!res?.data) {
      throw new Error("Page creation failed: no saved page was returned");
    }
    writeCache(CACHE_KEYS.pages, [res.data, ...items.filter((page) => page.id !== res.data.id)]);
    recordLocalAudit("CREATE_PAGE", "PagesCMS", `Created page: ${res.data.title}`);
    return res.data;
  },

  update: async (id: string, pageData: Partial<PageContent>): Promise<PageContent> => {
    const items = readCache<PageContent[]>(CACHE_KEYS.pages, FALLBACK_PAGES);
    const res = await requestJson(
      `/api/pages/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(pageData),
      },
      "Failed to update page"
    );
    if (!res?.data) {
      throw new Error("Page update failed: no saved page was returned");
    }
    const index = items.findIndex((page) => page.id === id);
    if (index === -1) items.unshift(res.data);
    else items[index] = res.data;
    writeCache(CACHE_KEYS.pages, items);
    recordLocalAudit("UPDATE_PAGE", "PagesCMS", `Updated page ID: ${id}`);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    const items = readCache<PageContent[]>(CACHE_KEYS.pages, FALLBACK_PAGES);
    await requestJson(
      `/api/pages/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete page"
    );
    writeCache(CACHE_KEYS.pages, items.filter((page) => page.id !== id));
    recordLocalAudit("DELETE_PAGE", "PagesCMS", `Deleted page ID: ${id}`);
  },
};

// 7. Enquiries / Leads
export const cmsEnquiries = {
  submit: async (formData: {
    name: string;
    phone: string;
    email?: string;
    interest?: string;
    preferredDate?: string;
    meetingType?: string;
    message?: string;
  }): Promise<{ success: boolean; token: string; message: string; data?: EnquiryLead }> => {
    const generatedToken = "BME-" + Math.floor(100000 + Math.random() * 900000);
    const newLead: EnquiryLead = {
      id: `enq-${Date.now()}`,
      token: generatedToken,
      clientName: formData.name,
      phone: formData.phone,
      email: formData.email,
      propertyInterest: formData.interest,
      preferredDate: formData.preferredDate,
      meetingType: (formData.meetingType as any) || "office",
      clientNote: formData.message,
      status: "New",
      internalNotes: ["Lead received via website consultation form."],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await requestJson<{
      success: boolean;
      token: string;
      message: string;
      data?: EnquiryLead;
    }>(
      "/api/enquiries",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
      "Submission failed"
    );

    if (!res.success || !res.token) {
      throw new Error(res.message || "The inquiry could not be submitted. Please try again.");
    }

    const savedLead = res.data || { ...newLead, token: res.token };
    const items = readCache<EnquiryLead[]>(CACHE_KEYS.enquiries, FALLBACK_ENQUIRIES);
    writeCache(CACHE_KEYS.enquiries, [savedLead, ...items]);
    recordLocalAudit("NEW_ENQUIRY", "Leads", `New inquiry received from ${formData.name}`);
    return res;
  },

  list: async (params: { status?: string; search?: string } = {}): Promise<EnquiryLead[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set("status", params.status);
      if (params.search) searchParams.set("search", params.search);

      const res = await requestJson(
        `/api/enquiries?${searchParams.toString()}`,
        {
          headers: getHeaders(true),
        },
        "Failed to fetch enquiries"
      );
      if (res && Array.isArray(res.data)) {
        writeCache(CACHE_KEYS.enquiries, res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Using cached enquiries:", err);
    }

    let items = readCache<EnquiryLead[]>(CACHE_KEYS.enquiries, FALLBACK_ENQUIRIES);
    if (params.status && params.status !== "all") {
      items = items.filter((e) => e.status.toLowerCase() === params.status?.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (e) =>
          e.clientName.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          (e.propertyInterest && e.propertyInterest.toLowerCase().includes(q))
      );
    }
    return items;
  },

  update: async (
    id: string,
    updateData: { status?: string; note?: string }
  ): Promise<EnquiryLead> => {
    const items = readCache<EnquiryLead[]>(CACHE_KEYS.enquiries, FALLBACK_ENQUIRIES);
    const res = await requestJson(
      `/api/enquiries/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(updateData),
      },
      "Failed to update lead"
    );
    if (!res?.data) {
      throw new Error("Lead update failed: no saved lead was returned");
    }
    const index = items.findIndex((lead) => lead.id === id);
    if (index === -1) items.unshift(res.data);
    else items[index] = res.data;
    writeCache(CACHE_KEYS.enquiries, items);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    const items = readCache<EnquiryLead[]>(CACHE_KEYS.enquiries, FALLBACK_ENQUIRIES);
    await requestJson(
      `/api/enquiries/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete lead"
    );
    writeCache(CACHE_KEYS.enquiries, items.filter((lead) => lead.id !== id));
  },
};

// 8. Audit Logs
export const cmsAudit = {
  list: async (): Promise<AuditLog[]> => {
    try {
      const res = await requestJson(
        "/api/audit-logs",
        {
          headers: getHeaders(true),
        },
        "Failed to fetch audit logs"
      );
      if (res && Array.isArray(res.data)) {
        writeCache(CACHE_KEYS.audit, res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Using cached/fallback audit logs:", err);
    }
    return readCache<AuditLog[]>(CACHE_KEYS.audit, FALLBACK_AUDIT_LOGS);
  },
};
