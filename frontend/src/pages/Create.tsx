import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Send, Heart, Palette } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { useAuthStore } from '@/store/authStore'
import { messageService } from '@/services/messageService'
import { useMessageStore } from '@/store/messageStore'

const createSchema = z.object({
  recipient: z.string().min(1, 'Nome do destinatário é obrigatório'),
  message: z.string().min(1, 'Escreva sua mensagem').max(1000, 'Mensagem muito longa (máx 1000 caracteres)'),
  theme: z.string().min(1, 'Tema é obrigatório'),
})

type CreateForm = z.infer<typeof createSchema>

const themes = [
  { id: 'classic', name: 'Clássico', color: 'bg-rose-100 border-rose-300' },
  { id: 'romantic', name: 'Romântico', color: 'bg-pink-100 border-pink-300' },
  { id: 'friendship', name: 'Amizade', color: 'bg-purple-100 border-purple-300' },
  { id: 'secret', name: 'Admirador Secreto', color: 'bg-amber-100 border-amber-300' },
]

export function Create() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addMessage } = useMessageStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('classic')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { theme: 'classic' },
  })

  const messageContent = watch('message', '')

  async function onSubmit(data: CreateForm) {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await messageService.create({ ...data, theme: selectedTheme })
      addMessage(response.data.message)
      navigate(`/payment/${response.data.message.id}`)
    } catch (err) {
      console.error('Erro ao criar mensagem:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal animateOnMount>
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
              Escreva sua <span className="text-gradient">mensagem</span>
            </h1>
            <p className="text-text-light text-lg">
              Escolha um tema e escreva algo especial para alguém
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <ScrollReveal direction="left" animateOnMount>
            <Card glass className="h-full">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <Input
                  label="Para quem é?"
                  placeholder="Nome do destinatário"
                  error={errors.recipient?.message}
                  {...register('recipient')}
                />

                <TextArea
                  label="Sua mensagem"
                  placeholder="Escreva sua mensagem com carinho..."
                  error={errors.message?.message}
                  {...register('message')}
                />

                <div>
                  <label className="text-sm font-medium text-text-light flex items-center gap-2 mb-3">
                    <Palette size={16} />
                    Tema do cartão
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${selectedTheme === theme.id
                            ? `${theme.color} ring-2 ring-primary/30`
                            : 'bg-white/50 border-gray-100 hover:border-gray-200'
                          }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-text-muted text-right">
                  {messageContent.length}/1000 caracteres
                </div>

                <Button type="submit" isLoading={isSubmitting} size="lg">
                  <Send size={18} />
                  Enviar Mensagem
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-text-muted text-center">
                    Você precisa estar logado para enviar uma mensagem
                  </p>
                )}
              </form>
            </Card>
          </ScrollReveal>

          {/* Preview */}
          <ScrollReveal direction="right" animateOnMount>
            <Card glass className="h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <p className="text-sm text-text-muted mb-2">Pré-visualização</p>
              </div>
              <motion.div
                layout
                className={`w-full max-w-sm rounded-2xl p-8 shadow-xl border ${themes.find((t) => t.id === selectedTheme)?.color || 'bg-rose-50 border-rose-200'
                  }`}
              >
                <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-4" />
                <p className="text-sm text-text-light text-center mb-4 font-cursive">
                  Para: {watch('recipient') || 'Alguém especial'}
                </p>
                <p className="font-cursive text-lg text-text text-center leading-relaxed min-h-[60px]">
                  {messageContent || 'Sua mensagem aparecerá aqui...'}
                </p>
                <div className="mt-6 pt-4 border-t border-black/5">
                  <p className="text-xs text-text-muted text-center">
                    💌 Correio Elegante
                  </p>
                </div>
              </motion.div>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
