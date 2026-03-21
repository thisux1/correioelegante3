interface TelemetryPayload {
  event: string
  pageId?: string
  durationMs?: number
  status?: string
  detail?: string
}

function sanitizeDetail(detail: unknown): string | undefined {
  if (typeof detail !== 'string') {
    return undefined
  }

  return detail
    .replace(/[\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

export function trackEditorEvent(payload: TelemetryPayload): void {
  const safePayload = {
    event: payload.event,
    pageId: payload.pageId,
    durationMs: payload.durationMs,
    status: payload.status,
    detail: sanitizeDetail(payload.detail),
    timestamp: new Date().toISOString(),
  }

  console.info('[telemetry]', safePayload)
}
