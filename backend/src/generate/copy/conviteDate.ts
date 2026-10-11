/**
 * Banco de copy curado — momento `convite_date`.
 *
 * Pedir alguém pra sair num dia e lugar de verdade: o convite é o momento
 * inteiro. A voz é a de quem deixa o bilhete na carteira — específico no
 * plano ("sorvete naquele lugar", "cinema de sábado") e leve na saída
 * ("se não rolar, sem crise"). Guia de voz:
 * `backend/src/generate/copy/voice-guide.md`.
 *
 * ## Interpolação
 *
 * `{nome}` é substituído pelo nome do destinatário
 * (`brief.nomes.destinatario`) no texto final. `{lugar}` e `{data}` NÃO
 * interpolam — dia e lugar chegam via prop `evento` do ticketRsvp/timer.
 * Por isso as variantes mencionam o plano de forma neutra ("aquele lugar",
 * "sábado à tarde") e funcionam mesmo sem `brief.evento`. Limites são
 * medidos sobre o texto já interpolado — deixe folga para nomes de ~12
 * caracteres.
 *
 * ## Limites
 *
 * `CONVITE_DATE_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem 3+ variantes, com registro variado:
 * umas mais diretas, outras mais tímidas.
 */

/** Junta parágrafos de texto com linha em branco entre eles. */
export function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const CONVITE_DATE_COPY = {
  /**
   * Snippet exibido na carta selada — anuncia que é convite e instiga a
   * abrir. Máx 60 chars.
   */
  'envelope.teaser': [
    '{nome}, isso é um convite de verdade. abre.',
    'não é cobrança, não é indireta. é convite, {nome}.',
    '{nome}, dessa vez eu vim com plano pronto.',
    'tem pergunta que só se faz por escrito, {nome}.',
    '{nome}, abre devagar. tem data e lugar aqui.',
  ],

  /**
   * Abertura do pedido — nomeia o que a página é (um convite) e prepara a
   * pergunta. 2 a 3 frases. Máx 300 chars.
   */
  'proposta.narracao': [
    'Vou pular a parte em que eu finjo que isso é casual. É um convite: tem dia, tem lugar e tem eu ensaiando essa frase faz uma semana. O plano inteiro tá logo ali.',
    'Tem gente que convida no cara a cara. Eu preferi a página, que aqui a voz não trava no meio da frase. O convite é real — data, lugar e programa — mas a porta fica aberta: se não rolar, sem crise.',
    'Repara que eu não mandei um "oi, sumida". Vim com plano pronto: dia marcado, lugar escolhido e a coragem finalmente fora da mochila. Só falta uma palavra sua pra isso virar encontro.',
    'Isso aqui é o meu jeito de te chamar pra sair sem engasgar no meio da frase. Juntei dia, lugar e coragem no mesmo envelope. O resto depende de um "topa" seu.',
    'Cheguei com vergonha e com plano — as duas coisas juntas, porque uma sem a outra ia dar em nada. O convite tá aqui embaixo, com data e lugar de verdade. Lê com calma que eu explico tudo.',
  ],

  /** Título do convite RSVP. Máx 60 chars. */
  'rsvp.titulo': [
    'convite oficial. bora?',
    'data e lugar. só falta o seu sim.',
    'reserva esse dia pra mim?',
    'marca na agenda que o resto é comigo.',
    'confirma aí que eu já tô contando.',
  ],

  /** Label da contagem regressiva. Máx 60 chars. */
  'timer.label': [
    'contagem regressiva pro nosso rolê:',
    'falta pouco pra gente se ver de verdade:',
    'ansiedade oficialmente cronometrada:',
    'já pode ir pensando no look:',
    'tempo até o nosso encontro:',
  ],

  /**
   * Convite em texto — o fallback incondicional quando o brief não traz
   * evento. Funciona sem data/lugar: nomeia o programa concreto sem
   * depender de interpolação. Máx 200 chars.
   */
  'convite.detalhes': [
    'A proposta é simples: cinema no fim de tarde e um lanche depois pra discutir o filme. Se o filme for ruim, melhor ainda — rende mais assunto.',
    'Sábado à tarde: sorvete naquele lugar que você vive indicando. Depois a gente decide o resto com a cara do dia — sem roteiro rígido, sem pressão.',
    'Tem um parque que eu passo todo dia e sempre penso em te trazer. Sábado tá valendo. Pipoca da barraca por minha conta.',
    'Pensa num plano sem erro: café, passeio de fim de tarde e conversa que não cabe em story. Eu cuido do resto — você só confirma.',
    'Rolê simples e garantido: a gente se encontra, divide um lanche e anda até a conversa acabar — o que, entre nós, pode demorar.',
  ],

  /**
   * O programa detalhado — vibe e roteiro do encontro. 1 a 2 parágrafos,
   * concreto e sem produção exagerada. Máx 400 chars.
   */
  'plano.detalhes': [
    paras(
      'O plano é o seguinte: a gente se encontra, começa com um sorvete pra quebrar o gelo (piada pronta, eu sei) e termina com uma volta maior só pra conversa não acabar.',
      'Se chover, plano B: café com brigadeiro e o mesmo papo, só que em lugar fechado.',
    ),
    'Roteiro humilde mas de coração grande: chego na hora marcada, a gente anda sem destino até achar um lugar bom pra sentar, e eu finjo que não ensaiei essa conversa no chuveiro.',
    'Sem produção de filme: só você, eu, um lugar com comida boa e tempo sobrando. O dress code é "vem como você é" — porque é exatamente essa pessoa que eu quero encontrar.',
    paras(
      'Minha parte do plano já tá pronta: lugar escolhido, hora certa e assunto de reserva caso a gente trave.',
      'A sua parte é uma palavra só. E essa palavra é "topa".',
    ),
    'A gente pode fazer o clássico — lanche, passeio, filme — ou inventar o nosso: uma tarde sem roteiro no primeiro lugar que parecer bom. Dos dois jeitos, a companhia é a parte que importa.',
  ],

  /** Pergunta sim/não do quiz — o "topa?" oficial. Máx 80 chars. */
  'quiz.pergunta': [
    'topa sair comigo nesse dia?',
    'bora transformar esse plano num encontro?',
    'sorvete, passeio e eu de companhia. topa?',
    'posso oficializar esse convite?',
    'se o plano for esse, você vai?',
  ],

  /** Mensagem exibida ao responder o quiz. Máx 80 chars. */
  'quiz.sucesso': [
    'anotado. agora é compromisso de verdade.',
    'boa. um sim seu vale mais que depoimento.',
    'combinado. eu cuido de todo o resto.',
    'é oficial. já tô contando as horas.',
    'perfeito. a agenda agradece e eu também.',
  ],

  /**
   * Linha de fecho — a porta fica aberta. Reforça que o convite não expira
   * e que um "não" não quebra nada. Máx 160 chars.
   */
  fecho: [
    'Se não rolar, sem crise: o convite não vence e o respeito não quebra. Mas se rolar, prometo caprichar no primeiro encontro.',
    'Sem ultimato e sem pressão — o convite fica de pé. Quando você quiser, a gente marca.',
    'Pode responder agora, amanhã ou semana que vem. O sorvete derrete, mas o convite não.',
    'Se a resposta for não, a gente finge que foi só uma página bonita e segue o baile. Se for sim, eu já sei onde a gente começa.',
    'Isso aqui é porta aberta, não armadilha. Entra se quiser — eu vou estar aqui de qualquer jeito.',
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type ConviteDateCopySlot = keyof typeof CONVITE_DATE_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const CONVITE_DATE_SLOT_LIMITS: Record<ConviteDateCopySlot, number> = {
  'envelope.teaser': 60,
  'proposta.narracao': 300,
  'rsvp.titulo': 60,
  'timer.label': 60,
  'convite.detalhes': 200,
  'plano.detalhes': 400,
  'quiz.pergunta': 80,
  'quiz.sucesso': 80,
  fecho: 160,
};
