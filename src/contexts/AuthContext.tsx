
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<{ 
    ok: boolean; 
    needsEmailConfirm: boolean;
    error?: string;
  }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing session on mount
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { user } = session;
        setUser({ id: user.id, email: user.email ?? '', name: user.user_metadata?.name });
      }
    };
    initSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const { user } = session;
        setUser({ id: user.id, email: user.email ?? '', name: user.user_metadata?.name });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setIsLoading(false);
      return false;
    }
    if (data.session) {
      const { user } = data.session;
      setUser({ id: user.id, email: user.email ?? '', name: user.user_metadata?.name });
    }
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // First try to sign up - Supabase will handle the email uniqueness check
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin,
        },
      });

      // If we get a user already registered error
      // Supabase quirk: if email already exists but isn't confirmed yet,
      // signUp returns 200 without error but `identities` array is empty.
      if (data && data.user && Array.isArray((data.user as any).identities) && (data.user as any).identities.length === 0) {
        return {
          ok: false,
          needsEmailConfirm: false,
          error: 'This email is already in use. Please use a different email or sign in.'
        };
      }

      if (error && typeof error.message === 'string' && error.message.toLowerCase().includes('already registered')) {
        return { 
          ok: false, 
          needsEmailConfirm: false, 
          error: 'This email is already in use. Please use a different email or sign in.' 
        };
      }

      if (error) {
        console.error('Signup error:', error);
        return { 
          ok: false, 
          needsEmailConfirm: false, 
          error: error.message || 'Failed to create account. Please try again.' 
        };
      }

      return { 
        ok: true, 
        needsEmailConfirm: !data.session,
        error: null
      };
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      return { 
        ok: false, 
        needsEmailConfirm: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };



  const value = {
    user,
    login,
    signup,
    logout,

    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
