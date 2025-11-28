"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { UserRole } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const provider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        setUserRole(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncProfile = async () => {
      if (!user) {
        setUserRole(null);
        return;
      }
      try {
        const token = await user.getIdToken();
        if (!token || cancelled) return;
        const response = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!cancelled && response.ok) {
          const data = await response.json();
          setUserRole(data.profile?.role ?? "user");
        }
      } catch (error) {
        console.error("Failed to sync user profile", error);
        setUserRole(null);
      }
    };

    syncProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userRole,
      loading,
      login: async () => {
        await signInWithPopup(firebaseAuth, provider);
      },
      logout: async () => {
        await signOut(firebaseAuth);
        setUserRole(null);
      },
      getToken: async () => {
        if (!firebaseAuth.currentUser) return null;
        return firebaseAuth.currentUser.getIdToken();
      },
    }),
    [user, userRole, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

