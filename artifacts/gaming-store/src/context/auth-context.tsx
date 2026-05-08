import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const syncUserProfile = useCallback(async (authUser: User | null) => {
    if (!authUser) return;
    const fallbackName = authUser.user_metadata?.name ?? authUser.email?.split("@")[0] ?? null;
    const fallbackAvatar = authUser.user_metadata?.avatar_url ?? null;

    await supabase.from("users").upsert(
      {
        supabase_id: authUser.id,
        email: authUser.email ?? "",
        name: fallbackName,
        avatar_url: fallbackAvatar,
        is_banned: false,
      },
      { onConflict: "supabase_id" }
    );
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoaded(true);
      void syncUserProfile(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoaded(true);
      void syncUserProfile(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [syncUserProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      isLoaded,
      isSignedIn: !!session?.user,
      signOut,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
