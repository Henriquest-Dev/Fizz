/* FIZZ — dados partilhados (catálogo e configuração de formulários)
   Catálogo baseado em docs/catalogo.json. Preço, volume e unidades por caixa ficam
   deliberadamente de fora até serem confirmados pela Mopani. */
window.FIZZ = {
  products: [
    { id: 'uva',       name: 'Uva',          cat: 'Refrigerante',      color: '#A0154A', desc: 'FIZZ Uva: a cor intensa e o sabor da uva, altamente refrescante.' },
    { id: 'framboesa', name: 'Framboesa',    cat: 'Refrigerante',      color: '#EC264E', desc: 'FIZZ Framboesa: frutos vermelhos numa bebida altamente refrescante.' },
    { id: 'limao',     name: 'Limão',        cat: 'Refrigerante',      color: '#8DD827', desc: 'FIZZ Limão: o clássico cítrico, altamente refrescante.' },
    { id: 'cola',      name: 'Cola',         cat: 'Refrigerante',      color: '#702522', desc: 'FIZZ Cola: o sabor de sempre, altamente refrescante.' },
    { id: 'laranja',   name: 'Laranja',      cat: 'Refrigerante',      color: '#F58019', desc: 'FIZZ Laranja: sabor a laranja, altamente refrescante.' },
    { id: 'ananas',    name: 'Ananás',       cat: 'Refrigerante',      color: '#F3C700', desc: 'FIZZ Ananás: sabor tropical, altamente refrescante.' },
    { id: 'litchi',    name: 'Litchi',       cat: 'Refrigerante',      color: '#E79FB9', desc: 'FIZZ Litchi: um sabor exótico, altamente refrescante.' },
    { id: 'energy',    name: 'Energy Drink', cat: 'Bebida energética', color: '#1F1D26', desc: 'FIZZ Energy Drink: a bebida energética da família FIZZ.' },
  ],
  availability: 'Confirmar com a Mopani',

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
