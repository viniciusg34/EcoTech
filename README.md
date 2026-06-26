# EcoTech

🌿 EcoTech
Projeto da faculdade Unisuam

Plataforma web de reciclagem e sustentabilidade para a região metropolitana do Rio de Janeiro e Costa Verde. Conecta usuários a Ecopontos, empresas parceiras e recompensas por reciclagem.

⚙️ Tecnologias

HTML, CSS e JavaScript vanilla — sem frameworks
Leaflet.js — mapa interativo de Ecopontos
ZXing — leitura de QR code e código de barras pela câmera
QRCode.js — geração de QR codes para placas de Ecopontos
MockAPI — backend simulado com endpoints REST
Vercel — deploy estático

🔌 APIs MockAPI

RecursoBase URLPessoas (/pessoa)https://6a38cde364a2d8269222d659.mockapi.ioEmpresas (/empresa)https://6a386bef64a2d82692228142.mockapi.io/api/v1Ecopontos (/empresa/:id/ecopontos)mesmo base de empresas

🔐 Autenticação e Sessão

Sessão salva em sessionStorage e/ou localStorage sob a chave ecotech_session
Login detecta automaticamente se é pessoa física (vai para coleta.html) ou empresa (vai para empresa.html) pela presença do campo cnpj no registro
eco-session.js injeta avatar, dropdown e protege páginas via requireAuth()
ID do usuário logado salvo em localStorage como ecotech_user_id

♻️ Fluxo de Scanner + Ecoponto

Empresa gera QR code em empresa.html com payload ECO-{code}|emp={empresaId}|ep={ecopontoId}
Usuário escaneia com a câmera ou digita o código em coleta.html
Sistema detecta prefixo ECO- → busca o ecoponto na API → atualiza coletado via PUT
Usuário recebe EcoCoins registrados no seu perfil via PUT /pessoa/:id

🎨 Design System

Paleta: cream e sage — variáveis CSS como --cream, --sage-*, --ink-*
Fontes: Plus Jakarta Sans (UI) + Lora (títulos)
Tema claro/escuro via html[data-theme] com persistência no localStorage
CSS organizado por páginas: coleta.css, empresa.css, perfil.css, etc.

🚀 Como rodar localmente

bash# Clone o repositório
git clone https://github.com/seu-usuario/ecotech.git
abra o arquivo index.html

# Abra com Live Server (VS Code) ou qualquer servidor estático
# Não requer build — é HTML/CSS/JS puro

As credenciais da MockAPI já estão nos scripts. Para testar o login, use qualquer registro da API /pessoa ou /empresa.