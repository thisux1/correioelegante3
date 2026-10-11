import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateService, type GenerateBriefInput } from '@/services/generateService'
import { useEditorStore } from '@/editor/store/editorStore'

const MOMENTOS = [
  { id: 'crush_secreto', nome: 'Crush secreto', descricao: 'Mistério, pistas e a revelação de quem sempre quis contar', disponivel: true },
  { id: 'carta_amor', nome: 'Carta de amor', descricao: 'Memórias, intimidade e futuro', disponivel: false },
  { id: 'convite_date', nome: 'Convite pra sair', descricao: 'Chama pra um date com resposta na hora', disponivel: false },
  { id: 'pedido_namoro', nome: 'Pedido de namoro', descricao: 'Buildup, clímax e celebração', disponivel: false },
  { id: 'data_especial', nome: 'Data especial', descricao: 'Aniversário de namoro, meses juntos, conquistas', disponivel: false },
  { id: 'desculpas', nome: 'Pedido de desculpas', descricao: 'Vulnerável e direto, sem jogos', disponivel: false },
  { id: 'anonimo', nome: 'Anônimo', descricao: 'Intriga total. Ela descobre aos poucos', disponivel: false },
  { id: 'so_porque_sim', nome: 'Só porque sim', descricao: 'Um gesto pequeno que vale muito', disponivel: false },
] as const

const TONS = [
  { id: 'leve', nome: 'Leve e divertido' },
  { id: 'misterioso', nome: 'Misterioso' },
  { id: 'vulneravel', nome: 'Vulnerável' },
  { id: 'cinematico', nome: 'Cinematográfico' },
] as const

/** Coração pixel 7x6 — sprite vetorial, não emoji. */
function PixelHeart({ className = '', color = '#e11d48' }: { className?: string; color?: string }) {
  const rows = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000']
  return (
    <svg viewBox="0 0 7 6" className={className} aria-hidden="true" shapeRendering="crispEdges">
      {rows.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />
          ) : null,
        ),
      )}
    </svg>
  )
}

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  const className = 'font-pixel-ui block text-[16px] font-bold leading-snug text-[#4c0519]'
  const content = (
    <>
      {children}
      {required && <span className="text-[#e11d48]" aria-hidden="true"> *</span>}
    </>
  )
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>{content}</label>
  ) : (
    <span className={className}>{content}</span>
  )
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="font-pixel-body mt-1 text-[20px] leading-tight text-[#9f3a58]">{children}</p>
}

export function Generate() {
  const navigate = useNavigate()
  const setPage = useEditorStore((s) => s.setPage)
  const setDraftContext = useEditorStore((s) => s.setDraftContext)

  const [momento, setMomento] = useState<string | null>(null)
  const [destinatario, setDestinatario] = useState('')
  const [remetente, setRemetente] = useState('')
  const [apelidos, setApelidos] = useState('')
  const [tom, setTom] = useState<string>('leve')
  const [contexto, setContexto] = useState('')
  const [memoria, setMemoria] = useState('')
  const [intimidadePergunta, setIntimidadePergunta] = useState('')
  const [intimidadeResposta, setIntimidadeResposta] = useState('')
  const [musicaUrl, setMusicaUrl] = useState('')
  const [anonimo, setAnonimo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = momento === 'crush_secreto' && destinatario.trim().length > 0 && !loading

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !momento) return
    setLoading(true)
    setError(null)
    try {
      const brief: GenerateBriefInput = {
        momento,
        nomes: {
          destinatario: destinatario.trim(),
          remetente: anonimo ? undefined : remetente.trim() || undefined,
        },
        apelidos: apelidos.split(',').map((a) => a.trim()).filter(Boolean),
        tom: tom as GenerateBriefInput['tom'],
        contexto: contexto.trim() || undefined,
        memorias: memoria.trim() ? [{ titulo: 'Uma memória nossa', descricao: memoria.trim() }] : [],
        perguntasIntimidade:
          intimidadePergunta.trim() && intimidadeResposta.trim()
            ? [{ pergunta: intimidadePergunta.trim(), resposta: intimidadeResposta.trim() }]
            : [],
        midias: musicaUrl.trim() ? { fotos: [], musicaUrl: musicaUrl.trim() } : undefined,
        anonimoParaDestinatario: anonimo,
      }
      const result = await generateService.generate(brief)
      setPage({ blocks: result.content.blocks, theme: result.content.theme })
      setDraftContext(null)
      navigate('/editor')
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Não consegui gerar a página. Tenta de novo.'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="os-desktop min-h-screen px-4 py-8 sm:py-14">
      <div className="os-window mx-auto w-full max-w-2xl">
        {/* Title bar */}
        <div className="os-titlebar">
          <PixelHeart className="h-3.5 w-4" color="#ffffff" />
          <span>correio_elegante.exe</span>
          <span className="os-blink ml-0.5 inline-block h-3 w-2 bg-white" aria-hidden="true" />
          <span className="flex-1" />
          <span className="flex gap-1">
            <span className="os-caption-btn" aria-hidden="true">_</span>
            <span className="os-caption-btn" aria-hidden="true">□</span>
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Fechar e voltar ao início"
              className="os-caption-btn cursor-pointer"
            >
              ×
            </button>
          </span>
        </div>

        <form className="p-5 sm:p-8" onSubmit={handleGenerate}>
          <h1 className="font-pixel-sans text-3xl font-bold leading-tight text-[#4c0519] sm:text-4xl">
            Conta o essencial. A gente monta o resto.
          </h1>
          <p className="font-pixel-body mt-2 text-[22px] leading-tight text-[#701a35]">
            Responde umas perguntas, recebe uma página pronta e ajusta o que quiser.
          </p>

          {/* Passo 1 — momento */}
          <fieldset className="mt-8">
            <legend className="font-pixel-ui text-[16px] font-bold text-[#4c0519]">
              <span className="mr-2 inline-block bg-[#e11d48] px-1.5 py-0.5 text-[#fff]">01</span>
              qual é o momento?
            </legend>
            <div className="mt-4 grid gap-3">
              {MOMENTOS.filter((m) => m.disponivel).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={momento === m.id}
                  aria-expanded={momento === m.id}
                  aria-controls="brief-panel"
                  data-selected={momento === m.id}
                  onClick={() => setMomento(m.id)}
                  className="os-option p-3"
                >
                  <span className="os-option-name font-pixel-sans block font-semibold text-[#4c0519]">
                    {m.nome}
                  </span>
                  <span className="font-pixel-body mt-0.5 block text-[20px] leading-tight text-[#9f3a58]">
                    {m.descricao}
                  </span>
                </button>
              ))}
            </div>
            <div className="os-sunken mt-3 divide-y divide-[#ffe4ec]" role="list" aria-label="Momentos em breve">
              {MOMENTOS.filter((m) => !m.disponivel).map((m) => (
                <div key={m.id} role="listitem" className="flex items-baseline justify-between gap-3 px-3 py-2">
                  <span className="font-pixel-sans text-sm font-semibold text-[#c98096]">{m.nome}</span>
                  <span className="font-pixel-body text-[18px] leading-tight text-[#c98096]">em breve</span>
                </div>
              ))}
            </div>
          </fieldset>

          {/* Passo 2 — brief */}
          <div id="brief-panel">
            {momento === 'crush_secreto' && (
            <fieldset className="os-sunken mt-8 p-4 sm:p-6">
              <legend className="font-pixel-ui bg-[#fffdfa] px-2 text-[16px] font-bold text-[#4c0519]">
                <span className="mr-2 inline-block bg-[#e11d48] px-1.5 py-0.5 text-[#fff]">02</span>
                o essencial
              </legend>
              <div className="space-y-6">
                <div>
                  <FieldLabel htmlFor="dest" required>
                    nome de quem vai receber
                  </FieldLabel>
                  <input
                    id="dest"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Duda"
                    required
                    autoComplete="off"
                    autoCapitalize="words"
                    className="os-input mt-2 min-h-[44px]"
                  />
                  <FieldHint>aparece no envelope e na carta.</FieldHint>
                </div>

                <label className="os-sunken flex cursor-pointer items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={anonimo}
                    onChange={(e) => setAnonimo(e.target.checked)}
                    className="os-check sr-only"
                  />
                  <span className="os-check-box mt-0.5" aria-hidden="true" />
                  <span>
                    <span className="font-pixel-sans block font-semibold text-[#4c0519]">
                      Manter mistério (anônimo)
                    </span>
                    <span className="font-pixel-body mt-0.5 block text-[20px] leading-tight text-[#9f3a58]">
                      seu nome nunca aparece. a página entrega só pistas.
                    </span>
                  </span>
                </label>

                {!anonimo && (
                  <div>
                    <FieldLabel htmlFor="rem">seu nome (opcional)</FieldLabel>
                    <input
                      id="rem"
                      value={remetente}
                      onChange={(e) => setRemetente(e.target.value)}
                      placeholder="Rafa"
                      autoComplete="off"
                      autoCapitalize="words"
                      className="os-input mt-2 min-h-[44px]"
                    />
                    <FieldHint>se ficar em branco, a página usa um texto neutro.</FieldHint>
                  </div>
                )}

                <div>
                  <FieldLabel htmlFor="apel">apelidos / como você chama a pessoa</FieldLabel>
                  <input
                    id="apel"
                    value={apelidos}
                    onChange={(e) => setApelidos(e.target.value)}
                    placeholder="du, dudinha"
                    className="os-input mt-2 min-h-[44px]"
                    autoComplete="off"
                  />
                  <FieldHint>separe por vírgula. vira pista no jogo de descoberta.</FieldHint>
                </div>

                <div>
                  <span id="tom-label">
                    <FieldLabel>tom da página</FieldLabel>
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby="tom-label">
                    {TONS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={tom === t.id}
                        data-selected={tom === t.id}
                        onClick={() => setTom(t.id)}
                        className="os-option min-h-[44px] px-3 py-2 text-center"
                      >
                        <span className="os-option-name font-pixel-sans text-sm font-semibold">
                          {t.nome}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="mem">uma memória de vocês dois (opcional)</FieldLabel>
                  <textarea
                    id="mem"
                    value={memoria}
                    onChange={(e) => setMemoria(e.target.value)}
                    placeholder="Aquele café que a gente tomou depois da aula..."
                    rows={3}
                    className="os-input mt-2"
                  />
                  <FieldHint>aparece na parte de lembranças da página.</FieldHint>
                </div>

                <div className="os-sunken p-4">
                  <span className="font-pixel-ui block text-[16px] font-bold text-[#4c0519]">
                    pergunta que só vocês sabem (opcional)
                  </span>
                  <p className="font-pixel-body mt-1 text-[20px] leading-tight text-[#9f3a58]">
                    trava a revelação atrás de uma resposta que só a pessoa certa tem.
                  </p>
                  <label htmlFor="intim-pergunta" className="sr-only">pergunta de intimidade</label>
                  <input
                    id="intim-pergunta"
                    value={intimidadePergunta}
                    onChange={(e) => setIntimidadePergunta(e.target.value)}
                    placeholder="O que tinha na xícara que você pegou emprestada?"
                    className="os-input mt-3 min-h-[44px]"
                  />
                  <label htmlFor="intim-resposta" className="font-pixel-body mt-3 block text-[20px] leading-tight text-[#9f3a58]">
                    resposta esperada:
                  </label>
                  <input
                    id="intim-resposta"
                    value={intimidadeResposta}
                    onChange={(e) => setIntimidadeResposta(e.target.value)}
                    placeholder="cappuccino"
                    autoComplete="off"
                    className="os-input mt-1 min-h-[44px]"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="mus">uma música que lembra vocês (link opcional)</FieldLabel>
                  <input
                    id="mus"
                    value={musicaUrl}
                    onChange={(e) => setMusicaUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="os-input mt-2 min-h-[44px]"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="ctx">quer contar mais alguma coisa? (opcional)</FieldLabel>
                  <textarea
                    id="ctx"
                    value={contexto}
                    onChange={(e) => setContexto(e.target.value)}
                    placeholder="Do seu jeito, como se tivesse mandando um áudio..."
                    rows={4}
                    className="os-input mt-2"
                  />
                </div>
              </div>
            </fieldset>
            )}
          </div>

          {error && (
            <div className="os-sunken mt-6 px-4 py-3" role="alert">
              <span className="font-pixel-ui text-[16px] font-bold text-[#be123c]">erro: </span>
              <span className="font-pixel-body text-[20px] text-[#701a35]">{error}</span>
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={!canSubmit}
              className="os-btn os-btn-primary min-h-[52px] w-full px-6 text-lg"
            >
              <PixelHeart className="h-3.5 w-4" color="#ffffff" />
              {loading ? 'montando sua página...' : 'gerar minha página'}
            </button>
            <p className="font-pixel-body mt-3 text-center text-[20px] leading-tight text-[#9f3a58]">
              gerar é de graça. você só paga se decidir publicar.
            </p>
          </div>
        </form>

        {/* Status bar */}
        <div className="os-statusbar" aria-live="polite">
          {loading ? (
            <span className="flex flex-1 items-center gap-2 px-1">
              <span className="font-pixel-body text-[20px] leading-tight text-[#9f3a58]">
                compilando blocos
              </span>
              <span className="os-progress flex-1" role="progressbar" aria-label="Gerando página">
                <span className="os-progress-fill block" />
              </span>
            </span>
          ) : (
            <span className="os-sunken flex-1 px-3 py-1.5 font-pixel-body text-[20px] leading-tight text-[#9f3a58]">
              {canSubmit
                ? 'pronto pra gerar.'
                : momento
                  ? 'falta o nome de quem vai receber.'
                  : 'aguardando seleção de momento.'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
