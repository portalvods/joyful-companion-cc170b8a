# Painel Gerador Pro — Plano de Implementação

## Visão Geral
Transformar o app atual em um **painel administrativo** no estilo dos prints: sidebar escura fixa à esquerda + área de conteúdo com múltiplos geradores. Tudo em **modo mock** (sem backend real por enquanto — dá pra ligar depois).

## 1. Layout Base
- `src/routes/app.tsx` — layout com sidebar fixa + `<Outlet />`
- `src/components/pro-sidebar.tsx` — sidebar escura com logo **GERADOR**PRO (azul/amarelo), grupos de itens e badges ("EM BREVE", estrela de favorito)
- Landing (`/`) continua existindo; painel vive em `/app/*`
- Botão "Sair" volta para `/`

## 2. Rotas do Painel
```text
/app                        → Dashboard (cards de resumo + atalhos)
/app/express                → Geração Express (LOTE) ★ principal
/app/futebol                → Gerar Futebol (1 banner por vez)
/app/nba                    → Gerar NBA
/app/ufc                    → Gerar UFC
/app/f1                     → Fórmula 1
/app/todos-esportes         → Todos esportes
/app/guia-futebol           → Guia Futebol
/app/bolao                  → Bolão da Copa 2026
/app/filmes                 → Gerar Banner Filme
/app/series                 → Gerar Banner Séries/Novelas
/app/video                  → Gerar Vídeo (mock)
/app/video-divulgacao       → Vídeo divulgação
/app/logo                   → Editor de Logo
/app/whatsapp               → Configurar WhatsApp (número global usado nos banners)
/app/telegram               → Meu Telegram
/app/creditos               → Comprar Créditos (mock)
/app/indicacao              → Link de Indicação
```

## 3. Geração Express (o coração)
Reproduz a tela do print 3:
- Header: "GERAÇÃO EXPRESS — selecione e gere múltiplos banners num só clique"
- Tabs: **Favoritos · Futebol · NBA · Esportes**
- Card "Dados Globais": input de WhatsApp opcional (aplicado a todos os banners)
- Grid de **cards de modelo** (Modelo 1, 2, 4, 5…):
  - Estrela ⭐ para favoritar (persistido em localStorage)
  - Badge "CORES" quando há variações
  - Faixa de miniaturas de cores abaixo do card (azul, roxo, verde, vermelho, amarelo)
  - Click no card → seleciona / desmarca
- Rodapé fixo: "**Gerar N banners selecionados**" → gera todos e mostra em modal/galeria com download

## 4. Geradores individuais (Futebol / NBA / UFC / F1)
Estilo do print 7 (Gerar NBA):
- Título com ícone da modalidade
- Passo 1: **Escolha o Modelo** (grid de thumbs)
- Passo 2: **Preencha os jogos** (lista dinâmica: time A, time B, horário, canal, campeonato)
- Passo 3: Preview + botão "Gerar Banner" → canvas render + download PNG

## 5. Bolão da Copa
Tela do print 6:
- Header com troféu + "BOLÃO DA COPA 2026"
- Cards de status: chance única / participantes / prazo
- Seção "Seu palpite" (mock: aceita placares ou mostra "encerrado")
- Seção "Participação no bolão"

## 6. Módulos extras (mock enxuto)
- **Filmes/Séries**: form (título, gênero, nota, sinopse, poster URL) → banner
- **Logo**: upload de imagem + preview redimensionado
- **WhatsApp/Telegram**: form simples salvando em localStorage
- **Créditos**: 3 cards de plano (mock)
- **Indicação**: link com código do usuário + estatísticas fake

## 7. Sistema de renderização
- Reaproveita o Canvas atual (`src/components/banner/canvas.tsx`) como engine
- Cada "Modelo" = uma função que recebe `{ jogos, whatsapp, cor }` e desenha no canvas
- Modelos iniciais (mocks visuais): **10 de Futebol, 6 de NBA, 4 de UFC, 3 de F1**
- Variações de cor via paleta trocável (azul/roxo/verde/vermelho/amarelo/cinza)
- Export: `canvas.toBlob()` → download PNG; no Express, gera todos em sequência e oferece **ZIP** (usando `jszip`)

## 8. Design System
- Manter tema dark atual (`oklch`)
- Sidebar: `#0d1424` bg, item ativo com gradiente azul→roxo (como no print 1)
- Logo wordmark: "GERADOR" azul + "PRO" amarelo
- Cards com borda sutil + hover glow
- Ícones: `lucide-react` (Home, MessageCircle, Zap, Video, Trophy, Circle=futebol, etc.)

## Detalhes Técnicos
- **Stack**: TanStack Start + shadcn/ui + Tailwind + Zustand (store já existe) + framer-motion
- **Persistência**: localStorage para favoritos, WhatsApp global, Telegram, seleções
- **ZIP no Express**: `bun add jszip file-saver`
- **Sem backend nesta etapa** — quando o usuário quiser ligar autenticação/créditos reais, ativa Lovable Cloud
- **Sem "Mercado Pago"** funcional agora — só card "EM BREVE" como no print

## O que NÃO entra nesta etapa
- Login/auth real (fica pra depois se quiser)
- Pagamento real de créditos
- Envio real por WhatsApp/Telegram (só formata o número)
- Vídeo real (só UI mock)

## Confirmações que preciso
1. **Modo mock puro** primeiro (sem login/DB), OK? Ou já quer autenticação desde o início?
2. Os **modelos de banner** podem ser **recriações visuais próprias** (não vou clonar arte do gerador.pro), tudo bem?
3. Manter a **landing atual** (`/`) e colocar o painel em `/app`, ou substituir tudo pelo painel?
