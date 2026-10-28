import React, { useEffect } from "react";

interface HelmetProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  keywords?: string;
}

export const Helmet: React.FC<HelmetProps> = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  keywords
}) => {
  useEffect(() => {
    // 1. Update document title
    document.title = title;

    // Helper to find or create meta tag
    const getOrCreateMeta = (attrName: string, attrValue: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Map standard descriptions
    const descMeta = getOrCreateMeta("name", "description");
    descMeta.setAttribute("content", description);

    // 3. Keywords
    if (keywords) {
      const keywordsMeta = getOrCreateMeta("name", "keywords");
      keywordsMeta.setAttribute("content", keywords);
    } else {
      const keywordsMeta = getOrCreateMeta("name", "keywords");
      keywordsMeta.setAttribute("content", "Bismillah Real Estate, Quetta, Haji Saud Zehri, A-1 City, Plots, Flats, Apartments, Balochistan Real Estate, Property Quetta");
    }

    // 4. Open Graph Tags
    const ogTitleMeta = getOrCreateMeta("property", "og:title");
    ogTitleMeta.setAttribute("content", ogTitle || title);

    const ogDescMeta = getOrCreateMeta("property", "og:description");
    ogDescMeta.setAttribute("content", ogDescription || description);

    const ogImageMeta = getOrCreateMeta("property", "og:image");
    ogImageMeta.setAttribute("content", ogImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80");

    const ogUrlMeta = getOrCreateMeta("property", "og:url");
    ogUrlMeta.setAttribute("content", ogUrl || window.location.href);

    const ogTypeMeta = getOrCreateMeta("property", "og:type");
    ogTypeMeta.setAttribute("content", "website");

    const ogSiteNameMeta = getOrCreateMeta("property", "og:site_name");
    ogSiteNameMeta.setAttribute("content", "Bismillah Real Estate Quetta");

    // 5. Twitter Cards
    const twCardMeta = getOrCreateMeta("name", "twitter:card");
    twCardMeta.setAttribute("content", "summary_large_image");

    const twTitleMeta = getOrCreateMeta("name", "twitter:title");
    twTitleMeta.setAttribute("content", ogTitle || title);

    const twDescMeta = getOrCreateMeta("name", "twitter:description");
    twDescMeta.setAttribute("content", ogDescription || description);

    const twImageMeta = getOrCreateMeta("name", "twitter:image");
    twImageMeta.setAttribute("content", ogImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80");

  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl, keywords]);

  return null;
};
