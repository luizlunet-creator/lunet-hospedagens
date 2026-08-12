// ============================================================================
// PRECIFICAÇÃO PÚBLICA DO SITE — edite os valores aqui.
// Isso é só a ESTIMATIVA mostrada pro hóspede no site (calendário público).
// Não tem relação com o CRM privado (precos.js, que fica só no seu
// computador e nunca é publicado).
// ============================================================================

// ---- 1) VALORES DAS DIÁRIAS, por apartamento e por categoria ----
// Todos começam em 0 de propósito — enquanto estiverem em 0, o site NÃO
// mostra a caixa "Sua viagem" pra esse apartamento (pra nunca aparecer
// R$ 0,00 pro hóspede). Troque os 0 pelos valores reais quando tiver.
const pricing = {
  ap05: {
    normal: 0,        // diária comum (seg a qui)
    weekend: 0,        // diária de sexta e sábado
    highSeason: 0,      // diária na alta temporada (ver pricingPeriods.highSeason)
    specialDate: 0,      // diária em feriado/data especial (ver pricingPeriods.specialDates)
    newYear: 0,        // diária no período de Réveillon (ver pricingPeriods.newYear)
    cleaningFee: 0       // taxa de limpeza (valor fixo, não é por noite)
  },
  ap06: {
    normal: 0,
    weekend: 0,
    highSeason: 0,
    specialDate: 0,
    newYear: 0,
    cleaningFee: 0
  }
};

// Liga o id interno de cada apartamento (usado no resto do site) à chave
// usada aqui em cima (ap05/ap06, como pedido).
const PRICING_APT_KEY = { airbnb06: 'ap06', airbnb5: 'ap05' };

// ---- 2) PERÍODOS ESPECIAIS — edite/adicione datas aqui ----
// Formato de data: "AAAA-MM-DD" (ano-mês-dia).
const pricingPeriods = {
  // Períodos de alta temporada (ex: verão). Pode ter vários intervalos.
  highSeason: [
    // { start: "2026-12-20", end: "2027-02-28" },
  ],

  // Período de Réveillon — tem prioridade sobre tudo. Pode ter vários.
  newYear: [
    // { start: "2026-12-28", end: "2027-01-02" },
  ],

  // Datas avulsas de feriado/data especial (uma data por dia).
  specialDates: [
    // "2026-09-07",
    // "2026-10-12",
  ]
};

// ============================================================================
// LÓGICA DE CÁLCULO — não precisa mexer aqui pra trocar preço/data,
// só nas duas configurações acima.
// ============================================================================

// Prioridade (da mais forte pra mais fraca): Réveillon > Data especial >
// Alta temporada > Fim de semana > Normal.
function pricingCategoryForNight(iso) {
  if (pricingInAnyPeriod(iso, pricingPeriods.newYear)) return 'newYear';
  if ((pricingPeriods.specialDates || []).includes(iso)) return 'specialDate';
  if (pricingInAnyPeriod(iso, pricingPeriods.highSeason)) return 'highSeason';
  if (pricingIsWeekendNight(iso)) return 'weekend';
  return 'normal';
}

function pricingInAnyPeriod(iso, periods) {
  return (periods || []).some(p => p && p.start && p.end && p.start <= iso && iso <= p.end);
}

// Noite de sexta ou sábado conta como fim de semana (domingo já é normal de novo).
function pricingIsWeekendNight(iso) {
  const dow = new Date(iso + 'T00:00:00').getDay();
  return dow === 5 || dow === 6;
}

function pricingAddDaysISO(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Calcula noite por noite (uma reserva pode atravessar categorias
// diferentes) e devolve o detalhamento completo.
function calcHospedagem(aptId, checkinISO, checkoutISO) {
  const key = PRICING_APT_KEY[aptId];
  const cfg = key && pricing[key];
  if (!cfg) return null;

  const noites = [];
  let cursor = checkinISO;
  while (cursor < checkoutISO) {
    const categoria = pricingCategoryForNight(cursor);
    const preco = Number(cfg[categoria]) || 0;
    noites.push({ data: cursor, categoria, preco });
    cursor = pricingAddDaysISO(cursor, 1);
  }

  const subtotal = noites.reduce((s, n) => s + n.preco, 0);
  const cleaningFee = Number(cfg.cleaningFee) || 0;

  // Se a diária normal não foi configurada (ainda em 0), consideramos que
  // o apartamento não tem preço publicado ainda — não mostra estimativa
  // pra não exibir R$ 0,00 (ou uma conta zerada) pro hóspede.
  const configurado = Number(cfg.normal) > 0;

  return { noites, subtotal, cleaningFee, total: subtotal + cleaningFee, configurado };
}
