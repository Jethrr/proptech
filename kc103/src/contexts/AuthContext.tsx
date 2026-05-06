import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  profileName: string | null;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const PROFILE_TIMEOUT_MS = 6000;

    const loadProfileName = async (): Promise<string | null> => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Profile request timed out")), PROFILE_TIMEOUT_MS);
      });

      const profile = await Promise.race([
        api.getProfile(),
        timeoutPromise,
      ]).catch(() => ({ profile: null }));

      const fullName = [profile.profile?.first_name, profile.profile?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      return fullName || null;
    };

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data.user ?? null);
        if (data.user) {
          const fullName = await loadProfileName();
          if (!mounted) return;
          setProfileName(fullName);
        } else {
          setProfileName(null);
        }
      } catch {
        if (!mounted) return;
        setUser(null);
        setProfileName(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        const fullName = await loadProfileName();
        if (!mounted) return;
        setProfileName(fullName);
      } else {
        setProfileName(null);
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
      setProfileName(`${firstName} ${lastName}`.trim());
    }
  };

  const logout = async () => {
    // Optimistically clear local auth state so route guards redirect immediately.
    setUser(null);
    setProfileName(null);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("Profile request timed out")), 6000);
    });
    const data = await Promise.race([api.getProfile(), timeoutPromise]).catch(
      () => ({ profile: null })
    );
    const fullName = [data.profile?.first_name, data.profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    setProfileName(fullName || null);
  };

  const value = useMemo(
    () => ({
      user,
      profileName,
      login,
      register,
      logout,
      refreshProfile,
      isAuthenticated: !!user,
      loading,
    }),
    [user, profileName, loading]
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

