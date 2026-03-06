import type { CommandInput, CommandOutcome, Profile, RoundState } from "../types/game";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

interface ApiErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: {
      retryAfterMs?: number;
    };
  };
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  retryAfterMs?: number;

  constructor(status: number, message: string, code?: string, retryAfterMs?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const rawBody = await response.text();
    let parsed: ApiErrorEnvelope | undefined;
    try {
      parsed = rawBody ? (JSON.parse(rawBody) as ApiErrorEnvelope) : undefined;
    } catch {
      parsed = undefined;
    }
    throw new ApiRequestError(
      response.status,
      parsed?.error?.message ?? (rawBody || `Request failed: ${response.status}`),
      parsed?.error?.code,
      parsed?.error?.details?.retryAfterMs,
    );
  }

  return (await response.json()) as T;
}

export async function createRound(difficulty: "easy" | "normal" | "hard") {
  return request<{ round: RoundState }>("/api/v1/rounds", {
    method: "POST",
    body: JSON.stringify({ difficulty }),
  });
}

export async function getRound(roundId: string) {
  return request<{ round: RoundState }>(`/api/v1/rounds/${roundId}`);
}

export async function sendCommand(payload: {
  roundId: CommandInput["roundId"];
  actorId: CommandInput["actorId"];
  action: CommandInput["action"];
  direction?: CommandInput["direction"];
}) {
  return request<{ round: RoundState; commandOutcome: CommandOutcome }>("/api/v1/commands", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProfile() {
  return request<{ profile: Profile }>("/api/v1/profile");
}
