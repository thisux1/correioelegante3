import { describe, expect, it, vi, afterEach } from 'vitest'

async function loadFlagsModule() {
  vi.resetModules()
  return import('./featureFlags')
}

describe('featureFlags rollout', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('flag ON in production with 100% enables user', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_EDITOR_MODULAR_ENABLED', 'true')
    vi.stubEnv('VITE_EDITOR_MODULAR_ROLLOUT_PERCENT', '100')

    const { resolveEditorAccessForUser } = await loadFlagsModule()
    const decision = resolveEditorAccessForUser('user-1')

    expect(decision.enabled).toBe(true)
  })

  it('flag OFF disables user access', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_EDITOR_MODULAR_ENABLED', 'false')
    vi.stubEnv('VITE_EDITOR_MODULAR_ROLLOUT_PERCENT', '100')

    const { resolveEditorAccessForUser } = await loadFlagsModule()
    const decision = resolveEditorAccessForUser('user-1')

    expect(decision.enabled).toBe(false)
    expect(decision.reason).toBe('global-disabled')
  })

  it('rollout 10% is deterministic per user', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_EDITOR_MODULAR_ENABLED', 'true')
    vi.stubEnv('VITE_EDITOR_MODULAR_ROLLOUT_PERCENT', '10')

    const { resolveEditorAccessForUser } = await loadFlagsModule()
    const first = resolveEditorAccessForUser('fixed-user-id')
    const second = resolveEditorAccessForUser('fixed-user-id')

    expect(first.enabled).toBe(second.enabled)
    expect(first.bucket).toBe(second.bucket)
  })

  it('media upload flag OFF disables access', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_EDITOR_MEDIA_UPLOAD_ENABLED', 'false')
    vi.stubEnv('VITE_EDITOR_MEDIA_UPLOAD_ROLLOUT_PERCENT', '100')

    const { resolveEditorMediaUploadAccessForUser } = await loadFlagsModule()
    const decision = resolveEditorMediaUploadAccessForUser('user-1')

    expect(decision.enabled).toBe(false)
    expect(decision.reason).toBe('global-disabled')
  })
})
