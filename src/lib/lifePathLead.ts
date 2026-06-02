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

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || "Could not send your blueprint email right now.");
  }

  return data as LifePathLeadResult;
}
