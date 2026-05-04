import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "@/hooks/use-seo";

export function JsonLd({ id, schema }: { id: string; schema: object }) {
  useEffect(() => {
    const existing = document.getElementById(`jsonld-${id}`);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id        = `jsonld-${id}`;
    script.type      = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => { document.getElementById(`jsonld-${id}`)?.remove(); };
  });
  return null;
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      id="organization"
      schema={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        description: "Nepal's #1 digital gaming marketplace for game top-ups, gift cards, subscriptions and vouchers.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+977-9826749317",
          contactType: "customer service",
          areaServed: "NP",
          availableLanguage: ["English", "Nepali"],
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "NP",
        },
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      id="website"
      schema={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function FAQJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      id="faqpage"
      schema={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ crumbs }: { crumbs: { name: string; url: string }[] }) {
  return (
    <JsonLd
      id="breadcrumb"
      schema={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.url.startsWith("http") ? c.url : `${SITE_URL}${c.url}`,
        })),
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: any }) {
  const variants: any[] = Array.isArray(product.variants) ? product.variants : [];
  const prices   = variants.map((v: any) => Number(v.price)).filter((p: number) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : Number(product.price);
  const maxPrice = prices.length ? Math.max(...prices) : Number(product.price);

  return (
    <JsonLd
      id="product"
      schema={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.imageUrl ?? `${SITE_URL}/opengraph.jpg`,
        url: `${SITE_URL}/products/${product.id}`,
        brand: { "@type": "Brand", name: SITE_NAME },
        offers: prices.length > 1
          ? {
              "@type": "AggregateOffer",
              priceCurrency: "NPR",
              lowPrice: minPrice,
              highPrice: maxPrice,
              offerCount: prices.length,
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: SITE_NAME },
            }
          : {
              "@type": "Offer",
              priceCurrency: "NPR",
              price: minPrice,
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: SITE_NAME },
            },
      }}
    />
  );
}
