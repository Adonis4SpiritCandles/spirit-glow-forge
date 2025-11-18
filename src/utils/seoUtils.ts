/**
 * SEO Utility Functions for SPIRIT CANDLES
 */

/**
 * Generate a URL-friendly slug from text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Clean URL from tracking parameters
 */
export const cleanUrl = (url: string): string => {
  const urlObj = new URL(url);
  const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  
  trackingParams.forEach(param => {
    urlObj.searchParams.delete(param);
  });
  
  return urlObj.toString();
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (items: { name: string; url: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Generate product structured data
 */
export const generateProductStructuredData = (product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
}) => {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'SPIRIT CANDLES'
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: product.url
    }
  };

  if (product.sku) {
    data.sku = product.sku;
  }

  if (product.rating && product.reviewCount) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount
    };
  }

  return data;
};

/**
 * Generate WebSite structured data with search action
 */
export const generateWebSiteStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SPIRIT CANDLES',
    url: 'https://spirit-candle.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://spirit-candle.com/shop?search={search_term}'
      },
      'query-input': 'required name=search_term'
    }
  };
};

/**
 * Get full URL for the current page
 */
export const getFullUrl = (path: string, language: 'en' | 'pl'): string => {
  const baseUrl = 'https://spirit-candle.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/${language}${cleanPath}`;
};

/**
 * Generate alternate URLs for hreflang
 */
export const generateAlternateUrls = (path: string): { en: string; pl: string } => {
  const baseUrl = 'https://spirit-candle.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return {
    en: `${baseUrl}/en${cleanPath}`,
    pl: `${baseUrl}/pl${cleanPath}`
  };
};

/**
 * Truncate text for meta descriptions (max 160 chars)
 */
export const truncateDescription = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

/**
 * Extract product availability from stock quantity
 */
export const getProductAvailability = (stockQuantity: number): 'InStock' | 'OutOfStock' => {
  return stockQuantity > 0 ? 'InStock' : 'OutOfStock';
};

/**
 * Generate structured data for a collection page.
 * Enhanced version with better schema.org compliance
 */
export const generateCollectionStructuredData = (collection: {
  name: string;
  description: string;
  url: string;
  image?: string;
  numberOfItems?: number;
}) => {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: truncateDescription(collection.description, 200),
    url: collection.url,
  };

  if (collection.image) {
    data.image = {
      '@type': 'ImageObject',
      url: collection.image,
      width: 1200,
      height: 630
    };
  }

  if (collection.numberOfItems !== undefined) {
    data.numberOfItems = collection.numberOfItems;
  }

  return data;
};

/**
 * Generate structured data for an FAQ page.
 * Enhanced with better structure
 */
export const generateFAQPageStructuredData = (faqs: { question: string; answer: string }[]) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate structured data for the About page.
 * Enhanced with better Organization reference
 */
export const generateAboutPageStructuredData = (aboutInfo?: {
  description?: string;
  image?: string;
}) => {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About SPIRIT CANDLES',
    description: aboutInfo?.description || 
      'Learn about SPIRIT CANDLES – our story, values, and commitment to creating luxury soy candles.',
    mainEntity: {
      '@type': 'Organization',
      name: 'SPIRIT CANDLES',
      url: 'https://spirit-candle.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://spirit-candle.com/spiritcandles/spirit-logo.png',
        width: 512,
        height: 512
      },
      sameAs: [
        'https://www.instagram.com/spiritcandles',
        'https://www.tiktok.com/@spiritcandles'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'm5moffice@proton.me',
        contactType: 'customer service',
        availableLanguage: ['English', 'Polish']
      }
    }
  };

  if (aboutInfo?.image) {
    data.image = {
      '@type': 'ImageObject',
      url: aboutInfo.image,
      width: 1200,
      height: 630
    };
  }

  return data;
};

/**
 * Generate structured data for the Contact page.
 * Enhanced with better contact information
 */
export const generateContactPageStructuredData = (contactInfo?: {
  email?: string;
  phone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}) => {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact SPIRIT CANDLES',
    description: 'Get in touch with SPIRIT CANDLES. We are here to help with your questions about our luxury soy candles.',
    mainEntity: {
      '@type': 'Organization',
      name: 'SPIRIT CANDLES',
      url: 'https://spirit-candle.com',
      contactPoint: {
        '@type': 'ContactPoint',
        email: contactInfo?.email || 'm5moffice@proton.me',
        telephone: contactInfo?.phone || '+48 729877557',
        contactType: 'customer service',
        availableLanguage: ['English', 'Polish'],
        areaServed: ['PL', 'EU', 'US']
      }
    }
  };

  if (contactInfo?.address) {
    data.mainEntity.address = {
      '@type': 'PostalAddress',
      streetAddress: contactInfo.address.streetAddress,
      addressLocality: contactInfo.address.addressLocality,
      postalCode: contactInfo.address.postalCode,
      addressCountry: contactInfo.address.addressCountry || 'PL'
    };
  }

  return data;
};

/**
 * Generate Article structured data (for blog posts, if needed)
 */
export const generateArticleStructuredData = (article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: truncateDescription(article.description, 200),
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: article.author || 'SPIRIT CANDLES'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SPIRIT CANDLES',
      logo: {
        '@type': 'ImageObject',
        url: 'https://spirit-candle.com/spiritcandles/spirit-logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url
    }
  };
};

/**
 * Generate Video structured data (for TikTok/YouTube embeds)
 */
export const generateVideoStructuredData = (video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: truncateDescription(video.description, 200),
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl
  };
};

/**
 * Generate WebPage structured data (for generic pages)
 */
export const generateWebPageStructuredData = (page: {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) => {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: truncateDescription(page.description, 200),
    url: page.url,
  };

  if (page.image) {
    data.image = {
      '@type': 'ImageObject',
      url: page.image,
      width: 1200,
      height: 630
    };
  }

  if (page.datePublished) {
    data.datePublished = page.datePublished;
  }

  if (page.dateModified) {
    data.dateModified = page.dateModified;
  }

  return data;
};