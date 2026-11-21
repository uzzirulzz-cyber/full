import {
  type ConfirmationResult,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  type User,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { OperationType, auth, db, handleFirestoreError } from '../lib/firebase';
import type { LiveTvChannel } from '../types/store';

export interface UserProfileRecord {
  uid: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  provider: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfileRecord | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithTikTok: () => Promise<void>;
  sendPhoneOtp: (phoneE164: string, recaptchaContainerId: string) => Promise<void>;
  verifyPhoneOtp: (code: string) => Promise<void>;
  hasPendingPhoneOtp: boolean;
  resetPhoneOtp: () => void;
  signOutUser: () => Promise<void>;
  watchlistIds: string[];
  toggleWatchlistChannel: (channel: LiveTvChannel) => Promise<boolean>;
}

const WATCHLIST_LOCAL_KEY = 'pb_livetv_watchlist_v1';

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeProvider(user: User, fallbackProvider?: string): string {
  const raw = fallbackProvider || user.providerData?.[0]?.providerId || 'google.com';
  const allowed = ['google.com', 'facebook.com', 'github.com', 'oidc.tiktok', 'phone', 'password'];
  return allowed.includes(raw) ? raw : 'google.com';
}

function formatFirebaseAuthError(err: unknown, providerLabel: string): Error {
  const code = (err as { code?: string })?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return new Error(`${providerLabel} sign-in popup was closed before completing.`);
  }
  if (code === 'auth/popup-blocked') {
    return new Error('Popup was blocked by the browser. Please allow popups for Playbeat Digital.');
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
    return new Error(
      `${providerLabel} sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method). Enable ${providerLabel} there to activate live login.`,
    );
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return new Error(
      'An account already exists with the same email under a different provider. Sign in with your original provider.',
    );
  }
  if (code === 'auth/invalid-phone-number') {
    return new Error('Enter a valid phone number in international format (e.g., +923001234567).');
  }
  if (code === 'auth/invalid-verification-code') {
    return new Error('Invalid 6-digit SMS verification code. Please check and try again.');
  }
  if (code === 'auth/too-many-requests') {
    return new Error('Too many SMS attempts. Please wait a few minutes before retrying.');
  }
  if (code === 'auth/unauthorized-domain') {
    return new Error(
      'This domain needs to be added under Firebase Console → Authentication → Settings → Authorized domains.',
    );
  }
  return new Error(err instanceof Error ? err.message : `${providerLabel} authentication failed.`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasPendingPhoneOtp, setHasPendingPhoneOtp] = useState(false);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_LOCAL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const syncUserProfile = useCallback(async (firebaseUser: User, explicitProvider?: string) => {
    const userPath = `users/${firebaseUser.uid}`;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const nowIso = new Date().toISOString();
    const provider = normalizeProvider(firebaseUser, explicitProvider);

    try {
      const existingSnap = await getDoc(userRef);
      if (existingSnap.exists()) {
        const existing = existingSnap.data() as UserProfileRecord;
        const updated: UserProfileRecord = {
          uid: firebaseUser.uid,
          provider,
          role: existing.role || 'customer',
          createdAt: existing.createdAt || nowIso,
          updatedAt: nowIso,
          ...(firebaseUser.displayName ? { displayName: firebaseUser.displayName.slice(0, 120) } : existing.displayName ? { displayName: existing.displayName } : {}),
          ...(firebaseUser.email ? { email: firebaseUser.email.slice(0, 180) } : existing.email ? { email: existing.email } : {}),
          ...(firebaseUser.phoneNumber ? { phoneNumber: firebaseUser.phoneNumber.slice(0, 32) } : existing.phoneNumber ? { phoneNumber: existing.phoneNumber } : {}),
          ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL.slice(0, 500) } : existing.photoURL ? { photoURL: existing.photoURL } : {}),
        };
        await setDoc(userRef, updated);
        setProfile(updated);
      } else {
        const created: UserProfileRecord = {
          uid: firebaseUser.uid,
          provider,
          role: 'customer',
          createdAt: nowIso,
          updatedAt: nowIso,
          ...(firebaseUser.displayName ? { displayName: firebaseUser.displayName.slice(0, 120) } : {}),
          ...(firebaseUser.email ? { email: firebaseUser.email.slice(0, 180) } : {}),
          ...(firebaseUser.phoneNumber ? { phoneNumber: firebaseUser.phoneNumber.slice(0, 32) } : {}),
          ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL.slice(0, 500) } : {}),
        };
        await setDoc(userRef, created);
        setProfile(created);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (!nextUser) {
        setProfile(null);
        return;
      }
      void syncUserProfile(nextUser).catch(() => {
        // Error already logged cleanly via handleFirestoreError
      });
    });
    return () => unsub();
  }, [syncUserProfile]);

  // Sync LIVE TV watchlist with Firestore when authenticated; fallback to localStorage for guests
  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem(WATCHLIST_LOCAL_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setWatchlistIds(parsed);
        }
      } catch {
        // ignore
      }
      return;
    }

    const colPath = `users/${user.uid}/watchlist`;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'watchlist'),
      (snap) => {
        const ids = snap.docs.map((d) => d.id);
        setWatchlistIds(ids);
        try {
          localStorage.setItem(WATCHLIST_LOCAL_KEY, JSON.stringify(ids));
        } catch {
          // ignore
        }
      },
      (err) => {
        console.error('Watchlist sync error:', err.message, colPath);
      },
    );
    return () => unsub();
  }, [user]);

  const toggleWatchlistChannel = useCallback(
    async (channel: LiveTvChannel): Promise<boolean> => {
      const exists = watchlistIds.includes(channel.id);
      if (user) {
        const itemPath = `users/${user.uid}/watchlist/${channel.id}`;
        const itemRef = doc(db, 'users', user.uid, 'watchlist', channel.id);
        try {
          if (exists) {
            await deleteDoc(itemRef);
            return false;
          } else {
            await setDoc(itemRef, {
              channelId: channel.id,
              channelName: channel.name.slice(0, 140),
              category: channel.category.slice(0, 60),
              addedAt: new Date().toISOString(),
            });
            return true;
          }
        } catch (err) {
          handleFirestoreError(err, exists ? OperationType.DELETE : OperationType.WRITE, itemPath);
        }
      }

      // Guest localStorage persistence
      let added = false;
      setWatchlistIds((prev) => {
        const has = prev.includes(channel.id);
        added = !has;
        const next = has ? prev.filter((id) => id !== channel.id) : [...prev, channel.id];
        try {
          localStorage.setItem(WATCHLIST_LOCAL_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      return added;
    },
    [user, watchlistIds],
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await syncUserProfile(cred.user, 'google.com');
      setIsAuthModalOpen(false);
    } catch (err) {
      throw formatFirebaseAuthError(err, 'Google');
    }
  }, [syncUserProfile]);

  const signInWithFacebook = useCallback(async () => {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('public_profile');
      provider.addScope('email');
      const cred = await signInWithPopup(auth, provider);
      await syncUserProfile(cred.user, 'facebook.com');
      setIsAuthModalOpen(false);
    } catch (err) {
      throw formatFirebaseAuthError(err, 'Facebook');
    }
  }, [syncUserProfile]);

  const signInWithGitHub = useCallback(async () => {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('user:email');
      const cred = await signInWithPopup(auth, provider);
      await syncUserProfile(cred.user, 'github.com');
      setIsAuthModalOpen(false);
    } catch (err) {
      throw formatFirebaseAuthError(err, 'GitHub');
    }
  }, [syncUserProfile]);

  const signInWithTikTok = useCallback(async () => {
    try {
      const provider = new OAuthProvider('oidc.tiktok');
      provider.addScope('user.info.basic');
      const cred = await signInWithPopup(auth, provider);
      await syncUserProfile(cred.user, 'oidc.tiktok');
      setIsAuthModalOpen(false);
    } catch (err) {
      throw formatFirebaseAuthError(err, 'TikTok (OIDC)');
    }
  }, [syncUserProfile]);

  const sendPhoneOtp = useCallback(async (phoneE164: string, recaptchaContainerId: string) => {
    try {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
      });
      recaptchaRef.current = verifier;
      const result = await signInWithPhoneNumber(auth, phoneE164.trim(), verifier);
      confirmationRef.current = result;
      setHasPendingPhoneOtp(true);
    } catch (err) {
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaRef.current = null;
      }
      throw formatFirebaseAuthError(err, 'Phone SMS');
    }
  }, []);

  const verifyPhoneOtp = useCallback(
    async (code: string) => {
      if (!confirmationRef.current) {
        throw new Error('Request an SMS code first before verifying.');
      }
      try {
        const cred = await confirmationRef.current.confirm(code.trim());
        await syncUserProfile(cred.user, 'phone');
        confirmationRef.current = null;
        setHasPendingPhoneOtp(false);
        setIsAuthModalOpen(false);
      } catch (err) {
        throw formatFirebaseAuthError(err, 'Phone SMS');
      }
    },
    [syncUserProfile],
  );

  const resetPhoneOtp = useCallback(() => {
    confirmationRef.current = null;
    setHasPendingPhoneOtp(false);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        signInWithGoogle,
        signInWithFacebook,
        signInWithGitHub,
        signInWithTikTok,
        sendPhoneOtp,
        verifyPhoneOtp,
        hasPendingPhoneOtp,
        resetPhoneOtp,
        signOutUser,
        watchlistIds,
        toggleWatchlistChannel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
