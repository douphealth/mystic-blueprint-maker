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
  const isDev = import.meta.env.DEV || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
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
      const msg = "API endpoint '/api/life-path-lead' not found. This is expected in custom standalone deployments.";
      console.error("API failure:", msg);
      if (isDev) {
        console.warn(`${msg} Bypassing lead gate gracefully in local development.`);
        return { ok: true, message: "Standalone deployment fallback" };
      }
      return { ok: false, message: msg };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      const errMsg = data?.message || `API error: ${response.status} ${response.statusText}`;
      console.error("Email service failure:", errMsg);
      if (isDev) {
        console.warn("Email service failure. Bypassing lead gate gracefully in local development.");
        return { ok: true, message: "Fallback bypass enabled" };
      }
      return { ok: false, message: errMsg };
    }

    return { ok: true, ...data };
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("API connection failure:", error);
    if (isDev) {
      console.warn("API connection failure. Bypassing lead gate gracefully in local development.");
      return { ok: true, message: "Fallback bypass enabled" };
    }
    return { ok: false, message: errMsg };
  }
}
