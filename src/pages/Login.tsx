
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

declare global {
  interface Window {
    handleSignInWithGoogle: (response: any) => Promise<void>;
  }
}

const Login: React.FC = () => {
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [showClientIdInput, setShowClientIdInput] = useState<boolean>(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);

    window.handleSignInWithGoogle = async (response: any) => {
      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });
        
        if (error) throw error;
      } catch (error) {
        console.error('Error signing in with Google:', error);
        toast.error('Failed to sign in with Google. Please try again.');
      }
    };

    return () => {
      document.body.removeChild(script);
      delete window.handleSignInWithGoogle;
    };
  }, []);

  const handleSaveClientId = () => {
    if (!googleClientId) {
      toast.error('Please enter a valid Google Client ID');
      return;
    }
    
    localStorage.setItem('googleClientId', googleClientId);
    setShowClientIdInput(false);
    toast.success('Google Client ID saved!');
    
    // Force reload to initialize Google Sign-In with the new client ID
    window.location.reload();
  };

  // Get client ID from localStorage on component mount
  useEffect(() => {
    const savedClientId = localStorage.getItem('googleClientId');
    if (savedClientId) {
      setGoogleClientId(savedClientId);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Field Sales App</h1>
          <p className="mt-2 text-gray-600">Sign in to access your account</p>
        </div>
        
        <div className="pt-4">
          {showClientIdInput ? (
            <div className="mb-4 space-y-4">
              <h3 className="text-sm font-medium">Enter your Google Client ID</h3>
              <Input
                type="text"
                placeholder="Google Client ID"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveClientId}
                  className="w-full"
                >
                  Save Client ID
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowClientIdInput(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : googleClientId ? (
            // Only render the Google Sign-In button if we have a client ID
            <div className="flex justify-center my-4">
              <div
                id="g_id_onload"
                data-client_id={googleClientId}
                data-context="signin"
                data-ux_mode="popup"
                data-callback="handleSignInWithGoogle"
                data-auto_select="true"
                data-itp_support="true"
                data-use_fedcm_for_prompt="true"
              ></div>
              <div
                className="g_id_signin"
                data-type="standard"
                data-shape="pill"
                data-theme="outline"
                data-text="signin_with"
                data-size="large"
                data-logo_alignment="left"
              ></div>
            </div>
          ) : (
            <div className="mb-4">
              <Button 
                onClick={() => setShowClientIdInput(true)}
                className="w-full mb-4"
              >
                Configure Google Client ID
              </Button>
            </div>
          )}
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <Button 
            onClick={() => {
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/dashboard`,
                },
              });
            }}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </Button>

          {googleClientId && (
            <div className="mt-4 text-right">
              <button 
                onClick={() => setShowClientIdInput(true)} 
                className="text-xs text-gray-500 hover:text-blue-500"
              >
                Change Client ID
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
