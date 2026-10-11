/**
 * Banco de copy curado — momento `data_especial` (aniversário de namoro,
 * dia dos namorados, "hoje é dia nosso"). O casal já se conhece: a voz é
 * de quem comemora uma data que só existe porque os dois inventaram.
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
 * à pessoa — teaser, carta. Limites são medidos sobre o texto já
 * interpolado, então deixe folga para nomes de ~12 caracteres.
 *
 * ## Limites
 *
 * `DATA_ESPECIAL_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem entre 4 e 6 variantes mantidas
 * agnósticas ao tipo de data: funcionam para aniversário de namoro, dia
 * dos namorados ou "dia em que a gente se conheceu" sem edição.
 */

/** Junta parágrafos de carta com linha em branco entre eles. */
export function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const DATA_ESPECIAL_COPY = {
  /** Snippet exibido na carta selada — anuncia que hoje é o dia. Máx 60 chars. */
  'envelope.teaser': [
    '{nome}, hoje é o nosso dia. abre com calma.',
    'é hoje, {nome}. a data finalmente chegou.',
    '{nome}, essa carta só abre no dia certo: hoje.',
    'hoje faz tempo que a gente começou, {nome}.',
    'nem precisava de calendário pra lembrar de hoje.',
    'abre, {nome}. hoje a saudade vira festa.',
  ],

  /** Label da contagem regressiva até a data. Máx 60 chars. */
  'timer.label': [
    'contagem regressiva pro nosso dia:',
    'falta só isso pra gente comemorar:',
    'o dia tá chegando. olha quanto falta:',
    'tempo até a data virar festa de novo:',
    'já pode começar a contar:',
  ],

  /**
   * Narração de "hoje faz tempo" — usada quando o brief não traz evento,
   * então a contagem vira texto em vez de timer. 2 a 3 frases. Máx 300 chars.
   */
  'contagem.narracao': [
    'Hoje faz tempo que a gente transformou um dia qualquer em dia nosso. Não precisa de contagem regressiva: a contagem começou faz tempo e não para mais. Desce a página que o resto eu conto direitinho.',
    'Tem data que o calendário inventa e tem data que a gente inventa. A de hoje é das duas: faz tempo que esse dia virou nosso e todo ano a gente acha um jeito novo de comemorar o mesmo começo.',
    'hoje faz tempo. tempo que a gente se achou, se escolheu e ficou. não é dia comum: se o calendário inteiro apagasse, esse dia ainda ia brilhar sozinho no meio do ano.',
    'essa data de novo. parece que foi ontem e parece que foi uma vida inteira — e as duas coisas são verdade. hoje é dia de olhar pra trás com orgulho e pra frente com vontade.',
    'sem contagem regressiva dessa vez: o dia já chegou. hoje é o dia que a gente decidiu comemorar pra sempre — e todo ano ele fica maior porque a história cresce junto.',
  ],

  /**
   * Narração do slot de memórias — aparece como fallback quando o brief não
   * traz fotos, memórias nem música, e como contraponto quando traz.
   * Máx 300 chars.
   */
  'memorias.narracao': [
    'A história da gente não cabe em linha do tempo nenhuma, mas uns pedaços eu guardei aqui. Cada um com data, com lugar, com o seu jeito no meio — é isso que essa data comemora.',
    'Antes da carta, um pouco do que a gente já viveu. Porque hoje não é um dia qualquer: é o dia em que tudo isso aqui começou a fazer sentido.',
    'se essa página fosse um álbum, essa parte pedia pra folhear devagar. tem história nossa aqui que eu releio toda vez que essa data chega no calendário.',
    'o que eu guardei da gente não é museu, é mochila: vai comigo pra todo lado. separei uns momentos pra você lembrar por que hoje merece festa.',
    'hoje não comemora um dia só, comemora tudo que veio depois dele. os pedaços mais bonitos eu deixei aqui embaixo — vai com calma que cada um tem o seu lugar.',
  ],

  /** Título da capa do photoBook. Máx 80 chars. */
  'photoBook.coverTitle': [
    'o nosso álbum de hoje',
    'fotos que a gente fez sem querer guardar',
    'capítulos em foto, edição especial',
    'o álbum que essa data merecia',
  ],

  /** Subtítulo da capa do photoBook. Máx 100 chars. */
  'photoBook.coverSubtitle': [
    'cada página é um dia que a gente não troca por nada',
    'abre devagar que cada foto tem história',
    'registrado sem pose, guardado com carinho',
    'o que a gente viveu entre uma data e outra',
  ],

  /** Título do player quando o brief não traz dedicatória própria. Máx 60 chars. */
  'music.titulo': [
    'a nossa música. sim, a gente tem uma.',
    'toca essa que hoje ela é a trilha oficial',
    'a música que virou nossa sem pedir licença',
    'se hoje tem trilha sonora, é essa aqui',
  ],

  /** Cartãozinho preso ao buquê — a comemoração materializada. Máx 140 chars. */
  'bouquet.message': [
    'hoje não podia passar sem flores. aceita que é nosso.',
    'um buquê pra data que a gente fez virar festa.',
    'flores de tela, vontade de verdade. feliz dia nosso.',
    'nem todo buquê precisa de ocasião. o nosso precisava de hoje.',
    'pra marcar a data do jeito que ela merece: com flor.',
  ],

  /** Pergunta lúdica sim/não do quiz — leve, sem ultimato. Máx 80 chars. */
  'quiz.pergunta': [
    'topa comemorar essa data comigo todo ano?',
    'a gente ainda vai lembrar desse dia daqui a dez anos?',
    'aposto que você sorriu pensando no nosso começo. sorriu?',
    'promete que ano que vem a festa é maior?',
  ],

  /** Mensagem exibida quando responde o quiz. Máx 80 chars. */
  'quiz.sucesso': [
    'anotado no calendário do coração.',
    'trato feito. a data agora é oficialmente nossa.',
    'sabia que você ia topar. já tô contando os dias.',
    'combinado. que venham mais anos assim.',
  ],

  /**
   * Corpo da carta — o slot mais importante do arco. 3 a 4 parágrafos:
   * anuncia a data, detalhe concreto do ano que passou, por que essa data
   * importa, fechamento em festa sem pressão. Máx 1400 chars.
   */
  'carta.corpo': [
    paras(
      '{nome}, hoje é o dia.',
      'Eu podia fingir que é uma data qualquer, mas nós dois sabemos que não é. Hoje faz tempo que você decidiu ficar — e eu passo o ano inteiro juntando motivos pra essa data valer a pena. Esse ano não foi diferente: teve piada ruim que você riu por educação, madrugada que a gente esticou sem perceber, dia comum que virou lembrança boa.',
      'Eu lembro de detalhe que nem você lembra: o lugar onde a gente percebeu que isso era pra valer, a mensagem que eu quase não mandei, o jeito que você fala do que gosta e esquece o mundo em volta. Cada pedaço desse virou tijolo do que a gente é hoje.',
      'Então feliz dia nosso, {nome}. Que o próximo ano traga mais piada ruim, mais madrugada e mais motivo pra escrever carta. Comigo você já sabe: vai ter festa e vai ter carta todo ano.',
      'da pessoa que comemora você em dia comum, mas hoje comemora mais alto.',
    ),
    paras(
      '{nome},',
      'hoje o calendário ganha. no meio de trezentos e tantos dias iguais, esse aqui é o que a gente escolheu pra ser diferente — e todo ano eu entendo melhor o porquê.',
      'faz tempo que a gente começou e a gente continua começando. cada vez que essa data chega eu olho pra trás e acho que a gente era criança; olho pra frente e torço pra demorar muito pra acabar.',
      'não vou escrever poema porque sei que você prefere assim: eu te amo no dia comum e no dia de festa, que é o mesmo amor só que hoje com direito a bolo. feliz dia nosso.',
      'com carinho de quem sabe a data de cor.',
    ),
    paras(
      'se isso fosse 2009, eu deixava um depoimento no seu mural escrito "hoje é dia de quem eu amo". como não é, vai carta mesmo — que dura mais.',
      '{nome}, hoje a gente comemora uma data que inventou. ninguém decretou feriado, ninguém fez lei: a gente decidiu que esse dia ia ser nosso e pronto, virou. acho que é por isso que ele importa tanto.',
      'não vou listar tudo que a gente viveu porque a página já tenta. só queria deixar escrito que, de todas as datas que existem, a de hoje é a que eu guardo com mais carinho — foi nela que a gente começou a ser a gente.',
      'feliz dia nosso. pros próximos todos eu já aviso: tô dentro.',
    ),
    paras(
      '{nome},',
      'hoje faz tempo. tempo de piada interna, de lugar que virou nosso, de música que não sai da cabeça porque lembra a gente. o tempo passou rápido demais, mas deu de sobra pra colecionar motivo pra essa data.',
      'eu queria escrever bonito e saiu assim mesmo: eu tenho sorte. sorte de ter você no dia comum e no dia de festa, no dia que deu errado e principalmente hoje — o dia que a gente decidiu chamar de nosso.',
      'que venha o próximo ciclo. a gente comemora de novo, no mesmo dia, com a mesma vontade — e eu escrevo outra carta, porque tradição que é tradição não se quebra.',
    ),
    paras(
      '{nome}, oi. hoje é dia de festa pequena e coração grande.',
      'tem gente que espera o ano inteiro por um feriado que vem pronto. a gente não: a gente fez o nosso. essa data não existia pra mais ninguém até a gente decidir que ela importava — e todo ano eu confirmo que a decisão foi certa.',
      'o que eu guardo desse tempo todo não cabe em presente: é você rindo até perder o ar, é a gente fazendo nada junto como se fosse programa, é a certeza boba de que amanhã tem mais. é isso que a gente comemora hoje.',
      'feliz dia nosso, {nome}. o resto da página tenta explicar o tamanho disso. eu só assino embaixo.',
    ),
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type DataEspecialCopySlot = keyof typeof DATA_ESPECIAL_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const DATA_ESPECIAL_SLOT_LIMITS: Record<DataEspecialCopySlot, number> = {
  'envelope.teaser': 60,
  'timer.label': 60,
  'contagem.narracao': 300,
  'memorias.narracao': 300,
  'photoBook.coverTitle': 80,
  'photoBook.coverSubtitle': 100,
  'music.titulo': 60,
  'bouquet.message': 140,
  'quiz.pergunta': 80,
  'quiz.sucesso': 80,
  'carta.corpo': 1400,
};
