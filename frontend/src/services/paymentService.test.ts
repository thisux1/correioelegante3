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
})
