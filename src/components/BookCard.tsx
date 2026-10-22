import React from 'react';
import { EBook } from '../types';
import { Book3D } from './Book3D';
import { Zap, BookOpen, Star, Info, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookCardProps {
  book: EBook;
  onBuyClick: (book: EBook) => void;
  onSampleClick: (book: EBook) => void;
  onDetailClick: (book: EBook) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onBuyClick,
  onSampleClick,
  onDetailClick,
}) => {
  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {}
    onBuyClick(book);
  };

  const handleSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSampleClick(book);
  };

  return (
    <div 
      onClick={() => onDetailClick(book)}
      className="group relative bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer backdrop-blur-sm"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
          {book.category}
        </span>
        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{book.rating}</span>
          <span className="text-slate-500 text-[10px]">({book.reviewsCount})</span>
        </div>
      </div>

      {/* 3D Book Graphic */}
      <div className="py-2 flex items-center justify-center">
        <Book3D 
          book={book} 
          size="md" 
          interactive={true} 
        />
      </div>

      {/* Book Metadata */}
      <div className="mt-4 space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {book.subtitle}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>By {book.author}</span>
          <span className="text-slate-500">{book.pages} Pages • PDF</span>
        </div>
      </div>

      {/* Pricing & Value */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {book.currency}{book.price}
            </span>
            {book.originalPrice > book.price && (
              <span className="text-xs text-slate-500 line-through">
                {book.currency}{book.originalPrice}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            Instant Digital Download
          </span>
        </div>

        {book.discount && (
          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            {book.discount}% OFF
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
        {/* Sample PDF Link Button */}
        <button
          onClick={handleSample}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors"
          title="Preview sample pages on Google Drive"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Sample PDF</span>
        </button>

        {/* Buy Now Button leading to custom payment link */}
        <button
          onClick={handleBuy}
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all transform hover:-translate-y-0.5"
          title="Buy with instant payment link"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span>Buy Now</span>
        </button>
      </div>

      {/* Details Hint */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors inline-flex items-center gap-1">
          Click card for chapters & full details <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
};
