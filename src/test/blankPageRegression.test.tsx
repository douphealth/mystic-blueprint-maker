import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import Index from "../pages/Index";

/**
 * Reproduction for the "page goes totally blank after unlocking" report.
 *
 * The results screen does `getInterpretation(type, n)!` with a non-null
 * assertion and passes the result straight into <NumerologySection>, which
 * immediately calls `interpretation.fullText.split(...)` during render.
 *
 * A name with no A/E/I/O/U (e.g. "Lynn Smyth") makes calculateSoulUrge return 0,
 * and a non-Latin name makes calculateExpression / calculateSoulUrge /
 * calculatePersonality all return 0. getInterpretation has no entry for 0, so
 * the assertion is a lie and the render throws. There is no error boundary in
 * App.tsx, so the whole tree unmounts and the user sees an empty dark page.
 */

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, session: null, loading: false }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    auth: {
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

const setSearch = (s: string) => {
  Object.defineProperty(window, "location", {
    writable: true,
    configurable: true,
    value: { ...window.location, search: s, href: "https://blueprint.mysticaldigits.com/" + s },
  });
};

describe("results screen robustness", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React logs the render error loudly; keep the output readable.
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => errSpy.mockRestore());

  it("renders normally for an ordinary name", () => {
    setSearch("?name=Jane+Doe&dob=1990-05-15");
    expect(() => render(<Index />)).not.toThrow();
  });

  it("does NOT blank the page for a name with no vowels", () => {
    // "Lynn Smyth" -> soul urge 0 -> soulUrgeInterpretations[0] === undefined
    setSearch("?name=Lynn+Smyth&dob=1990-05-15");
    let view!: ReturnType<typeof render>;
    expect(() => { view = render(<Index />); }).not.toThrow();
    // the page must actually contain the reading, not just fail to throw
    expect(view.container.textContent).toContain("Lynn Smyth");
    expect(view.container.textContent).toContain("Soul Urge");
    expect(view.container.textContent!.length).toBeGreaterThan(2000);
  });

  it("does NOT blank the page for a non-Latin name", () => {
    // every name number reduces to 0
    setSearch("?name=%D0%98%D0%B2%D0%B0%D0%BD+%D0%9F%D0%B5%D1%82%D1%80%D0%BE%D0%B2&dob=1990-05-15");
    let view!: ReturnType<typeof render>;
    expect(() => { view = render(<Index />); }).not.toThrow();
    expect(view.container.textContent!.length).toBeGreaterThan(2000);
  });

  it("does NOT blank the page for a digits-only name", () => {
    setSearch("?name=12345&dob=1990-05-15");
    expect(() => render(<Index />)).not.toThrow();
  });
});
