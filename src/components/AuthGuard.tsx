
import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only redirect after loading is complete
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Show nothing during the initial loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813]"></div>
      </div>
    );
  }
  
  // For authenticated users, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // This should not be visible, but just in case
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813]"></div>
    </div>
  );
};
