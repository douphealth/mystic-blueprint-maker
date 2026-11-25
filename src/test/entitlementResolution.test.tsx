import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { STRIPE_PAYMENT_LINK, startCheckout } from "../lib/premiumApi";
import { resolveEntitlement, isPremiumUnlocked, loadBuyerEmail, saveBuyerEmail } from "../lib/entitlement";
import RestorePurchase from "../components/RestorePurchase";

/**
 * The revenue path.
 *
 * These tests intercept `fetch`, the real transport, rather than mocking the
 * backend module. That distinction is not cosmetic: the previous revision of
 * this suite mocked `supabase.functions.invoke`, which meant it stayed green
 * while the Supabase project behind that client had been deleted. Mocking the
 * thing under test is what hid the outage, so it is not done here.
 *
 * Two facts about the deployed environment shape every assertion here:
 *
 *   1. The backend is now this site's WordPress install. When it is unreachable,
 *      the fallback chain is the code path that runs — and it must never cost a
 *      paying customer their file, because the PDF is generated in the browser.
 *   2. A transport failure must resolve as "inconclusive", never as "not
 *      entitled". Those are different states and conflating them locks out
 *      buyers who did nothing wrong.
 */

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));

vi.stubGlobal("fetch", mockFetch);

vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    addPage: vi.fn(),
    save: vi.fn(),
    text: vi.fn(),
    rect: vi.fn(),
    roundedRect: vi.fn(),
    line: vi.fn(),
    circle: vi.fn(),
    link: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    setFillColor: vi.fn(),
    addFileToVFS: vi.fn(),
    addFont: vi.fn(),
    setCharSpace: vi.fn(),
    getCharSpace: vi.fn().mockReturnValue(0),
    setLineDashPattern: vi.fn(),
    output: vi.fn().mockReturnValue(new ArrayBuffer(8)),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    splitTextToSize: vi.fn().mockImplementation((txt) => [txt]),
    getTextWidth: vi.fn().mockReturnValue(10),
  })),
}));

/** A reachable backend that answers with the given JSON body. */
const backendSays = (payload: Record<string, unknown>) =>
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });

/** The backend is unreachable — DNS failure, offline, timeout. */
const backendDown = () => mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

/** A reachable backend that returns an HTTP error. */
const backendErrors = (status = 500) =>
  mockFetch.mockResolvedValue({ ok: false, status, json: async () => ({}) });

beforeEach(() => {
  window.localStorage.clear();
  mockFetch.mockReset();
  backendDown();
});

describe("checkout", () => {
  it("falls back to the live payment link when the backend is unreachable", async () => {
    const result = await startCheckout();

    expect(result.mode).toBe("link");
    expect(result.url).toBe(STRIPE_PAYMENT_LINK);
  });

  it("still prefills the buyer's email on the fallback link", async () => {
    const result = await startCheckout("Amara@Example.com");

    expect(result.mode).toBe("link");
    expect(result.url).toContain("prefilled_email=amara%40example.com");
  });

  it("prefers the server-created session when the backend answers", async () => {
    backendSays({ url: "https://checkout.stripe.com/c/pay/cs_test_123" });

    const result = await startCheckout("amara@example.com");

    expect(result.mode).toBe("server");
    expect(result.url).toContain("cs_test_123");
  });

  it("falls back rather than surfacing an error when the backend 500s", async () => {
    backendErrors(500);

    const result = await startCheckout();

    expect(result.mode).toBe("link");
  });

  it("prefills the buyer email on the Stripe link fallback", async () => {
    backendDown();

    const result = await startCheckout("Amara@Example.com ");

    expect(result.mode).toBe("link");
    expect(result.url).toContain("prefilled_email=amara%40example.com");
  });

  it("uses the restore URL the backend returns for an already-entitled buyer", async () => {
    // The backend answers with a restore URL rather than a checkout URL, so a
    // returning buyer is never charged twice.
    backendSays({
      url: "https://blueprint.mysticaldigits.com/?restore=1&email=amara%40example.com",
      mode: "already_entitled",
      entitled: true,
    });

    const result = await startCheckout("amara@example.com");

    expect(result.mode).toBe("server");
    expect(result.url).toContain("restore=1");
    expect(result.url).not.toContain("buy.stripe.com");
  });
});

describe("entitlement resolution", () => {
  it("does not unlock on a session id the backend cannot be reached to confirm", async () => {
    const result = await resolveEntitlement({ sessionId: "cs_live_abc" });

    expect(result.entitled).toBe(false);
    expect(result.pending).toBe(true);
    expect(result.inconclusive).toBe(true);
    expect(isPremiumUnlocked()).toBe(false);
  });

  it("does not unlock on a session id the backend has no record of", async () => {
    vi.useFakeTimers();
    try {
      backendSays({ entitled: false, reason: "not_found" });
      const pending = resolveEntitlement({ sessionId: "cs_live_madeup" });
      await vi.runAllTimersAsync();
      const result = await pending;

      expect(result.entitled).toBe(false);
      expect(result.pending).toBe(true);
      expect(isPremiumUnlocked()).toBe(false);
      // it polled for the webhook rather than giving up on the first miss
      expect(mockFetch.mock.calls.length).toBeGreaterThan(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reports a verified purchase when the backend confirms the session", async () => {
    backendSays({ entitled: true, email: "amara@example.com" });

    const result = await resolveEntitlement({ sessionId: "cs_test_abc" });

    expect(result.entitled).toBe(true);
    expect(result.source).toBe("server");
    expect(result.email).toBe("amara@example.com");
    expect(loadBuyerEmail()).toBe("amara@example.com");
  });

  it("restores by email when the backend finds the purchase", async () => {
    backendSays({ entitled: true, email: "amara@example.com" });

    const result = await resolveEntitlement({ email: "amara@example.com" });

    expect(result.entitled).toBe(true);
    expect(result.source).toBe("server");
  });

  it("declines a restore when the backend knows nothing and nothing is stored", async () => {
    backendSays({ entitled: false, reason: "not_found" });

    const result = await resolveEntitlement({ email: "stranger@example.com" });

    expect(result.entitled).toBe(false);
    expect(result.source).toBe("none");
    expect(isPremiumUnlocked()).toBe(false);
  });

  it("still grants when the backend says no but this browser bought under another address", async () => {
    backendSays({ entitled: false, reason: "not_found" });
    window.localStorage.setItem("md:premium-unlocked", new Date().toISOString());

    const result = await resolveEntitlement({ email: "other@example.com" });

    expect(result.entitled).toBe(true);
    expect(result.source).toBe("local");
  });

  it("reports no entitlement for a first-time visitor", async () => {
    const result = await resolveEntitlement();

    expect(result.entitled).toBe(false);
    expect(result.source).toBe("none");
  });

  it("unlocks nothing for a visitor with no session id and no address", async () => {
    const result = await resolveEntitlement({});

    expect(result.entitled).toBe(false);
    expect(isPremiumUnlocked()).toBe(false);
  });

  it("lets the restore lookup say no", async () => {
    backendSays({ entitled: false, reason: "not_found" });

    const result = await resolveEntitlement({ email: "stranger@example.com" });

    expect(result.entitled).toBe(false);
  });
});

/**
 * Answer by route, so a test can stand up the new backend (request-restore
 * exists) or the older one (request-restore is a 404) side by side.
 */
const routes = (table: Record<string, { status?: number; body?: Record<string, unknown> }>) =>
  mockFetch.mockImplementation(async (url: string) => {
    const hit = Object.entries(table).find(([path]) => String(url).endsWith(path));
    if (!hit) return { ok: false, status: 404, json: async () => ({ code: "rest_no_route" }) };
    const status = hit[1].status ?? 200;
    return { ok: status >= 200 && status < 300, status, json: async () => hit[1].body ?? {} };
  });

const calledPaths = () => mockFetch.mock.calls.map((c) => String(c[0]).replace(/^.*\/mdx\/v1/, ""));

describe("restore purchase UI", () => {
  it("emails an unlock link and does not unlock on a typed address", async () => {
    routes({ "/request-restore": { body: { ok: true } } });
    render(<RestorePurchase defaultEmail="" />);

    fireEvent.click(screen.getByText(/Already purchased\? Restore it/i));
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "amara@example.com" },
    });
    fireEvent.click(screen.getByText(/Email me a link/i));

    expect(await screen.findByText(/we've emailed it a/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(isPremiumUnlocked()).toBe(false);
    expect(calledPaths()).toEqual(["/request-restore"]);
  });

  it("gives the same answer whether or not the address bought anything", async () => {
    // The server replies ok either way; the UI must not hint at the difference.
    routes({ "/request-restore": { body: { ok: true } } });
    render(<RestorePurchase defaultEmail="stranger@example.com" startOpen />);
    fireEvent.click(screen.getByText(/Email me a link/i));

    expect(await screen.findByText(/has a Premium Edition purchase/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.queryByText(/couldn't find a purchase/i)).toBeNull();
  });

  it("falls back to the direct lookup against the older backend", async () => {
    routes({ "/verify-entitlement": { body: { entitled: true, email: "amara@example.com" } } });
    render(<RestorePurchase defaultEmail="amara@example.com" startOpen />);
    fireEvent.click(screen.getByText(/Email me a link/i));

    expect(await screen.findByText(/Purchase restored/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(isPremiumUnlocked()).toBe(true);
    expect(calledPaths()).toEqual(["/request-restore", "/verify-entitlement"]);
  });

  it("says so plainly when the older backend finds nothing", async () => {
    routes({ "/verify-entitlement": { body: { entitled: false, reason: "not_found" } } });
    render(<RestorePurchase defaultEmail="stranger@example.com" startOpen />);
    fireEvent.click(screen.getByText(/Email me a link/i));

    expect(await screen.findByText(/couldn't find a purchase/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(isPremiumUnlocked()).toBe(false);
  });

  it("says the server is unreachable rather than 'no purchase' when it is down", async () => {
    backendDown();
    render(<RestorePurchase defaultEmail="amara@example.com" startOpen />);
    fireEvent.click(screen.getByText(/Email me a link/i));

    expect(await screen.findByText(/couldn't reach our records/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(isPremiumUnlocked()).toBe(false);
  });

  it("rejects an address that is not an address", async () => {
    render(<RestorePurchase defaultEmail="" />);

    fireEvent.click(screen.getByText(/Already purchased\? Restore it/i));
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByText(/Email me a link/i));

    expect(await screen.findByText(/Enter the email address you used at checkout/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("prefills the address captured by the email gate", () => {
    saveBuyerEmail("amara@example.com");
    render(<RestorePurchase defaultEmail="amara@example.com" />);

    fireEvent.click(screen.getByText(/Already purchased\? Restore it/i));

    expect(screen.getByDisplayValue("amara@example.com")).toBeInTheDocument();
  });
});

describe("restore link token", () => {
  it("unlocks when the server confirms the token, and keeps the receipt", async () => {
    routes({
      "/verify-entitlement": {
        body: { entitled: true, email: "amara@example.com", receipt: { amount_total: 799, currency: "usd", purchased_at: "2026-11-25 10:00:00" } },
      },
    });
    const result = await resolveEntitlement({ restoreToken: "tok.sig" });
    expect(result).toMatchObject({ entitled: true, source: "server", email: "amara@example.com" });
    expect(result.receipt?.amount_total).toBe(799);
    expect(isPremiumUnlocked()).toBe(true);
    expect(JSON.parse(String(mockFetch.mock.calls[0][1].body))).toEqual({ token: "tok.sig" });
  });

  it("does not unlock on a token the server rejects", async () => {
    routes({ "/verify-entitlement": { body: { entitled: false, reason: "bad_token" } } });
    const result = await resolveEntitlement({ restoreToken: "forged" });
    expect(result.entitled).toBe(false);
    expect(isPremiumUnlocked()).toBe(false);
  });
});

describe("checkout for an existing buyer", () => {
  it("reports an emailed unlock link instead of a second checkout", async () => {
    routes({ "/create-payment": { body: { mode: "restore_sent", url: "", entitled: true } } });
    const result = await startCheckout("amara@example.com");
    expect(result.mode).toBe("restore_sent");
    expect(result.url).not.toContain("stripe.com");
  });
});
