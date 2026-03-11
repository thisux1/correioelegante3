type FrameFn = (timeMs: number) => void

const _fns = new Set<FrameFn>()
let _raf: number | null = null

function _tick(timeMs: number) {
    _fns.forEach(fn => fn(timeMs))
    _raf = requestAnimationFrame(_tick)
}

/**
 * Register a per-frame render callback into the shared RAF loop.
 * All registered callbacks run in a single requestAnimationFrame loop,
 * synchronized for efficient GPU scheduling.
 *
 * @returns cleanup function that unregisters the callback
 */
export function scheduleRenderer(fn: FrameFn): () => void {
    _fns.add(fn)
    if (_fns.size === 1) _raf = requestAnimationFrame(_tick)
    return () => {
        _fns.delete(fn)
        if (_fns.size === 0 && _raf !== null) {
            cancelAnimationFrame(_raf)
            _raf = null
        }
    }
}
