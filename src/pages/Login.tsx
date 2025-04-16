
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getAuthUrl } from '@/lib/hubspot';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from || '/dashboard';
  
  useEffect(() => {
    console.log('Login page effect running, loading:', loading, 'isAuthenticated:', isAuthenticated, 'redirect to:', from);
    
    // Wait until auth is loaded before making decisions
    if (!loading) {
      if (isAuthenticated) {
        console.log('User already authenticated, redirecting from login to:', from);
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, from]);
  
  const handleLogin = async () => {
    if (isLoggingIn) return; // Prevent multiple clicks
    
    try {
      setIsLoggingIn(true);
      console.log('Initiating login process');
      const authUrl = await getAuthUrl();
      console.log('Redirecting to auth URL:', authUrl);
      
      // Add a small delay to allow logs to be sent before redirecting
      setTimeout(() => {
        // Use window.location.href for a full page navigation to avoid React Router issues
        window.location.href = authUrl;
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to initiate login. Please try again.');
      setIsLoggingIn(false);
    }
  };
  
  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813]"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#2E1813]">Sales Meetings Manager</h1>
          <p className="text-gray-600 mt-2">Connect with your HubSpot account to manage your sales meetings</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-6 bg-[#FF7A59] hover:bg-[#FF8F73] text-white"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg 
                  className="w-5 h-5 mr-2" 
                  viewBox="0 0 512 512" 
                  fill="currentColor"
                >
                  <path d="M93.667 152.777h61.731v206.446h-61.731zM214.942 152.777h59.87v30.499c10.88-16.359 38.03-34.922 78.885-34.922 55.195 0 88.32 36.329 88.32 114.005v96.864h-62.172v-88.594c0-46.755-16.359-65.583-49.078-65.583-27.739 0-54.557 19.093-54.557 65.92v88.257h-61.268zM256 0C114.615 0 0 114.615 0 256s114.615 256 256 256 256-114.615 256-256S397.385 0 256 0z" />
                </svg>
                Sign in with HubSpot
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
