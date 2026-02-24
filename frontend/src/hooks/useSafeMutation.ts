/**
 * Safe GraphQL Mutation Hook
 * Provides error handling and null safety for GraphQL mutations
 */

import { useMutation } from '@apollo/client/react';
import { DocumentNode, OperationVariables } from '@apollo/client';
import { useState, useCallback } from 'react';

interface SafeMutationResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | undefined;
  execute: (variables?: OperationVariables) => Promise<T | null>;
  reset: () => void;
}

interface SafeMutationOptions<T> {
  onCompleted?: (data: T) => void;
  onError?: (error: Error) => void;
  refetchQueries?: Array<{ query: DocumentNode; variables?: OperationVariables }>;
}

export function useSafeMutation<T = unknown>(
  mutation: DocumentNode,
  options?: SafeMutationOptions<T>
): SafeMutationResult<T> {
  const [mutationResult, setMutationResult] = useState<{
    data: T | null;
    error: Error | undefined;
  }>({
    data: null,
    error: undefined,
  });

  const [executeMutation, { loading }] = useMutation<T>(mutation, {
    onError: (error) => {
      console.error('GraphQL mutation error:', error);
      setMutationResult({ data: null, error });
      options?.onError?.(error);
    },
    onCompleted: (data) => {
      setMutationResult({ data, error: undefined });
      options?.onCompleted?.(data);
    },
    refetchQueries: options?.refetchQueries,
  });

  const execute = useCallback(
    async (variables?: OperationVariables): Promise<T | null> => {
      try {
        const result = await executeMutation({ variables });

        if (result.error) {
          setMutationResult({ data: null, error: result.error });
          return null;
        }

        const data = result.data ?? null;
        setMutationResult({ data, error: undefined });
        return data;
      } catch (error) {
        console.error('Mutation execution failed:', error);
        const err = error instanceof Error ? error : new Error(String(error));
        setMutationResult({ data: null, error: err });
        return null;
      }
    },
    [executeMutation]
  );

  const reset = useCallback(() => {
    setMutationResult({ data: null, error: undefined });
  }, []);

  return {
    data: mutationResult.data,
    loading,
    error: mutationResult.error,
    execute,
    reset,
  };
}

/**
 * Helper to safely extract data from GraphQL mutation result
 */
export function extractMutationData<T>(result: T | null | undefined): T | null {
  if (!result) return null;
  return result;
}
