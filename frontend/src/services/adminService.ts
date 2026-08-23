import api from './api'

export type AdminAnalyticsPeriod = 7 | 30 | 90

export interface AdminTimeseriesPoint {
  date: string
  count: number
}

export interface AdminOverviewResponse {
  users: {
    total: number
    last7d: number
    last30d: number
    verified: number
  }
  subscriptions: {
    active: number
    newLast30d: number
  }
  content: {
    messages: number
    pages: number
    paidResources: number
    views30d: number
  }
  support: {
    open: number
  }
}

export interface AdminTimeseriesResponse {
  signups: AdminTimeseriesPoint[]
  lettersCreated: AdminTimeseriesPoint[]
  paymentsCompleted: AdminTimeseriesPoint[]
  views: AdminTimeseriesPoint[]
}

export interface AdminContentBlockType {
  type: string
  count: number
}

export interface AdminContentTheme {
  theme: string
  count: number
}

export interface AdminContentResponse {
  blockTypes: AdminContentBlockType[]
  themes: AdminContentTheme[]
  avgBlocksPerPage: number
}

export interface AdminFunnelResponse {
  registered: number
  createdContent: number
  paidOnce: number
  subscribed: number
}

export interface AdminRevenueResponse {
  subscriptionRevenue: number
  subscriptionCount: number
  oneOffEstimate: number
  refundRequests: number
  mrrEstimate: number
}

function buildPeriodParams(days?: AdminAnalyticsPeriod) {
  return days ? { params: { days } } : undefined
}

export const adminService = {
  async getOverview(): Promise<AdminOverviewResponse> {
    const { data } = await api.get<AdminOverviewResponse>('/admin/analytics/overview')
    return data
  },

  async getTimeseries(days: AdminAnalyticsPeriod): Promise<AdminTimeseriesResponse> {
    const { data } = await api.get<AdminTimeseriesResponse>('/admin/analytics/timeseries', buildPeriodParams(days))
    return data
  },

  async getContent(): Promise<AdminContentResponse> {
    const { data } = await api.get<AdminContentResponse>('/admin/analytics/content')
    return data
  },

  async getFunnel(): Promise<AdminFunnelResponse> {
    const { data } = await api.get<AdminFunnelResponse>('/admin/analytics/funnel')
    return data
  },

  async getRevenue(days: AdminAnalyticsPeriod): Promise<AdminRevenueResponse> {
    const { data } = await api.get<AdminRevenueResponse>('/admin/analytics/revenue', buildPeriodParams(days))
    return data
  },
}
