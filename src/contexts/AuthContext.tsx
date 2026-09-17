import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Auth context.
 *
 * WHAT CHANGED AND WHY
 * This previously wrapped Supabase magic-link auth. No UI anywhere called
 * `signInWithMagicLink`, so a session was never established and `user` was
 * permanently `null`. The Supabase project behind it had also been deleted, so
 * even with a UI every call would have failed at DNS.
 *
 * The only consumer is `Index.tsx`, doing `if (user) { save the reading }`. With
 * `user` always null that branch never ran, so removing auth changes no
 * behaviour a visitor can observe — it removes a dead network dependency and a
 * dead hostname from the shipped bundle.
 *
 * The shape is kept deliberately, so call sites stay stable and a real backend
 * can be reintroduced without touching consumers. `signInWithMagicLink` now
 * reports honestly that sign-in is unavailable instead of failing silently
 * against a host that does not resolve.
 */

interface AuthContextType {
  user: { id: string; email?: string } | null;
  session: { access_token: string } | null;
  loading: boolean;
  /** Sign-in is not currently offered. Kept so call sites remain stable. */
  signInWithMagicLink: (email: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  signInWithMagicLink: async () => ({
    error: new Error("Sign-in is not available in this version."),
  }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const UNAVAILABLE = () =>
  Promise.resolve({ error: new Error("Sign-in is not available in this version.") });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useState<AuthContextType["user"]>(null);
  const [session] = useState<AuthContextType["session"]>(null);

  return (
    <AuthContext.Provider
      value={{ user, session, loading: false, signInWithMagicLink: UNAVAILABLE, signOut: async () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
};
