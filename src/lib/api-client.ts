import { ApiErrorResponse, ApiSuccessResponse, ValidationIssue } from "../types/api";

const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:5000/api";

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: ValidationIssue[] | null;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: ValidationIssue[] | null = null
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

let activeMosqueId: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

export function setActiveMosqueId(id: string | null) {
  activeMosqueId = id;
}

export function getActiveMosqueId(): string | null {
  return activeMosqueId;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorizedCallback = handler;
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

interface RequestOptions extends RequestInit {
  mosqueId?: string | null;
  skipAuthRefresh?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers);

  // Set default JSON Content-Type if body is not FormData
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Tenant resolution: attach x-mosque-id header if available
  const tenantId = options.mosqueId ?? activeMosqueId;
  if (tenantId && !headers.has("x-mosque-id")) {
    headers.set("x-mosque-id", tenantId);
  }

  const fetchConfig: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Required for HttpOnly cookies
  };

  const response = await fetch(url, fetchConfig);

  // Parse response body safely
  let responseData: unknown = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  // Handle Token Expiry & Automatic Refresh (401 AUTH_TOKEN_EXPIRED)
  if (
    response.status === 401 &&
    !options.skipAuthRefresh &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshResponse.ok) {
          isRefreshing = false;
          onRefreshed("refreshed");
          // Retry the original request
          return request<T>(endpoint, { ...options, skipAuthRefresh: true });
        } else {
          isRefreshing = false;
          onRefreshed(null);
          onUnauthorizedCallback?.();
        }
      } catch {
        isRefreshing = false;
        onRefreshed(null);
        onUnauthorizedCallback?.();
      }
    } else {
      // Queue concurrent requests while token is refreshing
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber((token) => {
          if (token) {
            resolve(request<T>(endpoint, { ...options, skipAuthRefresh: true }));
          } else {
            reject(
              new ApiError(
                401,
                "AUTH_TOKEN_EXPIRED",
                "Session expired. Please log in again."
              )
            );
          }
        });
      });
    }
  }

  if (!response.ok) {
    const errorBody = responseData as ApiErrorResponse | null;
    const code = errorBody?.error?.code || `HTTP_${response.status}`;
    const message =
      errorBody?.error?.message ||
      response.statusText ||
      "An unexpected server error occurred.";
    const details = errorBody?.error?.details || null;

    throw new ApiError(response.status, code, message, details);
  }

  const successBody = responseData as ApiSuccessResponse<T> | null;
  return (successBody?.data ?? (responseData as T)) as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T>(
    endpoint: string,
    file: File | Blob,
    fileName: string,
    options?: RequestOptions
  ) => {
    const formData = new FormData();
    formData.append("file", file, fileName);
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  },
};

