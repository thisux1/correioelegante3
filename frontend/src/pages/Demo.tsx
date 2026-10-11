import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AtmosphereCanvas } from '@/components/animations/AtmosphereCanvas'
import { EnvelopeUnboxing } from '@/components/animations/EnvelopeUnboxing'
import { PageRenderer } from '@/editor/components/PageRenderer'
import { PixelHeart } from '@/components/ui/PixelHeart'
import { buildThemeStyle, getThemeAtmosphere } from '@/editor/themes'
import { DEMO_PAGE_BLOCKS, DEMO_PAGE_THEME } from '@/data/demoPage'

export function Demo() {
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false)
  const atmosphere = getThemeAtmosphere(DEMO_PAGE_THEME)

  useEffect(() => {
    document.title = 'Correio Elegante — Demo ao vivo'

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const created = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    const previous = meta.getAttribute('content')
    meta.setAttribute(
      'content',
      'Abra uma página real gerada pelo Correio Elegante: envelope, raspadinha, pistas e carta. Crie a sua em minutos.',
    )

    return () => {
      document.title = 'Correio Elegante'
      if (created && meta.parentNode) {
        meta.parentNode.removeChild(meta)
      } else if (previous !== null) {
        meta.setAttribute('content', previous)
      }
    }
  }, [])

  const envelopeBlock = DEMO_PAGE_BLOCKS.find((b) => b.type === 'envelope')
  const recipientName =
    envelopeBlock && 'recipientName' in envelopeBlock.props
      ? (envelopeBlock.props as { recipientName?: string }).recipientName
      : undefined

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 pb-24 pt-24 sm:px-6"
      style={buildThemeStyle(DEMO_PAGE_THEME)}
    >
      <AtmosphereCanvas atmosphere={atmosphere} position="fixed" />

      {!isEnvelopeOpened && (
        <EnvelopeUnboxing
          recipientName={recipientName}
          theme={DEMO_PAGE_THEME}
          onOpenComplete={() => setIsEnvelopeOpened(true)}
        />
      )}

      <div
        className={`relative z-10 mx-auto w-full max-w-3xl transition-all duration-300 ${
          isEnvelopeOpened ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!isEnvelopeOpened}
      >
        <div className="os-window">
          <div className="os-titlebar">
            <PixelHeart className="h-3.5 w-4 shrink-0" color="#ffffff" />
            <span className="min-w-0 flex-1 truncate">para_marina.exe</span>
            <span className="os-caption-btn" aria-hidden="true">×</span>
          </div>
          <div className="p-4 sm:p-8">
            <PageRenderer
              blocks={DEMO_PAGE_BLOCKS}
              theme={DEMO_PAGE_THEME}
              showAtmosphere={false}
            />
            <div className="mt-8 border-t-2 border-[#ffe4ec] pt-6 text-center">
              <p className="font-pixel-ui mb-4 text-[15px] font-bold text-[#701a35]">
                ESSA PÁGINA FOI GERADA PELO CORREIO ELEGANTE
              </p>
              <Link
                to="/gerar"
                className="os-btn os-btn-primary inline-flex px-7 py-3.5 text-base"
              >
                <span>Crie a sua</span>
                <ArrowRight size={18} className="shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="os-statusbar">
            <span className="os-sunken flex-1 px-2 py-1 font-pixel-ui text-[13px] text-[#701a35]">
              demo ao vivo · todos os blocos são interativos de verdade
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
