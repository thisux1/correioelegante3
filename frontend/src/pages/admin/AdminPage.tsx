import { useState } from 'react'
import { BarChart3, LifeBuoy } from 'lucide-react'
import { AdminDashboard } from './AdminDashboard'
import { AdminTickets } from '@/pages/AdminTickets'

type AdminTab = 'analytics' | 'chamados'

const TABS: Array<{ id: AdminTab; label: string; icon: typeof BarChart3 }> = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'chamados', label: 'Chamados', icon: LifeBuoy },
]

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics')

  return (
    <div className="min-h-screen pb-16 pt-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="font-display text-4xl font-bold text-text sm:text-5xl">Painel Admin</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-text-light sm:text-base">
              Gestao da plataforma: metricas, conteudo e suporte em um so lugar.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Secoes do administrador"
            className="flex w-fit items-center gap-1 rounded-xl border border-border/80 bg-surface-raised/80 p-1"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 cursor-pointer rounded-lg px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
                    isActive
                      ? 'bg-white text-[#4c0519] shadow-xs'
                      : 'text-text-light hover:text-text'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </header>

        <div role="tabpanel">
          {activeTab === 'analytics' ? <AdminDashboard /> : <AdminTickets />}
        </div>
      </div>
    </div>
  )
}
