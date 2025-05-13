import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { AuthSpinner } from "./AuthSpinner";

type ProtectedRouteProps = {
  redirectPath?: string;
};

export const ProtectedRoute = ({
  redirectPath = "/auth",
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AuthSpinner message="Loading your account..." />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={redirectPath}
        replace
      />
    );
  }

  return <Outlet />;
};
