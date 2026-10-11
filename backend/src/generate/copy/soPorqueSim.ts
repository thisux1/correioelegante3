/**
 * Banco de copy curado — momento `so_porque_sim`.
 *
 * A engine emite props marcadas `copySlot:<chave>` (ou a prop literal
 * `copySlot` com a chave como valor); o resolvedor substitui cada marca por
 * uma variante deste banco antes de persistir. Guia de voz:
 * `backend/src/generate/copy/voice-guide.md`.
 *
 * ## Voz do momento
 *
 * "Isso aqui não tem motivo — você que é o motivo." É o momento mais leve do
 * catálogo: carinho numa terça-feira qualquer, piada de canto de boca, zero
 * gravidade. Nada de ocasião, contagem ou pedido sério — a piada desarma, o
 * afeto chega de bandeja.
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
 * `SO_PORQUE_SIM_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem 4 ou 5 variantes, todas no registro
 * "dia comum ficou melhor do nada".
 */

/** Junta parágrafos de carta com linha em branco entre eles. */
export function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const SO_PORQUE_SIM_COPY = {
  /** Snippet exibido no envelope selado — anuncia a ausência de motivo. Máx 60. */
  'envelope.teaser': [
    '{nome}, não é data comemorativa. abre mesmo assim.',
    'sem motivo, {nome}. só porque sim. abre.',
    '{nome}, isso aqui não é cobrança nem aniversário.',
    'chegou sem avisar, tipo terça-feira. abre, {nome}.',
    '{nome}, não tem ocasião. a ocasião é você.',
  ],

  /** Texto sobre a superfície de raspar. Máx 50. */
  'scratch.cover': [
    'raspa aqui que eu conto uma coisa.',
    'raspadinha do nada. raspa e sorri.',
    'tem um segredo besta embaixo. raspa.',
    'raspa devagarinho, sem pressa.',
    'coça aqui. prometo que é bobo e bom.',
  ],

  /** Revelação doce/engraçada da raspadinha — nunca a identidade. Máx 80. */
  'scratch.secret': [
    'que você é a melhor parte do meu dia. só isso.',
    'que hoje é um dia normal e você continua incrível.',
    'nada. era só uma desculpa pra te fazer sorrir.',
    'que eu lembrei de você no meio da terça-feira.',
    'que raspadinha nenhuma dá prêmio melhor que você.',
  ],

  /** Introdução antes da lista de apelidos — prova de "é pra você". Máx 80. */
  'hints.intro': [
    'prova de que isso aqui é pra você e mais ninguém:',
    'só quem te conhece de verdade te chama assim:',
    'esses nomes só fazem sentido pra uma pessoa:',
    'se esses apelidos são seus, a página achou a pessoa certa:',
    'três provas de que eu sei quem você é:',
  ],

  /** Narração de abertura do bloco de surpresa — 2 a 3 frases. Máx 300. */
  'surpresa.narracao': [
    'Isso aqui não é aniversário, não é data redonda, não é pedido de nada. É uma terça-feira qualquer que resolveu ficar melhor porque você existe. Continua descendo.',
    'Nenhum alarme tocou hoje lembrando de te mandar isso. Não tem calendário mandando, não tem motivo oficial. Tem só a vontade boba de fazer seu dia um pouco mais bonito.',
    'Aviso importante: essa página não comemora nada. Ela existe porque o mundo já é cinza demais pra ficar esperando data especial pra dizer que você importa.',
    'Se você abriu isso achando que era boleto, surpresa: é o oposto. É a coisa mais inútil e mais necessária da sua semana — um carinho sem motivo, entregue em domicílio.',
    'Não procura data no rodapé que não tem. Isso aqui nasceu de uma terça-feira sem graça e de uma pessoa que pensou em você antes do almoço. O resto é consequência.',
  ],

  /** Pergunta lúdica do quiz — convite bobo, nunca pedido romântico. Máx 80. */
  'quiz.pergunta': [
    'me deixa te levar um lanche hoje?',
    'posso te encher de carinho sem motivo?',
    'topa um sorvete patrocinado por mim essa semana?',
    'aceita um mimo aleatório de terça-feira?',
    'me deixa estragar seu dia com coisa boa?',
  ],

  /** Mensagem quando a pessoa responde o quiz. Máx 80. */
  'quiz.sucesso': [
    'combinado. já tô providenciando.',
    'anotado. esse sim tem valor de contrato.',
    'sabia. agora aguenta a consequência boa.',
    'boa. agora é só esperar o mimo chegar.',
    'registrado. não aceito devolução do carinho.',
  ],

  /** Bilhete que acompanha o buquê. Máx 120. */
  'bouquet.message': [
    'flores num dia normal, porque data comemorativa é pouco pra você.',
    'um buquê de terça-feira. a ocasião é você existir.',
    'flores sem motivo: o melhor tipo de flores.',
    'margarida, girassol e tulipa — o time titular do meu carinho.',
    'não é aniversário. é só que você merece flor no dia comum.',
  ],

  /**
   * Corpo da carta — o slot mais importante do arco. 3 a 5 parágrafos:
   * abertura do dia comum, detalhe concreto, a frase "você é o motivo",
   * fechamento leve sem cobrança. Máx 1400.
   */
  'carta.corpo': [
    paras(
      '{nome},',
      'hoje não é seu aniversário, não é dia comemorativo, não é nada no calendário. é terça-feira — o dia mais "tanto faz" da semana. e foi justo no meio dela, entre um café requentado e uma reunião que podia ser e-mail, que eu pensei em você.',
      'pensei sem aviso, igual espirro. do nada a sua cara apareceu na minha cabeça e o dia ficou menos cinza. aí eu percebi que a gente espera ocasião demais pra dizer o óbvio: que você é a melhor parte de um dia que nem pediu pra ter parte boa.',
      'então vai essa carta sem selo de data especial. o motivo dela é você, que já é motivo suficiente num dia que não pedia nada.',
      'sem motivo nenhum — e com todos ao mesmo tempo.',
    ),
    paras(
      '{nome}, oi.',
      'aviso prévio: essa carta não tem motivo. não rolou nada, não venceu nada, não tem data escondida no rodapé. eu só acordei hoje e lembrei que você existe, e achei injusto o dia seguir normal sabendo disso.',
      'porque você merece carta no dia comum também. qualquer um lembra de você no aniversário, quando o calendário apita. eu quis ser a pessoa que lembra numa quarta-feira às 14h, quando não tem confete nenhum passando.',
      'se essa carta fosse só esse parágrafo, já bastava: você é o tipo de gente que melhora dia que nem pediu melhora. o resto é detalhe.',
      'pode voltar pra terça agora. ela vai estar um pouquinho melhor.',
    ),
    paras(
      'se fosse 2009, eu deixava um depoimento no seu Orkut do nada — aquele tipo "só pra dizer oi" que na verdade queria dizer muito mais.',
      'como não é, vai carta mesmo: {nome}, eu tava no meio de um dia completamente normal, desses que a gente esquece no dia seguinte, e você passou pela minha cabeça. e eu achei desperdício deixar isso quieto.',
      'não tem pedido aqui, não tem cobrança, não tem nem pressa. tem só uma pessoa que acha você legal demais pra ficar sem saber disso até a próxima data redonda.',
      'o dia continua normal. só que agora você sabe que ele não foi inteiramente comum.',
    ),
    paras(
      '{nome},',
      'existe gente que só lembra dos outros quando o calendário manda. eu decidi não ser essa pessoa hoje. então aqui vai a verdade sem embalagem de ocasião: você é incrível, e isso não precisava de data pra ser dito.',
      'incrível no sentido prático, tá? aquele riso que sai antes da piada terminar, o jeito que você trata o garçom, o fato de você saber o nome do cachorro da vizinha. coisas pequenas que só repara quem presta atenção. eu presto.',
      'pronto, falei. era só isso. um carinho à base de nada, num dia à base de tédio, pra uma pessoa feita de coisas boas.',
      'agora pode guardar essa página e fingir que não sorriu.',
    ),
    paras(
      '{nome},',
      'aconteceu o seguinte: era um dia comum, desses que não entram pra história, e do nada eu lembrei de você. não foi memória importante, nem saudade programada. foi tipo abrir a geladeira sem fome — você apareceu porque sim.',
      'e aí eu pensei: por que a gente só escreve coisa bonita em data marcada? se você faz dia comum ficar melhor só por existir, o mínimo é o dia comum retribuir com uma carta. então tá aqui: uma carta de terça-feira, embrulhada em nada, com conteúdo de tudo.',
      'não responde se não quiser, não conta pra ninguém se preferir. só guarda a informação: em algum lugar, num dia sem importância, alguém parou tudo pra lembrar que você vale o desvio.',
    ),
  ],

  /** Texto de fechamento da página — porta aberta, zero cobrança. Máx 300. */
  fecho: [
    'Era isso. Nenhum motivo, nenhuma data, nenhum pedido. Só a lembrança de que, no meio de uma semana qualquer, alguém achou que você merecia uma página inteira. Porque merece.',
    'Pode voltar pro seu dia agora. Ele vai ser um pouco melhor, mesmo que você não admita. E se alguém perguntar por que você tá sorrindo, fala que foi à toa — porque foi mesmo.',
    'Fim da transmissão. Volte à programação normal: o lanche, a fila, a terça-feira seguindo igual. Só que agora você sabe — tem alguém que acha você o motivo de tudo isso.',
    'Isso aqui não cobra resposta, não pede nada, não expira. É carinho de graça, entregue num dia comum. Guarda ou esquece — ele já fez o trabalho dele.',
    'É isso. Um carinho sem CEP, sem data, sem motivo. Se o resto do dia for chato, lembra que pelo menos uma parte dele veio embrulhada pra você.',
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type SoPorqueSimCopySlot = keyof typeof SO_PORQUE_SIM_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const SO_PORQUE_SIM_SLOT_LIMITS: Record<SoPorqueSimCopySlot, number> = {
  'envelope.teaser': 60,
  'scratch.cover': 50,
  'scratch.secret': 80,
  'hints.intro': 80,
  'surpresa.narracao': 300,
  'quiz.pergunta': 80,
  'quiz.sucesso': 80,
  'bouquet.message': 120,
  'carta.corpo': 1400,
  fecho: 300,
};
