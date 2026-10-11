/**
 * Banco de copy curado — momento `desculpas`.
 *
 * A engine emite props marcadas `copySlot:<chave>` (ou a prop literal
 * `copySlot` com a chave como valor); o resolvedor substitui cada marca por
 * uma variante deste banco antes de persistir. Guia de voz:
 * `backend/src/generate/copy/voice-guide.md`.
 *
 * ## Interpolação
 *
 * `{nome}` é substituído pelo nome do destinatário
 * (`brief.nomes.destinatario`) no texto final. Use só onde a fala se dirige
 * à pessoa — teaser e carta. Limites são medidos sobre o texto já
 * interpolado, então deixe folga para nomes de ~12 caracteres.
 *
 * ## Regras específicas de desculpa
 *
 * Além do guia de voz geral: assumir o erro sem se flagelar, zero desculpa
 * esfarrapada ("eu sei que errei", não "eu só tava estressado"), zero
 * exigência de perdão ("você não precisa responder agora") e o sentimento de
 * quem foi machucado no centro — nunca o alívio de quem pede. Humor quase
 * não cabe aqui: uma referência anos 2000 já tiraria a sinceridade da carta,
 * então o banco não usa nenhuma.
 *
 * ## Limites
 *
 * `DESCULPAS_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem pelo menos 4 variantes, de registro
 * variado: umas mais tímidas, outras mais diretas.
 */

/** Junta parágrafos de carta com linha em branco entre eles. */
export function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const DESCULPAS_COPY = {
  /** Snippet exibido na carta selada — honesto, com vergonha assumida. Máx 60 chars. */
  'envelope.teaser': [
    '{nome}, preciso te pedir desculpas. de verdade.',
    'essa carta vem com vergonha e com verdade, {nome}.',
    '{nome}, eu errei com você. abre quando puder.',
    'não é cobrança, {nome}. é um pedido de desculpas.',
    '{nome}, isso aqui ficou pesado demais pra guardar.',
    'te devo uma conversa, {nome}. ela começa aqui.',
  ],

  /**
   * Parágrafo que nomeia o erro sem dramatizar — 2 a 3 frases. O erro é
   * chamado de erro; a reação da pessoa é validada, nunca relativizada.
   * Máx 300 chars.
   */
  'contexto.narracao': [
    'Sem rodeio: eu errei com você. Não foi mal-entendido, não foi exagero seu — foi escolha minha, e eu sei que machucou. Essa página existe porque fingir que nada aconteceu seria pior ainda.',
    'Eu fiquei dias ensaiando esse pedido e toda versão começava igual: eu falhei com você. Não vou enfeitar a frase nem suavizar o que aconteceu. Você merece ouvir isso direito.',
    'O que eu fiz doeu em você, e eu demorei pra admitir isso até pra mim. Aqui não tem justificativa bonita nem versão que me deixe bem na história. Tem só o que aconteceu e o tamanho real disso.',
    'Antes de qualquer "desculpa", preciso nomear direito: eu errei, e o erro foi meu. Você não provocou, não exagerou na reação, não deve nada. O resto dessa página é eu falando disso com honestidade.',
    'Dava pra eu ter mandado só um "foi mal" por mensagem e fingido que resolvia. Mas o que aconteceu entre a gente merece mais que isso — e você merece mais que isso.',
  ],

  /**
   * Corpo da carta — o slot mais importante do arco. 3 a 4 parágrafos:
   * nomear o erro sem "mas", reconhecer o que a pessoa sentiu, devolver o
   * próximo passo a ela. Nunca pedir perdão como cobrança, nunca aliviar a
   * própria barra. Máx 1400 chars.
   */
  'carta.corpo': [
    paras(
      '{nome},',
      'vou começar pela parte mais difícil: eu errei, e errei com você. não foi mal-entendido e não foi exagero da sua parte — foi escolha minha, daquelas que a gente só mede o tamanho depois que a poeira baixa. e a poeira baixou faz tempo.',
      'eu podia gastar essa carta explicando o dia ruim, a cabeça cheia, o que quer que tenha passado por aqui. mas explicação não apaga o que aconteceu, e você não me deve paciência pra ouvir justificativa. o que importa é o que você sentiu — e eu sei que doeu.',
      'não precisa responder agora, nem nunca, se não quiser. só peço que você saiba: eu entendi o que fiz, sinto muito, e tô aqui — sem pressa, sem cobrança.',
    ),
    paras(
      '{nome}, oi. ainda sou eu — dessa vez sem piada pra disfarçar.',
      'eu fiquei remoendo o que aconteceu e toda justificativa que eu achava morria no meio do caminho. porque justificativa é jeito de fugir da culpa, e eu não vim fugir. eu errei, ponto. te tratei de um jeito que você não merecia, e eu sei disso.',
      'o que eu mais queria era desfazer. como não dá, fica a segunda melhor coisa: dizer em voz alta que a culpa foi minha, que a sua reação fez sentido, que você não exagerou coisa nenhuma.',
      'sem pressa nenhuma. lê, guarda, joga fora se for o caso. quando — e se — você quiser conversar, eu tô aqui.',
    ),
    paras(
      'eu sei que "desculpa" de graça não paga o que a gente sente. então antes da palavra, vai o reconhecimento: o que eu fiz foi errado e machucou você — e você não fez nada pra merecer isso.',
      'não vou listar os motivos que eu tinha na cabeça naquele dia. motivo vira desculpa rápido demais, e essa carta não é pra eu sair bem dela. é pra você saber que eu enxerguei o estrago inteiro, não só a parte que me convenia.',
      'se um dia a gente voltar a conversar como antes, vai ser no seu tempo. e se não voltar, eu entendo — a mágoa é sua e ninguém decreta quando ela passa.',
      'sinto muito, {nome}. de todas essas palavras, é a única que eu deixo sem enfeite.',
    ),
    paras(
      '{nome},',
      'tem coisa que a gente só entende quando vê a cara de quem machucou. eu vi a sua. e desde aquele dia eu sei que não adianta dizer que a intenção era outra — intenção não muda o que aconteceu.',
      'eu errei contigo num momento em que você contava comigo. essa é a frase inteira, sem "mas" no final. desculpa de verdade não é pedido, é registro: eu sei o que fiz, você tem razão em tudo que sentiu, e a culpa mora aqui do meu lado.',
      'o resto — conversa, tempo, reconciliação ou silêncio — fica com você. a minha parte era parar de fugir dessa conversa. tá feito.',
    ),
    paras(
      '{nome},',
      'essa é a terceira versão dessa carta. a primeira tinha explicação demais, a segunda tinha drama demais. essa tenta ter só verdade: eu errei com você, eu sei disso, e eu sinto muito.',
      'não vou pedir pra você entender o meu lado — o meu lado não é o assunto dessa página. o assunto é o que ficou com você depois do que eu fiz: a raiva, a decepção, a vontade de sumir do mapa. tudo legítimo, e eu não contesto nada.',
      'se precisar de tempo, o tempo é seu. se precisar de distância, a distância é sua. quando você quiser falar, eu escuto — não pra me defender, pra ouvir de verdade.',
    ),
  ],

  /**
   * Fallback em texto do slot de memórias — lembrança boa sem chantagem
   * emocional: a memória não apaga o erro nem cobra perdão. Máx 300 chars.
   */
  'memorias.legenda': [
    'A gente já passou por coisa boa demais pra eu deixar um erro definir tudo. Não escrevo isso pra apagar o que aconteceu — escrevo porque essas memórias são verdade também.',
    'Eu lembro das nossas tardes de conversa à toa. Elas não servem de desculpa pra nada — mas servem de prova de que vale cuidar do que a gente tem.',
    'Se a lembrança do que eu fiz tá pesada, não tento disputar lugar com ela. Só deixo registrado que a gente guarda coisa boa também, e que eu não joguei isso fora à toa.',
    'O que a gente viveu de bom continua sendo verdade, mesmo com esse erro no meio. Não pra diminuir o erro — pra lembrar que a história não é só ele.',
    'Guardo as lembranças boas com a mesma honestidade com que assumo o erro. As duas coisas são reais; deixar só uma delas falar seria mentira.',
  ],

  /** Título da música quando o brief não traz dedicatória. Máx 80 chars. */
  'music.titulo': [
    'a música que eu ouvi pensando nessa carta',
    'pra ouvir se — e quando — você quiser',
    'essa aqui sempre me lembra você',
    'uma música nossa, sem pressão',
  ],

  /**
   * Fecho de porta aberta — entrega o próximo passo pra pessoa, sem prazo,
   * sem cobrança, sem "perdoa logo". Máx 300 chars.
   */
  'fecho.abertura': [
    'Sem pressa. Quando — e se — você quiser conversar, eu tô aqui. E se a resposta for silêncio, eu respeito também. A porta fica aberta do meu lado.',
    'Não vou pedir resposta porque essa carta já pediu bastante. Saiba só que eu tô aqui, disponível, quando fizer sentido pra você — no seu tempo.',
    'A bola tá com você agora, e ela pode ficar aí o tempo que precisar. Quando quiser conversar, eu apareço. Até lá, eu cuido do meu erro em silêncio.',
    'Não tem prazo, não tem cobrança. Se um dia você quiser falar sobre isso, me procura. Se não quiser, a carta ainda cumpriu o papel: você sabe que eu entendi.',
    'Termino como comecei: eu errei e sinto muito. O próximo passo é seu — e pode ser até nenhum. De qualquer forma, valeu por ter lido até aqui.',
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type DesculpasCopySlot = keyof typeof DESCULPAS_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const DESCULPAS_SLOT_LIMITS: Record<DesculpasCopySlot, number> = {
  'envelope.teaser': 60,
  'contexto.narracao': 300,
  'carta.corpo': 1400,
  'memorias.legenda': 300,
  'music.titulo': 80,
  'fecho.abertura': 300,
};
