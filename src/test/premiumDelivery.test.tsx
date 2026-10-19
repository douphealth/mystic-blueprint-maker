import { describe, expect, it, beforeEach } from "vitest";
import { saveProfile, loadProfile, isPremiumUnlocked } from "../lib/entitlement";

describe("profile persistence without local entitlement", () => {
  beforeEach(() => localStorage.clear());

  it("remembers the numerology inputs for a verified purchaser", () => {
    saveProfile("Amara Nightingale", new Date("1990-05-15T00:00:00.000Z"));
    const profile = loadProfile();
    expect(profile?.name).toBe("Amara Nightingale");
    expect(profile?.dob).toBe("1990-05-15");
  });

  it("ignores missing or invalid profile fields", () => {
    saveProfile("", new Date("1990-05-15"));
    expect(loadProfile()).toBeNull();
    saveProfile("Someone", new Date("not a date"));
    expect(loadProfile()).toBeNull();
  });

  it("cannot unlock premium using legacy localStorage state", () => {
    localStorage.setItem("md:premium-unlocked", new Date().toISOString());
    expect(isPremiumUnlocked()).toBe(false);
  });
});
