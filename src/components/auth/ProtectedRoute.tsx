
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

type ProtectedRouteProps = {
  redirectPath?: string;
};

export const ProtectedRoute = ({ redirectPath = '/auth' }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
