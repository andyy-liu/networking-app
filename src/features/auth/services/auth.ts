import { supabase } from "@/lib/client";
import { Session, User, AuthError } from "@supabase/supabase-js";

/**
 * Get the current session
 */
export async function getSession(): Promise<{ session: Session | null; user: User | null }> {
  const { data } = await supabase.auth.getSession();
  return {
    session: data.session,
    user: data.session?.user ?? null
  };
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email: string, password: string): Promise<{ 
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { 
    user: data?.user ?? null,
    session: data?.session ?? null,
    error 
  };
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<{ 
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}> {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password 
  });

  return { 
    user: data?.user ?? null,
    session: data?.session ?? null,
    error 
  };
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'facebook'): Promise<{ 
  error: AuthError | null 
}> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    });
    return { error };
  } catch (error) {
    console.error("Error signing in with OAuth:", error);
    return { error: error as AuthError };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

/**
 * Update user password
 */
export async function updatePassword(password: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error };
}

/**
 * Update user profile
 */
export async function updateProfile(displayName: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });
  return { error };
}

/**
 * Set up auth state change listener
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return data.subscription;
}