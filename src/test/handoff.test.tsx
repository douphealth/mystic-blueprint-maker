import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { readHandoff } from "../lib/handoff";
import Index from "../pages/Index";
import EmailGate from "../components/EmailGate";

/**
 * The calculator on mysticaldigits.com links here with the birth date in the
 * URL fragment, so the visitor doesn't type it twice. And the email step must
 * not sign anyone up without a clear, ticked agreement.
 */

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.stubGlobal("fetch", mockFetch);

describe("readHandoff", () => {
  it("reads a valid birth date from the fragment", () => {
    expect(readHandoff({ hash: "#dob=1985-03-21&from=calculator" })).toEqual({ dob: "1985-03-21", from: "calculator" });
  });

  it("reads name and date from the free-Blueprint email link", () => {
    expect(readHandoff({ hash: "#name=Grace%20Elizabeth%20Mo%C3%B6re&dob=1985-03-21&from=email" })).toEqual({
      dob: "1985-03-21",
      name: "Grace Elizabeth Moöre",
      from: "email",
    });
    // a name with markup or digits is dropped, the date still prefills
    expect(readHandoff({ hash: "#name=%3Cb%3EX%3C%2Fb%3E&dob=1985-03-21&from=email" })).toEqual({ dob: "1985-03-21" });
    // a name is only trusted on our own email link
    expect(readHandoff({ hash: "#name=Grace&dob=1985-03-21&from=calculator" })).toEqual({ dob: "1985-03-21", from: "calculator" });
  });

  it("ignores dates that are not real, too old, or in the future", () => {
    expect(readHandoff({ hash: "#dob=1985-02-30" })).toEqual({});
    expect(readHandoff({ hash: "#dob=1850-01-01" })).toEqual({});
    expect(readHandoff({ hash: "#dob=2999-01-01" })).toEqual({});
    expect(readHandoff({ hash: "#dob=21/03/1985" })).toEqual({});
    expect(readHandoff({ hash: "" })).toEqual({});
  });
});

describe("calculator → Blueprint handoff", () => {
  const original = window.location;

  beforeEach(() => {
    window.localStorage.clear();
    mockFetch.mockReset();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { writable: true, value: original });
  });

  it("fills in the birth date and asks only for the name", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...original, pathname: "/", search: "?utm_source=mysticaldigits", hash: "#dob=1985-03-21&from=calculator" },
    });
    const replace = vi.spyOn(window.history, "replaceState");

    render(<Index />);

    expect(await screen.findByText(/birth date from the Life Path calculator is already filled in/i)).toBeInTheDocument();
    // The fragment is dropped from the address bar, the query string kept.
    expect(replace.mock.calls[0].slice(1)).toEqual(["", "/?utm_source=mysticaldigits"]);

    fireEvent.change(screen.getByPlaceholderText(/Alexander James Smith/i), { target: { value: "Grace Elizabeth Moore" } });
    fireEvent.click(screen.getByText(/Continue/i));

    expect(await screen.findByDisplayValue("1985-03-21")).toBeInTheDocument();
    expect(screen.getByText(/We filled in the date from the Life Path calculator/i)).toBeInTheDocument();
    replace.mockRestore();
  });

  it("opens the reading directly from the free-Blueprint email link", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...original, pathname: "/", search: "", hash: "#name=Grace%20Elizabeth%20Moore&dob=1985-03-21&from=email" },
    });
    const replace = vi.spyOn(window.history, "replaceState");

    render(<Index />);

    expect(await screen.findByText(/Unlock The Premium Edition/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/your@email.com/i)).toBeNull();
    expect(replace.mock.calls[0].slice(1)).toEqual(["", "/"]);
    replace.mockRestore();
  });

  it("accepts an older ?dob= link that has no name", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...original, pathname: "/", search: "?dob=1990-07-04", hash: "" },
    });

    render(<Index />);

    expect(await screen.findByText(/Your birth date is already filled in/i)).toBeInTheDocument();
    expect(screen.queryByText(/didn't include everything/i)).toBeNull();
  });
});

describe("email consent", () => {
  beforeEach(() => mockFetch.mockReset());

  it("does not submit until the consent box is ticked", async () => {
    const done = vi.fn();
    render(<EmailGate userName="Grace Moore" birthDate={new Date(1985, 2, 21)} onComplete={done} />);

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: "grace@example.com" } });
    fireEvent.click(screen.getByText(/Unlock My Free Blueprint/i));

    expect(await screen.findByText(/Please tick the box/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });

  it("states the purpose, links the privacy notice, and records what was agreed", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    render(<EmailGate userName="Grace Moore" birthDate={new Date(1985, 2, 21)} onComplete={vi.fn()} />);

    expect(screen.getByText(/short series of numerology emails/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy notice/i })).toHaveAttribute("href", "/privacy");

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: "grace@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByText(/Unlock My Free Blueprint/i));

    await screen.findByText(/Your blueprint is unlocked/i);
    const body = JSON.parse(String(mockFetch.mock.calls[0][1].body));
    expect(body.consent.marketing).toBe(true);
    expect(body.consent.text).toMatch(/unsubscribe at any time/i);
    expect(body.birthDate).toBe("1985-03-21");
  });
});
