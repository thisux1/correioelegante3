import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { generateService, type GenerateBriefInput, type InterpretedBriefFields } from '@/services/generateService'
import { useEditorStore } from '@/editor/store/editorStore'
import { MOMENTOS } from '@/data/momentos'
import { PixelHeart } from '@/components/ui/PixelHeart'
import { Turnstile, type TurnstileRef } from '@/components/ui/Turnstile'

const TONS = [
  { id: 'leve', nome: 'Leve e divertido' },
  { id: 'misterioso', nome: 'Misterioso' },
  { id: 'vulneravel', nome: 'Vulnerável' },
  { id: 'cinematico', nome: 'Cinematográfico' },
] as const

interface MomentoCampos {
  /** 'forced' esconde o checkbox e sempre envia anônimo. */
  anonimo?: boolean | 'forced'
  apelidos?: boolean
  memoria?: boolean
  intimidade?: boolean
  evento?: boolean
  musica?: boolean
}

const MOMENTO_CAMPOS: Record<string, MomentoCampos> = {
  crush_secreto: { anonimo: true, apelidos: true, memoria: true, intimidade: true, musica: true },
  carta_amor: { anonimo: true, memoria: true, musica: true },
  convite_date: { anonimo: true, evento: true, musica: true },
  pedido_namoro: { anonimo: true, apelidos: true, memoria: true, intimidade: true, evento: true, musica: true },
  data_especial: { anonimo: true, memoria: true, evento: true, musica: true },
  desculpas: { anonimo: true, memoria: true, musica: true },
  anonimo: { anonimo: 'forced', apelidos: true, intimidade: true },
  so_porque_sim: { anonimo: true, memoria: true, musica: true },
}

const CAMPOS_PADRAO: Required<Omit<MomentoCampos, 'anonimo'>> & { anonimo: true } = {
  anonimo: true,
  apelidos: true,
  memoria: true,
  intimidade: true,
  evento: true,
  musica: true,
}

const BRIEF_DRAFT_KEY = 'ce:brief:draft'

interface BriefDraft {
  momento: string | null
  destinatario: string
  remetente: string
  apelidos: string
  tom: string
  contexto: string
  memoria: string
  intimidadePergunta: string
  intimidadeResposta: string
  musicaUrl: string
  eventoData: string
  eventoLugar: string
  anonimo: boolean
}

function loadBriefDraft(): Partial<BriefDraft> {
  try {
    const raw = window.localStorage.getItem(BRIEF_DRAFT_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Partial<BriefDraft>)
      : {}
  } catch {
    return {}
  }
}

/** Exemplos alinhados à MOMENTO_CAMPOS — só preenchem campos ainda vazios. */
const EXEMPLOS: Record<string, Partial<BriefDraft>> = {
  crush_secreto: {
    destinatario: 'Luiza',
    apelidos: 'lu, lulu',
    tom: 'misterioso',
    memoria: 'o dia que o elevador travou e a gente ficou conversando no hall como se já se conhecesse há anos.',
    intimidadePergunta: 'qual sabor você sempre pede na sorveteria?',
    intimidadeResposta: 'pistache',
    anonimo: true,
  },
  carta_amor: {
    destinatario: 'Amor',
    remetente: 'Seu amor',
    tom: 'vulneravel',
    memoria: 'a primeira viagem de ônibus juntos, você dormindo no meu ombro o caminho inteiro.',
  },
  convite_date: {
    destinatario: 'Duda',
    tom: 'leve',
    eventoData: 'sábado, 19h',
    eventoLugar: 'café Aurora',
    contexto: 'quero chamar pra jantar sem parecer formal demais.',
  },
  pedido_namoro: {
    destinatario: 'Bia',
    apelidos: 'bia, binha',
    tom: 'vulneravel',
    memoria: 'o piquenique improvisado na varanda quando faltou luz no prédio.',
    intimidadePergunta: 'qual filme a gente nunca terminou de ver?',
    intimidadeResposta: 'sobre o tempo',
    eventoData: 'domingo, 17h',
    eventoLugar: 'nossa varanda',
  },
  data_especial: {
    destinatario: 'Amor',
    tom: 'cinematico',
    memoria: 'o primeiro dia, quando você chegou de tênis vermelho.',
    eventoData: '14 de junho',
    eventoLugar: 'onde tudo começou',
  },
  desculpas: {
    destinatario: 'Duda',
    tom: 'vulneravel',
    memoria: 'a nossa mania de fazer as pazes com café coado.',
    contexto: 'briguei por bobagem e quero assumir, sem chantagem.',
  },
  anonimo: {
    destinatario: 'Marina',
    apelidos: 'nina',
    tom: 'misterioso',
    intimidadePergunta: 'em qual banco da praça você sempre senta?',
    intimidadeResposta: 'o que fica embaixo da árvore grande',
    anonimo: true,
  },
  so_porque_sim: {
    destinatario: 'Vida',
    tom: 'leve',
    memoria: 'terça passada, você cantando no chuveiro sem saber que eu ouvia.',
  },
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

/** O que a página faz quando o campo fica vazio — transparência total sobre fallback. */
function FieldFallback({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-pixel-body mt-1 text-[18px] leading-tight text-[#9f3a58]">
      <span className="font-semibold">em branco:</span> {children}
    </p>
  )
}

export function Generate() {
  const navigate = useNavigate()
  const setPage = useEditorStore((s) => s.setPage)
  const setDraftContext = useEditorStore((s) => s.setDraftContext)

  const [searchParams] = useSearchParams()
  const [draft] = useState(loadBriefDraft)
  const [momento, setMomento] = useState<string | null>(() => {
    const m = searchParams.get('momento')
    if (MOMENTOS.some((x) => x.id === m && x.disponivel)) return m
    return MOMENTOS.some((x) => x.id === draft.momento && x.disponivel)
      ? draft.momento!
      : null
  })
  const [destinatario, setDestinatario] = useState(draft.destinatario ?? '')
  const [remetente, setRemetente] = useState(draft.remetente ?? '')
  const [apelidos, setApelidos] = useState(draft.apelidos ?? '')
  const [tom, setTom] = useState<string>(
    TONS.some((t) => t.id === draft.tom) ? draft.tom! : 'leve',
  )
  const [contexto, setContexto] = useState(draft.contexto ?? '')
  const [memoria, setMemoria] = useState(draft.memoria ?? '')
  const [intimidadePergunta, setIntimidadePergunta] = useState(draft.intimidadePergunta ?? '')
  const [intimidadeResposta, setIntimidadeResposta] = useState(draft.intimidadeResposta ?? '')
  const [musicaUrl, setMusicaUrl] = useState(draft.musicaUrl ?? '')
  const [eventoData, setEventoData] = useState(draft.eventoData ?? '')
  const [eventoLugar, setEventoLugar] = useState(draft.eventoLugar ?? '')
  const [anonimo, setAnonimo] = useState(draft.anonimo ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [textoLivre, setTextoLivre] = useState('')
  const [interpreting, setInterpreting] = useState(false)
  const [interpretNote, setInterpretNote] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileRef>(null)
  const turnstileTokenRef = useRef<string | null>(null)

  // Rascunho do brief: recarregar ou sair e voltar não perde o que foi escrito.
  useEffect(() => {
    const snapshot: BriefDraft = {
      momento,
      destinatario,
      remetente,
      apelidos,
      tom,
      contexto,
      memoria,
      intimidadePergunta,
      intimidadeResposta,
      musicaUrl,
      eventoData,
      eventoLugar,
      anonimo,
    }
    try {
      window.localStorage.setItem(BRIEF_DRAFT_KEY, JSON.stringify(snapshot))
    } catch {
      // storage indisponível — o brief vive só em memória
    }
  }, [
    momento,
    destinatario,
    remetente,
    apelidos,
    tom,
    contexto,
    memoria,
    intimidadePergunta,
    intimidadeResposta,
    musicaUrl,
    eventoData,
    eventoLugar,
    anonimo,
  ])

  const campos: MomentoCampos = momento ? (MOMENTO_CAMPOS[momento] ?? CAMPOS_PADRAO) : CAMPOS_PADRAO
  const anonimoEfetivo = campos.anonimo === 'forced' ? true : anonimo
  const canSubmit = momento !== null && destinatario.trim().length > 0 && !loading

  // Preenche apenas campos ainda vazios — nunca sobrescreve o que a pessoa
  // já escreveu. O exemplo respeita a matriz de campos do momento.
  const handleExemplo = () => {
    if (!momento) return
    const ex = EXEMPLOS[momento]
    if (!ex) return
    if (!destinatario.trim() && ex.destinatario) setDestinatario(ex.destinatario)
    if (!remetente.trim() && ex.remetente) setRemetente(ex.remetente)
    if (!apelidos.trim() && ex.apelidos) setApelidos(ex.apelidos)
    if (!contexto.trim() && ex.contexto) setContexto(ex.contexto)
    if (!memoria.trim() && ex.memoria) setMemoria(ex.memoria)
    if (!intimidadePergunta.trim() && ex.intimidadePergunta) setIntimidadePergunta(ex.intimidadePergunta)
    if (!intimidadeResposta.trim() && ex.intimidadeResposta) setIntimidadeResposta(ex.intimidadeResposta)
    if (!musicaUrl.trim() && ex.musicaUrl) setMusicaUrl(ex.musicaUrl)
    if (!eventoData.trim() && ex.eventoData) setEventoData(ex.eventoData)
    if (!eventoLugar.trim() && ex.eventoLugar) setEventoLugar(ex.eventoLugar)
    if (ex.tom && TONS.some((t) => t.id === ex.tom)) setTom(ex.tom)
    if (ex.anonimo !== undefined && campos.anonimo === true) setAnonimo(ex.anonimo)
  }

  /**
   * Texto livre → brief interpretado (S11). Preenche só campos vazios e
   * seleciona momento/tom quando o modelo tem confiança — nunca sobrescreve
   * o que a pessoa já digitou. Fallback do backend vira `contexto`.
   */
  const applyInterpreted = (fields: InterpretedBriefFields) => {
    if (!momento && fields.momento && MOMENTOS.some((m) => m.id === fields.momento && m.disponivel)) {
      setMomento(fields.momento)
    }
    if (fields.tom && TONS.some((t) => t.id === fields.tom)) setTom(fields.tom)
    if (!destinatario.trim() && fields.destinatario) setDestinatario(fields.destinatario)
    if (!remetente.trim() && fields.remetente) setRemetente(fields.remetente)
    if (!apelidos.trim() && fields.apelidos?.length) setApelidos(fields.apelidos.join(', '))
    if (!contexto.trim() && fields.contexto) setContexto(fields.contexto)
    const primeiraMemoria = fields.memorias?.[0]
    if (!memoria.trim() && primeiraMemoria) {
      setMemoria(primeiraMemoria.descricao ?? primeiraMemoria.titulo)
    }
    const primeiraPergunta = fields.perguntasIntimidade?.[0]
    if (!intimidadePergunta.trim() && primeiraPergunta) setIntimidadePergunta(primeiraPergunta.pergunta)
    if (!intimidadeResposta.trim() && primeiraPergunta) setIntimidadeResposta(primeiraPergunta.resposta)
    if (!eventoData.trim() && fields.evento?.data) setEventoData(fields.evento.data)
    if (!eventoLugar.trim() && fields.evento?.lugar) setEventoLugar(fields.evento.lugar)
    if (!musicaUrl.trim() && fields.musicaUrl) setMusicaUrl(fields.musicaUrl)
    if (fields.anonimoParaDestinatario === true) setAnonimo(true)
  }

  const handleInterpret = async () => {
    const texto = textoLivre.trim()
    if (texto.length < 10 || interpreting) return
    setInterpreting(true)
    setInterpretNote(null)
    setError(null)
    try {
      const result = await generateService.interpret(texto, turnstileTokenRef.current ?? undefined)
      applyInterpreted(result.fields)
      setInterpretNote(
        result.source === 'llm'
          ? 'preenchi o que encontrei no seu texto — revisa embaixo antes de gerar.'
          : 'não consegui interpretar agora — seu texto foi pro campo de contexto.',
      )
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Não consegui interpretar o texto. Tenta de novo.'
      setError(message)
    } finally {
      turnstileRef.current?.reset()
      turnstileTokenRef.current = null
      setInterpreting(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !momento) return
    setLoading(true)
    setError(null)
    try {
      const evento =
        campos.evento && (eventoData.trim() || eventoLugar.trim())
          ? { data: eventoData.trim() || undefined, lugar: eventoLugar.trim() || undefined }
          : undefined
      const brief: GenerateBriefInput = {
        momento,
        nomes: {
          destinatario: destinatario.trim(),
          remetente: anonimoEfetivo ? undefined : remetente.trim() || undefined,
        },
        apelidos: campos.apelidos ? apelidos.split(',').map((a) => a.trim()).filter(Boolean) : [],
        tom: tom as GenerateBriefInput['tom'],
        contexto: contexto.trim() || undefined,
        memorias:
          campos.memoria && memoria.trim()
            ? [{ titulo: 'Uma memória nossa', descricao: memoria.trim() }]
            : [],
        perguntasIntimidade:
          campos.intimidade && intimidadePergunta.trim() && intimidadeResposta.trim()
            ? [{ pergunta: intimidadePergunta.trim(), resposta: intimidadeResposta.trim() }]
            : [],
        evento,
        midias: campos.musica && musicaUrl.trim() ? { fotos: [], musicaUrl: musicaUrl.trim() } : undefined,
        anonimoParaDestinatario: anonimoEfetivo,
      }
      const result = await generateService.generate(brief, turnstileTokenRef.current ?? undefined)
      setPage({
        blocks: result.content.blocks,
        sections: result.content.sections,
        theme: result.content.theme,
      })
      setDraftContext(null)
      try {
        window.localStorage.removeItem(BRIEF_DRAFT_KEY)
      } catch {
        // ignora — rascunho antigo não é problema
      }
      navigate('/editor')
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Não consegui gerar a página. Tenta de novo.'
      setError(message)
      turnstileRef.current?.reset()
      turnstileTokenRef.current = null
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

          {/* Entrada alternativa — texto livre interpretado por IA */}
          <fieldset className="os-sunken mt-8 p-4 sm:p-5">
            <legend className="font-pixel-ui bg-[#fffdfa] px-2 text-[16px] font-bold text-[#4c0519]">
              ou conta do seu jeito
            </legend>
            <p className="font-pixel-body text-[20px] leading-tight text-[#9f3a58]">
              Escreve como se tivesse mandando um áudio: pra quem é, o que rolou entre
              vocês, o que você quer sentir na página. Eu preencho o formulário por você.
            </p>
            <label htmlFor="texto-livre" className="sr-only">
              Conta a história do seu jeito
            </label>
            <textarea
              id="texto-livre"
              value={textoLivre}
              onChange={(e) => setTextoLivre(e.target.value)}
              placeholder="tipo: quero fazer uma surpresa pra Marina, a gente se conheceu num ônibus e desde então..."
              rows={4}
              maxLength={4000}
              className="os-input mt-3"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleInterpret}
                disabled={textoLivre.trim().length < 10 || interpreting || loading}
                className="os-btn min-h-[44px] px-4 font-pixel-ui text-[14px]"
              >
                {interpreting ? 'entendendo...' : 'preencher por mim'}
              </button>
              {interpretNote && (
                <p className="font-pixel-body text-[19px] leading-tight text-[#701a35]" role="status">
                  {interpretNote}
                </p>
              )}
            </div>
          </fieldset>

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
            {MOMENTOS.some((m) => !m.disponivel) && (
              <div className="os-sunken mt-3 divide-y divide-[#ffe4ec]" role="list" aria-label="Momentos em breve">
                {MOMENTOS.filter((m) => !m.disponivel).map((m) => (
                  <div key={m.id} role="listitem" className="flex items-baseline justify-between gap-3 px-3 py-2">
                    <span className="font-pixel-sans text-sm font-semibold text-[#c98096]">{m.nome}</span>
                    <span className="font-pixel-body text-[18px] leading-tight text-[#c98096]">em breve</span>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          {/* Passo 2 — brief */}
          <div id="brief-panel">
            {momento !== null && (
            <fieldset className="os-sunken mt-8 p-4 sm:p-6">
              <legend className="font-pixel-ui bg-[#fffdfa] px-2 text-[16px] font-bold text-[#4c0519]">
                <span className="mr-2 inline-block bg-[#e11d48] px-1.5 py-0.5 text-[#fff]">02</span>
                o essencial
              </legend>
              {EXEMPLOS[momento] && (
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="font-pixel-body text-[20px] leading-tight text-[#9f3a58]">
                    sem ideia de onde começar?
                  </p>
                  <button
                    type="button"
                    onClick={handleExemplo}
                    className="os-btn min-h-[44px] shrink-0 px-4 font-pixel-ui text-[14px]"
                  >
                    ver um exemplo
                  </button>
                </div>
              )}
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

                {campos.anonimo === true && (
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
                )}

                {!anonimoEfetivo && (
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
                    <FieldHint>aparece na assinatura da página.</FieldHint>
                    <FieldFallback>a assinatura sai neutra, sem nome inventado.</FieldFallback>
                  </div>
                )}

                {campos.apelidos && (
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
                    <FieldHint>separe por vírgula. viram pistas e detalhes na copy.</FieldHint>
                    <FieldFallback>a página usa só o nome.</FieldFallback>
                  </div>
                )}

                {campos.evento && (
                  <div className="os-sunken p-4">
                    <span className="font-pixel-ui block text-[16px] font-bold text-[#4c0519]">
                      quando e onde (opcional)
                    </span>
                    <p className="font-pixel-body mt-1 text-[20px] leading-tight text-[#9f3a58]">
                      vira contagem regressiva e convite com lugar marcado.
                    </p>
                    <FieldFallback>o convite sai sem data nem lugar — dá pra completar no editor depois.</FieldFallback>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="evt-data" className="sr-only">data do evento</label>
                        <input
                          id="evt-data"
                          value={eventoData}
                          onChange={(e) => setEventoData(e.target.value)}
                          placeholder="sábado, 14 de junho, 19h"
                          autoComplete="off"
                          className="os-input min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label htmlFor="evt-lugar" className="sr-only">lugar do evento</label>
                        <input
                          id="evt-lugar"
                          value={eventoLugar}
                          onChange={(e) => setEventoLugar(e.target.value)}
                          placeholder="sorveteria da praça"
                          autoComplete="off"
                          className="os-input min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

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

                {campos.memoria && (
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
                    <FieldFallback>a página sai sem a seção de lembranças.</FieldFallback>
                  </div>
                )}

                {campos.intimidade && (
                <div className="os-sunken p-4">
                  <span className="font-pixel-ui block text-[16px] font-bold text-[#4c0519]">
                    pergunta que só vocês sabem (opcional)
                  </span>
                  <p className="font-pixel-body mt-1 text-[20px] leading-tight text-[#9f3a58]">
                    trava a revelação atrás de uma resposta que só a pessoa certa tem.
                  </p>
                  <FieldFallback>a revelação abre direto, sem trava secreta.</FieldFallback>
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
                )}

                {campos.musica && (
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
                    <FieldHint>vira a trilha da página.</FieldHint>
                    <FieldFallback>sai sem música — dá pra adicionar depois no editor.</FieldFallback>
                  </div>
                )}

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
                  <FieldHint>tudo que você contar vira tom e detalhe na página.</FieldHint>
                  <FieldFallback>a gente monta só com o essencial mesmo.</FieldFallback>
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
            <Turnstile
              ref={turnstileRef}
              action="generate_page"
              onSuccess={(token) => {
                turnstileTokenRef.current = token
              }}
              onExpire={() => {
                turnstileTokenRef.current = null
              }}
              onError={() => {
                turnstileTokenRef.current = null
              }}
              className="mb-3 flex items-center justify-center min-h-[65px]"
            />
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
