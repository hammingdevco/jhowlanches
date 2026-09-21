/* ==========================================================================
   data.js — DADOS DO SITE

   1) menuCategories  → categorias do cardápio
   2) menuItems       → produtos                (DEMO DATA — SUBSTITUIR PELO CARDÁPIO REAL)
   3) galleryItems    → fotos da galeria        (DEMO DATA — SUBSTITUIR PELAS FOTOS OFICIAIS)
   4) customerReviews → avaliações reais fornecidas pelo cliente

   Em produção, este arquivo pode ser substituído por uma chamada a uma API
   (ex.: fetch("/api/menu")) sem alterar o restante do código.
   ========================================================================== */

const menuCategories = [
  { id: "lanches",   label: "Lanches" },
  { id: "combos",    label: "Combos" },
  { id: "porcoes",   label: "Porções" },
  { id: "bebidas",   label: "Bebidas" },
  { id: "especiais", label: "Especiais" }
];

/* --------------------------------------------------------------------------
   DEMO DATA — SUBSTITUIR PELO CARDÁPIO REAL
   Nenhum item, descrição ou preço abaixo é real.
   Campos:
     id          número único
     name        nome do produto
     description descrição curta
     price       preço em reais (number). 0 exibe "Preço a definir"
     category    id de uma categoria de menuCategories
     image       caminho da imagem (assets/images/...)
     available   false exibe "Indisponível" e bloqueia o botão de adicionar
     demo        true exibe o selo "Demo". Remova o campo nos itens reais.
   -------------------------------------------------------------------------- */
const menuItems = [
  {
    id: 1,
    name: "Lanche Demonstrativo Clássico",
    description: "Descrição demonstrativa. Substitua pelo item real do cardápio.",
    price: 14,
    category: "lanches",
    image: "assets/burger.svg",
    available: true,
    demo: true
  },
  {
    id: 2,
    name: "Lanche Demonstrativo Duplo",
    description: "Descrição demonstrativa. Substitua pelo item real do cardápio.",
    price: 18,
    category: "lanches",
    image: "assets/burger.svg",
    available: true,
    demo: true
  },
  {
    id: 3,
    name: "Lanche Demonstrativo Simples",
    description: "Descrição demonstrativa. Substitua pelo item real do cardápio.",
    price: 12,
    category: "lanches",
    image: "assets/especial.svg",
    available: true,
    demo: true
  },
  {
    id: 4,
    name: "Combo Demonstrativo 1",
    description: "Descrição demonstrativa de combo. Substitua pelo item real.",
    price: 20,
    category: "combos",
    image: "assets/combo.svg",
    available: true,
    demo: true
  },
  {
    id: 5,
    name: "Combo Demonstrativo 2",
    description: "Item marcado como indisponível para demonstrar esse estado.",
    price: 19,
    category: "combos",
    image: "assets/combo.svg",
    available: false,
    demo: true
  },
  {
    id: 6,
    name: "Porção Demonstrativa",
    description: "Descrição demonstrativa de porção. Substitua pelo item real.",
    price: 15,
    category: "porcoes",
    image: "assets/fries.svg",
    available: true,
    demo: true
  },
  {
    id: 7,
    name: "Porção Demonstrativa Grande",
    description: "Descrição demonstrativa de porção. Substitua pelo item real.",
    price: 20,
    category: "porcoes",
    image: "assets/fries.svg",
    available: true,
    demo: true
  },
  {
    id: 8,
    name: "Bebida Demonstrativa Pequena",
    description: "Descrição demonstrativa de bebida. Substitua pelo item real.",
    price: 6,
    category: "bebidas",
    image: "assets/drink.svg",
    available: true,
    demo: true
  },
  {
    id: 9,
    name: "Bebida Demonstrativa Média",
    description: "Descrição demonstrativa de bebida. Substitua pelo item real.",
    price: 8,
    category: "bebidas",
    image: "assets/drink.svg",
    available: true,
    demo: true
  },
  {
    id: 10,
    name: "Especial Demonstrativo da Casa",
    description: "Descrição demonstrativa de item especial. Substitua pelo item real.",
    price: 17,
    category: "especiais",
    image: "assets/especial.svg",
    available: true,
    demo: true
  }
];

/* --------------------------------------------------------------------------
   DEMO DATA — SUBSTITUIR PELAS FOTOS OFICIAIS
   Para trocar: coloque a foto em assets/images/ e altere "src" e "alt".
   Depois remova "demo: true" para esconder o selo "Foto demonstrativa".
   -------------------------------------------------------------------------- */
const galleryItems = [
  { src: "assets/burger.svg",           alt: "Ilustração demonstrativa de um hambúrguer",            caption: "Lanches",  demo: true, size: "wide" },
  { src: "assets/foto-placeholder.svg", alt: "Espaço reservado para a foto oficial da fachada",      caption: "Fachada",  demo: true, size: "tall" },
  { src: "assets/fries.svg",            alt: "Ilustração demonstrativa de porção de batata frita",   caption: "Porções",  demo: true, size: "sq" },
  { src: "assets/foto-placeholder.svg", alt: "Espaço reservado para a foto oficial do ambiente",     caption: "Ambiente", demo: true, size: "sq" },
  { src: "assets/especial.svg",         alt: "Ilustração demonstrativa de sanduíche especial",       caption: "Especiais", demo: true, size: "wide" },
  { src: "assets/combo.svg",            alt: "Ilustração demonstrativa de combo",                    caption: "Combos",   demo: true, size: "sq" }
];

/* --------------------------------------------------------------------------
   AVALIAÇÕES REAIS fornecidas pelo cliente. Textos mantidos como enviados.
   Não adicione avaliações inventadas.
   -------------------------------------------------------------------------- */
const customerReviews = [
  { text: "Vcs estão de parabéns que lanche perfeito, melhor lanche da zona norte." },
  { text: "Além do pão com carne ser excepcional!" },
  { text: "Ótimos lanches, o molho Jhow é muito bom" }
];
