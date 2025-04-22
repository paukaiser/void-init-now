// src/components/LoginButton.tsx
import React from 'react';

const LoginButton = () => {
  const handleLogin = () => {
    globalThis.location.href = 'http://localhost:3000/auth/login'; // Update to backend URL
  };

  return (
    // deno-lint-ignore jsx-button-has-type
    <button
      onClick={handleLogin}
      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
    >
      Log in with HubSpot
    </button>
  );
};

export default LoginButton;
