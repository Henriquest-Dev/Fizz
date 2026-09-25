/* FIZZ — dados partilhados (catálogo, composição e configuração de formulários)

   O QUE ESTÁ CONFIRMADO (fontes públicas):
   - Mopani Internacional, fundada em 2006 na Machava Socimol; fábricas em Maputo e Nampula;
     capacidade de 40 000 caixas/dia de 24 × 350 ml (mopani.co.mz/home/aboutus).
   - Garrafa de 350 ml à venda em lojas moçambicanas (Limão, Uva, Energy Drink).

   O QUE FALTA: a lista de ingredientes, a tabela nutricional e os alergénios não estão publicados
   online. Preencher `label` de cada produto a partir do rótulo oficial; enquanto estiver vazio,
   o site mostra o campo como «em actualização» (nunca inventa valores).

   Exemplo de preenchimento:
     label: {
       ingredients: 'Água gaseificada, açúcar, …',
       nutrition: [['Energia', '… kJ / … kcal'], ['Hidratos de carbono', '… g'], ['dos quais açúcares', '… g'], ['Sódio', '… mg']],
       allergens: 'Sem alergénios declarados.',
     }
*/
window.FIZZ = {
  facts: {
    format: '350 ml · garrafa PET',
    pack: '24 × 350 ml',
    made: 'Mopani Internacional, com fábricas em Maputo e Nampula (Moçambique).',
    availability: 'Disponibilidade actual e preços de revenda são indicados pela equipa comercial da Mopani, no pedido de cotação.',
    serve: 'Bem gelada. Depois de aberta, fecha bem a tampa para manter o gás.',
  },

  products: [
    {
      id: 'uva', name: 'Uva', cat: 'Refrigerante', color: '#A0154A',
      tagline: 'Intensa, doce e cheia de cor.',
      taste: 'Uva tinta, doce e aromática, com a efervescência de sempre da FIZZ.',
      pairs: ['Hambúrgueres e grelhados', 'Batatas fritas', 'Festas e aniversários'],
      label: {},
    },
    {
      id: 'framboesa', name: 'Framboesa', cat: 'Refrigerante', color: '#EC264E',
      tagline: 'Frutos vermelhos com um toque ácido.',
      taste: 'Framboesa viva e ligeiramente ácida, doce na medida certa.',
      pairs: ['Batatas fritas', 'Pipocas e petiscos', 'Tarde com amigos'],
      label: {},
    },
    {
      id: 'limao', name: 'Limão', cat: 'Refrigerante', color: '#8DD827',
      tagline: 'O clássico verde-néon.',
      taste: 'Cítrico, vivo e muito fresco: o limão que deu cor à FIZZ.',
      pairs: ['Praia e sol', 'Peixe e marisco grelhado', 'O almoço de todos os dias'],
      label: {},
    },
    {
      id: 'cola', name: 'Cola', cat: 'Refrigerante', color: '#702522',
      tagline: 'O sabor de sempre.',
      taste: 'Cola clássica, encorpada e com muito gás.',
      pairs: ['Prego no pão', 'Massas e pratos de forno', 'Jantar com a família'],
      label: {},
    },
    {
      id: 'laranja', name: 'Laranja', cat: 'Refrigerante', color: '#F58019',
      tagline: 'Sumarenta e alegre.',
      taste: 'Laranja doce e sumarenta, para os dias de calor.',
      pairs: ['Frango grelhado', 'Pão com chouriço', 'Festas e convívios'],
      label: {},
    },
    {
      id: 'ananas', name: 'Ananás', cat: 'Refrigerante', color: '#F3C700',
      tagline: 'Tropical do primeiro ao último gole.',
      taste: 'Ananás maduro e doce, com um final tropical.',
      pairs: ['Magwinya', 'Salsichas grelhadas', 'Tardes de calor'],
      label: {},
    },
    {
      id: 'litchi', name: 'Litchi', cat: 'Refrigerante', color: '#E79FB9',
      tagline: 'Exótico e delicado.',
      taste: 'Floral e doce, com a leveza do litchi.',
      pairs: ['Chamussas', 'Amendoim torrado', 'Pausa a meio da tarde'],
      label: {},
    },
    {
      id: 'energy', name: 'Energy Drink', cat: 'Bebida energética', color: '#1F1D26', tint: '#C9782C',
      tagline: 'A energia que te leva mais longe.',
      taste: 'Sabor intenso de bebida energética, servida bem fresca.',
      pairs: ['Treino e desporto', 'Estudo e trabalho', 'Viagens longas'],
      serve: 'Bem fresca. Lê as advertências de consumo no rótulo.',
      label: {},
    },
  ],

  /* Destinos dos formulários.
     Vazio = modo de pré-visualização: o formulário valida e confirma, mas NÃO envia dados.
     Para activar, colocar o URL de um serviço aprovado (ex.: Formspree, Getform ou uma API própria)
     que aceite POST com FormData e responda 2xx. */
  endpoints: {
    cotacao: '',
    fornecedores: '',
    geral: '',
    newsletter: '',
  },

  provinces: ['Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo Cidade', 'Maputo Província',
    'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambézia'],
};
