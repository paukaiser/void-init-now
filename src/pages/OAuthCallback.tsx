
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/lib/hubspot';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const OAuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      
      if (errorParam) {
        setError(`Authorization error: ${errorParam}`);
        toast.error('Authorization failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      
      if (!code) {
        setError('No authorization code received');
        toast.error('No authorization code received. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      
      try {
        const tokens = await getAccessToken(code);
        await login(tokens);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error during OAuth callback:', err);
        setError('Failed to complete authentication');
        toast.error('Failed to complete authentication. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    handleCallback();
  }, [login, navigate, location.search]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {error ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm text-gray-500">Redirecting you back to login...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813] mx-auto"></div>
          <h2 className="text-xl font-semibold mt-4">Completing authentication...</h2>
          <p className="mt-2 text-sm text-gray-500">Please wait while we process your HubSpot login</p>
        </div>
      )}
    </div>
  );
};

export default OAuthCallbackPage;
