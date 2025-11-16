import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  supabase,
  SUPABASE_CONFIG_ERROR,
  supabaseConfigurationError
} from '../lib/supabase';
import { sanitizeInput, loginRateLimiter, signupRateLimiter } from '../lib/security';

// Validation functions
import {
  validateSignUp,
  validateSignIn,
  validateGuestInfo,
  validatePasswordReset
} from '../lib/validations';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const configError = supabaseConfigurationError;
  const client = supabase;

  // Fetch user profile from DB
  const fetchProfile = async (userId) => {
    if (!client) {
      return;
    }
    try {
      const { data: profile, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setUserProfile(null);
        return;
      }

      if (profile) {
        setUserProfile(profile);
      } else {
        // Create fallback profile if user not found in DB
        const { data: { user: authUser } } = await client.auth.getUser();
        if (authUser) {
          const fallbackProfile = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || 'User',
            phone: authUser.user_metadata?.phone || '',
            role: 'customer',
            created_at: new Date().toISOString()
          };
          setUserProfile(fallbackProfile);
        }
      }
    } catch (error) {
      console.error('Unexpected profile fetch error:', error);
      setUserProfile(null);
    }
  };

  // Listen for auth changes and fetch profile
  useEffect(() => {
    let mounted = true;
    let initialLoadDone = false;

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
        setIsGuest(false);
        setGuestInfo(null);
        if (mounted) setLoading(false);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
        setGuestInfo(null);
        setIsGuest(false);
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = client.auth.onAuthStateChange(handleAuth);

    // Get initial session only once
    if (!initialLoadDone) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (mounted) {
          initialLoadDone = true;
          handleAuth('INITIAL_SESSION', session);
        }
      });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [client]);

  // Auth actions
  const signUp = async (email, password, fullName, phone) => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    try {
      // Rate limiting check
      if (!signupRateLimiter.isAllowed(email)) {
        throw new Error('Too many signup attempts. Please try again later.');
      }

      // Validate input
      const validation = validateSignUp(email, password, fullName, phone);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError);
      }

      const sanitizedEmail = sanitizeInput(email);
      const sanitizedFullName = sanitizeInput(fullName);
      const sanitizedPhone = sanitizeInput(phone);

      const { data, error } = await client.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedFullName,
            phone: sanitizedPhone,
            role: 'customer'
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists.');
        } else if (error.message.includes('Password should be')) {
          throw new Error('Password must be at least 6 characters long.');
        }
        throw error;
      }

      if (data.user) {
        try {
          await client.from('users').insert({
            id: data.user.id,
            email: sanitizedEmail,
            full_name: sanitizedFullName,
            phone: sanitizedPhone,
            role: 'customer',
          });
        } catch (dbError) {
          // Don't throw here - user is created in auth, profile can be created later
          console.error('Profile creation error:', dbError);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    try {
      // Rate limiting check
      if (!loginRateLimiter.isAllowed(email)) {
        throw new Error('Too many login attempts. Please wait 15 minutes and try again.');
      }

      // Validate input
      const validation = validateSignIn(email, password);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError);
      }

      const sanitizedEmail = sanitizeInput(email);

      const { error } = await client.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });

      if (error) {
        // Handle specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before signing in.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        }
        throw error;
      } else {
        // Reset rate limiter on successful login
        loginRateLimiter.reset(email);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      // Clear guest state immediately
      setIsGuest(false);
      setGuestInfo(null);
      // Auth state change will handle the rest
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const continueAsGuest = (info) => {
    try {
      // Validate guest info
      const validation = validateGuestInfo(info.fullName, info.phone, info.email);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError);
      }

      const validatedInfo = {
        fullName: sanitizeInput(info.fullName),
        phone: sanitizeInput(info.phone),
        email: sanitizeInput(info.email)
      };

      setUser(null);
      setUserProfile(null);
      setGuestInfo(validatedInfo);
      setIsGuest(true);
      setLoading(false);
    } catch (error) {
      throw new Error('Invalid guest information provided.');
    }
  };

  const resendVerification = async (email) => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    try {
      const sanitizedEmail = sanitizeInput(email);
      const { error } = await client.auth.resend({ type: 'signup', email: sanitizedEmail });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    if (!client) {
      throw new Error(configError || SUPABASE_CONFIG_ERROR);
    }

    try {
      // Validate email
      const validation = validatePasswordReset(email);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError);
      }

      const sanitizedEmail = sanitizeInput(email);
      const { error } = await client.auth.resetPasswordForEmail(sanitizedEmail);
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      guestInfo,
      loading,
      isGuest,
      configError,
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      resendVerification,
      resetPassword,
      fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
