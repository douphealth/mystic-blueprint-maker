import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import FreePdfButton from "../components/FreePdfButton";
import Index from "../pages/Index";
import { NumerologyProfile } from "../lib/numerology";
import fs from "fs";
import path from "path";

// Mock jsPDF
const mockSave = vi.fn();
const mockAddPage = vi.fn();
const mockText = vi.fn();
const mockRect = vi.fn();
const mockRoundedRect = vi.fn();
const mockLine = vi.fn();
const mockCircle = vi.fn();
const mockLink = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetDrawColor = vi.fn();
const mockSetLineWidth = vi.fn();
const mockSetFillColor = vi.fn();

vi.mock("jspdf", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        internal: {
          pageSize: {
            getWidth: () => 210,
            getHeight: () => 297,
          },
        },
        addPage: mockAddPage,
        save: mockSave,
        text: mockText,
        rect: mockRect,
        roundedRect: mockRoundedRect,
        line: mockLine,
        circle: mockCircle,
        link: mockLink,
        setFont: vi.fn(),
        setFontSize: mockSetFontSize,
        setTextColor: mockSetTextColor,
        setDrawColor: mockSetDrawColor,
        setLineWidth: mockSetLineWidth,
        setFillColor: mockSetFillColor,
        // used by the premium engine to embed the brand fonts
        addFileToVFS: vi.fn(),
        addFont: vi.fn(),
        setCharSpace: vi.fn(),
        getCharSpace: vi.fn().mockReturnValue(0),
        setLineDashPattern: vi.fn(),
        output: vi.fn().mockReturnValue(new ArrayBuffer(8)),
        getNumberOfPages: vi.fn().mockReturnValue(1),
        splitTextToSize: vi.fn().mockImplementation((txt) => [txt]),
        getTextWidth: vi.fn().mockReturnValue(10),
      };
    }),
  };
});

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => {
  return {
    useAuth: () => ({
      user: null,
      session: null,
      loading: false,
      signInWithMagicLink: vi.fn(),
      signOut: vi.fn(),
    }),
  };
});

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
      auth: {
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
    },
  };
});

const mockProfile: NumerologyProfile = {
  lifePath: 5,
  expression: 3,
  soulUrge: 8,
  personality: 4,
  birthday: 5,
  personalYear: 7,
  hiddenPassion: [3],
  karmicDebt: [],
  pinnacles: [],
  challenges: [],
  personalMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3],
};

describe("MysticalDigits App Tests", () => {
  // The generator is loaded with a dynamic import, so its completion is not
  // bounded by any fixed delay. Asserting after a 500ms sleep used to fail
  // intermittently and then leak the late `save()` into the *next* test — which
  // is why "exactly once" occasionally read as twice. Wait for the real
  // condition instead, and clear the shared spy before each test.
  beforeEach(() => {
    mockSave.mockClear();
  });

  it("renders FreePdfButton and handles download without throwing", async () => {
    render(<FreePdfButton profile={mockProfile} name="Test User" />);
    const btn = screen.getByText(/Download Free Blueprint PDF/i);
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    await vi.waitFor(() => expect(mockSave).toHaveBeenCalled(), { timeout: 15_000 });
  });

  it("triggers auto-download once when autoDownload prop is set", async () => {
    render(<FreePdfButton profile={mockProfile} name="Test User" autoDownload={true} />);

    await vi.waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1), { timeout: 15_000 });

    // Give a second, unwanted trigger room to appear, so "exactly once" is a
    // real assertion rather than a race that happens to be won.
    await new Promise((r) => setTimeout(r, 800));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("bypasses intake quiz with name and dob params", async () => {
    const originalSearch = window.location.search;
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: "?name=Jane+Doe&dob=1995-10-22",
      },
    });

    render(<Index />);
    const heading = await screen.findByText("Jane Doe");
    expect(heading).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: originalSearch,
      },
    });
  });

  it("recovers into the intake form when a link carries an unparseable date", async () => {
    const originalSearch = window.location.search;
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: "?name=Jane+Doe&dob=10-22-1995",
      },
    });

    render(<Index />);

    // A subscriber arriving from a personalised email must never hit a dead
    // end. The old behaviour was an "Invalid Link" wall; now the name that did
    // survive is kept and only the missing piece is asked for.
    expect(await screen.findByText(/couldn't read a birth date/i)).toBeInTheDocument();
    expect(screen.queryByText("Invalid Link")).not.toBeInTheDocument();

    // The intake is on the date step, because the name is already known.
    // findByText, not getByText: AnimatePresence mode="wait" holds the incoming
    // step back until the outgoing one has finished animating out.
    expect(await screen.findByText(/Reveal My Blueprint/i)).toBeInTheDocument();

    // And the name we could read is still there, one step back.
    fireEvent.click(await screen.findByText(/Go back/i));
    expect(await screen.findByDisplayValue("Jane Doe")).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: originalSearch,
      },
    });
  });

  it("uses Brevo merge tags consistently in email_sequence.md", () => {
    const filePath = path.resolve(__dirname, "../../docs/emails/email_sequence.md");
    const content = fs.readFileSync(filePath, "utf8");

    // Everything above the appendix is a live template that gets pasted into
    // Brevo. Foreign syntax is fine *inside* the appendix — it is reference
    // material — but a stray tag above it would be mailed out as literal text.
    const [liveTemplates] = content.split("## Appendix: merge tags for other ESPs");
    expect(liveTemplates.length).toBeGreaterThan(0);

    expect(liveTemplates).toContain("{{ contact.FIRSTNAME }}");
    expect(liveTemplates).toContain("{{ contact.LASTNAME }}");
    expect(liveTemplates).toContain("{{ contact.DOB_ISO }}");

    for (const foreign of [
      "{{first_name}}",
      "{{full_name}}",
      "{{birth_date}}",
      "{{pdf_url}}",
      "YOUR_NAME_TAG",
      "YOUR_DOB_TAG",
      "%FIRSTNAME%",
      "*|FNAME|*",
      "{{contact.name}}",
    ]) {
      expect(liveTemplates).not.toContain(foreign);
    }

    // Every CTA must carry both required parameters, and none may point at the
    // old host that stripped the query string.
    const ctaLines = liveTemplates
      .split("\n")
      .filter((line) => line.includes("blueprint.mysticaldigits.com/?"));
    expect(ctaLines.length).toBeGreaterThanOrEqual(10);
    for (const line of ctaLines) {
      expect(line).toContain("name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}");
      expect(line).toContain("dob={{ contact.DOB_ISO }}");
    }

    // No *link* may point at the old host. It is still named once in the prose
    // above, documenting the fix — that mention is the point, so only lines
    // that actually carry a URL are checked.
    for (const line of liveTemplates.split("\n")) {
      if (!line.includes("https://")) continue;
      expect(line).not.toContain("life-path.mysticaldigits.com");
    }
  });
});
