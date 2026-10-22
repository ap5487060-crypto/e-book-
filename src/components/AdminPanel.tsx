import React, { useState, useEffect } from 'react';
import { EBook, SiteSettings, InquiryClick, AppNotification } from '../types';
import { 
  ADMIN_CREDENTIALS,
  db 
} from '../firebase';
import { 
  saveEBook, 
  deleteEBook, 
  deleteAllBooks,
  authenticateAdmin, 
  checkAdminSession, 
  adminLogout,
  saveLocalSettings 
} from '../services/dataService';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  LogOut, 
  Zap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Bell, 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  Upload,
  Link,
  Save,
  Search,
  Key,
  X,
  AlertOctagon
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  books: EBook[];
  settings: SiteSettings;
  inquiries: InquiryClick[];
  notifications: AppNotification[];
  dataSource: 'firebase' | 'local';
  onBooksUpdated: () => void;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  books,
  settings,
  inquiries,
  notifications,
  dataSource,
  onBooksUpdated,
  onSettingsUpdated,
}) => {
  // Auth state - completely empty so credentials are never exposed publicly
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'books' | 'inquiries' | 'rules' | 'settings'>('books');

  // Book edit/add modal state
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [currentBook, setCurrentBook] = useState<Partial<EBook>>({});
  const [imagePreview, setImagePreview] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // IN-APP DELETE CONFIRMATION STATE (Replaces window.confirm completely)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    isAll: boolean;
    bookId?: string;
    bookTitle?: string;
  }>({ isOpen: false, isAll: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Settings form state
  const [storeSettings, setStoreSettings] = useState<SiteSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Rules copy state
  const [rulesCopied, setRulesCopied] = useState(false);

  // Check existing session
  useEffect(() => {
    const session = checkAdminSession();
    if (session) {
      setIsAuthenticated(true);
    }
  }, [isOpen]);

  // Keep settings synced
  useEffect(() => {
    setStoreSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authenticateAdmin(adminEmail, adminPassword);
      if (res.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error logging in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
  };

  // Open Edit Book modal
  const handleEditBook = (book: EBook) => {
    setCurrentBook({ ...book });
    setImagePreview(book.coverImage);
    setIsEditingBook(true);
  };

  // Open New Book modal
  const handleNewBook = () => {
    const newBook: Partial<EBook> = {
      id: 'ebook-' + Date.now(),
      title: '',
      subtitle: '',
      author: 'Abhishek Prajapati',
      price: '' as any,
      originalPrice: '' as any,
      currency: '₹',
      discount: 0,
      coverImage: '',
      paymentLink: '',
      samplePdfUrl: '',
      description: '',
      category: '',
      pages: '' as any,
      language: 'English + Hindi',
      format: 'PDF (Instant Download)',
      features: ['Instant Download', 'Lifetime Access', 'Full Curriculum'],
      rating: 4.9,
      reviewsCount: 50,
      isFeatured: true,
      isBestSeller: false,
      badgeText: '',
      tableOfContents: [
        'Chapter 1: Foundations & Concepts',
        'Chapter 2: Step-by-Step Blueprint',
        'Chapter 3: Real-World Case Studies',
        'Chapter 4: Tools & Templates'
      ],
      createdAt: new Date().toISOString()
    };
    setCurrentBook(newBook);
    setImagePreview('');
    setIsEditingBook(true);
  };

  // Handle local image file upload & compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * (img.width > MAX_WIDTH ? scaleSize : 1);
        if (img.width <= MAX_WIDTH) {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setCurrentBook(prev => ({ ...prev, coverImage: dataUrl }));
        setImagePreview(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  // Save Book
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBook.title || !currentBook.price) {
      alert('Please fill at least Book Title and Price');
      return;
    }

    setSaveLoading(true);
    const orig = currentBook.originalPrice ? Number(currentBook.originalPrice) : 0;
    const pr = currentBook.price ? Number(currentBook.price) : 0;
    const pgs = currentBook.pages ? Number(currentBook.pages) : 0;
    let disc = currentBook.discount;
    if (orig > pr && orig > 0) {
      disc = Math.round(((orig - pr) / orig) * 100);
    }

    const fullBook: EBook = {
      id: currentBook.id || 'ebook-' + Date.now(),
      title: currentBook.title || 'Untitled eBook',
      subtitle: currentBook.subtitle || '',
      author: currentBook.author || 'Abhishek Prajapati',
      price: pr,
      originalPrice: orig || pr,
      currency: currentBook.currency || '₹',
      discount: disc,
      coverImage: currentBook.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      paymentLink: currentBook.paymentLink || '',
      samplePdfUrl: currentBook.samplePdfUrl || '',
      description: currentBook.description || '',
      category: currentBook.category || 'General',
      pages: pgs,
      language: currentBook.language || 'English',
      format: currentBook.format || 'PDF',
      features: currentBook.features || ['Instant Download', 'Lifetime Access'],
      rating: Number(currentBook.rating) || 4.9,
      reviewsCount: Number(currentBook.reviewsCount) || 50,
      isFeatured: currentBook.isFeatured ?? true,
      isBestSeller: !!currentBook.isBestSeller,
      badgeText: currentBook.badgeText || '',
      tableOfContents: currentBook.tableOfContents || [],
      createdAt: currentBook.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const res = await saveEBook(fullBook);
    setSaveLoading(false);
    setIsEditingBook(false);
    setSaveMessage('eBook published successfully! ' + (res.source === 'firebase' ? 'Synced with Firebase' : 'Saved to Store'));
    setTimeout(() => setSaveMessage(''), 3500);
    onBooksUpdated();
  };

  // Open Delete Confirmation Modal for Single Book
  const triggerDeleteSingle = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      isAll: false,
      bookId: id,
      bookTitle: title
    });
  };

  // Open Delete Confirmation Modal for All Books
  const triggerDeleteAll = () => {
    setDeleteModal({
      isOpen: true,
      isAll: true,
      bookTitle: 'All eBooks'
    });
  };

  // Execute Confirmed Delete (100% reliable without window.confirm)
  const confirmDeleteAction = async () => {
    setDeleteLoading(true);
    if (deleteModal.isAll) {
      await deleteAllBooks();
      setSaveMessage('All books deleted successfully! Store is now 100% clean.');
    } else if (deleteModal.bookId) {
      await deleteEBook(deleteModal.bookId);
      setSaveMessage(`"${deleteModal.bookTitle}" deleted successfully!`);
    }
    setDeleteLoading(false);
    setDeleteModal({ isOpen: false, isAll: false });
    setTimeout(() => setSaveMessage(''), 3500);
    onBooksUpdated();
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalSettings(storeSettings);
    onSettingsUpdated(storeSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Filtered books
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Firestore Rules text for user copy
  const firestoreRulesText = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // eBooks: Public read, authenticated users / admin write
    match /ebooks/{bookId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Store settings & notifications
    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Inquiries, clicks & notifications (public can record clicks)
    match /inquiries/{inquiryId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }
    
    match /notifications/{notifId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }
    
    // Fallback: logged-in users have full access
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Navbar of Admin Panel */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Admin Control Panel
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAuthenticated ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated Administrator
                  </span>
                ) : (
                  <span>Restricted Access Portal</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <span className={`w-2 h-2 rounded-full ${dataSource === 'firebase' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
              <span className="text-slate-300 font-medium">
                {dataSource === 'firebase' ? 'Firebase Live Sync' : 'Local Storage Ready'}
              </span>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/50 hover:text-red-400 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If Not Authenticated: Login Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/60 overflow-y-auto">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <Key className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Secure Admin Login
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter credentials to manage your real eBooks and payment links.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="Enter admin email..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors pr-10"
                      placeholder="Enter password..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Enter Admin Panel</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-950/80 border-r border-slate-800 p-4 flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-visible">
              <button
                onClick={() => setActiveTab('books')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                  activeTab === 'books'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Manage eBooks ({books.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                  activeTab === 'inquiries'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Clicks & Sales ({inquiries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('rules')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                  activeTab === 'rules'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Firestore Rules Code</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Store Settings</span>
              </button>

              <div className="hidden md:block mt-auto p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-200 font-semibold block mb-0.5">Firebase Linked</span>
                <span>Project: e-book-selling-90184</span>
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900">
              
              {saveMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}

              {/* TAB: MANAGE EBOOKS */}
              {activeTab === 'books' && (
                <div className="space-y-6">
                  
                  {/* Top Header & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">eBook Inventory ({books.length})</h3>
                      <p className="text-xs text-slate-400">
                        Add your real eBooks with payment links and Google Drive sample previews.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* One-click Wipe / Delete All Books button */}
                      {books.length > 0 && (
                        <button
                          onClick={triggerDeleteAll}
                          className="px-3.5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white font-bold text-xs border border-red-500/40 flex items-center gap-1.5 transition-colors"
                          title="Delete all demo books in one click"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear All ({books.length})</span>
                        </button>
                      )}

                      {/* Add New eBook Button */}
                      <button
                        onClick={handleNewBook}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Add New eBook</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar if books exist */}
                  {books.length > 0 && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search your eBooks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  {/* Empty State Banner (Clean store prompt) */}
                  {books.length === 0 ? (
                    <div className="p-10 sm:p-14 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h4 className="text-lg font-bold text-white">Your Store Is Fresh & Clean!</h4>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                          All demo products have been cleared. Click below to add your first real eBook with your title, selling price, payment link (Razorpay/UPI/Stripe), and Google Drive sample PDF!
                        </p>
                      </div>
                      <button
                        onClick={handleNewBook}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
                      >
                        <Plus className="w-5 h-5 stroke-[3]" />
                        <span>Add Your First Real eBook</span>
                      </button>
                    </div>
                  ) : (
                    /* Books Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredBooks.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex gap-4 items-start shadow-md"
                        >
                          <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-700">
                            <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                {b.category}
                              </span>
                              {b.isFeatured && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                  Hero Featured
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-white truncate">{b.title}</h4>
                            <p className="text-xs text-slate-400 truncate">{b.subtitle || 'No subtitle'}</p>

                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-base font-extrabold text-amber-400">{b.currency}{b.price}</span>
                              {b.originalPrice > b.price && (
                                <span className="text-xs text-slate-500 line-through">{b.currency}{b.originalPrice}</span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
                              <button
                                onClick={() => handleEditBook(b)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Edit</span>
                              </button>

                              {b.paymentLink && (
                                <a
                                  href={b.paymentLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                                  title="Test Payment Link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Pay Link</span>
                                </a>
                              )}

                              {/* DELETE BUTTON WITH IN-APP CONFIRMATION */}
                              <button
                                onClick={() => triggerDeleteSingle(b.id, b.title)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/80 text-red-400 hover:text-white text-xs font-bold flex items-center gap-1 ml-auto border border-red-500/20 hover:border-red-500 transition-colors"
                                title="Delete this eBook"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Welcome, Abhishek!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Real-time analytics summary for your eBook store.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">{books.length}</span>
                      <p className="text-xs text-slate-400 mt-0.5">Active eBooks</p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        {inquiries.length}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">Total Payment Clicks</p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                        <Eye className="w-5 h-5" />
                      </div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        {books.reduce((acc, b) => acc + (b.viewsCount || 50), 0)}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">Total Views</p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                        <Bell className="w-5 h-5" />
                      </div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        {notifications.length}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">Notifications</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: INQUIRIES & CLICKS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Clicks & Payment Tracking</h3>
                    <p className="text-xs text-slate-400">
                      Real-time log of customers who clicked "Buy Now" or "Sample PDF".
                    </p>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    {inquiries.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <DollarSign className="w-10 h-10 text-amber-500/40 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-300">No clicks recorded yet</p>
                        <p className="text-xs text-slate-500 mt-1">When users click "Buy Now", entries appear here instantly.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/80">
                        {inquiries.map((inq) => (
                          <div key={inq.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{inq.bookTitle}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                                  {inq.platformClicked}
                                </span>
                              </div>
                              <span className="text-slate-400 text-[11px] mt-0.5 block">
                                Price: ₹{inq.bookPrice} • ID: {inq.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-slate-400">
                                {new Date(inq.timestamp).toLocaleString()}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                                {inq.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: FIRESTORE RULES CODE */}
              {activeTab === 'rules' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Firestore Security Rules</h3>
                    <p className="text-xs text-slate-400">
                      Copy this exact code and paste it into your Firebase Console to enable read/write permissions.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                    <p className="font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Firebase Console Instructions:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Open Firebase Console &gt; Project <strong className="text-white">e-book-selling-90184</strong> &gt; <strong>Firestore Database</strong> &gt; <strong>Rules</strong> tab.</li>
                      <li>Replace with this code and click <strong className="text-amber-400">Publish</strong>.</li>
                    </ol>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-t-xl text-xs text-slate-400 font-mono">
                      <span>firestore.rules</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(firestoreRulesText);
                          setRulesCopied(true);
                          setTimeout(() => setRulesCopied(false), 2500);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                      >
                        {rulesCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{rulesCopied ? 'Copied!' : 'Copy Rules Code'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950/90 border border-t-0 border-slate-800 rounded-b-xl text-emerald-400 text-xs font-mono overflow-x-auto">
                      {firestoreRulesText}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB: STORE SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Store & Payment Setup</h3>
                    <p className="text-xs text-slate-400">Customize titles, WhatsApp contact, UPI ID, and top announcement banner.</p>
                  </div>

                  {settingsSaved && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Settings updated successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Store Name
                        </label>
                        <input
                          type="text"
                          value={storeSettings.storeName}
                          onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Currency Symbol
                        </label>
                        <input
                          type="text"
                          value={storeSettings.currencySymbol}
                          onChange={(e) => setStoreSettings({ ...storeSettings, currencySymbol: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hero Title (Large Headline)
                      </label>
                      <input
                        type="text"
                        value={storeSettings.heroTitle}
                        onChange={(e) => setStoreSettings({ ...storeSettings, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Announcement Bar Text
                      </label>
                      <input
                        type="text"
                        value={storeSettings.announcement}
                        onChange={(e) => setStoreSettings({ ...storeSettings, announcement: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Customer Support Email
                      </label>
                      <input
                        type="email"
                        value={storeSettings.supportEmail}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        placeholder="support@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Settings</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* IN-APP DELETE CONFIRMATION MODAL (Reliable, no window.confirm) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">
                {deleteModal.isAll ? 'Delete All eBooks?' : 'Delete This eBook?'}
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {deleteModal.isAll ? (
                  <span>Are you sure you want to delete <strong className="text-red-400">all {books.length} eBooks</strong>? This will give you a completely clean slate.</span>
                ) : (
                  <span>Are you sure you want to delete <strong className="text-white">"{deleteModal.bookTitle}"</strong>? This will remove it from the store and database.</span>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteModal({ isOpen: false, isAll: false })}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDeleteAction}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ADD / EDIT EBOOK MODAL */}
      {isEditingBook && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {currentBook.id ? 'Edit eBook' : 'Add New Real eBook'}
              </h3>
              <button
                onClick={() => setIsEditingBook(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              
              {/* Row 1: Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    eBook Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentBook.title || ''}
                    onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. Complete Web Development Guide"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={currentBook.author || ''}
                    onChange={(e) => setCurrentBook({ ...currentBook, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                    placeholder="Abhishek Prajapati"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={currentBook.subtitle || ''}
                  onChange={(e) => setCurrentBook({ ...currentBook, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Master modern techniques and frameworks..."
                />
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Selling Price ({currentBook.currency || '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={currentBook.price !== undefined && currentBook.price !== null ? currentBook.price : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentBook({ ...currentBook, price: val === '' ? ('' as any) : val });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. 299"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    value={currentBook.originalPrice !== undefined && currentBook.originalPrice !== null ? currentBook.originalPrice : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentBook({ ...currentBook, originalPrice: val === '' ? ('' as any) : val });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. 999"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currentBook.currency || '₹'}
                    onChange={(e) => setCurrentBook({ ...currentBook, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                    placeholder="₹"
                  />
                </div>
              </div>

              {/* Payment Link & Sample Drive PDF Link */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Payment Gateway Link (Razorpay, Stripe, UPI, Instamojo, Gumroad, etc.) *
                  </label>
                  <div className="relative">
                    <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      required
                      value={currentBook.paymentLink || ''}
                      onChange={(e) => setCurrentBook({ ...currentBook, paymentLink: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      placeholder="https://pages.razorpay.com/... or your custom link"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    When the customer clicks "Buy Now", this URL will open instantly for payment!
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Sample eBook PDF Link (Google Drive / Direct Preview Link) *
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      required
                      value={currentBook.samplePdfUrl || ''}
                      onChange={(e) => setCurrentBook({ ...currentBook, samplePdfUrl: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                      placeholder="https://drive.google.com/file/d/.../preview or view"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Google Drive link allows customers to preview chapters before buying!
                  </p>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Book Cover Image (3D Rendered)
                </label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-700">
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">No Cover</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={currentBook.coverImage || ''}
                      onChange={(e) => {
                        setCurrentBook({ ...currentBook, coverImage: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      placeholder="Paste Image URL or upload below..."
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload from Device (Compressed & saved directly)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={currentBook.description || ''}
                  onChange={(e) => setCurrentBook({ ...currentBook, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Comprehensive description of what the reader will learn..."
                />
              </div>

              {/* Category, Pages, Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={currentBook.category !== undefined && currentBook.category !== null ? currentBook.category : ''}
                    onChange={(e) => setCurrentBook({ ...currentBook, category: e.target.value })}
                    placeholder="e.g. AI & Tech"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Page Count</label>
                  <input
                    type="number"
                    value={currentBook.pages !== undefined && currentBook.pages !== null ? currentBook.pages : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentBook({ ...currentBook, pages: val === '' ? ('' as any) : val });
                    }}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={currentBook.badgeText !== undefined && currentBook.badgeText !== null ? currentBook.badgeText : ''}
                    onChange={(e) => setCurrentBook({ ...currentBook, badgeText: e.target.value })}
                    placeholder="e.g. 🔥 NEW RELEASE"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={!!currentBook.isFeatured}
                  onChange={(e) => setCurrentBook({ ...currentBook, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="featuredToggle" className="text-xs text-slate-200 cursor-pointer">
                  Feature in Top 3D Hero Showcase Section
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingBook(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'Saving...' : 'Save & Publish eBook'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
