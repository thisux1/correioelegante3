import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { PixelHeart } from '@/components/ui/PixelHeart'
import { PageRenderer } from '@/editor/components/PageRenderer'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { DEMO_PAGE_BLOCKS, DEMO_SHOWCASE_BLOCKS } from '@/data/demoBlocks'
import { MOMENTOS } from '@/data/momentos'

function OsWindowTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="os-titlebar">
      <PixelHeart className="h-3.5 w-4 shrink-0" color="#ffffff" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span className="os-caption-btn" aria-hidden="true">×</span>
    </div>
  )
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
      <p className="font-pixel-ui mb-3 text-[15px] font-bold uppercase tracking-wide text-[#be123c]">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-extrabold leading-[1.15] tracking-tight text-[#4c0519] sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-base font-medium leading-relaxed text-[#701a35] sm:text-lg">
          {sub}
        </p>
      )}
    </div>
  )
}

function Hero() {
  return (
    <section className="os-desktop relative overflow-hidden px-4 pb-16 pt-28 sm:pb-24 sm:pt-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="text-center lg:col-span-6 lg:text-left xl:col-span-6">
          <p className="font-pixel-ui mb-5 text-[15px] font-bold uppercase tracking-wide text-[#be123c]">
            {'// correio elegante · declarações em página interativa'}
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-[#4c0519] sm:text-6xl">
            Não é um textão. É uma{' '}
            <span className="font-serif italic text-[#e11d48]">página inteira</span>{' '}
            sobre vocês dois.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-[#701a35] sm:text-xl lg:mx-0">
            Conta o essencial — quem ela é, o momento, duas ou três lembranças. O Correio Elegante
            monta uma página interativa com envelope, pistas e memória. Você ajusta e publica.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Link to="/gerar" className="os-btn os-btn-primary w-full px-7 py-4 text-base sm:w-auto">
              <span>Criar minha página</span>
              <ArrowRight size={18} className="shrink-0" aria-hidden="true" />
            </Link>
            <a href="#demo-real" className="os-btn w-full px-7 py-4 text-base sm:w-auto">
              <span>Ver uma página de verdade</span>
              <ChevronDown size={18} className="shrink-0" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-6 text-sm font-medium text-[#701a35]">
            Criar e testar é grátis. Você só paga na hora de publicar.
          </p>
        </div>

        <div className="lg:col-span-6 xl:col-span-6">
          <div className="os-window mx-auto max-w-md lg:max-w-none">
            <OsWindowTitle>correio_elegante — para_voce.exe</OsWindowTitle>
            <div
              className="os-sunken m-2 max-h-[420px] overflow-y-auto p-3 sm:max-h-[480px] sm:p-4"
              data-lenis-prevent
              tabIndex={0}
              role="region"
              aria-label="Demonstração de página gerada"
            >
              <PageRenderer
                blocks={DEMO_PAGE_BLOCKS}
                theme="romantic-sunset"
                showAtmosphere={false}
              />
            </div>
            <div className="os-statusbar">
              <span className="os-sunken flex-1 px-2 py-1 font-pixel-ui text-[13px] text-[#701a35]">
                role pra ver · é uma página real, não um mockup
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Showcase() {
  const items = [
    { title: 'raspadinha.exe', caption: 'Raspa de verdade — no celular ou no mouse.', block: DEMO_SHOWCASE_BLOCKS.scratch },
    { title: 'pergunta.exe', caption: 'O botão "não" foge. A resposta certa, não.', block: DEMO_SHOWCASE_BLOCKS.quiz },
    { title: 'pistas.exe', caption: 'Uma pista por vez. O mistério dura o quanto você quiser.', block: DEMO_SHOWCASE_BLOCKS.hints },
  ]
  return (
    <section id="demo-real" className="scroll-mt-24 bg-[#fff5f7] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="É assim que chega"
          title={<>Blocos que a pessoa <span className="font-serif italic text-[#e11d48]">brinca</span>, não só lê</>}
          sub="Tudo aqui embaixo é o componente real do produto. Pode clicar, arrastar e testar."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex h-full flex-col">
              <div className="os-window flex flex-1 flex-col">
                <OsWindowTitle>{item.title}</OsWindowTitle>
                <div className="os-sunken m-2 flex flex-1 items-center justify-center p-3">
                  <div className="w-full">
                    <BlockRenderer block={item.block} mode="preview" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-[#701a35]">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Momentos() {
  return (
    <section className="os-desktop px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Começa pelo momento"
          title="Oito jeitos de dizer o que você sente"
          sub="Cada momento monta um arco diferente — a estrutura da página muda, não só o texto."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MOMENTOS.map((m) => (
            <Link
              key={m.id}
              to={`/gerar?momento=${m.id}`}
              className="os-option p-4 transition-transform hover:-translate-y-0.5"
            >
              <div className="font-pixel-ui text-[16px] font-bold leading-snug text-[#4c0519]">
                {m.nome}
              </div>
              <p className="mt-2 text-sm leading-snug text-[#701a35]">{m.descricao}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const steps = [
    {
      n: '01',
      title: 'Responde o essencial',
      desc: 'O nome dela, o momento, duas ou três lembranças. Sem formulário gigante — o resto a gente pergunta só se fizer sentido.',
    },
    {
      n: '02',
      title: 'A gente monta a página',
      desc: 'O sistema escolhe o arco do momento, escreve os textos e encaixa os blocos certos: envelope, pistas, timeline, música.',
    },
    {
      n: '03',
      title: 'Você ajusta e publica',
      desc: 'Editor com grade, arrastar e redimensionar. Sai com link e QR code — e nada vai ao ar sem o seu ok.',
    },
  ]
  return (
    <section className="bg-[#fff5f7] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Como funciona"
          title="Três passos, zero design"
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((s) => (
            <div key={s.n} className="os-window">
              <OsWindowTitle>passo_{s.n}</OsWindowTitle>
              <div className="p-5 sm:p-6">
                <div className="font-pixel-ui text-[28px] font-bold leading-none text-[#e11d48]">{s.n}</div>
                <h3 className="font-display mt-3 text-xl font-bold text-[#4c0519]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#701a35]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DentroDaPagina() {
  const features = [
    'A carta — o coração de tudo',
    'Fotos soltas onde fizerem sentido',
    'Galeria com transições suaves',
    'Vídeo enviado direto do celular',
    'Envelope que abre com um toque',
    'Raspadinha com segredo embaixo',
    'Pistas reveladas uma por vez',
    'Pergunta que desbloqueia a carta',
    'Livro de fotos que vira página',
    'Buquê de pixel-art desenhado pra ela',
    'Contagem regressiva pro date',
    'Timeline das memórias de vocês',
    'Polaroids espalhadas pela página',
    'Vídeo do YouTube embutido',
    'Música tocando enquanto ela lê',
    'Quiz com botão que foge',
  ]
  return (
    <section className="os-desktop px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="O que cabe dentro"
          title="Dezesseis peças pra montar a surpresa"
          sub="O gerador escolhe as que combinam com o seu momento. No editor, você troca o que quiser."
        />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="os-sunken flex items-center gap-3 px-4 py-3">
              <PixelHeart className="h-3 w-3.5 shrink-0" color="#e11d48" />
              <span className="text-sm font-semibold text-[#4c0519]">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Faq() {
  const faqs = [
    {
      q: 'Preciso saber escrever bem?',
      a: 'Não. Você responde perguntas simples e a página sai pronta — estrutura, textos e blocos. Depois, dá pra reescrever tudo no editor se quiser.',
    },
    {
      q: 'Quanto custa?',
      a: 'Criar e testar a página é grátis. Pra publicar: R$ 4,99 por página avulsa, ou R$ 15 por 30 dias de páginas ilimitadas. Páginas publicadas ficam no ar pra sempre.',
    },
    {
      q: 'Como a pessoa recebe?',
      a: 'Por link ou QR code. Ela abre no navegador do celular — sem instalar app, sem criar conta.',
    },
    {
      q: 'Dá pra mandar anônimo?',
      a: 'Sim. No modo anônimo, seu nome não aparece em lugar nenhum da página — a revelação fica por conta das pistas.',
    },
    {
      q: 'E se eu não gostar do que saiu?',
      a: 'A geração é um ponto de partida, não uma caixa-preta. Todo bloco vira peça de editor: move, redimensiona, troca texto, exclui e adiciona.',
    },
  ]
  return (
    <section className="bg-[#fff5f7] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Perguntas" title="O que todo mundo pergunta" />
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="os-window group">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-lg font-bold text-[#4c0519]">{f.q}</span>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-[#e11d48] transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="border-t-2 border-[#4c0519] px-5 pb-5 pt-4 text-sm leading-relaxed text-[#701a35]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="os-desktop px-4 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="os-window mx-auto max-w-3xl">
        <OsWindowTitle>ultima_chamada.exe</OsWindowTitle>
        <div className="px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-3xl font-extrabold leading-[1.15] text-[#4c0519] sm:text-5xl">
            A declaração que ela vai{' '}
            <span className="font-serif italic text-[#e11d48]">relembrar</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-[#701a35] sm:text-lg">
            Daqui a alguns minutos pode existir uma página com o nome dela, as memórias de vocês
            e uma pergunta esperando resposta.
          </p>
          <div className="mt-8">
            <Link to="/gerar" className="os-btn os-btn-primary px-8 py-4 text-base">
              <span>Criar minha página</span>
              <ArrowRight size={18} className="shrink-0" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-4 text-sm font-medium text-[#701a35]">Grátis pra criar. Paga só pra publicar.</p>
        </div>
      </div>
    </section>
  )
}

export function Home() {
  return (
    <div className="min-h-screen bg-[#fff5f7]">
      <Hero />
      <Showcase />
      <Momentos />
      <ComoFunciona />
      <DentroDaPagina />
      <Faq />
      <FinalCta />
    </div>
  )
}
