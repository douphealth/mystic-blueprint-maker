import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import PaymentSuccess from "../pages/PaymentSuccess";
import Index from "../pages/Index";
import { saveProfile, isPremiumUnlocked, loadProfile } from "../lib/entitlement";

/**
 * These tests cover the loop that used to be broken: a paying customer landed
 * on /payment-success and had nothing to download.
 *
 * jsPDF is mocked because these assertions are about *delivery wiring*, not
 * layout. Real-engine PDF coverage lives in blueprintPdf.test.ts.
 */

const mockSave = vi.fn();

vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    addPage: vi.fn(),
    save: mockSave,
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

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signInWithMagicLink: vi.fn(), signOut: vi.fn() }),
}));

// Hoisted so the mock factory below can close over it.
const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    functions: { invoke: mockInvoke },
    auth: {
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

/** The default the suite runs under: the backend is unreachable. */
const backendDown = () => mockInvoke.mockRejectedValue(new TypeError("Failed to fetch"));

/** The backend answers. */
const backendSays = (payload: Record<string, unknown>) =>
  mockInvoke.mockResolvedValue({ data: payload, error: null });

const renderAt = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("paid delivery", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockSave.mockClear();
  });

  it("stores the profile so a later page can rebuild the reading", () => {
    saveProfile("Amara Nightingale", new Date("1990-05-15T00:00:00.000Z"));
    const stored = loadProfile();
    expect(stored?.name).toBe("Amara Nightingale");
    expect(stored?.dob).toBe("1990-05-15");
  });

  it("ignores an empty name or an invalid date", () => {
    saveProfile("", new Date("1990-05-15"));
    expect(loadProfile()).toBeNull();
    saveProfile("Someone", new Date("not a date"));
    expect(loadProfile()).toBeNull();
  });

  it("hands the premium PDF to a buyer whose profile is still stored", async () => {
    saveProfile("Amara Nightingale", new Date("1990-05-15T00:00:00.000Z"));

    renderAt(<PaymentSuccess />);

    // the download card is present...
    expect(await screen.findByText(/Premium Edition · Unlocked/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Premium Edition/i })).toBeInTheDocument();
    // ...and it fires automatically, so the buyer gets the file without hunting
    await vi.waitFor(() => expect(mockSave).toHaveBeenCalled(), { timeout: 5000 });
    // the entitlement is recorded, which is what turns the paywall off
    expect(isPremiumUnlocked()).toBe(true);
  });

  it("asks for the details again rather than delivering nothing", async () => {
    // no stored profile — different browser, or storage unavailable
    renderAt(<PaymentSuccess />);

    expect(await screen.findByText(/Full birth name/i)).toBeInTheDocument();
    expect(screen.queryByText(/Premium Edition · Unlocked/i)).not.toBeInTheDocument();
  });

  it("generates the premium edition from manually entered details", async () => {
    const { container } = renderAt(<PaymentSuccess />);

    fireEvent.change(await screen.findByPlaceholderText(/birth certificate/i), {
      target: { value: "Amara Nightingale" },
    });
    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).not.toBeNull();
    fireEvent.change(dateInput as Element, { target: { value: "1990-05-15" } });
    fireEvent.click(screen.getByText(/Generate My Premium Edition/i));

    expect(await screen.findByText(/Premium Edition · Unlocked/i)).toBeInTheDocument();
    await vi.waitFor(() => expect(mockSave).toHaveBeenCalled(), { timeout: 5000 });
  });

  it("rejects an incomplete manual entry with a clear message", async () => {
    renderAt(<PaymentSuccess />);
    fireEvent.click(await screen.findByText(/Generate My Premium Edition/i, {}, { timeout: 8000 }));
    expect(await screen.findByText(/enter the full name/i)).toBeInTheDocument();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("shows the download instead of the paywall to a returning buyer", async () => {
    window.localStorage.setItem("md:premium-unlocked", new Date().toISOString());

    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, search: "?name=Jane+Doe&dob=1995-10-22" },
    });

    render(<Index />);

    expect(await screen.findByText(/Premium Edition · Unlocked/i, {}, { timeout: 20000 })).toBeInTheDocument();
    // the upsell must not be shown a second time
    expect(screen.queryByText(/Unlock The Premium Edition/i)).not.toBeInTheDocument();
  }, 30_000);
});
