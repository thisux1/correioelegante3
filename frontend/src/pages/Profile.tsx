import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Mail, Trash2, ExternalLink, LogOut, Settings, MessageCircle, AlertTriangle, Key, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { messageService } from '@/services/messageService'
import { authService } from '@/services/authService'

export function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const { messages, setMessages, removeMessage, setLoading, isLoading } = useMessageStore()

  const [activeTab, setActiveTab] = useState<'messages' | 'settings'>('messages')

  // Password Change State
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({ oldPassword, newPassword })
      setPasswordSuccess('Senha alterada com sucesso!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Erro ao alterar senha. Verifique sua senha atual.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true)
    try {
      await authService.deleteAccount()
      clearAuth()
      navigate('/')
    } catch (err) {
      console.error('Erro ao excluir conta:', err)
      setIsDeletingAccount(false)
      setIsDeleteModalOpen(false)
      alert('Erro ao excluir conta. Tente novamente mais tarde.')
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-text mb-2">
            Meu Perfil
          </h1>
          <p className="text-text-light text-sm">
            Crie, envie e gerencie a magia dos seus correios elegantes.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8 border-b border-gray-200/50 pb-4">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'messages'
              ? 'bg-primary/20 text-primary-dark'
              : 'text-text-light hover:bg-gray-100 hover:text-text'
              }`}
          >
            <MessageCircle size={18} />
            Mensagens
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings'
              ? 'bg-primary/20 text-primary-dark'
              : 'text-text-light hover:bg-gray-100 hover:text-text'
              }`}
          >
            <Settings size={18} />
            Configurações
          </button>
        </div>

        {activeTab === 'messages' ? (
          <>
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

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shimmer h-24 bg-white/60 rounded-2xl" />
                ))}
              </div>
            ) : messages.length === 0 ? (
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
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} glass hover className="flex items-center justify-between gap-4">
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
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <Card glass className="p-6">
              <h2 className="font-display text-xl font-semibold text-text mb-6">
                Sua Conta
              </h2>
              <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center">
                    <Mail size={20} className="text-primary-dark" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted mb-0.5">E-mail Cadastrado</p>
                    <p className="font-medium text-text truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full sm:w-auto text-text-light hover:text-text hover:bg-white/60"
              >
                <LogOut size={16} className="mr-2" />
                Sair da Conta
              </Button>
            </Card>

            <Card glass className="overflow-hidden">
              <button
                onClick={() => setIsPasswordFormOpen(!isPasswordFormOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/20 transition-colors"
                aria-expanded={isPasswordFormOpen}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex flex-shrink-0 items-center justify-center">
                    <Key size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-display text-lg font-semibold text-text">
                      Alterar Senha
                    </h2>
                    <p className="text-sm text-text-light mt-0.5">
                      Atualize sua senha para manter sua conta mágica segura.
                    </p>
                  </div>
                </div>
                <motion.div animate={{ rotate: isPasswordFormOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={20} className="text-text-muted" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isPasswordFormOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="p-6 pt-2 border-t border-white/20">
                      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <Input
                          label="Senha atual"
                          type="password"
                          placeholder="Sua senha atual"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          disabled={isChangingPassword}
                          required
                        />
                        <Input
                          label="Nova senha"
                          type="password"
                          placeholder="Mínimo de 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isChangingPassword}
                          required
                        />
                        <Input
                          label="Confirmar nova senha"
                          type="password"
                          placeholder="Repita a nova senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isChangingPassword}
                          required
                        />

                        {passwordError && (
                          <p className="text-sm text-red-500">{passwordError}</p>
                        )}
                        {passwordSuccess && (
                          <p className="text-sm text-emerald-500">{passwordSuccess}</p>
                        )}

                        <div className="pt-2">
                          <Button type="submit" disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}>
                            {isChangingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            <Card glass className="p-6 border-red-200/50 bg-red-50/30">
              <h2 className="font-display text-xl font-semibold text-red-600 flex items-center gap-2 mb-2">
                <AlertTriangle size={20} />
                Zona de Perigo
              </h2>
              <p className="text-text-light text-sm mb-4">
                A exclusão da conta é permanente e não pode ser desfeita.
                Todos os seus correios elegantes serão apagados.
              </p>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Excluir Minha Conta
              </Button>
            </Card>

            <Modal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              title="Excluir Conta Mágica"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-text-light mb-4">
                    Tem certeza que deseja excluir sua conta? Esta ação é{' '}
                    <strong className="text-red-600">irreversível</strong>.
                    <br />
                    Toda a magia guardada aqui será perdida para sempre.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? 'A tristeza é grande, apagando...' : 'Sim, Excluir Para Sempre'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeletingAccount}
                  >
                    Cancelar e Voltar à Magia
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </div>
  )
}
