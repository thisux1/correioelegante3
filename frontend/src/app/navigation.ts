interface NavigateOptions {
  replace?: boolean
  state?: unknown
}

type AppNavigate = (to: string, options?: NavigateOptions) => void

let appNavigator: AppNavigate | null = null

export function registerNavigator(navigate: AppNavigate | null) {
  appNavigator = navigate
}

export function navigateTo(to: string, options?: NavigateOptions) {
  if (appNavigator) {
    appNavigator(to, options)
    return
  }

  if (typeof window === 'undefined') {
    return
  }

  const nextState = options?.state ?? null
  if (options?.replace) {
    window.history.replaceState(nextState, '', to)
  } else {
    window.history.pushState(nextState, '', to)
  }

  window.dispatchEvent(new PopStateEvent('popstate', { state: nextState }))
}
