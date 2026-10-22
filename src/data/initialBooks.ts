import { EBook, SiteSettings } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  storeName: "BookVerse 3D",
  tagline: "Exclusive Digital Masterpieces & Knowledge Vaults",
  heroTitle: "Supercharge Your Mind With Premium eBooks",
  heroSubtitle: "Handcrafted actionable guides, masterclasses, and roadmaps with instant digital download and interactive previews.",
  announcement: "⚡ Welcome! Explore our premium eBooks with instant download and sample Google Drive preview.",
  showAnnouncement: true,
  supportEmail: "support@bookverse.com",
  upiId: "ebooksales@upi",
  currencySymbol: "₹",
  customPaymentInstructions: "After making payment, your eBook PDF download link will unlock instantly on screen and will also be sent to your email with receipt."
};

// All demo products cleared for clean real user eBook inventory
export const INITIAL_BOOKS: EBook[] = [];

export const INITIAL_REVIEWS = [];
