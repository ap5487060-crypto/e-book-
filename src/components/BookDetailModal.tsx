import React, { useState } from 'react';
import { EBook } from '../types';
import { Book3D } from './Book3D';
import { 
  X, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  Star, 
  Share2, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Globe, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookDetailModalProps {
  book: EBook | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyClick: (book: EBook) => void;
  onSampleClick: (book: EBook) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onBuyClick,
  onSampleClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'reviews'>('overview');

  if (!isOpen || !book) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.7 },
      });
    } catch (e) {}
    onBuyClick(book);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-fadeIn">
        
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-colors"
            title="Share Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: 3D Book Showcase */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 relative">
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {book.badgeText || '⭐ PREMIUM EDITION'}
              </span>
            </div>

            <div className="my-6">
              <Book3D book={book} size="lg" />
            </div>

            {/* Quick Details Badges */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-6 border-t border-slate-800/80 text-center">
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <FileText className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">{book.pages} Pages</span>
                <span className="text-[10px] text-slate-400">Length</span>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <Globe className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white truncate">{book.language}</span>
                <span className="text-[10px] text-slate-400">Language</span>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <Layers className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">Digital PDF</span>
                <span className="text-[10px] text-slate-400">Instant Access</span>
              </div>
            </div>
          </div>

          {/* Right Column: Book Information & Actions */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {book.category}
                </span>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-200">{book.rating}</span>
                  <span className="text-xs text-slate-400">({book.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-display">
                {book.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                {book.subtitle}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Authored by <span className="text-slate-200 font-semibold">{book.author}</span>
              </p>

              {/* Price Callout */}
              <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/60 to-slate-800/30 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-400">
                      {book.currency}{book.price}
                    </span>
                    {book.originalPrice > book.price && (
                      <span className="text-base text-slate-400 line-through">
                        {book.currency}{book.originalPrice}
                      </span>
                    )}
                    {book.discount && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {book.discount}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    One-time payment • Lifetime access • Free updates
                  </p>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> 100% Verified
                  </span>
                  <p className="text-[10px] text-slate-400">Instant PDF Delivery</p>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="flex border-b border-slate-800 gap-4 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview & Perks
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'chapters'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chapters & Content ({book.tableOfContents?.length || 0})
                </button>
              </div>

              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {book.description}
                  </p>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      What's Included:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {book.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Chapters */}
              {activeTab === 'chapters' && (
                <div className="space-y-2">
                  {book.tableOfContents && book.tableOfContents.length > 0 ? (
                    book.tableOfContents.map((chap, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                      >
                        <span className="font-medium">{chap}</span>
                        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                          Included
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Complete curriculum included in the download.</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
              {/* Sample PDF Preview Button */}
              <button
                onClick={() => {
                  onClose();
                  onSampleClick(book);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Read Sample PDF</span>
              </button>

              {/* Buy Now Button leading to custom payment link */}
              <button
                onClick={handleBuy}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Buy Now ({book.currency}{book.price})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
