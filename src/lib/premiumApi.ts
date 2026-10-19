import { wpCreatePayment, wpVerifyEntitlement } from "./wpBackend";

export interface VerifyResult {
  entitled: boolean;
  verified: boolean;
  email?: string;
  inconclusive: boolean;
}

/** Never authorize based on a redirect, email, localStorage, or an unverified checkout ID. */
export async function verifySession(sessionId?: string): Promise<VerifyResult> {
  const id = sessionId?.trim();
  const { data, error } = await wpVerifyEntitlement(id ? { session_id: id } : {}, 15000);
  if (error) return { entitled: false, verified: false, inconclusive: true };
  return {
    entitled: data?.entitled === true && data?.verified === true,
    verified: data?.verified === true,
    email: data?.email,
    inconclusive: data?.inconclusive === true,
  };
}

/** Server checkout only: no stale Payment Link and no silent fall-through. */
export async function startCheckout(email?: string): Promise<{url: string; mode: "server"}> {
  const cleanEmail = email?.trim().toLowerCase();
  const { data, error } = await wpCreatePayment({ email: cleanEmail }, 15000);
  if (error || !data?.url) throw new Error("Secure checkout is temporarily unavailable. Please try again later.");
  const url = new URL(data.url);
  if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") {
    throw new Error("The payment service returned an unexpected URL.");
  }
  return {url: url.toString(), mode: "server"};
}
