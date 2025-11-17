// src/lib/log.ts
// Structured logging helper for consistent observability

export function logInfo(context: string, payload?: unknown): void {
  console.log(`[INFO] [${context}]`, payload !== undefined ? payload : '');
}

export function logWarn(context: string, payload?: unknown): void {
  console.warn(`[WARN] [${context}]`, payload !== undefined ? payload : '');
}

export function logError(context: string, error: unknown, extra?: unknown): void {
  const errorDetails: Record<string, unknown> = {};

  if (error instanceof Error) {
    errorDetails.message = error.message;
    errorDetails.stack = error.stack;
    errorDetails.name = error.name;
  } else {
    errorDetails.rawError = error;
  }

  if (extra !== undefined) {
    errorDetails.extra = extra;
  }

  console.error(`[ERROR] [${context}]`, errorDetails);
}
