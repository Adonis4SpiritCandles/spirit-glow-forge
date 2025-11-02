import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  titleTemplate?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  structuredData?: object | object[];
  locale?: 'en' | 'pl';
  alternateUrls?: {
    en?: string;
    pl?: string;
  };
}

const SEOManager = ({
  title,
  titleTemplate = '%s | SPIRIT CANDLES',
  description,
  keywords,
  image = 'https://spirit-candle.com/spirit-logo.png',
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
  canonical,
  structuredData,
  locale,
  alternateUrls,
}: SEOProps) => {
  const { language } = useLanguage();
  const currentLocale = locale || language;
  const ogLocale = currentLocale === 'en' ? 'en_US' : 'pl_PL';
  const alternateLocale = currentLocale === 'en' ? 'pl_PL' : 'en_US';

  // Default values based on language
  const defaultTitle = currentLocale === 'en' 
    ? 'SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles'
    : 'SPIRIT CANDLES — Odrodź Swoją Naturę | Luksusowe Świece Sojowe';
  
  const defaultDescription = currentLocale === 'en'
    ? 'Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances. Handcrafted with natural soy wax and wooden wicks for an elevated sensory experience. Reborn your nature.'
    : 'Odkryj luksusowe świece sojowe SPIRIT CANDLES inspirowane kultowymi zapachami. Ręcznie robione z naturalnego wosku sojowego i drewnianymi knotami dla wyjątkowych doznań zmysłowych. Odrodź swoją naturę.';

  const defaultKeywords = currentLocale === 'en'
    ? 'luxury candles, soy candles, wooden wick, natural candles, home fragrance, aromatherapy, handcrafted candles, premium candles'
    : 'luksusowe świece, świece sojowe, drewniany knot, naturalne świece, domowe zapachy, aromaterapia, ręcznie robione świece, świece premium';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalUrl = url || `https://spirit-candle.com/${currentLocale}`;
  const finalCanonical = canonical || finalUrl;

  // Clean URL from tracking parameters
  const cleanCanonical = finalCanonical.split('?')[0];

  // Robots meta tag
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  // Organization structured data (always included)
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SPIRIT CANDLES',
    url: 'https://spirit-candle.com',
    logo: 'https://spirit-candle.com/spirit-logo.png',
    sameAs: [
      'https://www.instagram.com/spiritcandles',
      'https://www.tiktok.com/@spiritcandles'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'kontakt@spirit-candle.com',
      contactType: 'Customer Service',
      availableLanguage: ['Polish', 'English']
    }
  };

  // Combine structured data
  const allStructuredData = structuredData 
    ? Array.isArray(structuredData) 
      ? [organizationData, ...structuredData]
      : [organizationData, structuredData]
    : [organizationData];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={currentLocale} />
      <title>{titleTemplate ? titleTemplate.replace('%s', finalTitle) : finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={cleanCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="SPIRIT CANDLES" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={alternateLocale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />

      {/* hreflang tags for bilingual support */}
      {alternateUrls?.en && (
        <link rel="alternate" hrefLang="en" href={alternateUrls.en} />
      )}
      {alternateUrls?.pl && (
        <link rel="alternate" hrefLang="pl" href={alternateUrls.pl} />
      )}
      {alternateUrls?.en && (
        <link rel="alternate" hrefLang="x-default" href={alternateUrls.en} />
      )}

      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={`structured-data-${index}`} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOManager;