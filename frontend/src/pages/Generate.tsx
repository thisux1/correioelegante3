import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { generateService, type GenerateBriefInput } from '@/services/generateService'
import { useEditorStore } from '@/editor/store/editorStore'

const MOMENTOS = [
  { id: 'crush_secreto', nome: 'Crush secreto', descricao: 'Mistério, pistas e a revelação de quem sempre quis contar', disponivel: true },
  { id: 'carta_amor', nome: 'Carta de amor', descricao: 'Memórias, intimidade e futuro', disponivel: false },
  { id: 'convite_date', nome: 'Convite pra sair', descricao: 'Chama pra um date com resposta na hora', disponivel: false },
  { id: 'pedido_namoro', nome: 'Pedido de namoro', descricao: 'Buildup, clímax e celebração', disponivel: false },
  { id: 'data_especial', nome: 'Data especial', descricao: 'Aniversário de namoro, meses juntos, conquistas', disponivel: false },
  { id: 'desculpas', nome: 'Pedido de desculpas', descricao: 'Vulnerável e direto, sem jogos', disponivel: false },
  { id: 'anonimo', nome: 'Anônimo', descricao: 'Intriga total — ela descobre aos poucos', disponivel: false },
  { id: 'so_porque_sim', nome: 'Só porque sim', descricao: 'Um gesto pequeno que vale muito', disponivel: false },
] as const

const TONS = [
  { id: 'leve', nome: 'Leve e divertido' },
  { id: 'misterioso', nome: 'Misterioso' },
  { id: 'vulneravel', nome: 'Vulnerável' },
  { id: 'cinematico', nome: 'Cinematográfico' },
] as const

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

  const handleGenerate = async () => {
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
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50/50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-rose-600">
          Correio Elegante
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-rose-950">
          Conta o essencial. A gente monta o resto.
        </h1>
        <p className="mt-3 text-lg text-rose-900/70">
          Responde umas perguntas e recebe uma página pronta — depois é só ajustar o que quiser.
        </p>

        {/* Passo 1 — momento */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-rose-950">Qual é o momento?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {MOMENTOS.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={!m.disponivel}
                onClick={() => setMomento(m.id)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  momento === m.id
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-rose-100 bg-white hover:border-rose-300'
                } ${!m.disponivel ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                <span className="block font-semibold text-rose-950">{m.nome}</span>
                <span className="mt-1 block text-sm text-rose-900/60">
                  {m.disponivel ? m.descricao : 'Em breve'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Passo 2 — brief */}
        {momento === 'crush_secreto' && (
          <section className="mt-10 space-y-6 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-rose-950" htmlFor="dest">
                Nome de quem vai receber *
              </label>
              <Input
                id="dest"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder="Duda"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-rose-900/50">Aparece no envelope e na carta.</p>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50/50 p-4">
              <input
                type="checkbox"
                checked={anonimo}
                onChange={(e) => setAnonimo(e.target.checked)}
                className="mt-1 h-4 w-4 accent-rose-600"
              />
              <span>
                <span className="block text-sm font-medium text-rose-950">
                  Manter mistério (anônimo)
                </span>
                <span className="mt-1 block text-xs text-rose-900/60">
                  Seu nome nunca aparece — a página entrega só pistas.
                </span>
              </span>
            </label>

            {!anonimo && (
              <div>
                <label className="block text-sm font-medium text-rose-950" htmlFor="rem">
                  Seu nome (opcional)
                </label>
                <Input
                  id="rem"
                  value={remetente}
                  onChange={(e) => setRemetente(e.target.value)}
                  placeholder="Rafa"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-rose-900/50">
                  Se ficar em branco, a página usa um texto neutro.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-rose-950" htmlFor="apel">
                Apelidos / como você chama a pessoa
              </label>
              <Input
                id="apel"
                value={apelidos}
                onChange={(e) => setApelidos(e.target.value)}
                placeholder="du, dudinha"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-rose-900/50">
                Separe por vírgula. Vira pista no jogo de descoberta.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-950">Tom da página</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTom(t.id)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      tom === t.id
                        ? 'border-rose-500 bg-rose-50 font-medium text-rose-950'
                        : 'border-rose-100 text-rose-900/70 hover:border-rose-300'
                    }`}
                  >
                    {t.nome}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-950" htmlFor="mem">
                Uma memória de vocês dois (opcional)
              </label>
              <TextArea
                id="mem"
                value={memoria}
                onChange={(e) => setMemoria(e.target.value)}
                placeholder="Aquele café que a gente tomou depois da aula..."
                rows={3}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-rose-900/50">
                Aparece na parte de lembranças da página.
              </p>
            </div>

            <div className="rounded-lg border border-rose-100 p-4">
              <span className="block text-sm font-medium text-rose-950">
                Pergunta que só vocês sabem (opcional)
              </span>
              <p className="mt-1 text-xs text-rose-900/60">
                Trava a revelação atrás de uma resposta que só a pessoa certa tem.
              </p>
              <Input
                value={intimidadePergunta}
                onChange={(e) => setIntimidadePergunta(e.target.value)}
                placeholder="O que tinha na xícara que você pegou emprestada?"
                className="mt-3"
              />
              <Input
                value={intimidadeResposta}
                onChange={(e) => setIntimidadeResposta(e.target.value)}
                placeholder="cappuccino"
                className="mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-950" htmlFor="mus">
                Uma música que lembra vocês (link opcional)
              </label>
              <Input
                id="mus"
                value={musicaUrl}
                onChange={(e) => setMusicaUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-950" htmlFor="ctx">
                Quer contar mais alguma coisa? (opcional)
              </label>
              <TextArea
                id="ctx"
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Do seu jeito, como se tivesse mandando um áudio..."
                rows={4}
                className="mt-1"
              />
            </div>
          </section>
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        <div className="mt-8">
          <Button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="w-full py-4 text-lg"
          >
            {loading ? 'Montando sua página...' : 'Gerar minha página'}
          </Button>
          <p className="mt-3 text-center text-sm text-rose-900/50">
            Gerar é de graça. Você só paga se decidir publicar.
          </p>
        </div>
      </div>
    </div>
  )
}
