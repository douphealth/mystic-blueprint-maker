// ---------------------------------------------------------------------------
// Removed: the Supabase client.
//
// WHAT WAS HERE
// A generated Supabase client pointed at project ref `pqrnobnniqfxysztjrgo`, with
// a 24-character placeholder where a publishable JWT belongs. That project does
// not exist — the subdomain returns NXDOMAIN (Status 3) from both the Cloudflare
// and Google resolvers. A paused project still resolves and serves a wake-up
// page, which is how you can tell deletion from suspension.
//
// WHAT IT WAS USED FOR
//   * `supabase.auth.*` — magic-link sign-in. No UI ever called it, so `user`
//     was permanently null and the session was never established.
//   * `supabase.from("saved_readings").insert(...)` in Index.tsx — guarded by
//     `if (user)`, and `user` was always null, so it could never run. It wrote
//     to a table that does not exist, in a project that does not exist.
//   * `supabase.functions.invoke(...)` — entitlement and checkout. Now served by
//     this site's own WordPress backend; see `src/lib/wpBackend.ts`.
//
// WHY IT IS DELETED RATHER THAN FIXED
// Nothing reachable depended on it. Keeping a client around that silently fails
// every call is worse than removing it: it makes the module graph look like
// there is a second backend, and it kept a dead hostname in the shipped bundle.
//
// IF AUTH IS WANTED LATER
// Re-introduce it deliberately, against a project that exists, with a real key,
// and with a UI that actually calls it. `saved_readings` would need a table and
// an RLS policy written for it. Until then, readings live in localStorage via
// `src/lib/entitlement.ts`, which is what the product relies on today.
// ---------------------------------------------------------------------------

export {};
