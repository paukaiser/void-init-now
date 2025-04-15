
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

const ProtectedLayout: React.FC = () => {
  const { session, loading } = useAuth();
  const currentDate = format(new Date(), 'dd MMM yyyy');
  
  // Add overflow hidden to body when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Show loading state or redirect if not authenticated
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Allo Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{currentDate}</span>
          <UserMenu />
        </div>
      </header>
      <main className="flex-grow p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
