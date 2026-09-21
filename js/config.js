/* ==========================================================================
   config.js — CONFIGURAÇÃO DO PROJETO (edite aqui)

   Este é o único arquivo que você precisa editar para conectar o Clerk,
   trocar telefone/WhatsApp, link de pedidos e endereço.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CLERK — AUTENTICAÇÃO
   Cole aqui a PUBLISHABLE KEY (começa com pk_test_ ou pk_live_).
   NUNCA coloque a Secret Key (sk_...) em nenhum arquivo do frontend.
   Enquanto o valor abaixo for o padrão, o site funciona normalmente, mas
   login/cadastro exibem um aviso de configuração pendente.
   -------------------------------------------------------------------------- */
const CLERK_PUBLISHABLE_KEY = "pk_test_cHJvdWQta3JpbGwtNzkxOC5jbGVyay5hY2NvdW50cy5kZXYk";

/* --------------------------------------------------------------------------
   DADOS REAIS DO NEGÓCIO (fornecidos pelo cliente)
   -------------------------------------------------------------------------- */
const JHOW = Object.freeze({
  name: "Jhow Lanches",

  phoneDisplay: "(32) 99149-5040",
  phoneHref: "tel:+5532991495040",
  whatsappNumber: "5532991495040", // formato internacional, só dígitos (55 + DDD + número)
  whatsappDefaultMessage: "Olá! Gostaria de fazer um pedido no Jhow Lanches.",

  // Canal de pedido online que já existe. Este site NÃO cria outro sistema de pedidos.
  orderUrl: "http://st4y.me/4195138",

  address: {
    street: "R. Ivan Baptista de Oliveira, 612",
    district: "Milho Branco",
    city: "Juiz de Fora",
    state: "MG",
    zip: "36083-000"
  },

  rating: 4.3,
  reviewCount: 21,
  priceRange: "R$ 1–20",
  closesAt: "00:00",

  /* --------------------------------------------------------------------
     MODO DEMONSTRAÇÃO
     true  = itens/preços do cardápio são fictícios e isso é avisado ao
             visitante (selos "Demo", avisos e mensagem do pedido).
     false = use depois de cadastrar o cardápio real em js/data.js.
     -------------------------------------------------------------------- */
  demoMode: true,

  // Chaves do localStorage (implementação FRONTEND / DEMO — veja README)
  storage: {
    cart: "jhow_cart_v1",
    favorites: "jhow_favorites_v1",
    orders: "jhow_orders_v1"
  }
});

// Namespace global usado pelos demais scripts.
window.Jhow = window.Jhow || {};
