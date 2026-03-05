import type { Profile, RoundState } from "../types/game";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
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
  roundId: string;
  actorId: string;
  action: "move" | "bomb" | "wait";
  direction?: "up" | "down" | "left" | "right";
}) {
  return request<{ round: RoundState }>("/api/v1/commands", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProfile() {
  return request<{ profile: Profile }>("/api/v1/profile");
}
