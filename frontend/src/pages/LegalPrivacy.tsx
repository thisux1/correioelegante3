import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'

export function LegalPrivacy() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <Container size="narrow">
        <Card glass className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-text">Política de Privacidade</h1>
            <p className="text-sm text-text-light">Última atualização: 04/04/2026</p>
          </div>

          <section className="space-y-4 text-sm text-text-light leading-relaxed text-justify">
            <div>
              <h2 className="text-base font-semibold text-text mb-2">1. Compromisso com a Privacidade</h2>
              <p>
                A Privacidade e a Proteção de Dados Pessoais são pilares fundamentais da nossa plataforma. Esta Política descreve como coletamos, utilizamos e protegemos suas informações, em total conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">2. Dados Coletados e Finalidade</h2>
              <p>
                Coletamos apenas os dados estritamente necessários para a operação do serviço:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Identificação:</strong> Endereço de e-mail para criação de conta, autenticação e suporte.</li>
                <li><strong>Acesso:</strong> Endereço IP, tipo de navegador e registros de interação para fins de segurança e prevenção a fraudes.</li>
                <li><strong>Pagamentos:</strong> Informações de transação processadas por parceiros especializados (ex: Stripe). Não armazenamos dados de cartão de crédito em nossos servidores.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">3. Compartilhamento de Informações</h2>
              <p>
                A Plataforma não comercializa dados pessoais sob nenhuma hipótese. O compartilhamento ocorre apenas com provedores de serviços essenciais (hospedagem de infraestrutura em nuvem) ou por determinação legal de autoridades competentes.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">4. Segurança da Informação</h2>
              <p>
                Implementamos medidas técnicas e organizacionais para garantir a integridade dos dados, incluindo criptografia SSL/TLS em todas as comunicações e controle rigoroso de acesso aos bancos de dados.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">5. Seus Direitos (LGPD)</h2>
              <p>
                Como titular dos dados, você possui o direito de: (i) confirmar a existência de tratamento; (ii) acessar seus dados; (iii) corrigir informações incompletas; (iv) solicitar a exclusão definitiva da sua conta e respectivos dados pessoais a qualquer momento através das configurações do perfil.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">6. Contato</h2>
              <p>
                Para questões relacionadas ao tratamento de dados, o Usuário poderá entrar em contato através dos canais oficiais de suporte disponibilizados no rodapé da Plataforma.
              </p>
            </div>
          </section>
        </Card>
      </Container>
    </div>
  )
}
