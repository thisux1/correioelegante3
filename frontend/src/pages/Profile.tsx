import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Trash2, LogOut, AlertTriangle, Key, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export function Profile() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

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
  const [deleteAccountError, setDeleteAccountError] = useState('')

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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setPasswordError(axiosErr.response?.data?.error || 'Erro ao alterar senha. Verifique sua senha atual.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true)
    setDeleteAccountError('')
    try {
      await authService.deleteAccount()
      clearAuth()
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setDeleteAccountError(axiosErr.response?.data?.error || 'Erro ao excluir conta. Tente novamente mais tarde.')
      setIsDeletingAccount(false)
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
            Gerencie as configurações da sua conta.
          </p>
        </div>

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
                    Atualize sua senha para manter sua conta segura.
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
              A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão apagados.
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
            title="Excluir Conta"
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-text-light mb-4">
                  Tem certeza que deseja excluir sua conta? Esta ação é{' '}
                  <strong className="text-red-600">irreversível</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {deleteAccountError && (
                  <p className="text-sm text-red-500 text-center">{deleteAccountError}</p>
                )}
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? 'Apagando...' : 'Sim, Excluir Para Sempre'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeletingAccount}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}
