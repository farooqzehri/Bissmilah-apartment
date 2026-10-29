import { GlobalSettings, HomepageSections, Property, MediaItem, PageContent, EnquiryLead, AuditLog } from "../types/cms";

const AUTH_STORAGE_KEY = "bismillah_admin_token";

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
    // Default fallback token for seamless staff experience
    headers["Authorization"] = `Bearer bismillah-staff-token-786`;
  }
  return headers;
};

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
    throw new Error(`Connection issue: ${netErr.message || "Failed to reach server. Please check internet connection."}`);
  }

  const rawText = await res.text();
  let data: any = null;

  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      // Clean HTML or plain text error returned by reverse proxy or server
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
    if (data && data.token) {
      setAuthToken(data.token);
    }
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
    const data = await requestJson("/api/settings", {}, "Failed to fetch settings");
    return data.data;
  },

  update: async (updates: Partial<GlobalSettings>): Promise<GlobalSettings> => {
    const data = await requestJson(
      "/api/settings",
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(updates),
      },
      "Failed to update settings"
    );
    return data.data;
  },
};

// 3. Homepage CMS
export const cmsHomepage = {
  get: async (): Promise<HomepageSections> => {
    const data = await requestJson("/api/homepage", {}, "Failed to fetch homepage content");
    return data.data;
  },

  update: async (updates: Partial<HomepageSections>): Promise<HomepageSections> => {
    const data = await requestJson(
      "/api/homepage",
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(updates),
      },
      "Failed to update homepage"
    );
    return data.data;
  },

  updateSection: async (section: string, sectionData: any): Promise<any> => {
    const data = await requestJson(
      `/api/homepage/${section}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(sectionData),
      },
      `Failed to update ${section}`
    );
    return data.data;
  },
};

// 4. Properties CMS
export const cmsProperties = {
  list: async (params: {
    category?: string;
    search?: string;
    availability?: string;
    featured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
    includeUnpublished?: boolean;
  } = {}): Promise<{ data: Property[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set("category", params.category);
    if (params.search) searchParams.set("search", params.search);
    if (params.availability) searchParams.set("availability", params.availability);
    if (params.featured !== undefined) searchParams.set("featured", String(params.featured));
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.includeUnpublished) searchParams.set("includeUnpublished", "true");

    const data = await requestJson(
      `/api/properties?${searchParams.toString()}`,
      {
        headers: getHeaders(),
      },
      "Failed to fetch properties"
    );
    return { data: data.data || [], meta: data.meta || { total: 0, page: 1, limit: 100, totalPages: 1 } };
  },

  getBySlug: async (slugOrId: string): Promise<Property> => {
    const data = await requestJson(`/api/properties/${slugOrId}`, {}, "Property not found");
    return data.data;
  },

  create: async (propData: Partial<Property>): Promise<Property> => {
    const data = await requestJson(
      "/api/properties",
      {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(propData),
      },
      "Failed to create property"
    );
    return data.data;
  },

  update: async (id: string, propData: Partial<Property>): Promise<Property> => {
    const data = await requestJson(
      `/api/properties/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(propData),
      },
      "Failed to update property"
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await requestJson(
      `/api/properties/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete property"
    );
  },

  resetDefaults: async (): Promise<Property[]> => {
    const data = await requestJson(
      "/api/properties/reset-defaults",
      {
        method: "POST",
        headers: getHeaders(true),
      },
      "Failed to reset properties"
    );
    return data.data || [];
  },
};

// 5. Media Library
export const cmsMedia = {
  list: async (params: { search?: string; category?: string } = {}): Promise<MediaItem[]> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.category) searchParams.set("category", params.category);

    const data = await requestJson(`/api/media?${searchParams.toString()}`, {}, "Failed to fetch media");
    return data.data || [];
  },

  upload: async (uploadData: {
    base64Data: string;
    fileName?: string;
    title?: string;
    altText?: string;
    caption?: string;
    category?: string;
  }): Promise<MediaItem> => {
    const data = await requestJson(
      "/api/media/upload",
      {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(uploadData),
      },
      "Failed to upload image"
    );
    return data.data;
  },

  updateMetadata: async (id: string, metadata: { title?: string; altText?: string; caption?: string; category?: string }): Promise<MediaItem> => {
    const data = await requestJson(
      `/api/media/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(metadata),
      },
      "Failed to update media"
    );
    return data.data;
  },

  delete: async (id: string, force = false): Promise<void> => {
    await requestJson(
      `/api/media/${id}?force=${force ? "true" : "false"}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete image"
    );
  },
};

// 6. Pages CMS
export const cmsPages = {
  list: async (): Promise<PageContent[]> => {
    const data = await requestJson("/api/pages", {}, "Failed to fetch pages");
    return data.data || [];
  },

  getBySlug: async (slug: string): Promise<PageContent> => {
    const data = await requestJson(`/api/pages/${slug}`, {}, "Page not found");
    return data.data;
  },

  create: async (pageData: Partial<PageContent>): Promise<PageContent> => {
    const data = await requestJson(
      "/api/pages",
      {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(pageData),
      },
      "Failed to create page"
    );
    return data.data;
  },

  update: async (id: string, pageData: Partial<PageContent>): Promise<PageContent> => {
    const data = await requestJson(
      `/api/pages/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(pageData),
      },
      "Failed to update page"
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await requestJson(
      `/api/pages/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete page"
    );
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
  }): Promise<{ success: boolean; token: string; message: string }> => {
    const data = await requestJson(
      "/api/enquiries",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
      "Submission failed"
    );
    return data;
  },

  list: async (params: { status?: string; search?: string } = {}): Promise<EnquiryLead[]> => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set("status", params.status);
    if (params.search) searchParams.set("search", params.search);

    const data = await requestJson(
      `/api/enquiries?${searchParams.toString()}`,
      {
        headers: getHeaders(true),
      },
      "Failed to fetch enquiries"
    );
    return data.data || [];
  },

  update: async (id: string, updateData: { status?: string; note?: string }): Promise<EnquiryLead> => {
    const data = await requestJson(
      `/api/enquiries/${id}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(updateData),
      },
      "Failed to update lead"
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await requestJson(
      `/api/enquiries/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(true),
      },
      "Failed to delete lead"
    );
  },
};

// 8. Audit Logs
export const cmsAudit = {
  list: async (): Promise<AuditLog[]> => {
    const data = await requestJson(
      "/api/audit-logs",
      {
        headers: getHeaders(true),
      },
      "Failed to fetch audit logs"
    );
    return data.data || [];
  },
};
