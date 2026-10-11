import React, { act, useEffect } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { PageRuntimeProvider } from '@/editor/context'
import { useRecipientState } from './useRecipientState'

const STORAGE_KEY = 'ce:progress:page-1'

let currentValue: unknown = null
let setter: ((next: unknown) => void) | null = null

interface ProbeProps {
  stateKey?: string
  initial?: unknown
  validate?: (value: unknown) => boolean
}

function Probe({ stateKey = 'flag', initial = false, validate }: ProbeProps) {
  const [value, setValue] = useRecipientState(
    'block-1',
    stateKey,
    initial,
    validate as ((v: unknown) => v is unknown) | undefined,
  )
  useEffect(() => {
    currentValue = value
    setter = setValue as (next: unknown) => void
  })
  return null
}

function render(ui: React.ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = ReactDOM.createRoot(container)
  act(() => root.render(ui))
  return {
    unmount: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

async function set(value: unknown) {
  await act(async () => {
    setter?.(value)
  })
}

describe('useRecipientState', () => {
  beforeEach(() => {
    window.localStorage.clear()
    currentValue = null
    setter = null
  })

  it('behaves like useState when no pageId is present (editor/demo)', async () => {
    render(<Probe />)
    expect(currentValue).toBe(false)

    await set(true)
    expect(currentValue).toBe(true)
    expect(window.localStorage.getItem('ce:progress:')).toBeNull()
    expect(window.localStorage.length).toBe(0)
  })

  it('persists values under the page progress map', async () => {
    render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <Probe />
      </PageRuntimeProvider>,
    )

    await set(true)

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<
      string,
      unknown
    >
    expect(stored['block-1.flag']).toBe(true)
  })

  it('restores a stored value on remount', async () => {
    const first = render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <Probe />
      </PageRuntimeProvider>,
    )
    await set(true)
    first.unmount()

    render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <Probe />
      </PageRuntimeProvider>,
    )
    expect(currentValue).toBe(true)
  })

  it('keeps different keys in the same page map without clobbering', async () => {
    render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <>
          <Probe stateKey="a" initial={0} />
          <Probe stateKey="b" initial={0} />
        </>
      </PageRuntimeProvider>,
    )
    // The mounted probe is the last one rendered; write both keys explicitly.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'block-1.a': 1 }))

    await set(7)

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<
      string,
      unknown
    >
    expect(stored['block-1.b']).toBe(7)
  })

  it('falls back to initial when stored JSON is malformed', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-json{{{')
    render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <Probe initial="hello" />
      </PageRuntimeProvider>,
    )
    expect(currentValue).toBe('hello')
  })

  it('ignores stored values whose typeof does not match the initial value', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'block-1.flag': 'yes' }))
    render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <Probe initial={false} />
      </PageRuntimeProvider>,
    )
    expect(currentValue).toBe(false)
  })

  it('honours a custom validate predicate', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'block-1.flag': 'bogus' }))
    render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <Probe
          initial="idle"
          validate={(v): v is string => v === 'idle' || v === 'sent'}
        />
      </PageRuntimeProvider>,
    )
    expect(currentValue).toBe('idle')
  })

  it('accepts validated stored values', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'block-1.flag': 'sent' }))
    render(
      <PageRuntimeProvider value={{ pageId: 'page-1' }}>
        <Probe
          initial="idle"
          validate={(v): v is string => v === 'idle' || v === 'sent'}
        />
      </PageRuntimeProvider>,
    )
    expect(currentValue).toBe('sent')
  })

  it('does not leak progress across pages', async () => {
    render(
      <PageRuntimeProvider value={{ pageId: 'page-2' }}>
        <Probe />
      </PageRuntimeProvider>,
    )
    await set(true)
    expect(window.localStorage.getItem('ce:progress:page-1')).toBeNull()
    expect(window.localStorage.getItem('ce:progress:page-2')).toContain('block-1.flag')
  })
})
