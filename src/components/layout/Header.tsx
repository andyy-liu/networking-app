import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LogOut } from "lucide-react";

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    const displayName = user?.user_metadata?.display_name;
    if (displayName) {
      const parts = displayName.split(" ");
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // Fall back to email initials if no display name
    if (!user?.email) return "U";
    const parts = user.email.split("@")[0].split(".");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Outreach Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-right mr-2">
                <div className="text-sm font-medium">Welcome back,</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.user_metadata?.display_name || user.email}
                </div>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => (window.location.href = "/auth")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
