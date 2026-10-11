/**
 * Banco de copy curado — momento `carta_amor`.
 *
 * A engine emite props marcadas `copySlot:<chave>`; o resolvedor substitui
 * cada marca por uma variante deste banco antes de persistir. Guia de voz:
 * `backend/src/generate/copy/voice-guide.md`.
 *
 * ## Diferença de voz vs. crush_secreto
 *
 * Aqui o remetente é declarado: nada de "adivinha quem", "quem escreveu isso"
 * ou mistério de identidade. A carta assina em primeira pessoa ("eu") e a
 * vulnerabilidade mora em dizer o sentimento em voz alta, não em esconder o
 * autor. O medo nomeado é o de falar — nunca o de ser descoberto.
 *
 * ## Interpolação
 *
 * `{nome}` é substituído pelo nome do destinatário
 * (`brief.nomes.destinatario`) no texto final. Limites são medidos sobre o
 * texto já interpolado, então deixe folga para nomes de ~12 caracteres.
 *
 * ## Limites
 *
 * `CARTA_AMOR_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem entre 4 e 6 variantes, com registro
 * variado: umas mais tímidas, outras mais diretas.
 */

/** Junta parágrafos de carta com linha em branco entre eles. */
function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const CARTA_AMOR_COPY = {
  /** Snippet na carta selada — já avisa que é amor declarado. Máx 60 chars. */
  'envelope.teaser': [
    '{nome}, é carta de amor. assinada e tudo.',
    'dessa vez não é indireta, {nome}. é direta.',
    'fui eu que escrevi. o nome tá aqui fora.',
    '{nome}, abre devagar que isso é sério.',
    'guardei coragem a semana inteira pra isso.',
    'lê com calma. é pra valer, {nome}.',
  ],

  /** Antes da pergunta de intimidade — cumplicidade, não senha. Máx 80. */
  'intimacyGate.intro': [
    'só {nome} sabe essa. prova que é você:',
    'pergunta nossa, de quem tava lá:',
    'pra ter certeza que caiu na pessoa certa:',
    'responde direitinho que o resto é seu:',
    'essa só acerta quem dividiu o momento:',
  ],

  /** Introdução dos apelidos compartilhados — "são nossos". Máx 80 chars. */
  'hints.intro': [
    'esses apelidos são só nossos, {nome}:',
    'cada nome desses tem uma história comigo:',
    'só a gente sabe de onde saiu cada um:',
    'provas de que eu te conheço de verdade:',
    'cada um desses a gente inventou junto:',
  ],

  /**
   * Frase de cumplicidade quando o brief não traz apelidos nem perguntas.
   * Uma linha só — 1 a 2 frases. Máx 200 chars.
   */
  'cumplicidade.frase': [
    'tem coisa que só faz sentido porque é nossa — e ninguém mais precisa entender.',
    'a gente construiu um idioma de duas pessoas. essa carta tá escrita nele.',
    'só quem tava lá sabe o peso de cada detalhe. você tava.',
    'nosso arquivo particular de besteiras guardadas é o que eu mais prezo.',
    'entre a gente não tem plateia: sempre foi conversa de porta fechada.',
  ],

  /**
   * Linha de memórias quando não há fotos, música ou timeline — o texto
   * segura a seção sozinho. 1 a 2 frases. Máx 200 chars.
   */
  'memorias.narracao': [
    'o que a gente já viveu não cabe em foto — mas eu tentei juntar mesmo assim.',
    'tem lembrança que dispensa legenda: a gente tava lá e pronto.',
    'se eu pudesse, colava aqui cada tarde boba que a gente gastou junto.',
    'de tanto guardar, minha memória de você virou acervo.',
    'a gente não precisa de prova: a gente tem história.',
  ],

  /** Título da capa do photoBook. Máx 60 chars. */
  'photobook.capa': [
    'nosso álbum, {nome}',
    'capítulos que a gente já viveu',
    'o livro do nosso até agora',
    'provas impressas de que a gente existe',
    'folheia devagar que cada página é nossa',
  ],

  /** Título do player quando o brief não traz dedicatória. Máx 80 chars. */
  'music.titulo': [
    'a nossa música',
    'a que sempre me faz pensar em você',
    'toca essa e lembra de mim',
    'dedicada a {nome}, sem cerimônia',
    'a trilha sonora disso tudo',
  ],

  /**
   * Pergunta do quiz leve — sempre em formato de promessa, pra casar com o
   * botão "Prometo". Porta aberta, nunca ultimato. Máx 80 chars.
   */
  'quiz.pergunta': [
    'me promete um abraço quando a gente se ver?',
    'promete guardar essa carta com carinho?',
    'me promete um sorvete no nosso próximo encontro?',
    'promete reler isso quando bater saudade?',
    'me promete um filme ruim pra gente rir junto?',
  ],

  /** Mensagem quando a pessoa responde ao quiz. Máx 80 chars. */
  'quiz.sucesso': [
    'anotado. promessa agora tem testemunha.',
    'prometido. já tô cobrando mentalmente.',
    'combinado. esse sim eu guardo direitinho.',
    'sabia que você ia topar. valeu por existir.',
    'fechado. agora é só o tempo colaborar.',
  ],

  /** Recado que acompanha o buquê. Máx 120 chars. */
  'bouquet.recado': [
    'as flores que eu não tive coragem de entregar em mãos.',
    'se fosse em mãos, eu escolheria essas — e gaguejaria.',
    'aceita? vieram direto, igual a verdade dessa carta.',
    'rosas, porque o clássico é clássico por um motivo.',
    'pra {nome}, sem vaso e com muito carinho.',
  ],

  /**
   * Corpo da carta — o slot que carrega o momento. Remetente declarado: a
   * voz diz "eu" e assume o texto, sem nenhuma linha de adivinhação. 3 a 4
   * parágrafos: abertura, detalhe concreto, vulnerabilidade nomeada,
   * fechamento sem pressão. Máx 1400 chars.
   */
  'carta.corpo': [
    paras(
      '{nome}, oi. sou eu — e dessa vez o "eu" vem com nome e tudo, porque esconder já gastou minha cota de coragem umas três vezes.',
      'escrevi porque falar travou. toda vez que eu te via, ensaiava a frase perfeita e saía um "e aí, beleza?" digno de prêmio. então vai por escrito, que é onde eu consigo chegar até o fim da frase.',
      'eu te amo. pronto, foi dito — sem metáfora e sem plano de fuga. amo seu riso que escapa antes da hora, amo que você lembra detalhes que eu nem lembro de ter contado, amo que o mundo rende mais quando você tá por perto comentando ele errado comigo.',
      'não precisa responder agora, nem responder nunca, se não quiser. a carta já fez o trabalho dela: parou de pesar aqui dentro. se quiser conversar, eu prometo tentar não travar no oi.',
      'com amor, eu.',
    ),
    paras(
      '{nome}, senta que lá vem coisa — brincadeira, já veio: é uma carta de amor. daquelas antigas, à mão, só que digital, porque minha letra é crime ambiental.',
      'vou pular a parte poética porque você merece verdade, não metáfora: eu gosto de você num nível que atrapalha. atrapalha o sono, atrapalha a fila do lanche, atrapalha principalmente quando você chega e eu esqueço o alfabeto inteiro.',
      'te amo desde antes de saber o nome disso. se eu tivesse mais jeito, tinha contado antes — como sou eu, virou carta com revisão e tudo. essa é a versão sete; as outras seis morreram de vergonha.',
      'fica com ela o tempo que quiser. eu fico por aqui mesmo, que é onde eu já tava.',
    ),
    paras(
      '{nome},',
      'te escrevo com o coração na mão e zero elegância, que é o estado natural de quem ama e resolve contar.',
      'não vou fingir que tá sendo fácil. reescrevi essa carta até a tela pedir arrego. o que eu quero dizer é simples e assusta: eu te amo. amo de um jeito que não coube em indireta, não coube em música mandada no susto, não coube em olhar demorado por cima do caderno.',
      'o que eu sinto não é fogo de artifício — é lamparina: sempre acesa, gasta pouco, ilumina tudo. decidi que você merecia saber de onde vinha a luz.',
      'sem pressão nenhuma. a carta termina aqui; o sentimento continua comigo, que é onde ele sempre morou. eu.',
    ),
    paras(
      'se fosse 2009, eu mandava um depoimento capenga e torcia pra você sacar. como é hoje e eu finalmente achei coragem, vai assinado: sou eu, {nome}.',
      'eu te amo faz tempo. te amo na terça-feira sem graça, no ônibus lotado, naquela tarde em que você dividiu o fone comigo e o mundo encolheu direitinho até caber na gente.',
      'não espero filme, não espero final de novela. espero só que você chegue até o fim sabendo que existe alguém — eu — que te escolhe todo dia sem precisar de motivo.',
      'com amor e zero anonimato, eu.',
    ),
    paras(
      '{nome},',
      'prometi pra mim que essa carta ia ser curta, porque amor grande não precisa de discurso — precisa de coragem. então lá vai a minha, inteira:',
      'eu te amo. te amo com calma e com pressa, em silêncio e agora em voz alta. amo do jeito que se ama quem a gente conhece de verdade: pelo riso que você segura no lugar errado, por como você defende quem não tá na sala, por fazer qualquer lugar parecer o lugar certo.',
      'se essa carta pudesse pedir uma coisa, pedia só isso: lembra de mim com carinho, do jeito que eu lembro de você em tudo.',
      'com todo o meu amor, eu.',
    ),
  ],

  /** Assinatura final — bloco de category 'signature'. Máx 160 chars. */
  'fecho.assinatura': [
    'com amor e coragem atrasada,\neu.',
    'finalmente sem segredo nenhum,\neu.',
    'de quem sempre soube, e agora contou,\neu.',
    'pra {nome}, com o coração na linha,\neu.',
    'escrito à mão, mesmo em pixels,\neu.',
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type CartaAmorCopySlot = keyof typeof CARTA_AMOR_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const CARTA_AMOR_SLOT_LIMITS: Record<CartaAmorCopySlot, number> = {
  'envelope.teaser': 60,
  'intimacyGate.intro': 80,
  'hints.intro': 80,
  'cumplicidade.frase': 200,
  'memorias.narracao': 200,
  'photobook.capa': 60,
  'music.titulo': 80,
  'quiz.pergunta': 80,
  'quiz.sucesso': 80,
  'bouquet.recado': 120,
  'carta.corpo': 1400,
  'fecho.assinatura': 160,
};
