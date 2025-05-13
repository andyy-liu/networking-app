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
      try {
        const { session, user } = await authService.getSession();
        console.log("Initial auth state:", {
          hasSession: !!session,
          hasUser: !!user,
          userId: user?.id,
        });
        setSession(session);
        setUser(user);
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    // Listen for auth changes
    const subscription = authService.onAuthStateChange((event, session) => {
      console.log("Auth state change:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Starting signIn process");
      const {
        user: authUser,
        session: authSession,
        error,
      } = await authService.signInWithPassword(email, password);

      console.log("AuthContext: SignIn result:", {
        hasUser: !!authUser,
        hasSession: !!authSession,
        hasError: !!error,
        errorMessage: error?.message,
      });

      // If successful, update local state immediately
      if (authUser && authSession && !error) {
        console.log(
          "AuthContext: Setting user and session state after successful login"
        );
        setUser(authUser);
        setSession(authSession);
      } else if (error) {
        console.error("AuthContext: Error during sign in:", error.message);
      }

      return { error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error: error as Error };
    }
  };
  const signUp = async (email: string, password: string) => {
    try {
      const { user, session, error } = await authService.signUp(
        email,
        password
      );

      // If successful and confirmation is not required, update local state
      if (
        user &&
        session &&
        !error &&
        !user.identities?.[0]?.identity_data?.email_confirmed_at
      ) {
        setUser(user);
        setSession(session);
      }

      return { error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as Error };
    }
  };
  const signOut = async () => {
    try {
      console.log("Signing out user");
      const { error } = await authService.signOut();

      if (error) {
        console.error("Error signing out:", error);
      } else {
        // Explicitly clear state even if the Supabase auth state listener doesn't fire
        console.log("Sign out successful, clearing local state");
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
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
      // OAuth redirects to another page, so we don't need to manually update the state
      // The Auth state listener will handle the session update when the user returns
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
