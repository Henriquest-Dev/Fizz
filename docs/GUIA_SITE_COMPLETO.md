# Inventário FIZZ e orientação para o website

## Gama identificada

O catálogo da Mopani lista Laranja, Limão, Litchi, Ananás, Framboesa, Cola e Energy Drink. A capa pública da página FIZZ no Facebook mostra também Uva, pelo que está incluída como produto visualmente identificado, sujeito a confirmação da disponibilidade actual. Não inferir preço, formatos, quantidade por caixa ou composição a partir de fotografias. O ficheiro `catalogo.json` tem estes campos vazios para preenchimento posterior.

## Levantamento das imagens

- Facebook: 80 fotografias públicas identificadas na galeria sem sessão iniciada; 68 miniaturas disponíveis localmente e respectivos URLs em `referencias/inventario_facebook.json`. A plataforma pediu início de sessão ao tentar continuar, pelo que este levantamento não cobre o arquivo inteiro. A capa original de alta resolução está em `referencias/facebook/capa_gama_original.jpg`.
- Instagram: doze fotografias públicas disponíveis localmente em `referencias/instagram/`. São imagens de campanhas, não ficheiros de produto isolado.
- Produtos: oito reconstruções editoriais orientadas pelas fotografias das páginas, agora revistas como PNG RGBA. As formas e rótulos devem ser confirmados com fotografias oficiais antes de um lançamento comercial. O logótipo é um recorte da capa, não um ficheiro vectorial oficial.

## O vídeo enviado

O vídeo de 7,3 segundos percorre uma experiência de scroll acelerada: hero escuro com duas embalagens flutuantes e letras gigantes atrás; transição para uma secção clara editorial; mostra final da gama em pedestais. A duração do vídeo não deve ser o tempo de scroll no site. A sequência nesta pasta contém `hero_001–012`, `sabores_001–032` (quatro imagens por transição de produto) e `gama_001–008`, todos transparentes 1280 × 720. Fundos, títulos e botões devem ser criados em HTML/CSS.

## Arquitectura do site completo

1. **Início:** vídeo visual de scroll, slogan «Altamente Refrescante», acesso imediato à gama e chamadas claras «Ver produtos» e «Comprar por grosso».
2. **Produtos:** grelha de todos os oito itens observados, filtros Refrigerantes/Bebida energética, páginas de produto com imagem limpa, descrição breve, campos de embalagem e disponibilidade somente quando confirmados.
3. **Distribuição e compras por grosso:** página dedicada a distribuidores, comércio, restauração e compradores institucionais; pedido de cotação sem preços inventados. Formulário: nome, empresa, NUIT opcional, telefone, email, província, produtos, quantidade estimada, periodicidade, localização de entrega e mensagem. Pedir retorno da equipa comercial, sem prometer prazo.
4. **Fornecedores:** página distinta para apresentação de propostas de fornecimento ou serviços. Formulário: empresa, pessoa de contacto, categoria, localização, capacidades, proposta e contacto. Não insinuar concursos abertos ou homologação automática.
5. **Sobre a Mopani:** história e presença operacional apenas com dados confirmados pela empresa. Se o site é FIZZ, explicar a relação com Mopani e manter AquaPlus/Cool Salsa fora do catálogo FIZZ salvo decisão explícita.
6. **Contactos:** sales@mopani.co.mz, +258 82 303 7714 e morada da fonte oficial, sujeitos a confirmação antes de publicação. Rotas de contacto separadas para vendas, fornecedores e geral; política de privacidade e consentimento adequado nos formulários.

## Prompt para Cloud Code

Constrói um website completo, responsivo e em português de Portugal para a marca FIZZ Moçambique, não apenas uma landing page. Usa este kit como fonte visual: `produtos/` contém oito produtos recortados; `frames/` contém animações de scroll RGBA; `catalogo.json` contém a gama e campos deliberadamente não confirmados. A home deve seguir a linguagem do vídeo de referência: hero verde escuro com título editorial grande atrás dos produtos, transição para secção clara de sabores, gama completa em destaque. Implementar o scroll com canvas sticky, requestAnimationFrame, pré-carregamento progressivo, redução de movimento e fallback estático; backgrounds e texto em CSS/HTML. Criar páginas Início, Produtos com filtros e oito detalhes individuais, Distribuição/Compra por grosso com pedido de cotação, Fornecedores com submissão de proposta, Sobre e Contactos. Formular decisões comerciais como pedidos de contacto, sem preços, stock, embalagens, prazo de entrega ou capacidade inventados. Formulários funcionais com validação, antispam e confirmação de recepção, mas não publicar nem enviar dados até configurar um destino real aprovado. Mobile com composição própria, logótipo legível e produtos inteiros. Priorizar acessibilidade, performance e SEO. As miniaturas em `referencias/` são apenas inspiração editorial; usar os PNG transparentes para cards e animações. Antes de publicar, substituir recortes reconstruídos pelo material oficial da marca se disponível.

## Fontes públicas

- https://mopani.co.mz/home/products/
- https://mopani.co.mz/home/aboutus/
- https://www.facebook.com/fizzmocambique/photos
- https://www.instagram.com/fizz_mopani/
