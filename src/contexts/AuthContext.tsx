
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from "sonner";
import { refreshToken, getUserInfo } from '@/lib/hubspot';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  hub_id?: string;
  hub_domain?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (tokens: any) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<string | null>;
}

const LOCAL_STORAGE_KEY = 'hubspot_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      console.log('AuthContext: Loading authentication state');
      const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedAuth) {
        console.log('AuthContext: No stored auth found');
        setLoading(false);
        return;
      }
      
      try {
        const authData = JSON.parse(storedAuth) as AuthUser;
        console.log('AuthContext: Found stored auth, token expires at:', new Date(authData.expiresAt).toISOString());
        
        // Check if token is about to expire (within 5 minutes)
        if (authData.expiresAt - Date.now() < 5 * 60 * 1000) {
          // Token is about to expire, refresh it
          console.log('AuthContext: Token is about to expire, attempting to refresh');
          try {
            await refreshAuthToken(authData.refreshToken);
          } catch (error) {
            console.error('AuthContext: Failed to refresh token on init:', error);
            console.log('AuthContext: Clearing invalid auth data');
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setLoading(false);
            return;
          }
        } else {
          console.log('AuthContext: Token is still valid, setting user data');
          setUser(authData);
        }
      } catch (error) {
        console.error('AuthContext: Failed to load auth state:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      
      setLoading(false);
    };
    
    loadAuth();
  }, []);
  
  const refreshAuthToken = async (tokenToRefresh?: string): Promise<string | null> => {
    const refreshTokenToUse = tokenToRefresh || user?.refreshToken;
    
    if (!refreshTokenToUse) {
      console.error('AuthContext: No refresh token available');
      return null;
    }
    
    try {
      console.log('AuthContext: Refreshing auth token...');
      const data = await refreshToken(refreshTokenToUse);
      
      const updatedUser = {
        ...(user || {}),
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshTokenToUse,
        expiresAt: Date.now() + data.expires_in * 1000,
      } as AuthUser;
      
      console.log('AuthContext: Token refreshed successfully, expires:', new Date(updatedUser.expiresAt).toISOString());
      setUser(updatedUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
      
      return data.access_token;
    } catch (error) {
      console.error('AuthContext: Failed to refresh token:', error);
      // Only clear auth and redirect if this wasn't an initial load attempt
      if (!tokenToRefresh || tokenToRefresh === user?.refreshToken) {
        logout();
        toast.error('Your session has expired. Please log in again.');
      }
      return null;
    }
  };
  
  const login = async (tokens: any) => {
  console.log("AuthContext: Logging in user with tokens:", tokens);

  const user: AuthUser = {
    id: tokens.user_id || '',
    email: tokens.user_email || '',
    name: tokens.user_name || '',
    hub_id: tokens.hub_id || '',
    hub_domain: tokens.hub_domain || '',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
  };

  localStorage.setItem("hubspot_auth", JSON.stringify(user)); // 🔥 This is key
  setUser(user);
};
      
      console.log('AuthContext: Setting user data after successful login', authUser);
      setUser(authUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      toast.error('Failed to login. Please try again.');
      throw error;
    }
  };
  
  const logout = () => {
    console.log('AuthContext: Logging out user');
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info('You have been logged out.');
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated: !!user, 
        login, 
        logout,
        refreshAuthToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
