
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    console.log('AuthGuard effect running, loading:', loading, 'isAuthenticated:', isAuthenticated, 'path:', location.pathname);
    
    // Only make auth decisions after the auth state is fully loaded
    if (!loading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login from:', location.pathname);
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname } 
        });
      }
      setAuthChecked(true);
    } else {
      console.log('Auth still loading, waiting before making auth decisions');
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);
  
  // Show loading spinner while auth is loading or being checked
  if (loading || !authChecked) {
    console.log('Showing loading spinner while checking auth');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813]"></div>
        <p className="ml-2 text-gray-700">Checking authentication...</p>
      </div>
    );
  }
  
  // For authenticated users, render children
  if (isAuthenticated) {
    console.log('User authenticated, rendering protected content');
    return <>{children}</>;
  }
  
  // This should not be visible as we redirect in the useEffect
  console.log('Showing fallback loading (should rarely happen)');
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813]"></div>
      <p className="ml-2 text-gray-700">Redirecting...</p>
    </div>
  );
};
