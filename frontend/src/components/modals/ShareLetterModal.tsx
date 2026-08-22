import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Heart,
  Sparkles,
  QrCode,
  FolderHeart,
  MessageCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { formatLetterUrl } from './shareLetterUtils'

export interface ShareLetterModalProps {
  isOpen: boolean
  onClose: () => void
  pageId?: string
  pageTitle?: string
  recipientName?: string
  customUrl?: string
}

export function ShareLetterModal({
  isOpen,
  onClose,
  pageId = '',
  pageTitle,
  recipientName,
  customUrl,
}: ShareLetterModalProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [qrDownloaded, setQrDownloaded] = useState(false)
  const qrCanvasRef = useRef<HTMLDivElement>(null)

  const letterUrl = formatLetterUrl(pageId, customUrl)
  const recipientDisplay = recipientName ? ` para ${recipientName}` : ''

  const defaultWhatsappMessage = `💌 Olá! Preparei um Correio Elegante especial${recipientDisplay} com todo meu carinho. Abra sua carta aqui: ${letterUrl}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    defaultWhatsappMessage,
  )}`

  const handleCopyLink = useCallback(async () => {
    if (!letterUrl) return

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(letterUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = letterUrl
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }, [letterUrl])

  const handleDownloadQrCode = useCallback(() => {
    const canvas = qrCanvasRef.current?.querySelector('canvas')
    if (!canvas) return

    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `qrcode-correio-elegante-${pageId || 'carta'}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    setQrDownloaded(true)
    setTimeout(() => setQrDownloaded(false), 2500)
  }, [pageId])

  const handleNavigateToProfile = useCallback(() => {
    onClose()
    navigate('/profile')
  }, [navigate, onClose])

  const recipientViewHref = pageId ? `/card/page/${pageId}` : '/card'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop com blur romântico */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="relative z-50 w-full max-w-lg overflow-hidden rounded-3xl bg-surface p-6 sm:p-8 shadow-2xl border border-primary/20 ring-1 ring-black/10 text-text max-h-[90vh] overflow-y-auto"
          >
            {/* Botão fechar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal de compartilhamento"
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-text-light hover:bg-black/10 hover:text-text transition-colors"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho Celebratório com Selo de Cera 3D */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                  delay: 0.1,
                }}
                className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center"
              >
                {/* Brilho pulsante no fundo */}
                <motion.div
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.35, 0.65, 0.35],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/40 via-primary/30 to-amber-400/40 blur-lg"
                />

                {/* Selo de Cera 3D em Relevo Rubi Realista */}
                <div
                  className="relative flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-rose-700 to-rose-950 shadow-[0_10px_25px_-5px_rgba(225,29,72,0.6),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.6)] border-2 border-rose-400/50 ring-4 ring-rose-500/20"
                  aria-hidden="true"
                >
                  {/* Textura de anéis da cera */}
                  <div className="absolute inset-1.5 rounded-full border border-dashed border-white/30" />
                  <Heart className="h-9 w-9 fill-white text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                </div>

                {/* Efeito de faíscas mágicas */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  className="absolute -top-1 -right-1 text-amber-400"
                >
                  <Sparkles size={20} className="fill-amber-400" />
                </motion.div>
              </motion.div>

              <h2
                id="share-modal-title"
                className="font-display text-2xl sm:text-3xl font-bold text-text mb-1"
              >
                Carta Selada & Pronta para Envio!
              </h2>
              <p className="text-xs sm:text-sm text-text-light max-w-sm mx-auto">
                {pageTitle
                  ? `"${pageTitle}" foi selada com sucesso.`
                  : 'Sua mensagem especial foi guardada com todo carinho e está pronta para encantar.'}
              </p>
            </div>

            {/* Seção 1: Link Direto com Cópia com 1 Clique */}
            <div className="space-y-3 mb-5">
              <label
                htmlFor="share-letter-url"
                className="block text-xs font-bold uppercase tracking-wider text-text-muted text-left"
              >
                Link da Carta
              </label>

              <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-raised/70 p-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  id="share-letter-url"
                  type="text"
                  readOnly
                  value={letterUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  aria-label="URL da carta"
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-text outline-none truncate"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary-dark'
                  }`}
                  aria-label={copied ? 'Link copiado' : 'Copiar link'}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copiar Link</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Feedback inline de cópia */}
              <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-1"
                    role="status"
                    aria-live="polite"
                  >
                    <Check size={14} />
                    <span>Link copiado com sucesso! Agora é só colar e enviar.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Seção 2: Botão Principal de Envio no WhatsApp */}
            <div className="mb-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:bg-[#20bd5a] hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle size={20} className="fill-white shrink-0" />
                <span>Enviar no WhatsApp</span>
              </a>
            </div>

            {/* Seção 3: Gerador de QR Code com Moldura Temática */}
            <div className="mb-6 rounded-2xl border border-border/80 bg-surface-raised/50 p-4 sm:p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                <QrCode size={15} className="text-primary" />
                <span>QR Code para Presentes & Cartões Físicos</span>
              </div>

              {/* Moldura de Selo Postal com o QR Code */}
              <div
                ref={qrCanvasRef}
                className="relative mx-auto my-3 inline-block rounded-2xl border-2 border-dashed border-primary/30 bg-white p-3.5 shadow-md"
              >
                <QRCodeCanvas
                  value={letterUrl || 'https://correioelegante.studio'}
                  size={168}
                  level="H"
                  marginSize={1}
                  bgColor="#FFFFFF"
                  fgColor="#18181b"
                />
                <div
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs"
                  title="Selo Postal"
                >
                  <Heart size={12} className="fill-white" />
                </div>
              </div>

              <p className="text-[11px] text-text-light mb-3">
                Imprima ou anexe junto a uma caixa de bombons, flores ou presente físico.
              </p>

              <button
                type="button"
                onClick={handleDownloadQrCode}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-raised hover:border-primary/30 transition-colors shadow-xs cursor-pointer"
              >
                {qrDownloaded ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600">QR Code Baixado!</span>
                  </>
                ) : (
                  <>
                    <Download size={14} className="text-primary" />
                    <span>Baixar QR Code (PNG)</span>
                  </>
                )}
              </button>
            </div>

            {/* Seção 4: Ações Secundárias (Ver como Destinatário e Minhas Cartas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/70">
              <a
                href={recipientViewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs sm:text-sm font-semibold text-text hover:bg-primary/5 hover:border-primary/30 transition-colors text-center"
              >
                <ExternalLink size={15} className="text-text-muted" />
                <span>Ver como Destinatário</span>
              </a>

              <button
                type="button"
                onClick={handleNavigateToProfile}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/20 transition-colors text-center cursor-pointer"
              >
                <FolderHeart size={15} />
                <span>Minhas Cartas</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
