import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { Auth } from '@/pages/Auth'
import { authService } from '@/services/authService'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

const mockedAuthService = vi.mocked(authService)

function createSuccessResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} } as InternalAxiosRequestConfig,
  }
}

async function waitForCondition(assertion: () => void, timeoutMs = 1500) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      assertion()
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
  }
  assertion()
}

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set
  nativeInputValueSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function renderAuth(initialEntries: string[] = ['/auth']) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOM.createRoot(host)

  act(() => {
    root.render(
      React.createElement(
        MemoryRouter,
        { initialEntries },
        React.createElement(Auth)
      )
    )
  })

  return {
    host,
    unmount: () => {
      act(() => {
        root.unmount()
      })
      host.remove()
    },
  }
}

describe('Auth Component (Sign Up & Login UI/UX)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders login mode by default with email and password inputs', () => {
    const { host, unmount } = renderAuth()

    expect(host.textContent).toContain('Bem-vindo de volta')
    expect(host.textContent).toContain('Entrar na Conta')

    const emailInput = host.querySelector('#login-email') as HTMLInputElement
    const passwordInput = host.querySelector('#login-password') as HTMLInputElement

    expect(emailInput).not.toBeNull()
    expect(passwordInput).not.toBeNull()

    unmount()
  })

  it('switches to register tab when clicking Criar Conta button', async () => {
    const { host, unmount } = renderAuth()

    const registerTabBtn = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Criar Conta') && !b.getAttribute('type')?.includes('submit')
    )
    expect(registerTabBtn).toBeDefined()

    act(() => {
      registerTabBtn?.click()
    })

    await waitForCondition(() => {
      expect(host.textContent).toContain('Criar sua conta')
      expect(host.querySelector('#register-email')).not.toBeNull()
      expect(host.querySelector('#register-password')).not.toBeNull()
      expect(host.querySelector('#register-confirm-password')).not.toBeNull()
      expect(host.querySelector('#ageConfirmed')).not.toBeNull()
      expect(host.querySelector('#legalAccepted')).not.toBeNull()
    })

    unmount()
  })

  it('renders register mode directly when query param mode=register is present', () => {
    const { host, unmount } = renderAuth(['/auth?mode=register'])

    expect(host.textContent).toContain('Criar sua conta')
    expect(host.querySelector('#register-email')).not.toBeNull()
    expect(host.querySelector('#register-password')).not.toBeNull()

    unmount()
  })

  it('handles successful login flow', async () => {
    mockedAuthService.login.mockResolvedValue(
      createSuccessResponse({
        user: { id: 'u1', email: 'test@example.com', role: 'user', createdAt: '', updatedAt: '' },
        accessToken: 'token-123',
      })
    )

    const { host, unmount } = renderAuth()

    const emailInput = host.querySelector('#login-email') as HTMLInputElement
    const passwordInput = host.querySelector('#login-password') as HTMLInputElement

    act(() => {
      setInputValue(emailInput, 'test@example.com')
      setInputValue(passwordInput, 'secret123')
    })

    const form = host.querySelector('form') as HTMLFormElement
    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    await waitForCondition(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'secret123',
      })
    })

    unmount()
  })
})
