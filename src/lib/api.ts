// Deprecated: Express API client has been removed. Use Supabase client instead.
// This stub remains to avoid import errors if any legacy imports linger.

type RequestArgs = any[];

function deprecatedCall(name: string): never {
  throw new Error(`[deprecated api.ts] '${name}' called. Migrate to Supabase client in '@/lib/supabase'.`);
}

export const api = {
  get: (..._args: RequestArgs) => deprecatedCall('get'),
  post: (..._args: RequestArgs) => deprecatedCall('post'),
  put: (..._args: RequestArgs) => deprecatedCall('put'),
  patch: (..._args: RequestArgs) => deprecatedCall('patch'),
  delete: (..._args: RequestArgs) => deprecatedCall('delete'),
  defaults: { headers: { common: {} as Record<string, string> } },
};

export function setAuthToken(_token?: string) {
  // No-op: Auth now handled by Supabase (`supabase.auth`)
}
