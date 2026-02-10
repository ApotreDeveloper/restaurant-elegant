
export const validateEnv = () => {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  // Safely access env, defaulting to empty object if undefined to prevent crash
  const env = (import.meta as any).env || {};
  
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}.
Please check your .env file.`
    );
    // In development we might want to throw, but in production we might want to render a friendly error UI instead of crashing the root.
    // For now, logging error is sufficient as Supabase client will fail gracefully-ish with warnings already added there.
  }
};
