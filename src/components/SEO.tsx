import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_TITLE = "J's Jewels | Exquisite Jewelry & Accessories";
const DEFAULT_DESC = "Discover handcrafted luxury jewelry and accessories at J's Jewels. Free shipping on orders over ₦50,000.";
const DEFAULT_IMG = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200";

export function SEO({ title, description, image, url, type = 'website', jsonLd }: SEOProps) {
  const fullTitle = title ? `${title} | J's Jewels` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMG;
  const canonical = url || (typeof window !== 'undefined' ? window.location.href : '');
  const lds = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {lds.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
}
