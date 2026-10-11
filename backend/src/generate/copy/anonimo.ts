/**
 * Banco de copy curado — momento `anonimo`.
 *
 * A engine emite props marcadas `copySlot:<chave>` (ou a prop literal
 * `copySlot` com a chave como valor); o resolvedor substitui cada marca por
 * uma variante deste banco antes de persistir. Guia de voz:
 * `backend/src/generate/copy/voice-guide.md`.
 *
 * ## Voz do momento
 *
 * O correio elegante clássico: bilhete sem remetente. Mais amplo que
 * `crush_secreto` — pode ser admiração, gratidão, solidariedade, um
 * "alguém te vê" — não necessariamente confissão romântica. O "eu" nunca
 * se revela: nada de gênero, nome ou detalhe de turma que identifique
 * quem escreve. Os substantivos e os verbos carregam a frase; adjetivos
 * que delatariam o remetente ficam de fora.
 *
 * ## Interpolação
 *
 * `{nome}` é substituído pelo nome do destinatário
 * (`brief.nomes.destinatario`) no texto final. Use só onde a fala se dirige
 * à pessoa — teaser, gate, carta, fecho. Limites são medidos sobre o texto
 * já interpolado, então deixe folga para nomes de ~12 caracteres.
 *
 * ## Limites
 *
 * `ANONIMO_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem entre 4 e 6 variantes, com registro
 * variado: admiração, gratidão, "alguém repara em você".
 */

/** Junta parágrafos de carta com linha em branco entre eles. */
export function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const ANONIMO_COPY = {
  /** Snippet exibido na carta selada — instiga a abrir. Máx 60 chars. */
  'envelope.teaser': [
    '{nome}, tem bilhete pra você. sem remetente.',
    'pra {nome}, de alguém que preferiu o papel.',
    '{nome}, isso chegou do jeito clássico: anônimo.',
    '{nome}, alguém deixou isso aqui de fininho.',
    'sem nome no envelope, mas o seu tá dentro.',
    'pra você, {nome}. de quem não assina, mas vê.',
  ],

  /** Texto sobre a superfície de raspar. Máx 50 chars. */
  'scratch.cover': [
    'raspa aqui que tem gente por trás.',
    'embaixo disso mora uma pista. raspa.',
    'raspadinha do mistério: raspa e chuta.',
    'raspa devagar. quase tudo se revela.',
    'coça aqui que eu deixo uma pista.',
    'raspou, leu. o mistério continua.',
  ],

  /**
   * O segredo debaixo da raspadinha — o remetente está sempre oculto, então
   * as linhas giram em torno de "alguém te vê": admiração, gratidão e
   * solidariedade, nunca confissão direta. Máx 80 chars.
   */
  'scratch.secret': [
    'alguém que te vê todo dia e torce em silêncio.',
    'uma pessoa que repara em você mais do que entrega.',
    'alguém que te deve um valeu — "obrigado" entregaria demais.',
    'quem escreveu isso sabe o peso que você carrega.',
    'alguém perto que acha que você merece mais crédito.',
    'uma pessoa da sua turma. ou do corredor. ou da fila.',
  ],

  /** Introdução antes da lista de pistas (apelidos). Máx 80 chars. */
  'hints.intro': [
    'três pistas de que alguém repara em você de verdade:',
    'se esses nomes dizem algo, a gente já se cruzou:',
    'prova de que essa pessoa te conhece de perto:',
    'só quem divide corredor com você sabe desses nomes:',
    'junta as pistas que o mistério desarma:',
  ],

  /** Parágrafo narrativo de mistério — 2 a 3 frases. Máx 300 chars. */
  'misterio.narracao': [
    'Isso aqui é um correio elegante dos clássicos: bilhete sem assinatura, verdade sem rosto. Alguém passou tempo demais montando isso pra ser só brincadeira. Vai descendo com calma.',
    'Tem recado que só funciona sem nome. Esse é um deles: alguém que te vê de perto achou que você merecia saber — e escolheu o mistério pra contar. O resto da história tá logo aí embaixo.',
    'Sem remetente, sem endereço, sem rosto — só a certeza de que essa página era pra você. Tem alguém do outro lado que reparou uma coisa importante e não sossegou enquanto não contou. Desce aí.',
    '{nome}, a tradição manda esconder o nome e dessa vez ela tá certa: o que importa não é quem escreve, é quem lê. Isso foi feito com o cuidado de quem repara de longe.',
    'Se fosse 2009, isso seria um scrap sem nome de madrugada. Como não é, virou página: alguém decidiu que você merecia um bilhete desses — e aqui tá. Continua descendo que melhora.',
  ],

  /** Texto antes da pergunta de intimidade — "só você sabe essa". Máx 80 chars. */
  'intimacyGate.intro': [
    'só {nome} de verdade sabe essa. sem colar:',
    'checkpoint rápido: prova que é você mesmo:',
    'pergunta secreta nível senha de MSN:',
    'pra confirmar que o bilhete caiu na mão certa:',
    'responde direitinho que a carta se abre:',
  ],

  /** Pergunta lúdica sim/não do quiz do meio da página. Máx 80 chars. */
  'quiz.pergunta': [
    'você sorriu pelo menos uma vez até aqui?',
    'já desconfiou de quem tá por trás disso?',
    'tá curtindo o mistério ou tá impaciente?',
    'sentiu que esse bilhete era seu antes de abrir?',
    'aposto que você tá repassando a turma na cabeça. acertei?',
  ],

  /** Mensagem exibida quando responde o quiz do meio. Máx 80 chars. */
  'quiz.sucesso': [
    'anotado. o mistério segue intacto.',
    'boa. continua descendo que tem mais.',
    'sabia. isso aqui foi feito pra você mesmo.',
    'ponto pra você — e o segredo continua comigo.',
    'resposta certeira. desce mais um pouco.',
  ],

  /**
   * Corpo da carta — o slot mais importante do arco. 3 a 4 parágrafos de
   * calor anônimo: alguém repara, alguém agradece, alguém torce. Sem
   * confissão romântica obrigatória e sem nada que identifique quem
   * escreve. Máx 1400 chars.
   */
  'carta.corpo': [
    paras(
      '{nome},',
      'esse bilhete não tem remetente e não vai ter. o nome ficou de fora de propósito — não por covardia (tá, um pouco por covardia), mas porque o que precisa ser dito não precisa de rosto pra ser verdade.',
      'é o seguinte: alguém repara em você. repara no jeito que você cumprimenta todo mundo, até quem a maioria ignora. repara quando o dia tá pesado e você finge que tá de boa — e tá todo mundo acreditando, menos quem escreveu isso aqui.',
      'não quero nada em troca: nem resposta, nem chute de quem eu seja. só queria que você soubesse que tem gente que nota. o que você faz, o que você aguenta, o que você é — nada disso passa batido por aqui.',
      'de alguém que te vê.',
    ),
    paras(
      '{nome},',
      'tem gentileza que a gente recebe e nunca agradece, porque a vida corre rápido demais. então esse bilhete é um agradecimento atrasado — de alguém que você ajudou sem nem perceber.',
      'foi coisa pequena pra você e enorme pra mim: num dia em que tava tudo ruim, você parou, ouviu de verdade, tratou minha besteira como coisa séria. você nem deve lembrar. eu lembro toda semana.',
      'não vou dizer quando foi, nem quem eu sou — o mistério é parte do presente. só fica registrado que o seu jeito de ser muda o dia dos outros. mudou o meu de um jeito que nenhum "valeu" cobriria.',
      'valeu por existir do jeito que você existe.',
    ),
    paras(
      '{nome},',
      'vou direto: tem alguém que nota o quanto você se esforça. a entrega caprichada, o trabalho feito direitinho mesmo quando ninguém ia notar se fosse de qualquer jeito — notaram. eu notei.',
      'sei que às vezes parece que ninguém vê, que é tudo em vão. não é. do meu lugar aqui perto dá pra ver direitinho o capricho que você põe nas coisas, e isso diz muito sobre quem você é.',
      'esse bilhete existe só pra isso: deixar registrado que o seu esforço tem testemunha. continua, que compensa — e continua sabendo que do canto tem alguém na torcida, sem fazer barulho nenhum.',
      'de quem repara.',
    ),
    paras(
      '{nome}, oi.',
      'esse é um correio elegante raiz, desses que a tradição manda esconder o nome. o meu tá escondido direitinho, mas a admiração tá toda aqui escancarada:',
      'você é daquelas pessoas que melhoram o ambiente só de chegar. a risada muda a temperatura da sala, o papo rende até na fila, e dia cinza fica menos cinza quando você resolve comentar qualquer coisa. eu observei: é sempre assim.',
      'não é declaração, não é cantada, não é pegadinha. é só a constatação de alguém que te vê de perto e achou injusto você não saber. agora sabe.',
      'assinado: mistério.',
    ),
    paras(
      '{nome},',
      'reescrevi esse bilhete umas seis vezes. nas primeiras eu exagerava, nas outras apagava tudo de vergonha. ficou essa versão porque é a mais simples: alguém repara em você mais do que você imagina.',
      'repara no detalhe — na sua letra caprichada no quadro, no lanche que você sempre divide, no jeito que você segura a porta pro próximo. coisa miúda que a maioria deixa passar. eu não deixo.',
      'ele fica sem nome porque o importante não é quem escreve. é você saber que existe, na sua turma ou no seu corredor, uma pessoa que te acha notável — e que achou que isso merecia virar bilhete.',
      'sem assinatura, com todo o carinho.',
    ),
  ],

  /** Parágrafo de despedida — o fecho da página, sem pressão. Máx 300 chars. */
  fecho: [
    'e é isso: um bilhete sem nome e uma torcida com endereço certo — o seu. guarda ele que mistério bom é o que a gente relê.',
    'fim do bilhete, começo do mistério. se um dia você desconfiar de alguém que sorriu de canto no corredor, guarda o palpite.',
    '{nome}, tem alguém que te vê, te lembra e torce por você de perto. o resto fica pro próximo bilhete.',
    'pode reler quantas vezes quiser: bilhete anônimo não estraga com o tempo, só ganha camada. a pista mora em quem te olha demais.',
    'e quando você menos esperar, essa pessoa ainda vai tá ali: reparando, torcendo, guardando seu nome com carinho. fim — ou começo.',
  ],

  /**
   * Pergunta lúdica sim/não do quiz de fecho — aparece quando o brief traz
   * perguntas de intimidade (o gate já cobriu a checagem no meio). Máx 80.
   */
  'quiz.fecho.pergunta': [
    'quer que o mistério continue ou quer uma pista?',
    'se eu deixar outro bilhete, você procura?',
    'topa responder? um sinal qualquer já basta.',
    'quer descobrir quem escreveu isso um dia?',
    'se a próxima vier com pista, você lê?',
  ],

  /** Mensagem exibida quando responde o quiz de fecho. Máx 80 chars. */
  'quiz.fecho.sucesso': [
    'fechado. a próxima já tá em produção.',
    'combinado. o próximo bilhete vem com pista.',
    'bom saber. o mistério agradece a companhia.',
    'anotado. qualquer dia isso aqui ganha assinatura.',
    'então fica assim: eu olho, você desconfia.',
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type AnonimoCopySlot = keyof typeof ANONIMO_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const ANONIMO_SLOT_LIMITS: Record<AnonimoCopySlot, number> = {
  'envelope.teaser': 60,
  'scratch.cover': 50,
  'scratch.secret': 80,
  'hints.intro': 80,
  'misterio.narracao': 300,
  'intimacyGate.intro': 80,
  'quiz.pergunta': 80,
  'quiz.sucesso': 80,
  'carta.corpo': 1400,
  fecho: 300,
  'quiz.fecho.pergunta': 80,
  'quiz.fecho.sucesso': 80,
};
