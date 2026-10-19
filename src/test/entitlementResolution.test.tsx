import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveEntitlement, isPremiumUnlocked, saveBuyerEmail } from "../lib/entitlement";
import { startCheckout } from "../lib/premiumApi";
import { requestPurchaseRestore, completePurchaseRestore } from "../lib/wpBackend";

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.stubGlobal("fetch", mockFetch);
const backend = (data: Record<string, unknown>) => mockFetch.mockResolvedValue({
  ok: true, status: 200, json: async () => data,
});
const backendDown = () => mockFetch.mockRejectedValue(new TypeError("network offline"));

beforeEach(() => {
  mockFetch.mockReset();
  window.localStorage.clear();
});

describe("fail-closed premium entitlements", () => {
  it("ignores forged legacy unlock flags", async () => {
    localStorage.setItem("md:premium-unlocked", new Date().toISOString());
    expect(isPremiumUnlocked()).toBe(false);
    backend({ entitled: false, verified: false });
    expect((await resolveEntitlement()).entitled).toBe(false);
  });

  it("does not trust a forged success redirect or session ID", async () => {
    backend({ entitled: false, verified: false });
    const r = await resolveEntitlement({ sessionId: "cs_live_forged" });
    expect(r.entitled).toBe(false);
    expect(r.source).toBe("none");
  });

  it("does not accept server claims without explicit verified proof", async () => {
    backend({ entitled: true, verified: false });
    expect((await resolveEntitlement()).entitled).toBe(false);
  });

  it("only unlocks on positive server verification", async () => {
    backend({ entitled: true, verified: true, email: "buyer@example.com" });
    const r = await resolveEntitlement({ sessionId: "cs_test_real" });
    expect(r.entitled).toBe(true);
    expect(r.source).toBe("server");
  });

  it("fails closed when the verification backend is unreachable", async () => {
    backendDown();
    const r = await resolveEntitlement({ sessionId: "cs_live_forged" });
    expect(r.entitled).toBe(false);
    expect(r.inconclusive).toBe(true);
  });

  it("never accepts email address knowledge alone", async () => {
    saveBuyerEmail("buyer@example.com");
    backend({ entitled: false, verified: false });
    expect((await resolveEntitlement({email:"buyer@example.com"})).entitled).toBe(false);
  });
});

describe("secure checkout", () => {
  it("accepts server-provided Stripe-hosted checkout only", async () => {
    backend({url:"https://checkout.stripe.com/c/pay/safe"});
    const checkout=await startCheckout("buyer@example.com");
    expect(checkout.url).toContain("checkout.stripe.com");
    expect(mockFetch.mock.calls[0][1].credentials).toBe("include");
  });

  it("refuses a malicious or unexpected checkout URL", async () => {
    backend({url:"https://phishing.example/pay"});
    await expect(startCheckout()).rejects.toThrow("unexpected URL");
  });

  it("does not silently fall back to an unverified payment link", async () => {
    backendDown();
    await expect(startCheckout()).rejects.toThrow("temporarily unavailable");
  });
});

describe("purchase restoration transport", () => {
  it("requests a code instead of granting access from an email", async () => {
    backend({request_id:"abcdef0123456789abcdef0123456789"});
    await requestPurchaseRestore("buyer@example.com");
    expect(mockFetch.mock.calls[0][0]).toContain("/request-restore");
  });

  it("sends the one-time code to the server for verification", async () => {
    backend({entitled:true, verified:true});
    await completePurchaseRestore("abcdef0123456789abcdef0123456789", "12345678");
    expect(mockFetch.mock.calls[0][0]).toContain("/complete-restore");
    expect(mockFetch.mock.calls[0][1].body).toContain("12345678");
  });
});
