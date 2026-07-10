# Relatório de Campanha — Senado Federal

Site em React (Vite) para o relatório da campanha institucional (CNH, Isenção de IR, Gás de graça). Scroll em tela cheia por seções, gráficos, big numbers e modo de edição de texto embutido.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/` — arquivos estáticos prontos para qualquer hospedagem.

## Estrutura

```
src/
  data/campaignData.js       # todos os números e listas (troque por dados reais aqui)
  hooks/
    useEditableContent.jsx   # estado dos textos editáveis + localStorage
    useReveal.js             # animação de entrada ao rolar
    useSectionSpy.js         # dots de navegação ativos
  components/
    Editable.jsx             # texto editável inline
    EditPanel.jsx            # botão lápis + painel lateral
    NavDots.jsx               # bolinhas de navegação fixas
    charts/                  # BarChart, Donut (CSS puro, sem lib externa)
    sections/                # Hero, KpiSection, FormatSection, ThemeSection, CreativesSection
  styles/
    theme.css                # tokens de cor (claro/escuro)
    base.css                 # todo o resto do CSS
```

## Atualizar os números a partir da planilha do Sheets

Os big numbers, a série diária de impressões, investimento por canal e
performance por formato (vídeo vs. imagem) vêm de `src/data/sheetData.json`,
gerado automaticamente a partir da aba **"BASE CONSOLIDADA - MÍDIA ON"** da
planilha publicada. Sempre que a planilha for atualizada, rode:

```bash
npm run sync-data
```

Isso busca o CSV publicado, recalcula os agregados e regrava
`src/data/sheetData.json`. Depois é só commitar esse arquivo — o site não
busca a planilha em tempo real, então build e deploy continuam rápidos e
não dependem do Google estar no ar.

O script está em `scripts/syncSheetData.mjs`. Se a URL publicada mudar (nova
planilha ou nova aba), atualize a constante `CSV_URL` no topo do arquivo — o
`gid` da aba aparece no link ao selecioná-la em
Arquivo → Compartilhar → Publicar na web.

A seção de "Performance por lei" (`lawPerformance`) e os 22 criativos
(`creatives`) ainda usam dados fictícios em `campaignData.js`, pois essa
parte da planilha será reestruturada.

## Trocar os placeholders dos 22 criativos

Em `src/data/campaignData.js`, cada item de `creatives` tem um campo `mediaUrl`
(hoje `null`). Coloque os arquivos em `public/creatives/` e aponte:

```js
{ id: 1, kind: 'image', mediaUrl: '/creatives/01-cnh.jpg', ... }
{ id: 2, kind: 'video', mediaUrl: '/creatives/02-ir.mp4', ... }
```

O componente `CreativeTile` já sabe renderizar `<img>` ou `<video autoPlay muted loop>`
automaticamente conforme `kind`.

## Modo de edição de texto

Botão discreto (ícone lápis) no canto inferior esquerdo. Ao abrir, todos os
textos com contorno tracejado viram editáveis — clique, digite, saia do campo
(Tab/clique fora) e a alteração é salva automaticamente no `localStorage` do
navegador (chave `senado-campanha-edits-v1`). "Restaurar textos originais" no
painel limpa tudo.

> Isso é por navegador/dispositivo — não sincroniza entre pessoas. Se for
> preciso edição compartilhada, o próximo passo é trocar o `localStorage` por
> uma API simples (ex.: endpoint que lê/escreve um JSON).

## Deploy

### Vercel (recomendado, mais simples)
```bash
npm install -g vercel
vercel
```
Ou: importe o repositório em vercel.com → framework preset "Vite" é detectado
automaticamente → build command `npm run build`, output `dist`.

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`

### Qualquer hospedagem estática
Rode `npm run build` e suba o conteúdo de `dist/` (Cloudflare Pages, GitHub
Pages, S3+CloudFront, etc.).

## Próximos passos sugeridos
- Reestruturar a seção "Performance por lei" quando a planilha for reorganizada.
- Substituir os 22 placeholders pelos criativos finais.
- Se a edição de texto precisar ser compartilhada entre pessoas, trocar
  localStorage por um backend leve (Supabase, Firebase, ou API própria).
