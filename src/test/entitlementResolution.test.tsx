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
  it("grants on a Stripe redirect even when the backend cannot be reached", async () => {
    const result = await resolveEntitlement({ sessionId: "cs_test_abc" });

    expect(result.entitled).toBe(true);
    expect(result.source).toBe("stripe-redirect");
    // recorded, so the paywall stays off on the next visit
    expect(isPremiumUnlocked()).toBe(true);
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

  it("delivers to a payment-link buyer who arrives with no session id", async () => {
    // The production checkout is a Stripe payment link, which does not reliably
    // put a session id on the success URL. This is the common case, not an edge
    // case: the buyer has paid, has a fresh browser, and has no local flag.
    const result = await resolveEntitlement({ trustRedirect: true });

    expect(result.entitled).toBe(true);
    expect(result.source).toBe("stripe-redirect");
    expect(isPremiumUnlocked()).toBe(true);
  });

  it("does not let the redirect trust leak into the restore path", async () => {
    // Same page, but the restore lookup must still be able to say no.
    backendSays({ entitled: false, reason: "not_found" });

    const result = await resolveEntitlement({ email: "stranger@example.com" });

    expect(result.entitled).toBe(false);
  });
});

describe("restore purchase UI", () => {
  it("asks for the address first and only then unlocks", async () => {
    render(<RestorePurchase defaultEmail="" />);

    fireEvent.click(screen.getByText(/Already purchased\? Restore it/i));
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();

    backendSays({ entitled: true, email: "amara@example.com" });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "amara@example.com" },
    });
    fireEvent.click(screen.getByText(/Restore my purchase/i));

    expect(await screen.findByText(/Purchase restored/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(isPremiumUnlocked()).toBe(true);
  });

  it("says so plainly when no purchase is found, without breaking", async () => {
    backendSays({ entitled: false, reason: "not_found" });
    render(<RestorePurchase defaultEmail="stranger@example.com" />);

    fireEvent.click(screen.getByText(/Already purchased\? Restore it/i));
    fireEvent.click(screen.getByText(/Restore my purchase/i));

    expect(await screen.findByText(/couldn't find a purchase/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(isPremiumUnlocked()).toBe(false);
  });

  it("rejects an address that is not an address", async () => {
    render(<RestorePurchase defaultEmail="" />);

    fireEvent.click(screen.getByText(/Already purchased\? Restore it/i));
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByText(/Restore my purchase/i));

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
