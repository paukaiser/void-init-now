
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { supabase } from '@/lib/hubspot';

const OAuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleCallback = async () => {
      console.log('OAuth callback page loaded, processing authentication');
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      
      if (errorParam) {
        console.error('Auth error from HubSpot:', errorParam);
        setError(`Authorization error: ${errorParam}`);
        toast.error('Authorization failed. Please try again.');
        setProcessingAuth(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      
      if (!code) {
        console.error('No authorization code received');
        setError('No authorization code received');
        toast.error('No authorization code received. Please try again.');
        setProcessingAuth(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      
      try {
        console.log('Authorization code received:', code);
        // Exchange code for token using the Edge Function
        const { data, error } = await supabase.functions.invoke('hubspot-auth/exchange-token', {
          body: { code }
        });
        
        if (error) {
          throw new Error(`Token exchange error: ${error.message}`);
        }
        
        if (!data || !data.access_token) {
          throw new Error('Invalid token response received');
        }
        
        console.log('Token received, logging in user');
        
        await login(data);
        
        console.log('Login successful, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Error during OAuth callback:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete authentication');
        toast.error('Failed to complete authentication. Please try again.');
        setProcessingAuth(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    handleCallback();
  }, [login, navigate, location.search]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {error ? (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm text-gray-500">Redirecting you back to login...</p>
        </div>
      ) : (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E1813] mx-auto"></div>
          <h2 className="text-xl font-semibold mt-4">Completing authentication...</h2>
          <p className="mt-2 text-sm text-gray-500">Please wait while we process your HubSpot login</p>
        </div>
      )}
    </div>
  );
};

export default OAuthCallbackPage;
