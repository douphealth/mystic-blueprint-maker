import { describe, it, expect, vi } from "vitest";
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
  it("renders FreePdfButton and handles download without throwing", async () => {
    mockSave.mockClear();
    render(<FreePdfButton profile={mockProfile} name="Test User" />);
    const btn = screen.getByText(/Download Free Blueprint PDF/i);
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 500));
    expect(mockSave).toHaveBeenCalled();
  });

  it("triggers auto-download once when autoDownload prop is set", async () => {
    mockSave.mockClear();
    render(<FreePdfButton profile={mockProfile} name="Test User" autoDownload={true} />);
    await new Promise((r) => setTimeout(r, 500));
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

  it("fails to bypass and shows error for invalid date format", async () => {
    const originalSearch = window.location.search;
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: "?name=Jane+Doe&dob=10-22-1995",
      },
    });

    render(<Index />);
    const errorTitle = await screen.findByText("Invalid Link");
    expect(errorTitle).toBeInTheDocument();
    expect(screen.getByText(/Invalid birth date format/i)).toBeInTheDocument();

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: originalSearch,
      },
    });
  });

  it("contains required CTA variables in email_sequence.md", () => {
    const filePath = path.resolve(__dirname, "../../docs/emails/email_sequence.md");
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("{{pdf_url}}");
    expect(content).toContain("{{full_name}}");
    expect(content).toContain("{{birth_date}}");
  });
});
