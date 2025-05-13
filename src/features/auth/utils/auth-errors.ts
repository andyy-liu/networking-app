import { AuthError } from "@supabase/supabase-js";

/**
 * Maps Supabase auth error codes to user-friendly messages
 */
export const getAuthErrorMessage = (error: AuthError | null): string => {
  if (!error) return "";

  // Common auth error messages
  switch (error.message) {
    case "Invalid login credentials":
      return "The email or password you entered is incorrect.";
    case "Email not confirmed":
      return "Please check your email and confirm your account before logging in.";
    case "User already registered":
      return "An account with this email already exists.";
    case "Password should be at least 6 characters":
      return "Password must be at least 6 characters long.";
    case "For security purposes, you can only request this once every 60 seconds":
      return "Please wait a minute before requesting another password reset.";
    case "Email rate limit exceeded":
      return "Too many attempts. Please try again later.";
    case "Network request failed":
      return "Unable to connect to authentication service. Please check your internet connection.";
    default:
      // If it's an unknown error, return a generic message
      return error.message || "An unexpected error occurred. Please try again.";
  }
};

/**
 * Handle common auth errors and return appropriate actions
 */
export const handleAuthError = (error: AuthError | null): { 
  message: string;
  action?: "retry" | "reset-password" | "contact-support";
} => {
  const message = getAuthErrorMessage(error);
  
  if (!error) return { message: "" };

  // Determine suggested action based on error
  if (error.message.includes("Invalid login credentials")) {
    return {
      message,
      action: "reset-password"
    };
  }
  
  if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
    return {
      message,
      action: "retry"
    };
  }

  if (error.status >= 500) {
    return {
      message: "Authentication service is currently unavailable. Please try again later.",
      action: "contact-support"
    };
  }

  return { message };
};
