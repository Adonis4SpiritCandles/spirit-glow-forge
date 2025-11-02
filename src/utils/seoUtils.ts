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