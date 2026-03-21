interface PageEventPayload {
  event: 'page_load' | 'page_save' | 'page_publish' | 'page_delete';
  userId: string;
  pageId?: string;
  durationMs: number;
  result: 'success' | 'error';
  statusCode?: number;
  code?: string;
}

export function logPageEvent(payload: PageEventPayload): void {
  const body = {
    event: payload.event,
    userId: payload.userId,
    pageId: payload.pageId,
    durationMs: payload.durationMs,
    result: payload.result,
    statusCode: payload.statusCode,
    code: payload.code,
    timestamp: new Date().toISOString(),
  };

  if (payload.result === 'error') {
    console.error(JSON.stringify(body));
    return;
  }

  console.info(JSON.stringify(body));
}

interface AssetEventPayload {
  event:
    | 'upload_url_requested'
    | 'upload_completed'
    | 'asset_list'
    | 'asset_delete'
    | 'asset_reprocess'
    | 'media_job_enqueued'
    | 'media_job_started'
    | 'media_job_success'
    | 'media_job_failure'
    ;
  userId: string;
  assetId?: string;
  kind?: string;
  durationMs: number;
  result: 'success' | 'error';
  statusCode?: number;
  code?: string;
}

export function logAssetEvent(payload: AssetEventPayload): void {
  const body = {
    event: payload.event,
    userId: payload.userId,
    assetId: payload.assetId,
    kind: payload.kind,
    durationMs: payload.durationMs,
    result: payload.result,
    statusCode: payload.statusCode,
    code: payload.code,
    timestamp: new Date().toISOString(),
  };

  if (payload.result === 'error') {
    console.error(JSON.stringify(body));
    return;
  }

  console.info(JSON.stringify(body));
}
