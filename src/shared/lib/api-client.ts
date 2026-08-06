interface ApiErrorPayload {
  error?: unknown;
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    throw new Error(`${fallbackMessage} Check your connection and try again.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!response.ok) {
    const error = (payload as ApiErrorPayload | null)?.error;
    throw new Error(typeof error === "string" && error.trim() ? error : fallbackMessage);
  }

  return payload as T;
}

export function messageFromError(error: unknown, fallbackMessage: string) {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}
