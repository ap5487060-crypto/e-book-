export interface EBook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  price: number;
  originalPrice: number;
  currency: string;
  discount?: number;
  coverImage: string;
  paymentLink: string;
  samplePdfUrl: string; // Google Drive link or PDF preview
  description: string;
  category: string;
  pages: number;
  language: string;
  format: string; // "PDF", "EPUB", "PDF + Audiobook"
  features: string[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  badgeText?: string;
  authorBio?: string;
  tableOfContents?: string[];
  viewsCount?: number;
  salesCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  showAnnouncement: boolean;
  whatsappNumber?: string;
  supportEmail: string;
  upiId?: string;
  currencySymbol: string;
  customPaymentInstructions: string;
}

export interface InquiryClick {
  id: string;
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  platformClicked: string; // "Payment Link", "WhatsApp Buy", "Sample Preview"
  userNote?: string;
  timestamp: number;
  status: 'interested' | 'purchased' | 'contacted';
  clientIp?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'sale' | 'click' | 'review' | 'system';
  timestamp: number;
  read: boolean;
  bookTitle?: string;
}

export interface BookReview {
  id: string;
  bookId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}
