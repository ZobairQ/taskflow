import { ApolloClient, InMemoryCache, HttpLink, from, ServerError } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import type { GraphQLFormattedError } from 'graphql';

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'same-origin',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

interface ErrorResponse {
  graphQLErrors?: ReadonlyArray<GraphQLFormattedError>;
  networkError?: Error | ServerError | null;
  operation?: any;
  forward?: any;
}

const errorLink = onError((errorResponse: ErrorResponse) => {
  const { graphQLErrors, networkError } = errorResponse;
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL Error]: ${message}`);

      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network Error]: ${networkError.message}`);
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          projects: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          tasks: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      Project: {
        keyFields: ['id'],
        fields: {
          tasks: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      Task: {
        keyFields: ['id'],
      },
      GamificationProfile: {
        keyFields: ['id'],
      },
      PomodoroSession: {
        keyFields: ['id'],
      },
      Template: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'cache-first',
    },
  },
});

export const setAuthToken = (token: string, refreshToken?: string) => {
  localStorage.setItem('token', token);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  client.clearStore();
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
