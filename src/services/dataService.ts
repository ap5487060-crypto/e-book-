import { 
  db, 
  auth, 
  ADMIN_CREDENTIALS,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  addDoc 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { EBook, SiteSettings, InquiryClick, AppNotification, BookReview } from '../types';
import { INITIAL_BOOKS, INITIAL_SETTINGS, INITIAL_REVIEWS } from '../data/initialBooks';

const LOCAL_STORAGE_BOOKS_KEY = 'bookverse_ebooks_v2';
const LOCAL_STORAGE_SETTINGS_KEY = 'bookverse_settings_v2';
const LOCAL_STORAGE_INQUIRIES_KEY = 'bookverse_inquiries_v2';
const LOCAL_STORAGE_NOTIFS_KEY = 'bookverse_notifications_v2';
const LOCAL_STORAGE_ADMIN_KEY = 'bookverse_admin_session_v2';

// Seed or load local storage
export function getLocalBooks(): EBook[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local books', e);
  }
  // Default is clean empty list
  localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify([]));
  return [];
}

export function saveLocalBooks(books: EBook[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(books));
  } catch (e) {
    console.warn('Error saving local books', e);
  }
}

export function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local settings', e);
  }
  localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
  return INITIAL_SETTINGS;
}

export function saveLocalSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving local settings', e);
  }
}

export function getLocalInquiries(): InquiryClick[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local inquiries', e);
  }
  return [];
}

export function saveLocalInquiries(inquiries: InquiryClick[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(inquiries));
  } catch (e) {
    console.warn('Error saving local inquiries', e);
  }
}

export function getLocalNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local notifs', e);
  }
  const initialNotifs: AppNotification[] = [
    {
      id: 'n-welcome',
      title: 'Store Ready For Real eBooks',
      message: 'All demo books have been cleared. Add your real eBooks with payment links and sample PDFs.',
      type: 'system',
      timestamp: Date.now(),
      read: false
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(initialNotifs));
  return initialNotifs;
}

export function saveLocalNotifications(notifs: AppNotification[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.warn('Error saving local notifications', e);
  }
}

// Subscribe to real-time books from Firestore with fallback to LocalStorage
export function subscribeToBooks(
  onUpdate: (books: EBook[], source: 'firebase' | 'local') => void,
  onError?: (err: Error) => void
) {
  let isUnmounted = false;

  // Immediately emit current local books
  const localBooks = getLocalBooks();
  onUpdate(localBooks, 'local');

  try {
    const booksCol = collection(db, 'ebooks');
    const unsub = onSnapshot(booksCol, async (snapshot) => {
      if (isUnmounted) return;

      if (snapshot.empty) {
        // When empty, keep it clean and empty
        saveLocalBooks([]);
        onUpdate([], 'firebase');
      } else {
        const firestoreBooks: EBook[] = [];
        snapshot.forEach((docSnap) => {
          firestoreBooks.push({ id: docSnap.id, ...docSnap.data() } as EBook);
        });
        saveLocalBooks(firestoreBooks);
        onUpdate(firestoreBooks, 'firebase');
      }
    }, (err) => {
      console.warn('Firestore subscription error (will use local cache):', err.message);
      if (onError) onError(err);
      onUpdate(getLocalBooks(), 'local');
    });

    return () => {
      isUnmounted = true;
      unsub();
    };
  } catch (err: any) {
    console.warn('Firestore connection failed, using local storage:', err);
    if (onError) onError(err);
    return () => {};
  }
}

// Add or update an eBook
export async function saveEBook(book: EBook): Promise<{ success: boolean; source: 'firebase' | 'local'; error?: string }> {
  // Always update local cache first
  const currentBooks = getLocalBooks();
  const existingIdx = currentBooks.findIndex(b => b.id === book.id);
  let updatedList: EBook[];
  if (existingIdx >= 0) {
    updatedList = [...currentBooks];
    updatedList[existingIdx] = { ...book, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [book, ...currentBooks];
  }
  saveLocalBooks(updatedList);

  // Attempt sync to Firestore
  try {
    await setDoc(doc(db, 'ebooks', book.id), book);
    return { success: true, source: 'firebase' };
  } catch (err: any) {
    console.warn('Firestore write failed, saved to local cache:', err);
    return { success: true, source: 'local', error: err.message };
  }
}

// Delete a single eBook reliably
export async function deleteEBook(bookId: string): Promise<{ success: boolean; source: 'firebase' | 'local' }> {
  const currentBooks = getLocalBooks();
  const updated = currentBooks.filter(b => b.id !== bookId);
  saveLocalBooks(updated);

  try {
    await deleteDoc(doc(db, 'ebooks', bookId));
    return { success: true, source: 'firebase' };
  } catch (err: any) {
    console.warn('Firestore delete failed, updated local cache:', err);
    return { success: true, source: 'local' };
  }
}

// Delete ALL eBooks completely (Wipe everything)
export async function deleteAllBooks(): Promise<{ success: boolean; count: number }> {
  const currentBooks = getLocalBooks();
  const count = currentBooks.length;
  
  // Clear local storage first
  saveLocalBooks([]);

  // Delete all docs from Firestore
  try {
    const booksCol = collection(db, 'ebooks');
    const snapshot = await getDocs(booksCol);
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'ebooks', d.id)));
    await Promise.all(deletePromises);
  } catch (e) {
    console.warn('Error deleting all from Firestore, local cleared:', e);
  }

  return { success: true, count };
}

// Track inquiry or payment click event
export async function recordClickEvent(event: Omit<InquiryClick, 'id' | 'timestamp'>) {
  const id = 'click-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const clickData: InquiryClick = {
    ...event,
    id,
    timestamp: Date.now()
  };

  // Save to local
  const current = getLocalInquiries();
  saveLocalInquiries([clickData, ...current]);

  // Create real-time notification
  const notif: AppNotification = {
    id: 'notif-' + Date.now(),
    title: `Reader Clicked ${event.platformClicked}`,
    message: `Payment/Preview intent for "${event.bookTitle}" (₹${event.bookPrice})`,
    type: 'click',
    timestamp: Date.now(),
    read: false,
    bookTitle: event.bookTitle
  };
  const currentNotifs = getLocalNotifications();
  saveLocalNotifications([notif, ...currentNotifs]);

  // Sync to Firestore
  try {
    await addDoc(collection(db, 'inquiries'), clickData);
    await addDoc(collection(db, 'notifications'), notif);
  } catch (e) {
    // Silent fallback
  }
}

// Subscribe to notifications
export function subscribeToNotifications(onUpdate: (notifs: AppNotification[]) => void) {
  onUpdate(getLocalNotifications());

  try {
    const notifsCol = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(notifsCol, (snapshot) => {
      if (!snapshot.empty) {
        const notifs: AppNotification[] = [];
        snapshot.forEach(docSnap => {
          notifs.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
        });
        saveLocalNotifications(notifs);
        onUpdate(notifs);
      }
    }, (err) => {
      console.warn('Notifications firestore error:', err.message);
      onUpdate(getLocalNotifications());
    });
    return unsub;
  } catch (e) {
    return () => {};
  }
}

// Admin Authentication handling
export async function authenticateAdmin(email: string, pass: string): Promise<{ success: boolean; user?: any; error?: string }> {
  const isRequestedAdmin = (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
    pass.trim() === ADMIN_CREDENTIALS.password
  );

  try {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify({ email: userCredential.user.email, loggedInAt: Date.now() }));
      return { success: true, user: userCredential.user };
    } catch (firebaseErr: any) {
      if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
        if (isRequestedAdmin) {
          try {
            const newUser = await createUserWithEmailAndPassword(auth, email.trim(), pass);
            localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify({ email: newUser.user.email, loggedInAt: Date.now() }));
            return { success: true, user: newUser.user };
          } catch (createErr: any) {
            console.warn('Firebase createUser failed:', createErr);
          }
        }
      }
      
      if (isRequestedAdmin) {
        const fallbackAdmin = {
          email: ADMIN_CREDENTIALS.email,
          displayName: ADMIN_CREDENTIALS.name,
          uid: 'admin-super-abhishek',
          isSuperAdmin: true
        };
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(fallbackAdmin));
        return { success: true, user: fallbackAdmin };
      }

      return { success: false, error: firebaseErr.message || 'Invalid credentials' };
    }
  } catch (err: any) {
    if (isRequestedAdmin) {
      const fallbackAdmin = {
        email: ADMIN_CREDENTIALS.email,
        displayName: ADMIN_CREDENTIALS.name,
        uid: 'admin-super-abhishek'
      };
      localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(fallbackAdmin));
      return { success: true, user: fallbackAdmin };
    }
    return { success: false, error: err.message };
  }
}

export function checkAdminSession(): any | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    return null;
  }
  return null;
}

export async function adminLogout() {
  localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
  try {
    await signOut(auth);
  } catch (e) {
    // Ignore
  }
}
