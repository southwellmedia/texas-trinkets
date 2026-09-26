import { SITE_URL, GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION } from 'astro:env/server';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialLinks: string[];
  twitter?: {
    site: string;
    creator: string;
  };
  verification?: {
    google?: string;
    bing?: string;
  };
  /**
   * Branding configuration
   * Logo files: Replace SVGs in src/assets/branding/
   * Favicon: Replace in public/favicon.svg
   */
  branding: {
    /** Logo alt text for accessibility */
    logo: {
      alt: string;
    };
    /** Favicon path (lives in public/) */
    favicon: {
      svg: string;
    };
    /** Theme colors for manifest and browser UI */
    colors: {
      /** Browser toolbar color (hex) */
      themeColor: string;
      /** PWA splash screen background (hex) */
      backgroundColor: string;
    };
  };
}

const siteConfig: SiteConfig = {
  name: 'Texas Trinkets & Treasures',
  description:
    'Handmade western jewelry with turquoise, silver and a whole lot of heart. Made in Texas, one piece at a time. Custom orders welcome.',
  url: SITE_URL || 'https://example.com',
  ogImage: '/og-default.png',
  author: 'Salem Shields',
  // TODO: replace with the real inbox that should receive order requests
  email: 'hello@example.com',
  // TODO: add real social profile URLs (used for Organization JSON-LD + footer)
  socialLinks: [],
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    bing: BING_SITE_VERIFICATION,
  },
  branding: {
    logo: {
      alt: 'Texas Trinkets & Treasures',
    },
    favicon: {
      svg: '/favicon.svg',
    },
    colors: {
      themeColor: '#3a2518',
      backgroundColor: '#f6efe3',
    },
  },
};

export default siteConfig;
