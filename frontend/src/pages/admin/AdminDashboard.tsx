import { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  BadgeCheck,
  CircleDollarSign,
  Stamp,
  Eye,
  LifeBuoy,
  RefreshCw,
  LayoutGrid,
  Palette,
  BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import {
  adminService,
  type AdminAnalyticsPeriod,
  type AdminContentResponse,
  type AdminOverviewResponse,
  type AdminRevenueResponse,
  type AdminTimeseriesResponse,
} from '@/services/adminService'

const PERIOD_OPTIONS: Array<{ value: AdminAnalyticsPeriod; label: string }> = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
]

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

function formatDateLabel(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return day && month ? `${day}/${month}` : isoDate
}

interface KPICardProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}

function KPICard({ icon: Icon, label, value, hint }: KPICardProps) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs transition-shadow duration-300 hover:shadow-md hover:shadow-rose-950/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-text-light">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">{value}</p>
          {hint ? <p className="mt-1 truncate text-xs text-text-light">{hint}</p> : null}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 space-y-0.5">
        <h3 className="font-display text-lg font-bold text-text">{title}</h3>
        {description ? <p className="text-xs text-text-light">{description}</p> : null}
      </div>
      {children}
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-live="polite" aria-label="Carregando analytics...">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-primary/10 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-primary/10 animate-pulse" />
        <div className="h-72 rounded-2xl bg-primary/10 animate-pulse" />
      </div>
      <div className="h-64 rounded-2xl bg-primary/10 animate-pulse" />
    </div>
  )
}

export function AdminDashboard() {
  const [period, setPeriod] = useState<AdminAnalyticsPeriod>(30)
  const [reloadToken, setReloadToken] = useState(0)

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null)
  const [timeseries, setTimeseries] = useState<AdminTimeseriesResponse | null>(null)
  const [content, setContent] = useState<AdminContentResponse | null>(null)
  const [revenue, setRevenue] = useState<AdminRevenueResponse | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const abortController = new AbortController()

    async function loadAnalytics() {
      setIsLoading(true)
      setError('')
      try {
        const [overviewData, timeseriesData, contentData, revenueData] = await Promise.all([
          adminService.getOverview(),
          adminService.getTimeseries(period),
          adminService.getContent(),
          adminService.getRevenue(period),
        ])
        if (abortController.signal.aborted) return
        setOverview(overviewData)
        setTimeseries(timeseriesData)
        setContent(contentData)
        setRevenue(revenueData)
      } catch (err: unknown) {
        if (abortController.signal.aborted) return
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setError(axiosErr.response?.data?.error || 'Erro ao carregar os dados de analytics.')
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => abortController.abort()
  }, [period, reloadToken])

  function handleRetry() {
    setReloadToken((token) => token + 1)
  }

  const isEmpty =
    !isLoading && !error && overview !== null &&
    overview.users.total === 0 &&
    overview.content.messages === 0 &&
    overview.content.pages === 0

  const signupSeries = timeseries?.signups.map((point) => ({ label: formatDateLabel(point.date), value: point.count })) ?? []
  const viewSeries = timeseries?.views.map((point) => ({ label: formatDateLabel(point.date), value: point.count })) ?? []
  const paymentSeries = timeseries?.paymentsCompleted.map((point) => ({ label: formatDateLabel(point.date), value: point.count })) ?? []

  return (
    <div className="space-y-10">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-text-light uppercase tracking-wider">Analytics</span>
        </div>

        <div
          role="group"
          aria-label="Periodo dos dados"
          className="flex w-fit items-center gap-1.5 rounded-xl border border-border/80 bg-surface-raised/80 p-1"
        >
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              aria-pressed={period === option.value}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
                period === option.value
                  ? 'bg-white text-[#4c0519] shadow-xs'
                  : 'text-text-light hover:text-text'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="space-y-4">
          <InlineAlert tone="danger">{error}</InlineAlert>
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : isEmpty ? (
        <Card glass className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mb-1 font-display text-lg font-bold text-text">Ainda nao ha dados para exibir</h2>
          <p className="mx-auto mb-6 max-w-sm text-xs text-text-light sm:text-sm">
            Assim que as primeiras cartas forem criadas, os indicadores da plataforma aparecerao aqui.
          </p>
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw size={16} />
            Atualizar dados
          </Button>
        </Card>
      ) : (
        <div className="space-y-10">
          <section aria-label="Indicadores principais" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                icon={Users}
                label="Usuarios totais"
                value={formatNumber(overview?.users.total ?? 0)}
                hint={`${formatNumber(overview?.users.verified ?? 0)} com e-mail verificado`}
              />
              <KPICard
                icon={UserPlus}
                label="Novos usuarios (7d)"
                value={formatNumber(overview?.users.last7d ?? 0)}
              />
              <KPICard
                icon={BadgeCheck}
                label="Assinaturas ativas"
                value={formatNumber(overview?.subscriptions.active ?? 0)}
              />
              <KPICard
                icon={CircleDollarSign}
                label="MRR estimado"
                value={formatCurrency(revenue?.mrrEstimate ?? 0)}
              />
              <KPICard
                icon={Stamp}
                label="Cartas pagas"
                value={formatNumber(overview?.content.paidResources ?? 0)}
              />
              <KPICard
                icon={Eye}
                label="Visualizacoes (30d)"
                value={formatNumber(overview?.content.views30d ?? 0)}
              />
              <KPICard
                icon={LifeBuoy}
                label="Tickets abertos"
                value={formatNumber(overview?.support.open ?? 0)}
              />
            </div>
          </section>

          <section aria-label="Series temporais" className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-text">Movimento diario</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Novos cadastros"
                description={`Cadastros por dia nos ultimos ${period} dias`}
              >
                <LineChart
                  data={signupSeries}
                  ariaLabel={`Novos cadastros por dia nos ultimos ${period} dias`}
                  valueFormatter={formatNumber}
                />
              </ChartCard>

              <ChartCard
                title="Visualizacoes"
                description={`Visualizacoes de cartas por dia nos ultimos ${period} dias`}
              >
                <LineChart
                  data={viewSeries}
                  ariaLabel={`Visualizacoes por dia nos ultimos ${period} dias`}
                  valueFormatter={formatNumber}
                />
              </ChartCard>

              <div className="lg:col-span-2">
                <ChartCard
                  title="Pagamentos concluidos"
                  description={`Pagamentos aprovados por dia nos ultimos ${period} dias`}
                >
                  <BarChart
                    data={paymentSeries}
                    orientation="vertical"
                    ariaLabel={`Pagamentos concluidos por dia nos ultimos ${period} dias`}
                    valueFormatter={formatNumber}
                  />
                </ChartCard>
              </div>
            </div>
          </section>

          <section aria-label="Conteudo criado" className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold text-text">Conteudo</h2>
              <p className="text-sm text-text-light">
                Media de{' '}
                <strong className="font-semibold text-[#701a35]">
                  {formatNumber(content?.avgBlocksPerPage ?? 0)} blocos por pagina
                </strong>{' '}
                entre todas as paginas publicadas.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Tipos de bloco mais usados"
                description="Distribuicao de uso por tipo de bloco no editor"
              >
                {(content?.blockTypes.length ?? 0) > 0 ? (
                  <BarChart
                    data={(content?.blockTypes ?? []).map((item) => ({ label: item.type, value: item.count }))}
                    orientation="horizontal"
                    ariaLabel="Distribuicao de tipos de bloco"
                    valueFormatter={formatNumber}
                  />
                ) : (
                  <div className="flex items-center gap-3 py-8 text-sm text-text-light">
                    <LayoutGrid className="h-5 w-5 shrink-0 text-primary/60" aria-hidden="true" />
                    Nenhum bloco criado ainda.
                  </div>
                )}
              </ChartCard>

              <ChartCard
                title="Temas populares"
                description="Temas escolhidos com mais frequencia nas cartas"
              >
                {(content?.themes.length ?? 0) > 0 ? (
                  <BarChart
                    data={(content?.themes ?? []).map((item) => ({ label: item.theme, value: item.count }))}
                    orientation="horizontal"
                    ariaLabel="Popularidade de temas"
                    valueFormatter={formatNumber}
                  />
                ) : (
                  <div className="flex items-center gap-3 py-8 text-sm text-text-light">
                    <Palette className="h-5 w-5 shrink-0 text-primary/60" aria-hidden="true" />
                    Nenhum tema utilizado ainda.
                  </div>
                )}
              </ChartCard>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
