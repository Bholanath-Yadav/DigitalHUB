import { useEffect } from "react";

export const SITE_NAME = "Digital HUB";
export const SITE_URL  = typeof window !== "undefined" ? window.location.origin : "https://shop-hub--by095421.replit.app";

const DEFAULT_DESCRIPTION =
  "Nepal's #1 digital gaming marketplace. Buy Free Fire Diamonds, PUBG UC, TikTok Coins, Netflix, Spotify & Google Play gift cards. Instant delivery. Pay with eSewa, Khalti or IME Pay.";
const DEFAULT_IMAGE    = "/opengraph.jpg";
const DEFAULT_KEYWORDS =
  "free fire diamonds nepal, pubg uc nepal, tiktok coins nepal, netflix nepal, spotify nepal, google play gift card nepal, gaming store nepal, digital hub, esewa khalti";

export interface SEOProps {
  title?:       string;
  fullTitle?:   string;
  description?: string;
  keywords?:    string;
  image?:       string;
  type?:        "website" | "product";
  noindex?:     boolean;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useSEO({
  title,
  fullTitle,
  description = DEFAULT_DESCRIPTION,
  keywords    = DEFAULT_KEYWORDS,
  image       = DEFAULT_IMAGE,
  type        = "website",
  noindex     = false,
}: SEOProps = {}) {
  useEffect(() => {
    const docTitle  = fullTitle ?? (title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Nepal's #1 Gaming Store`);
    const imageUrl  = image.startsWith("http") ? image : `${window.location.origin}${image}`;
    const canonical = window.location.origin + window.location.pathname;

    document.title = docTitle;

    setMeta("name", "description",         description);
    setMeta("name", "keywords",            keywords);
    setMeta("name", "robots",              noindex ? "noindex, nofollow" : "index, follow");
    setMeta("name", "author",              SITE_NAME);

    setMeta("property", "og:site_name",    SITE_NAME);
    setMeta("property", "og:type",         type);
    setMeta("property", "og:title",        docTitle);
    setMeta("property", "og:description",  description);
    setMeta("property", "og:image",        imageUrl);
    setMeta("property", "og:image:width",  "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:url",          canonical);
    setMeta("property", "og:locale",       "en_NP");

    setMeta("name", "twitter:card",        "summary_large_image");
    setMeta("name", "twitter:title",       docTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image",       imageUrl);

    setCanonical(canonical);
  }, [title, fullTitle, description, keywords, image, type, noindex]);
}
