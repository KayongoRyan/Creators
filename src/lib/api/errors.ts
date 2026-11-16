export type ApiErrorKind =
  | "unauthenticated"
  | "forbidden"
  | "api_down"
  | "other";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly path: string;
  readonly kind: ApiErrorKind;

  constructor(status: number, path: string, kind: ApiErrorKind, message?: string) {
    super(message ?? defaultMessage(kind, status, path));
    this.name = "ApiRequestError";
    this.status = status;
    this.path = path;
    this.kind = kind;
  }
}

function defaultMessage(kind: ApiErrorKind, status: number, path: string) {
  if (kind === "unauthenticated") return "Sign in required";
  if (kind === "forbidden") {
    return "This account belongs to a different workspace.";
  }
  if (kind === "api_down") {
    return "API is not running. Start it with npm run dev:api, then Retry.";
  }
  return `API ${status}: ${path}`;
}

export function classifyHttpFailure(status: number, path: string): ApiErrorKind {
  if (status === 401) return "unauthenticated";
  if (status === 403) return "forbidden";
  // Next rewrite returns 500 when nothing listens on :4000
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return "api_down";
  }
  return "other";
}

export function toApiRequestError(error: unknown, fallbackPath = ""): ApiRequestError {
  if (error instanceof ApiRequestError) return error;
  if (error instanceof TypeError) {
    return new ApiRequestError(0, fallbackPath, "api_down");
  }
  if (error instanceof Error) {
    const match = /^API (\d+): (.+)$/.exec(error.message);
    if (match) {
      const status = Number(match[1]);
      const path = match[2];
      return new ApiRequestError(status, path, classifyHttpFailure(status, path));
    }
  }
  return new ApiRequestError(0, fallbackPath, "other", "Something went wrong loading data.");
}
