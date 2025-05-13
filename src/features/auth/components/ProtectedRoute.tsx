import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthSpinner } from "./AuthSpinner";

type ProtectedRouteProps = {
  redirectPath?: string;
};

export const ProtectedRoute = ({
  redirectPath = "/auth",
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", {
    isAuthenticated: !!user,
    isLoading: loading,
    currentPath: location.pathname,
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AuthSpinner message="Loading your account..." />
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to auth page");
    return (
      <Navigate
        to={redirectPath}
        replace
      />
    );
  }

  return <Outlet />;
};
