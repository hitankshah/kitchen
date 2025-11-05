import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, SUPABASE_CONFIG_ERROR, supabaseConfigurationError } from '../lib/supabase';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const configError = supabaseConfigurationError;
  const client = supabase;

  // Fetch user profile from DB
  const fetchProfile = async (userId) => {
    if (!client) return;
    
    try {
      const { data: profile, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Profile fetch error:', error);
        setUserProfile(null);
        setIsAdmin(false);
        return;
      }
      
      if (profile) {
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');
      } else {
        // Create fallback profile
        const { data: { user: authUser } } = await client.auth.getUser();
        if (authUser) {
          const fallbackProfile = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || 'Admin',
            phone: authUser.user_metadata?.phone || '',
            role: authUser.user_metadata?.role || 'admin',
            created_at: new Date().toISOString()
          };
          setUserProfile(fallbackProfile);
          setIsAdmin(fallbackProfile.role === 'admin');
        }
      }
    } catch (error) {
      console.error('Unexpected profile fetch error:', error);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    let mounted = true;

    if (!client) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
    
    const handleAuth = async (_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        if (mounted) setLoading(false);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        if (mounted) setLoading(false);
      }
    };
    
    const { data: { subscription } } = client.auth.onAuthStateChange(handleAuth);
    
    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuth('INITIAL_SESSION', session);
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [client]);

  // Auth actions
  const signIn = async (email, password) => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    const { data, error } = await client.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email first');
      }
      throw error;
    }

    // Check if user is admin
    if (data.user) {
      const { data: profile } = await client
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.role !== 'admin') {
        await client.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }
    }

    return data;
  };

  const signOut = async () => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const createAdmin = async (email, password, fullName) => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName, 
          role: 'admin' 
        } 
      }
    });

    if (error) throw error;

    if (data.user) {
      await client.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone: '',
        role: 'admin',
      });
    }

    return data;
  };

  const resetPassword = async (email) => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isAdmin,
      configError,
      signIn,
      signOut,
      createAdmin,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
