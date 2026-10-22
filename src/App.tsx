/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EBook, SiteSettings, InquiryClick, AppNotification } from './types';
import { 
  subscribeToBooks, 
  subscribeToNotifications, 
  getLocalBooks,
  getLocalSettings, 
  getLocalInquiries, 
  recordClickEvent 
} from './services/dataService';
import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { SamplePdfModal } from './components/SamplePdfModal';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import confetti from 'canvas-confetti';
import { 
  BookOpen, 
  Sparkles, 
  SlidersHorizontal, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Database
} from 'lucide-react';

export default function App() {
  // Books & Data State
  const [books, setBooks] = useState<EBook[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(getLocalSettings());
  const [inquiries, setInquiries] = useState<InquiryClick[]>(getLocalInquiries());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dataSource, setDataSource] = useState<'firebase' | 'local'>('local');

  // UI & Modals State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<EBook | null>(null);
  const [selectedBookForSample, setSelectedBookForSample] = useState<EBook | null>(null);
  const [selectedBookForPayment, setSelectedBookForPayment] = useState<EBook | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Subscribe to real-time books from Firebase Firestore (with local fallback)
  useEffect(() => {
    // Clear legacy v1 demo cache if present
    localStorage.removeItem('bookverse_ebooks_v1');

    const unsubscribeBooks = subscribeToBooks((updatedBooks, source) => {
      setBooks(updatedBooks);
      setDataSource(source);
    });

    const unsubscribeNotifs = subscribeToNotifications((updatedNotifs) => {
      setNotifications(updatedNotifs);
    });

    return () => {
      if (unsubscribeBooks) unsubscribeBooks();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, []);

  // Refresh inquiries on intervals or updates
  const refreshInquiries = () => {
    setInquiries(getLocalInquiries());
  };

  // Categories list derived from active books
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    books.forEach(b => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [books]);

  // Filter & Sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
        const matchesQuery = !searchQuery.trim() || 
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default: featured first, then bestsellers
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [books, selectedCategory, searchQuery, sortBy]);

  // Handle Buy Now Click - directly opens your configured payment page!
  const handleBuyClick = (book: EBook) => {
    // Record click event for real-time analytics
    recordClickEvent({
      bookId: book.id,
      bookTitle: book.title,
      bookPrice: book.price,
      platformClicked: 'Buy Now Gateway',
      status: 'interested'
    });
    refreshInquiries();

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Directly open your payment page if link exists
    if (book.paymentLink && book.paymentLink.trim()) {
      window.open(book.paymentLink, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedBookForPayment(book);
    }
  };

  // Handle Sample PDF Click
  const handleSampleClick = (book: EBook) => {
    // Record click event
    recordClickEvent({
      bookId: book.id,
      bookTitle: book.title,
      bookPrice: book.price,
      platformClicked: 'Google Drive Sample Preview',
      status: 'interested'
    });
    refreshInquiries();

    setSelectedBookForSample(book);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        notifications={notifications}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Catalog / Books Showcase */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* Section Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXPLORE COMPLETE COLLECTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              {selectedCategory === 'All' ? 'All Masterclass eBooks' : `${selectedCategory} Guides`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse with interactive 3D covers, read sample Google Drive previews, and get instant access.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              <option value="featured">Featured & Recommended</option>
              <option value="rating">Highest Rated (★ 4.9+)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Books Grid with 3D Perspective Cards */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No eBooks Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              No books matched "{searchQuery}". Try searching for another topic or clear filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBuyClick={handleBuyClick}
                onSampleClick={handleSampleClick}
                onDetailClick={(b) => setSelectedBookForDetail(b)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* MODALS */}
      {/* 1. Book Details Modal */}
      <BookDetailModal
        book={selectedBookForDetail}
        isOpen={!!selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        onBuyClick={handleBuyClick}
        onSampleClick={handleSampleClick}
      />

      {/* 2. Sample Google Drive PDF Reader Modal */}
      <SamplePdfModal
        book={selectedBookForSample}
        isOpen={!!selectedBookForSample}
        onClose={() => setSelectedBookForSample(null)}
        onBuyClick={handleBuyClick}
      />

      {/* 3. Payment Gateway Checkout Modal */}
      <PaymentCheckoutModal
        book={selectedBookForPayment}
        isOpen={!!selectedBookForPayment}
        settings={settings}
        onClose={() => setSelectedBookForPayment(null)}
      />

      {/* 4. Complete Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        books={books}
        settings={settings}
        inquiries={inquiries}
        notifications={notifications}
        dataSource={dataSource}
        onBooksUpdated={() => {
          const updated = getLocalBooks();
          setBooks(updated);
        }}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
      />

    </div>
  );
}
