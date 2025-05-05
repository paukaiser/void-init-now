
// src/components/LoginButton.tsx
import React from 'react';
import { Button } from "./ui/button";

const LoginButton = () => {
  const handleLogin = () => {
    globalThis.location.href = 'http://localhost:3000/auth/login'; // Update to backend URL
  };

  return (
    <Button
      onClick={handleLogin}
      className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
    >
      Log in with HubSpot
    </Button>
  );
};

export default LoginButton;
