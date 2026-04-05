import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'

export function LegalTerms() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <Container size="narrow">
        <Card glass className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-text">Termos de Uso</h1>
            <p className="text-sm text-text-light">Última atualização: 04/04/2026</p>
          </div>

          <section className="space-y-4 text-sm text-text-light leading-relaxed text-justify">
            <div>
              <h2 className="text-base font-semibold text-text mb-2">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a plataforma Correio Elegante ("Plataforma"), você ("Usuário") concorda integralmente com os presentes Termos de Uso. Caso não concorde com qualquer disposição aqui estabelecida, o acesso ao serviço deve ser imediatamente interrompido.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">2. Descrição do Serviço</h2>
              <p>
                O Correio Elegante consiste em uma ferramenta de tecnologia que permite a criação, personalização e compartilhamento de mensagens digitais acessíveis exclusivamente via leitura de QR Code.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">3. Responsabilidade do Usuário</h2>
              <p>
                O Usuário é o único e exclusivo responsável pelo conteúdo das mensagens por ele criadas. A Plataforma não realiza monitoramento prévio, mas reserva-se o direito de remover conteúdos que violem a lei ou estes Termos, especialmente em casos de:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Discurso de ódio, assédio, ameaças ou qualquer forma de bullying;</li>
                <li>Conteúdo difamatório, calunioso ou injurioso;</li>
                <li>Divulgação de dados sensíveis de terceiros sem autorização;</li>
                <li>Práticas de spam ou propaganda não solicitada.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">4. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo proprietário da Plataforma, incluindo, mas não se limitando a código-fonte, design, logotipos e ilustrações, é protegido por leis de direitos autorais e propriedade intelectual. O Usuário recebe uma licença pessoal, limitada e revogável para fruição dos serviços oferecidos.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">5. Limitação de Responsabilidade</h2>
              <p>
                A Plataforma não se responsabiliza por: (i) interrupções técnicas inerentes aos serviços de internet; (ii) danos decorrentes do mau uso do QR Code impresso por terceiros; ou (iii) qualquer expectativa de resultado ou interação não concretizada entre o remetente e o destinatário.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">6. Disposições Gerais</h2>
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. Para a resolução de quaisquer controvérsias, fica eleito o Foro da Comarca de Sorocaba/SP, com renúncia a qualquer outro, por mais privilegiado que seja.
              </p>
            </div>
          </section>
        </Card>
      </Container>
    </div>
  )
}
