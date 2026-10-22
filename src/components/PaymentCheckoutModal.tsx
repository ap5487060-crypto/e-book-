import React from 'react';
import { EBook, SiteSettings } from '../types';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentCheckoutModalProps {
  book: EBook | null;
  isOpen: boolean;
  settings: SiteSettings;
  onClose: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  book,
  isOpen,
  settings,
  onClose,
}) => {
  if (!isOpen || !book) return null;

  const handleOpenPaymentLink = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Open target payment link provided by admin
    if (book.paymentLink) {
      window.open(book.paymentLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Instant Checkout & Download
              </h3>
              <p className="text-[11px] text-slate-400">
                100% Encrypted & Verified Digital Delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Book Summary */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-4">
          <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-900">
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {book.category}
            </span>
            <h4 className="text-sm font-bold text-white truncate mt-1">
              {book.title}
            </h4>
            <p className="text-xs text-slate-400">{book.pages} Pages • Full Instant PDF Edition</p>
            
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-amber-400">
                {book.currency}{book.price}
              </span>
              {book.originalPrice > book.price && (
                <span className="text-xs text-slate-500 line-through">
                  {book.currency}{book.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Checkout Button: Direct Custom Payment Link */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleOpenPaymentLink}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Proceed to Payment Gateway</span>
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
          </button>
          
          <p className="text-[11px] text-center text-slate-400">
            Opens your secure payment gateway page (UPI, Cards, NetBanking, Wallets supported)
          </p>
        </div>

        {/* Security badges */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" /> 100% Secure Checkout
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encryption
          </span>
        </div>

      </div>
    </div>
  );
};
