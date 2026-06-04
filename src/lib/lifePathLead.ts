export interface LifePathLeadPayload {
  email: string;
  fullName: string;
  birthDate?: string;
  source?: string;
}

export interface LifePathLeadResult {
  ok: boolean;
  message?: string;
  requestId?: string;
}

export async function submitLifePathLead(payload: LifePathLeadPayload): Promise<LifePathLeadResult> {
  try {
    const response = await fetch("/api/life-path-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        source: payload.source ?? "life-path-app",
        page: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });

    if (response.status === 404) {
      console.warn("API endpoint '/api/life-path-lead' not found. This is expected in custom standalone deployments. Bypassing lead gate gracefully.");
      return { ok: true, message: "Standalone deployment fallback" };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      throw new Error(data?.message || "Could not send your blueprint email right now.");
    }

    return data as LifePathLeadResult;
  } catch (error) {
    console.error("Life-path lead submission failed:", error);
    // Return ok: true so that users are not blocked on custom deployments
    return { ok: true, message: "Fallback bypass enabled" };
  }
}
