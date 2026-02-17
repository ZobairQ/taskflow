import { GraphQLError } from 'graphql';

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
    this.name = 'AuthenticationError';
  }
}

export class UserInputError extends GraphQLError {
  constructor(message: string, properties?: Record<string, any>) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        http: { status: 400 },
        ...properties,
      },
    });
    this.name = 'UserInputError';
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
    this.name = 'ForbiddenError';
  }
}

export class ApolloError extends GraphQLError {
  constructor(message: string, code?: string) {
    super(message, {
      extensions: {
        code: code || 'INTERNAL_SERVER_ERROR',
        http: { status: 500 },
      },
    });
    this.name = 'ApolloError';
  }
}
