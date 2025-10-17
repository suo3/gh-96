// SEO Configuration for KenteKart Ghana
export const SEO_CONFIG = {
  siteName: "KenteKart Ghana",
  siteDescription: "Ghana's premier marketplace for swapping and trading items. Connect with locals to exchange goods safely and sustainably.",
  siteUrl: "https://kentekart.com", // Update with actual domain
  
  // Social media metadata
  social: {
    twitter: "@kentekart",
    facebook: "kentekart",
    instagram: "@kentekart"
  },
  
  // Local business metadata
  business: {
    name: "KenteKart Ghana",
    description: "Sustainable marketplace for Ghana",
    address: "Accra, Ghana",
    phone: "+233 XXX XXX XXX", // Update with actual number
    email: "contact@kentekart.com"
  },
  
  // SEO keywords for Ghana market
  keywords: [
    "Ghana marketplace",
    "swap items Ghana",
    "trade goods Accra",
    "second hand items Ghana",
    "sustainable shopping Ghana",
    "mobile money payments",
    "MTN mobile money",
    "Vodafone Cash",
    "Ghana trading platform"
  ]
};

export const generatePageTitle = (pageTitle?: string) => {
  if (!pageTitle) return SEO_CONFIG.siteName;
  return `${pageTitle} | ${SEO_CONFIG.siteName}`;
};

export const generateMetaDescription = (customDescription?: string) => {
  return customDescription || SEO_CONFIG.siteDescription;
};