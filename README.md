# FIZZ — Altamente Refrescante

Site promocional responsivo para a FIZZ Moçambique (Mopani Internacional). A estrutura, o scroll e o movimento seguem o vídeo de referência `Mockups.space.mp4`, adaptados aos assets e ao guia em [`docs/GUIA_CLOUD_CODE.md`](docs/GUIA_CLOUD_CODE.md).

## Ver localmente

É um site estático, sem build:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Estrutura

```
index.html              marcação e texto (tudo em HTML, sem texto em imagem)
assets/css/style.css    layout, tipografia, ondas, pedestais, mobile e movimento reduzido
assets/js/main.js       canvas sticky, mapeamento scroll → frames, parallax, marquee
assets/frames/          fizz_001–036.webp (1600×900, RGBA transparente)
assets/img/             logótipo e fotografia da secção editorial
docs/                   guia original
```

## Os três momentos do scroll

| Secção | Fundo | Frames | Vídeo de referência |
| --- | --- | --- | --- |
| Hero `#inicio` | verde profundo `#103D24` | 1–12: Limão + Cola a flutuar à frente de «REFRESCANTE» | latas à frente de «REFRESHING» |
| Editorial `#sabor` | creme `#FCEBD2`, onda SVG | 13–24: Laranja entra e cresce; título «Sabor que acompanha cada momento», foto em dois círculos, marquee «Altamente Refrescante» | borda rasgada → «Refreshing drinks without a hangover», foto, «No hangover» |
| Gama `#gama` | verde pálido `#E4F4DC` | 25–36: Laranja, Cola e Limão abrem para três pedestais em CSS com os nomes | quatro latas sobre pedestais |

Uma onda verde fecha a página no rodapé, como o regresso ao início no vídeo.

## Como funciona a animação

- Há um único `<canvas>` sticky sobre as três secções. O scroll de cada secção é mapeado para o seu conjunto de 12 frames. Entre secções, as garrafas atravessam a onda: o conjunto que sai sobe e desvanece e o que entra sobe de baixo.
- O scroll é suavizado com interpolação e `requestAnimationFrame`. `devicePixelRatio` fica limitado a 2 e as garrafas são posicionadas por caixa envolvente (equivalente a `object-fit: contain`), por isso nunca são cortadas. Há uma composição própria para telemóvel.
- Os frames 1–12 carregam primeiro; os restantes vêm em lotes de 4.
- Com `prefers-reduced-motion: reduce` ou sem JavaScript, o canvas desaparece e ficam imagens estáticas dos frames 001, 018 e 036.
- O scroll nunca é bloqueado nem forçado. Só se usa `position: sticky`.

## Notas sobre os assets

- Em `fizz_cola.png` e nos frames com a Cola vinha um fundo xadrez "falso" embutido (quadrados cinza/branco opacos à volta da garrafa). Foi removido automaticamente antes de exportar para WebP, protegendo tampas e rótulos.
- `assets/img/momento.webp` é um recorte, sem texto, de uma publicação pública de instagram.com/fizz_mopani (ver proveniência no guia). As fotografias de terceiros do vídeo não foram usadas.
- As cores de fundo e o texto editorial são propostas para o site, não manual de marca. Não há preços, alegações nutricionais nem contactos novos. Os links sociais são os das páginas públicas citadas no guia.
- Antes de publicação comercial, confirmar os rótulos e obter ficheiros oficiais da marca, incluindo um logótipo vectorial.
