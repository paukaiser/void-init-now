
// src/components/LoginButton.tsx
import React, { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { getCurrentSession, hasUserHubspotToken } from "@/integrations/supabase/client";

const LoginButton = () => {
  const [hasHubspotConnection, setHasHubspotConnection] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const handleLogin = () => {
    globalThis.location.href = 'http://localhost:3000/auth/login'; // Update to backend URL
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
    <Button
      onClick={handleLogin}
      className="bg-[#E9A68A] hover:bg-[#d9957a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
    >
      {hasHubspotConnection ? 'Log in with HubSpot' : 'Connect with HubSpot'}
    </Button>
  );
};

export default LoginButton;
