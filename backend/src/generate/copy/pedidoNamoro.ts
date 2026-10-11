/**
 * Banco de copy curado — momento `pedido_namoro`.
 *
 * O pedido de namoro é o arco mais cheio do produto: a página recapitula a
 * história do casal antes de fazer a pergunta. A engine emite props marcadas
 * `copySlot:<chave>`; o resolvedor substitui cada marca por uma variante
 * deste banco antes de persistir. Guia de voz:
 * `backend/src/generate/copy/voice-guide.md`.
 *
 * ## Interpolação
 *
 * `{nome}` é substituído pelo nome do destinatário
 * (`brief.nomes.destinatario`) no texto final. Use só onde a fala se dirige
 * à pessoa — teaser, gate, pergunta, carta. Limites são medidos sobre o
 * texto já interpolado, então deixe folga para nomes de ~12 caracteres.
 *
 * ## Tom deste momento
 *
 * O pedido é vulnerável e decisivo: a voz nomeia o medo ("tô tremendo"),
 * recapitula a história com detalhe concreto e faz a pergunta como porta
 * aberta — nunca como pressão. O "não" do quiz foge (isPlayfulNo), então o
 * medo de estragar tudo vira brincadeira; na carta, o "não" é acolhido de
 * verdade ("a gente ri disso depois").
 *
 * ## Limites
 *
 * `PEDIDO_NAMORO_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem de 4 a 6 variantes, com registro
 * variado: umas mais tímidas, outras mais diretas.
 */

/** Junta parágrafos de carta com linha em branco entre eles. */
export function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const PEDIDO_NAMORO_COPY = {
  /** Snippet exibido na carta selada — avisa que tem pergunta ali dentro. Máx 60 chars. */
  'envelope.teaser': [
    '{nome}, abre. tem uma pergunta te esperando.',
    'essa carta guarda uma pergunta faz tempo, {nome}.',
    '{nome}, o fim dessa página muda o status de tudo.',
    'abre com calma, {nome}. a última parte é sério.',
    '{nome}, tem pergunta que só cabe por escrito.',
    '{nome}, reescrevi isso umas dez vezes antes de mandar.',
  ],

  /**
   * Parágrafo de recapitulação — "a gente já tá quase lá faz tempo".
   * Abre a seção de história antes das memórias. Máx 400 chars.
   */
  narrativa: [
    'A gente já tá quase lá faz tempo, né. Já tem lugar que é nosso, já tem piada que só faz sentido entre a gente, já tem música que eu não consigo ouvir sem pensar em você. Só faltava uma coisa deixar de ser "quase" — e ela tá logo ali embaixo.',
    'Se a gente fosse parar pra contar, dava uma linha do tempo inteira: o dia em que a gente se conheceu, o primeiro "fica mais um pouco", a vez em que você riu tão alto que eu esqueci o assunto. Cada pedaço foi virando a gente. Essa página é o que vem depois de tudo isso.',
    'Todo mundo em volta já trata a gente como um par faz tempo. "cadê?", "chega junto?", "uma mesa pra dois". Faltava só a gente admitir em voz alta — e é exatamente isso que essa página faz daqui a pouco.',
    'Se isso fosse 2009, nosso status no Orkut já teria mudado faz tempo. Como não é, ficou aquele "quase" bonito enrolando a gente: quase namoro, quase oficial, quase assumido. Eu vim aqui tirar o quase do caminho.',
    'Tem coisa que amadurece devagar e chega pronta. A gente construiu isso aqui em lanche dividido, conversa que estica e silêncio que não aperta. Não foi à toa — foi tijolo por tijolo. Agora falta só colocar o nome na porta.',
  ],

  /**
   * Fallback textual do slot de memórias — recapitula a história quando o
   * brief não traz fotos, memórias ou música; também serve de legenda
   * quando um único módulo de mídia sobra no pick. Máx 300 chars.
   */
  'memorias.fallback': [
    'A nossa história até aqui não cabe em moldura nenhuma: é o lanche dividido sem combinar, a conversa que estica sem pedir licença, o seu nome que eu já escrevo até sem pensar. Foi somando esses nadas que virou tudo.',
    'Tem memória que não precisa de foto pra ficar nítida: o dia em que a gente se perdeu e fingiu que era passeio, a madrugada em que a conversa não deixava dormir, a risada que escapou antes da piada acabar. Cada uma dessas eu guardo de cor.',
    'Se a nossa história fosse um depoimento, eu já tinha escrito umas quinze vezes. Como é página, vai por partes: cada pedaço dela mora num cantinho aqui embaixo. Desce devagar que eu conto tudo — a parte mais importante é a última.',
    'A gente guarda as coisas de jeitos diferentes: eu em bilhete mental, você em conversa decorada. O que eu sei é que nenhum dia com você passou em branco — e o resto dessa página é a prova.',
  ],

  /** Título de capa do photoBook. Máx 60 chars. */
  'photoBook.titulo': [
    'a história até aqui, em fotos',
    'nosso álbum de quase-namoro',
    'tudo o que a gente já foi',
    'antes do oficial, já era a gente',
    'capítulos que a gente já viveu',
  ],

  /** Subtítulo de capa do photoBook. Máx 80 chars. */
  'photoBook.subtitulo': [
    'vira a página. o melhor capítulo tá no final.',
    'cada foto dessas foi ensaio pra pergunta de hoje.',
    'foi assim que a gente virou a gente.',
    'olha o que a gente construiu sem perceber.',
    'o próximo capítulo a gente escreve juntos.',
  ],

  /**
   * A pergunta do quiz — o clímax do arco. Toda variante É o pedido:
   * sem metáfora, sem indireta. O botão "não" foge (isPlayfulNo).
   * Neutras de gênero sempre que possível. Máx 80 chars.
   */
  'quiz.pergunta': [
    'quer namorar comigo?',
    'topa oficializar isso aqui?',
    'me deixa te chamar de meu bem pra valer?',
    '{nome}, quer namorar comigo?',
    'a gente namora ou não namora?',
    'posso te pedir em namoro agora?',
  ],

  /** Texto do botão de aceite do quiz. Máx 24 chars. */
  'quiz.sim': [
    'sim',
    'quero',
    'aceito',
    'mil vezes sim',
    'claro que sim',
    'agora é oficial',
  ],

  /** Texto do botão que foge — o não que nunca se concretiza. Máx 24 chars. */
  'quiz.nao': [
    'não',
    'nem tenta',
    'hoje não',
    'esse botão foge',
    'tenta de novo',
  ],

  /**
   * Mensagem pós-sim do quiz — alegria sem soberba: o alívio de quem
   * estava com medo de verdade. Máx 120 chars.
   */
  'quiz.sucesso': [
    'é oficial. eu vou lembrar dessa hora pra sempre.',
    'melhor sim da minha vida — e eu nem perguntei de joelhos.',
    'agora posso te chamar de meu bem sem medo.',
    'pronto. pode atualizar o status que agora é real.',
    'eu tava tremendo esperando esse "sim". valeu a coragem.',
    'a gente namora. que seja eterno enquanto dure.',
  ],

  /** Texto antes do gate de intimidade — checkpoint antes da pergunta. Máx 80 chars. */
  'intimacyGate.intro': [
    'antes da pergunta, prova que é {nome} mesmo:',
    'só quem viveu a nossa história sabe essa:',
    'checkpoint rápido — a pergunta merece a pessoa certa:',
    'pra abrir a última parte, responde direitinho:',
    'essa é só pra quem é de verdade, {nome}:',
  ],

  /**
   * Fallback textual da pergunta — quando o brief proíbe quiz/jogos,
   * a pergunta ainda precisa aparecer. Máx 80 chars.
   */
  'pergunta.texto': [
    '{nome}, quer namorar comigo?',
    'a pergunta inteira, sem jogo: quer namorar comigo?',
    'sem botão, sem enfeite: quer namorar comigo?',
    'quer namorar comigo? a resposta vem quando você quiser.',
    'no fundo a página inteira era só isso: quer namorar comigo?',
  ],

  /**
   * Corpo da carta — o pedido em prosa, pra quem rola a página direto
   * e passa do quiz. 3 a 4 parágrafos: abertura, história concreta,
   * a pergunta com o medo nomeado, fechamento de porta aberta.
   * Máx 1400 chars.
   */
  'carta.corpo': [
    paras(
      '{nome}, oi. Senta um pouquinho que essa parte eu ensaiei mais do que admito.',
      'A gente já faz tudo que um casal faz: eu sei o seu pedido no lanche sem perguntar, você sabe quando meu dia foi ruim antes de eu abrir a boca, a gente já briga por besteira e faz as pazes sem tratado. Só faltava o nome disso tudo.',
      'Tô escrevendo isso com o coração fazendo hora extra, então vou direto: quer namorar comigo? Não no "quase", não no "deixa quieto" — pra valer, com direito a apresentação oficial e tudo que vem junto.',
      'Se a resposta for não, a gente ri disso depois e eu finjo que foi um plano elaborado. Mas se for sim — e eu torço muito que seja — a gente acabou de começar a melhor parte da história.',
    ),
    paras(
      'Olha, {nome}: se fosse 2009, eu trocava o status no Orkut e torcia pra você captar a indireta. Como não é, eu escrevo a pergunta inteira aqui.',
      'Eu pensei muito em como fazer isso do tamanho que você merece. Pensei em serenata (não sei cantar), em cartaz na rua (vergonha demais), em falar de improviso (ia tropeçar na palavra). Daí lembrei que o que a gente tem sempre começou por escrito — recado, mensagem longa de madrugada, conversa que não acabava nunca.',
      'Então vai assim mesmo, do nosso jeito: quer namorar comigo? Quer dividir lanche, plano e calendário comigo? Quer que a gente possa dizer "meu namoro" quando fala um do outro?',
      'Sem pressão nenhuma: se quiser pensar, eu espero. Se quiser dizer não, eu sobrevivo e a gente segue sendo o que já é. Eu só não conseguia mais guardar a pergunta aqui dentro — ela cresceu demais.',
    ),
    paras(
      '{nome}, chegou a parte que eu mais ensaiei e menos consegui decorar.',
      'Você já deve ter percebido que essa página inteira era desculpa. A história que eu recapitulei, o suspense, o rodeio bonito — tudo isso era o meu jeito torto de criar coragem pra uma frase só. Uma frase de três palavrinhas que vem pesando no peito faz tempo.',
      'Quer namorar comigo?',
      'Pronto, falei. Tô tremendo e não dá pra esconder — se essa carta falasse em voz alta, ela gaguejava. Do dia em que a gente se conheceu até essa linha aqui, tudo foi me levando pra essa pergunta. E se a resposta for não, obrigado por ler até o fim — a gente ainda vai rir disso juntos.',
    ),
    paras(
      'Oi, {nome}. Se você chegou aqui rolando a página direto, tudo bem — a pergunta mora nessa carta também.',
      'Eu quis fazer isso direito: sem plaquinha em shopping, sem multidão olhando, sem o seu nome virando assunto de grupo alheio. Namoro é coisa nossa, então o pedido tinha que caber num lugar que é só nosso. Essa página é esse lugar.',
      'Não vou fingir frieza: reescrevi essa parte umas oito vezes e todas terminavam na mesma frase. Quer namorar comigo? Quer fazer oficial aquilo que a gente já vive de verdade?',
      'Pensa com calma. A resposta é sua, do jeito e na hora que você quiser. Eu já ganhei muito só de você ler até aqui — qualquer "sim" que vier depois é lucro.',
    ),
  ],

  /** Título do convite RSVP — o primeiro encontro já de namorados. Máx 60 chars. */
  'rsvp.titulo': [
    'primeiro encontro oficial. confirma?',
    'já tem até dia. só falta o seu "vou".',
    'confirma presença no capítulo um?',
    'reserva esse dia pra nós dois?',
    'o primeiro rolê de namoro tem data:',
  ],

  /** Label da contagem regressiva pro primeiro encontro oficial. Máx 60 chars. */
  'timer.label': [
    'contagem regressiva pro nosso primeiro date:',
    'falta pouco pro primeiro encontro de namoro:',
    'ansiedade oficial medida em segundos:',
    'tempo até o capítulo um:',
    'já pode contar. é pro nosso primeiro rolê:',
  ],

  /** Bilhete do buquê — a celebração depois do sim. Máx 240 chars. */
  'bouquet.message': [
    'pra celebrar o seu sim — e pra lembrar que agora a gente floresce junto.',
    'um buquê pra cada versão da gente: a que se conheceu, a que virou quase e a que agora é oficial.',
    'se eu pudesse entregar em mãos, vinha junto com esse sorriso bobo que não sai da minha cara.',
    'girassóis porque você é o lado da luz; rosas porque eu não ia deixar de ser clichê na hora certa.',
    'o primeiro buquê de namoro a gente nunca esquece. esse é o seu.',
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type PedidoNamoroCopySlot = keyof typeof PEDIDO_NAMORO_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const PEDIDO_NAMORO_SLOT_LIMITS: Record<PedidoNamoroCopySlot, number> = {
  'envelope.teaser': 60,
  narrativa: 400,
  'memorias.fallback': 300,
  'photoBook.titulo': 60,
  'photoBook.subtitulo': 80,
  'quiz.pergunta': 80,
  'quiz.sim': 24,
  'quiz.nao': 24,
  'quiz.sucesso': 120,
  'intimacyGate.intro': 80,
  'pergunta.texto': 80,
  'carta.corpo': 1400,
  'rsvp.titulo': 60,
  'timer.label': 60,
  'bouquet.message': 240,
};
