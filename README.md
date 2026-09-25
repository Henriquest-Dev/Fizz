# FIZZ — Altamente Refrescante

Landing page responsiva da FIZZ Moçambique (Mopani Internacional). A estrutura e o movimento seguem o vídeo de referência (`Mockups.space.mp4`) e os guias em [`docs/`](docs/).

**Online:** https://henriquest-dev.github.io/Fizz/ (publicado automaticamente a cada push; ver `.github/workflows/pages.yml`).

## Ver localmente

É um site estático, sem build:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Secções

| Âncora | Conteúdo |
| --- | --- |
| `#inicio` | Hero verde com Limão + Cola à frente de «REFRESCANTE»; «Ver produtos» e «Comprar por grosso» |
| `#sabores` | Título editorial, galeria de momentos (campanhas FIZZ, em duas filas que deslizam com o scroll) e os oito sabores um a um |
| `#gama` | As oito garrafas abrem-se em arco sobre um palco |
| — | Dois caminhos: **Sou fã** (conhecer os sabores) e **Tenho um negócio** (compra por grosso) |
| `#produtos` | Grelha dos oito produtos com filtros. O detalhe tem três separadores: **Conhecer** (sabor, combinações, como servir), **Composição** (o que é, ingredientes, tabela nutricional, alergénios, formato) e **Para negócios** (formato, caixa, produção, disponibilidade e pedido de cotação) |
| `#sobre` | A FIZZ por dentro: 2006, duas fábricas (Maputo e Nampula), 40 000 caixas/dia, oito sabores |
| `#contactos` | Separadores **Compra por grosso** (pedido de cotação), **Fornecedores** (proposta) e **Geral**, mais contactos directos e «Sobre» |
| `#newsletter` | Subscrição de novidades |

## Estrutura

```
index.html               marcação, texto e cartões de produto (HTML estático, bom para SEO)
assets/css/style.css     layout, tipografia, mobile/tablet, movimento reduzido
assets/js/data.js        catálogo e destinos dos formulários  ← configurar aqui
assets/js/main.js        canvas sticky e coreografia por scroll
assets/js/forms.js       menu, separadores, filtros, detalhe, validação e envio
assets/produtos/         oito recortes limpos (WebP grande + versão para cartões)
assets/img/              logótipo e galeria de momentos (campanhas FIZZ)
docs/                    guias e catalogo.json do kit
```

## Animação

As garrafas são desenhadas num `<canvas>` sticky a partir dos recortes limpos, reproduzindo a coreografia dos frames do kit (medida frame a frame):

- **Hero:** Limão de −10° para −6° e Cola de 14° para 10°, a flutuar.
- **Sabores:** a garrafa principal (≈ 77 % da altura) desliza para a esquerda e desvanece; a seguinte entra pela direita (≈ 59 %, semitransparente) e ocupa o lugar. A ordem é Uva, Framboesa, Limão, Cola, Laranja, Ananás, Litchi e Energy Drink.
- **Gama:** as oito abrem em arco, com o centro atrás e as pontas à frente.

Usar os recortes em vez dos 52 PNG do kit dá movimento contínuo (interpolado, sem saltos de 4 imagens por transição) e nenhum halo. Também reduz o peso: cerca de 1 MB contra dezenas.

- Scroll suavizado com `requestAnimationFrame`; nunca é bloqueado (só `position: sticky`).
- `devicePixelRatio` limitado a 2. Limão e Cola carregam primeiro; os restantes vêm em sequência.
- Com `prefers-reduced-motion: reduce` ou sem JavaScript, o canvas desaparece e ficam composições estáticas.

## Limpeza dos recortes

Vários PNG do kit tinham o fundo xadrez "falso" embutido (quadrados cinza/branco opacos à volta da garrafa, sobretudo Litchi, Energy e Cola). Outros tinham o corpo com opacidade 250/255, ligeiramente transparente. Cada produto foi processado assim:

1. Opacidade total no corpo da garrafa (alpha ≥ 235 → 255).
2. Máscara de segmentação **BiRefNet** (`rembg`, modelo `birefnet-general-lite`), que separa a garrafa do xadrez mesmo na Litchi (garrafa branca sobre xadrez branco). Tampas e gargalos transparentes ficam intactos.
3. Remoção de ilhas soltas, anti-aliasing de 1 px e **descontaminação de cor nas bordas**, sem halo claro nem escuro em fundos verdes ou creme.
4. Corte justo à garrafa.

Casos especiais:

- **Cola:** não vem no kit v2; foi usada a do primeiro kit, limpa com o mesmo processo.
- **Ananás:** não existe como produto no kit. Foi extraída do frame `sabores_021`, endireitada (−12°), ampliada 2×, e as bordas foram limpas por cor (xadrez neutro contra corpo amarelo) e simetria da garrafa. A resolução é mais baixa que a dos outros; substituir por fotografia oficial quando existir.

## Formulários

Os formulários têm validação com mensagens em português, NUIT opcional com 9 dígitos, consentimento obrigatório com ligação à política de privacidade, campo *honeypot*, tempo mínimo de preenchimento e limite de um envio a cada 30 s.

**Por agora nada é enviado.** Em `assets/js/data.js`, `endpoints` está vazio, por isso o site valida e mostra a confirmação com a nota «Pré-visualização: o envio ainda não está ligado». Para activar, preencher cada endpoint com o URL de um serviço aprovado (Formspree, Getform, API própria…) que aceite `POST` com `FormData`:

```js
endpoints: {
  cotacao: 'https://formspree.io/f/XXXX',
  fornecedores: 'https://formspree.io/f/YYYY',
  geral: 'https://formspree.io/f/ZZZZ',
  newsletter: 'https://…',
},
```

## Composição dos produtos

A lista de ingredientes, a tabela nutricional e os alergénios da FIZZ **não estão publicados online**. O site da Mopani não estava acessível durante a pesquisa, as lojas online (Krolyc, Ranxo) bloqueiam a leitura e não há registo no Open Food Facts. O separador «Composição» mostra o que está confirmado (tipo de bebida, 350 ml, produção em Moçambique). Os restantes campos aparecem como «a confirmar a partir do rótulo oficial».

Para preencher, copiar o rótulo traseiro de cada garrafa para `label` em `assets/js/data.js` (há um exemplo no topo do ficheiro). O site passa a mostrar os valores automaticamente.

Fontes dos factos usados: mopani.co.mz/home/aboutus (fundação em 2006, Machava Socimol, fábricas em Maputo e Nampula, 40 000 caixas de 24 × 350 ml por dia) e lojas moçambicanas que vendem FIZZ Limão, Uva e Energy Drink de 350 ml.

As combinações sugeridas («Combina com») e as descrições de sabor são texto editorial, inspirado nas campanhas da FIZZ.

## A confirmar antes da publicação comercial

- Contactos de vendas (sales@mopani.co.mz, +258 82 303 7714), tal como indicado no guia.
- Disponibilidade actual de cada sabor (sobretudo Uva), embalagens e volumes. O site mostra «A confirmar com a Mopani» e não mostra preços.
- O texto da política de privacidade é uma base a validar.
- Os recortes são reconstruções; usar ficheiros oficiais e um logótipo vectorial quando existirem.
- As imagens da galeria são publicações públicas da página FIZZ no Facebook (pasta `referencias/facebook` do kit).
