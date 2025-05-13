import { ReactNode, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { AuthContext, AuthContextType } from "../types";
import * as authService from "../services/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    async function loadSession() {
      const { session, user } = await authService.getSession();
      setSession(session);
      setUser(user);
      setLoading(false);
    }

    loadSession();

    // Listen for auth changes
    const subscription = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authService.signInWithPassword(email, password);
      return { error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await authService.signUp(email, password);
      return { error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await authService.signOut();
  };
  const updateProfile = async (displayName: string) => {
    try {
      const { error } = await authService.updateProfile(displayName);
      return { error };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await authService.updatePassword(newPassword);
      return { error };
    } catch (error) {
      console.error("Error updating password:", error);
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email);
      return { error };
    } catch (error) {
      console.error("Error sending reset password email:", error);
      return { error: error as Error };
    }
  };

  const signInWithOAuth = async (provider: "github" | "google") => {
    try {
      const { error } = await authService.signInWithOAuth(provider);
      return { error };
    } catch (error) {
      console.error("Error signing in with OAuth:", error);
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    resetPassword,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
