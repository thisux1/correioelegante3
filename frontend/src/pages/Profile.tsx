import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Mail, Trash2, ExternalLink, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { messageService } from '@/services/messageService'
import { authService } from '@/services/authService'

export function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const { messages, setMessages, removeMessage, setLoading, isLoading } = useMessageStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    async function fetchMessages() {
      setLoading(true)
      try {
        const response = await messageService.getAll()
        setMessages(response.data.messages)
      } catch (err) {
        console.error('Erro ao buscar mensagens:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [isAuthenticated, navigate, setMessages, setLoading])

  async function handleDelete(id: string) {
    try {
      await messageService.delete(id)
      removeMessage(id)
    } catch (err) {
      console.error('Erro ao deletar mensagem:', err)
    }
  }

  async function handleLogout() {
    try {
      await authService.logout()
    } catch { /* ignore */ }
    clearAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl font-bold text-text mb-2">
                Meu Perfil
              </h1>
              <p className="text-text-light text-sm flex items-center gap-2">
                <Mail size={14} />
                {user?.email}
              </p>
            </div>
            <Button variant="ghost" onClick={handleLogout} size="sm">
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-text">
              Minhas Mensagens ({messages.length})
            </h2>
            <Link to="/create">
              <Button size="sm">
                <Heart size={14} />
                Nova mensagem
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-24 bg-white/60 rounded-2xl" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <ScrollReveal>
            <Card glass className="text-center py-16">
              <Heart className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-text mb-2">
                Nenhuma mensagem ainda
              </h3>
              <p className="text-text-light mb-6">
                Que tal enviar seu primeiro correio elegante?
              </p>
              <Link to="/create">
                <Button>Escrever Mensagem</Button>
              </Link>
            </Card>
          </ScrollReveal>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ScrollReveal key={message.id} delay={index * 0.05}>
                <Card glass hover className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-text truncate">
                        Para: {message.recipient}
                      </p>
                      <Badge
                        variant={message.paymentStatus === 'paid' ? 'success' : 'warning'}
                      >
                        {message.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-light truncate">
                      {message.message}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {message.paymentStatus === 'paid' ? (
                      <Link to={`/card/${message.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink size={14} />
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/payment/${message.id}`}>
                        <Button variant="outline" size="sm">
                          Pagar
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(message.id)}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
