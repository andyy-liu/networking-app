import { supabase } from "@/lib/client";
import { Session, User, AuthError } from "@supabase/supabase-js";

// Get current session and user
export async function getSession(): Promise<{ session: Session | null; user: User | null }> {
  const { data } = await supabase.auth.getSession();
  return {
    session: data.session,
    user: data.session?.user ?? null
  };
}

// sign in with email and password
export async function signInWithPassword(email: string, password: string): Promise<{ 
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}> {
  console.log("Calling Supabase signInWithPassword for:", email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase auth response:", { 
      hasUser: !!data?.user, 
      hasSession: !!data?.session,
      hasError: !!error,
      errorMessage: error?.message || "none"
    });

    if (error) {
      console.error("Supabase auth error:", error.message);
    } else if (data?.user && data?.session) {
      console.log("Supabase auth success - user and session found");
    } else {
      console.warn("Supabase auth partial success - missing user or session");
    }

    return { 
      user: data?.user ?? null,
      session: data?.session ?? null,
      error 
    };
  } catch (err) {
    const error = err as AuthError;
    console.error("Unexpected error during sign in:", error);
    return {
      user: null,
      session: null,
      error
    };
  }
}

// register with email and password
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

// sign in with OAuth
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

// sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  console.log("Auth service: Calling Supabase signOut");
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error during Supabase signOut:", error.message);
    } else {
      console.log("Supabase signOut successful");
    }
    
    return { error };
  } catch (err) {
    const error = err as AuthError;
    console.error("Unexpected error during signOut:", error);
    return { error };
  }
}

// reset password
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

// update password
export async function updatePassword(password: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error };
}

// update user profile
export async function updateProfile(displayName: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });
  return { error };
}

// auth state change listener
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  console.log("Setting up auth state change listener");
  
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Auth state change detected: ${event}`, { 
      hasSession: !!session,
      userId: session?.user?.id
    });
    callback(event, session);
  });
  
  return data.subscription;
}