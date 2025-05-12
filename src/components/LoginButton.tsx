
import React, { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { getCurrentSession, hasUserHubspotToken } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LoginButton = () => {
  const [hasHubspotConnection, setHasHubspotConnection] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const checkHubspotConnection = async () => {
      const session = await getCurrentSession();
      if (session) {
        const hasConnection = await hasUserHubspotToken(session.user.id);
        setHasHubspotConnection(hasConnection);
      } else {
        setHasHubspotConnection(false);
      }
      setIsLoading(false);
    };

    checkHubspotConnection();
  }, [user]);

  const handleConnect = () => {
    if (user) {
      // User is already logged in, redirect to HubSpot OAuth
      window.location.href = 'https://rzuupvxigzdvnwlrcevo.supabase.co/functions/v1/hubspot-auth';
    } else {
      // Open login modal
      setIsLoginModalOpen(true);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSigningIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        toast.success('Signed in successfully');
        setIsLoginModalOpen(false);
        
        // Check if user has HubSpot connection, if not redirect to OAuth
        const hasConnection = await hasUserHubspotToken(data.user.id);
        setHasHubspotConnection(hasConnection);
        
        if (!hasConnection) {
          // Short delay before redirecting to HubSpot OAuth
          setTimeout(() => {
            window.location.href = 'https://rzuupvxigzdvnwlrcevo.supabase.co/functions/v1/hubspot-auth';
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
    setEmail('');
    setPassword('');
  };

  if (isLoading) {
    return (
      <Button
        disabled
        className="bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
      >
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleConnect}
        className="bg-[#E9A68A] hover:bg-[#d9957a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
      >
        {user ? (hasHubspotConnection ? 'Connected with HubSpot' : 'Connect with HubSpot') : 'Log In'}
      </Button>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6">Log in to your account</h2>
            
            <form onSubmit={handleSignIn}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9A68A]"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9A68A]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={handleCloseModal}
                  disabled={isSigningIn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E9A68A] hover:bg-[#d9957a] text-white font-medium rounded-md focus:outline-none"
                  disabled={isSigningIn}
                >
                  {isSigningIn ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginButton;
