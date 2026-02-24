import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client/react';
import { LOGIN, REGISTER, LOGOUT, REFRESH_TOKEN } from '../graphql/mutations';
import { GET_ME } from '../graphql/queries';
import { setAuthToken, clearAuthToken, isAuthenticated, getAuthToken } from '../lib/apollo';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuthPayload {
  token: string;
  refreshToken: string;
  user: User;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export function useAuth() {
  const client = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Type for GET_ME query result
  interface MeQueryResult {
    me: User;
  }

  // Query for current user
  const {
    data: meData,
    loading: meLoading,
    refetch: refetchMe,
    error: meError,
  } = useQuery<MeQueryResult>(GET_ME, {
    skip: !isAuthenticated(),
  });

  // Handle query result changes
  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
      localStorage.setItem('user', JSON.stringify(meData.me));
    }
    if (meError) {
      // Token might be invalid, clear it
      console.error('Auth query error:', meError);
      clearAuthToken();
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [meData, meError]);

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation<
    { login: AuthPayload },
    { input: LoginInput }
  >(LOGIN, {
    onCompleted: (data) => {
      if (!data?.login) {
        setError('Login failed: No data returned');
        return;
      }
      const { token, refreshToken, user } = data.login;
      if (!token || !user) {
        setError('Login failed: Invalid response');
        return;
      }
      setAuthToken(token, refreshToken);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setError(null);
    },
    onError: (err) => {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    },
  });

  // Register mutation
  const [registerMutation, { loading: registerLoading }] = useMutation<
    { register: AuthPayload },
    { input: RegisterInput }
  >(REGISTER, {
    onCompleted: (data) => {
      if (!data?.register) {
        setError('Registration failed: No data returned');
        return;
      }
      const { token, refreshToken, user } = data.register;
      if (!token || !user) {
        setError('Registration failed: Invalid response');
        return;
      }
      setAuthToken(token, refreshToken);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setError(null);
    },
    onError: (err) => {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    },
  });

  // Logout mutation
  const [logoutMutation] = useMutation(LOGOUT, {
    onCompleted: () => {
      clearAuthToken();
      setUser(null);
      localStorage.removeItem('user');
      client.resetStore();
    },
    onError: (err) => {
      // Still clear local state even if server logout fails
      console.error('Logout error:', err);
      clearAuthToken();
      setUser(null);
      localStorage.removeItem('user');
      client.resetStore();
    },
  });

  // Refresh token mutation
  const [refreshTokenMutation] = useMutation<{ refreshToken: AuthPayload }, { token: string }>(
    REFRESH_TOKEN
  );

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        // Try to get user from localStorage first for faster load
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // Invalid saved user, will refetch
          }
        }

        // Then verify with server
        try {
          await refetchMe();
        } catch {
          // If fetch fails, we might be offline
          // Keep the user from localStorage
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [refetchMe]);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await loginMutation({
          variables: { input: { email, password } },
        });
        return result.data?.login ?? null;
      } catch (error) {
        console.error('Login failed:', error);
        return null;
      }
    },
    [loginMutation]
  );

  // Register function
  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const result = await registerMutation({
          variables: { input: { email, password, name } },
        });
        return result.data?.register ?? null;
      } catch (error) {
        console.error('Registration failed:', error);
        return null;
      }
    },
    [registerMutation]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } catch (error) {
      // Still clear local state even if server logout fails
      console.error('Logout failed:', error);
      clearAuthToken();
      setUser(null);
      localStorage.removeItem('user');
      client.resetStore();
    }
  }, [logoutMutation, client]);

  // Refresh token function
  const refreshAuthToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await refreshTokenMutation({
      variables: { token: refreshToken },
    });

    if (result.data?.refreshToken) {
      const { token, refreshToken: newRefreshToken, user } = result.data.refreshToken;
      setAuthToken(token, newRefreshToken);
      setUser(user);
      return token;
    }

    throw new Error('Failed to refresh token');
  }, [refreshTokenMutation]);

  return {
    user,
    loading: loading || meLoading,
    loginLoading,
    registerLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuthToken,
    clearError: () => setError(null),
  };
}

export function useRequireAuth(redirectUrl = '/login') {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = redirectUrl;
    }
  }, [loading, isAuthenticated, redirectUrl]);

  return { user, loading, isAuthenticated };
}
