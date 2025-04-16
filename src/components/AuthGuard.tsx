
import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

const PUBLIC_PATHS = ['/login', '/oauth-callback'];

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Skip redirect for public paths
    if (PUBLIC_PATHS.includes(location.pathname)) {
      return;
    }
    
    // Only redirect after loading is complete
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);
  
  // Show nothing during the initial loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813]"></div>
      </div>
    );
  }
  
  // For public routes or authenticated users, render children
  if (PUBLIC_PATHS.includes(location.pathname) || isAuthenticated) {
    return <>{children}</>;
  }
  
  // This should not be visible, but just in case
  return null;
};
