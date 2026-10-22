import React, { useState } from 'react';
import { EBook } from '../types';
import { X, ExternalLink, Download, BookOpen, ShieldCheck, Zap, Maximize2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SamplePdfModalProps {
  book: EBook | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyClick: (book: EBook) => void;
}

export const SamplePdfModal: React.FC<SamplePdfModalProps> = ({
  book,
  isOpen,
  onClose,
  onBuyClick,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !book) return null;

  // Convert Google Drive view link to embeddable preview link if needed
  const getEmbeddableDriveUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      if (url.includes('/view')) {
        return url.replace('/view', '/preview');
      }
      if (!url.includes('/preview')) {
        return `${url}${url.endsWith('/') ? '' : '/'}preview`;
      }
    }
    return url;
  };

  const previewUrl = getEmbeddableDriveUrl(book.samplePdfUrl);

  const handleBuy = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch (e) {}
    onBuyClick(book);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className={`relative w-full ${isFullscreen ? 'h-full max-w-full rounded-none' : 'max-w-5xl h-[92vh] rounded-2xl'} bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Sample PDF Preview
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Google Drive Cloud Viewer
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {book.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Google Drive in New Tab */}
            <a
              href={book.samplePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
              title="Open Google Drive direct link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Drive</span>
            </a>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col">
          {previewUrl && !iframeError ? (
            <iframe
              src={previewUrl}
              title={`Sample Preview - ${book.title}`}
              className="w-full h-full border-0 bg-slate-900"
              allow="autoplay"
              onError={() => setIframeError(true)}
            />
          ) : (
            /* Fallback Reader if iframe blocked */
            <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center overflow-y-auto">
              <div className="max-w-lg bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">
                  Sample Preview on Google Drive
                </h4>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Google Drive previews can be viewed directly in a fresh tab for the best reading experience. Click below to inspect chapters, tables of content, and sample exercises!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={book.samplePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open PDF in Google Drive
                  </a>
                  <button
                    onClick={handleBuy}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    Unlock Full Book ({book.currency}{book.price})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Bottom Purchase Callout Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-14 rounded overflow-hidden shrink-0 hidden sm:block border border-slate-700">
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Liking this preview? Get the complete <span className="text-slate-200 font-semibold">{book.pages} pages</span> instant edition.
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-amber-400 font-extrabold text-lg">
                  {book.currency}{book.price}
                </span>
                {book.originalPrice > book.price && (
                  <span className="text-slate-500 text-xs line-through">
                    {book.currency}{book.originalPrice}
                  </span>
                )}
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Instant Access
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors flex-1 sm:flex-initial"
            >
              Continue Browsing
            </button>
            <button
              onClick={handleBuy}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all flex-1 sm:flex-initial"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Buy Full eBook Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
