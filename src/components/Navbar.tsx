import React, { useState } from 'react';
import { SiteSettings, AppNotification } from '../types';
import { 
  BookOpen, 
  Search, 
  ShieldCheck, 
  Bell, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  settings: SiteSettings;
  notifications: AppNotification[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  notifications,
  selectedCategory,
  onSelectCategory,
  categories,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      
      {/* Top Announcement Bar if enabled */}
      {settings.showAnnouncement && settings.announcement && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-slate-950 font-extrabold text-[11px] sm:text-xs py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
          <span>{settings.announcement}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1 font-display">
                {settings.storeName.split(' ')[0]}
                <span className="text-amber-400">{settings.storeName.split(' ').slice(1).join(' ') || 'Store'}</span>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block tracking-wider uppercase font-semibold">
                {settings.tagline}
              </span>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative mx-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, book or author..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Real-time Notifications Bell with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Store Notifications
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                      Real-time Feed
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 text-center">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div key={n.id} className="p-3 hover:bg-slate-850 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Panel Launch Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/60 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Search & Navigation Bar */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search eBooks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Category Filter Tabs */}
        <div className="hidden md:flex items-center gap-2 py-3 border-t border-slate-900 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
