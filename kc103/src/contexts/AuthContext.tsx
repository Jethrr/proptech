import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  profileName: string | null;
  firstName: string | null;
  lastName: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfileName = async (): Promise<{ fullName: string | null; first: string | null; last: string | null }> => {
      try {
        const { profile } = await api.getProfile();
        const first = profile?.first_name ?? null;
        const last = profile?.last_name ?? null;
        const fullName = [first, last].filter(Boolean).join(" ").trim();
        return { fullName: fullName || null, first, last };
      } catch {
        return { fullName: null, first: null, last: null };
      }
    };

    const applyProfileFromApi = async () => {
      const result = await loadProfileName();
      if (!mounted) return;
      setProfileName(result.fullName);
      setFirstName(result.first);
      setLastName(result.last);
    };

    const bootstrap = async () => {
      try {
        // Use local session for instant boot. getUser() is network-bound and can delay the app.
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) {
          void applyProfileFromApi();
        } else {
          setProfileName(null);
          setFirstName(null);
          setLastName(null);
        }
      } catch {
        if (!mounted) return;
        setUser(null);
        setProfileName(null);
        setFirstName(null);
        setLastName(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        void applyProfileFromApi();
      } else {
        setProfileName(null);
        setFirstName(null);
        setLastName(null);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) throw error;

    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      await api.updateProfile(firstName, lastName);
      setFirstName(firstName);
      setLastName(lastName);
      setProfileName(`${firstName} ${lastName}`.trim());
    }
  };

  const logout = async () => {
    // Optimistically clear local auth state so route guards redirect immediately.
    setUser(null);
    setProfileName(null);
    setFirstName(null);
    setLastName(null);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    try {
      const { profile } = await api.getProfile();
      const nextFirst = profile?.first_name ?? null;
      const nextLast = profile?.last_name ?? null;
      const fullName = [nextFirst, nextLast].filter(Boolean).join(" ").trim();
      setProfileName(fullName || null);
      setFirstName(nextFirst);
      setLastName(nextLast);
    } catch {
      // Keep existing name values on error
    }
  };

  const value = useMemo(
    () => ({
      user,
      profileName,
      firstName,
      lastName,
      login,
      register,
      logout,
      refreshProfile,
      isAuthenticated: !!user,
      loading,
    }),
    [user, profileName, firstName, lastName, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

