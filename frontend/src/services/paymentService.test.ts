import { describe, expect, it, vi, beforeEach } from 'vitest'
import { paymentService } from '@/services/paymentService'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createPix envia payload legado + generico para message', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { paymentId: '123' } })

    await paymentService.createPix({ resourceType: 'message', resourceId: '507f1f77bcf86cd799439011' })

    expect(api.post).toHaveBeenCalledWith('/payments/create', {
      paymentMethod: 'pix',
      resourceType: 'message',
      resourceId: '507f1f77bcf86cd799439011',
      messageId: '507f1f77bcf86cd799439011',
    })
  })

  it('createCard envia payload generico para page', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { sessionId: 'cs_123' } })

    await paymentService.createCard({ resourceType: 'page', resourceId: '507f1f77bcf86cd799439022' })

    expect(api.post).toHaveBeenCalledWith('/payments/create', {
      paymentMethod: 'credit_card',
      resourceType: 'page',
      resourceId: '507f1f77bcf86cd799439022',
    })
  })

  it('getStatus consulta endpoint por resourceType/resourceId', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'pending' } })

    await paymentService.getStatus({ resourceType: 'page', resourceId: '507f1f77bcf86cd799439022' })

    expect(api.get).toHaveBeenCalledWith('/payments/status/page/507f1f77bcf86cd799439022')
  })

  it('createSubscriptionPix envia payload correto para /payments/subscription/checkout', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { paymentId: 'sub_123', pixQrCode: 'qrcode' } })

    await paymentService.createSubscriptionPix()

    expect(api.post).toHaveBeenCalledWith('/payments/subscription/checkout', {
      paymentMethod: 'pix',
      planId: 'monthly_unlimited',
    })
  })

  it('getSubscriptionStatus consulta /payments/subscription/status', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { isSubscribed: true, daysRemaining: 30 } })

    const res = await paymentService.getSubscriptionStatus()

    expect(api.get).toHaveBeenCalledWith('/payments/subscription/status')
    expect(res.data.isSubscribed).toBe(true)
  })

  it('createPix envia turnstileToken no payload e headers quando fornecido', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { paymentId: '123' } })

    await paymentService.createPix(
      { resourceType: 'page', resourceId: '507f1f77bcf86cd799439022' },
      'cf_token_sample'
    )

    expect(api.post).toHaveBeenCalledWith(
      '/payments/create',
      {
        paymentMethod: 'pix',
        resourceType: 'page',
        resourceId: '507f1f77bcf86cd799439022',
        turnstileToken: 'cf_token_sample',
      },
      {
        headers: {
          'cf-turnstile-response': 'cf_token_sample',
        },
      }
    )
  })
})

