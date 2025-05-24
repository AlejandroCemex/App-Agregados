import { useParams as useNextParams } from 'next/navigation';

/**
 * A wrapper around Next.js useParams hook that safely handles the params
 * by ensuring they are properly typed and extracted.
 * 
 * @returns The route params with appropriate typing
 */
export function useParams<T extends Record<string, string>>(): T {
  const params = useNextParams();
  // Params are already resolved in the client component context
  return params as T;
} 