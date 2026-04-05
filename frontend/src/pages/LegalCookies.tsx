import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'

export function LegalCookies() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <Container size="narrow">
        <Card glass className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-text">Política de Cookies</h1>
            <p className="text-sm text-text-light">Última atualização: 04/04/2026</p>
          </div>

          <section className="space-y-4 text-sm text-text-light leading-relaxed text-justify">
            <div>
              <h2 className="text-base font-semibold text-text mb-2">1. O que são Cookies</h2>
              <p>
                Cookies são pequenos arquivos de texto enviados pela Plataforma e armazenados no seu navegador ou dispositivo. Eles permitem que o site "lembre" suas ações ou preferências ao longo do tempo, proporcionando uma navegação mais eficiente e personalizada.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">2. Como utilizamos os Cookies</h2>
              <p>
                Utilizamos cookies para as seguintes finalidades:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Estritamente Necessários:</strong> Essenciais para o funcionamento da Plataforma, permitindo a navegação e o acesso a áreas seguras (login). Sem estes cookies, o serviço não pode ser prestado adequadamente.</li>
                <li><strong>Funcionalidade:</strong> Utilizados para recordar suas preferências (como tema escuro/claro ou idioma) e para personalizar sua experiência de uso.</li>
                <li><strong>Segurança:</strong> Ajudam a identificar e prevenir riscos de segurança, protegendo sua conta de acessos não autorizados.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">3. Gestão e Controle</h2>
              <p>
                A maioria dos navegadores permite que você gerencie ou bloqueie cookies através de suas configurações. No entanto, ao desativar cookies estritamente necessários, a Plataforma poderá apresentar instabilidades ou impossibilitar o uso de recursos fundamentais como a criação e edição de mensagens.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-text mb-2">4. Atualizações</h2>
              <p>
                Esta Política de Cookies pode ser revisada periodicamente para refletir mudanças tecnológicas ou regulatórias. Recomendamos a consulta regular a esta página.
              </p>
            </div>
          </section>
        </Card>
      </Container>
    </div>
  )
}
