import React from 'react';
import { SiteSettings } from '../types';
import { BookOpen, ShieldCheck, Zap } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-900">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Instant Digital Delivery</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Immediately download your high-resolution eBook PDF right after payment checkout.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">100% Secure Checkout</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Protected by end-to-end encryption. Works with UPI, NetBanking, Cards, & Wallets.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Lifetime Digital Access</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Download high-resolution eBook PDFs with sample previews and future edition updates.
              </p>
            </div>
          </div>
        </div>

        {/* Middle Footer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-b border-slate-900">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black text-white">{settings.storeName}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Curated masterclasses, tech architectures, wealth frameworks, and digital strategies written to accelerate your career and financial journey.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] text-slate-500">Customer Support:</span>
              <span className="text-xs text-amber-400 font-semibold">{settings.supportEmail}</span>
            </div>
          </div>

          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Supported Gateways</h5>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Razorpay</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">UPI / QR</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Stripe</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Google Pay</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Paytm</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">PhonePe</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by Firebase Firestore & 3D Web Engine</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
