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
// baseGuests/extraGuestFee = taxa por hóspede extra (opcional). Enquanto
// extraGuestFee = 0, isso não tem NENHUM efeito no cálculo.
//   baseGuests    -> nº de hóspedes já incluído na diária
//   extraGuestFee -> valor por NOITE, por hóspede acima de baseGuests
const pricing = {
  ap05: {
    normal: 0,        // diária comum (seg a qui)
    weekend: 0,        // diária de sexta e sábado
    highSeason: 0,      // diária na alta temporada (ver pricingPeriods.highSeason)
    specialDate: 0,      // diária em feriado/data especial (ver pricingPeriods.specialDates)
    newYear: 0,        // diária no período de Réveillon (ver pricingPeriods.newYear)
    cleaningFee: 0,      // taxa de limpeza (valor fixo, não é por noite)
    baseGuests: 2,
    extraGuestFee: 0
  },
  ap06: {
    normal: 0,
    weekend: 0,
    highSeason: 0,
    specialDate: 0,
    newYear: 0,
    cleaningFee: 0,
    baseGuests: 2,
    extraGuestFee: 0
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

// ---- 3) ESTADIA MÍNIMA (em noites) POR CATEGORIA — edite aqui ----
// Vale pra reserva inteira: se QUALQUER noite escolhida cair numa categoria
// com estadia mínima, a reserva toda precisa ter pelo menos esse tanto de
// noites (ex: 1 noite de Réveillon no meio já exige o mínimo do Réveillon).
// Quando duas categorias aparecem na mesma reserva, vale o mínimo da que
// tiver prioridade mais alta (Réveillon > Data especial > Alta temporada >
// Fim de semana > Normal). Valor 1 = sem restrição (desativado).
const pricingMinStay = {
  normal: 1,
  weekend: 1,
  highSeason: 1,
  specialDate: 1,
  newYear: 1
};

// ---- 4) DESCONTO POR ESTADIA LONGA (opcional) — edite aqui ----
// Lista vazia = desativado. Cada item: a partir de quantas noites, quantos
// % de desconto (aplicado só sobre o valor das diárias, não sobre limpeza
// nem sobre a taxa de hóspede extra). Se a reserva bater mais de uma regra,
// vale a de maior "minNights".
const pricingDiscounts = {
  longStay: [
    // { minNights: 7, percent: 5 },
    // { minNights: 14, percent: 10 },
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

const PRICING_CATEGORY_LABEL = {
  normal: 'normal', weekend: 'fim de semana', highSeason: 'alta temporada',
  specialDate: 'data especial', newYear: 'Réveillon'
};

// Estadia mínima exigida pra esse conjunto de noites: entre TODAS as
// categorias presentes na reserva, vale o MAIOR mínimo de noites — não a
// categoria de maior prioridade de preço (uma reserva pode misturar uma
// categoria "forte" no preço com mínimo baixo e uma categoria "fraca" com
// mínimo mais alto; nesse caso o mínimo mais alto e' quem manda).
function pricingMinStayRequired(noites) {
  const presentes = Array.from(new Set(noites.map(n => n.categoria)));
  if (!presentes.length) return { categoria: 'normal', minNights: 1 };
  let categoria = presentes[0];
  let minNights = Number(pricingMinStay[categoria]) || 1;
  presentes.forEach(cat => {
    const min = Number(pricingMinStay[cat]) || 1;
    if (min > minNights) { minNights = min; categoria = cat; }
  });
  return { categoria, minNights };
}

// Desconto de estadia longa que se aplica (o de maior minNights, entre os
// que a reserva atinge), ou null se nenhum se aplicar / estiver desativado.
function pricingLongStayDiscount(totalNoites) {
  const aplicaveis = (pricingDiscounts.longStay || []).filter(d => d && totalNoites >= Number(d.minNights));
  if (!aplicaveis.length) return null;
  return aplicaveis.reduce((best, d) => (Number(d.minNights) > Number(best.minNights) ? d : best));
}

// Texto tipo "1 noite normal + 2 noites fim de semana" — só quando a
// reserva mistura mais de uma categoria (senão devolve null, pra não
// poluir a caixa "Sua viagem" com uma obviedade).
function pricingComposicaoNoites(noites) {
  const counts = {};
  const ordem = [];
  noites.forEach(n => {
    if (!(n.categoria in counts)) ordem.push(n.categoria);
    counts[n.categoria] = (counts[n.categoria] || 0) + 1;
  });
  if (ordem.length <= 1) return null;
  return ordem.map(cat => `${counts[cat]} noite${counts[cat] === 1 ? '' : 's'} ${PRICING_CATEGORY_LABEL[cat]}`).join(' + ');
}

// Arredonda pra centavo (evita erro de ponto flutuante tipo 129.99999999).
function pricingRound2(v) { return Math.round((Number(v) || 0) * 100) / 100; }

// Preco da noite pra uma categoria: se weekend/highSeason/specialDate/newYear
// estiver em 0, vazio ou invalido, cai pro valor da diaria normal do mesmo
// apartamento. Nunca cobra (nem mostra) uma noite a R$ 0 enquanto a diaria
// normal estiver configurada -- categorias especiais sao um AJUSTE sobre a
// normal, nao um valor obrigatorio de preencher.
function pricingNightRate(cfg, categoria) {
  const normal = Number(cfg.normal) || 0;
  if (categoria === 'normal') return normal;
  const raw = Number(cfg[categoria]);
  return Number.isFinite(raw) && raw > 0 ? raw : normal;
}

// Calcula noite por noite (uma reserva pode atravessar categorias
// diferentes) e devolve o detalhamento completo: preço, hóspede extra,
// desconto de estadia longa e a checagem de estadia mínima.
function calcHospedagem(aptId, checkinISO, checkoutISO, guestsCount) {
  const key = PRICING_APT_KEY[aptId];
  const cfg = key && pricing[key];
  if (!cfg) return null;

  const noites = [];
  let cursor = checkinISO;
  while (cursor < checkoutISO) {
    const categoria = pricingCategoryForNight(cursor);
    const preco = pricingNightRate(cfg, categoria);
    noites.push({ data: cursor, categoria, preco });
    cursor = pricingAddDaysISO(cursor, 1);
  }
  const totalNoites = noites.length;

  const subtotal = noites.reduce((s, n) => s + n.preco, 0);
  const cleaningFee = Number(cfg.cleaningFee) || 0;

  const baseGuests = Number(cfg.baseGuests) || 2;
  const extraGuestFee = Number(cfg.extraGuestFee) || 0;
  const hospedesExtra = Math.max(0, (Number(guestsCount) || 0) - baseGuests);
  const extraGuestTotal = pricingRound2(hospedesExtra * extraGuestFee * totalNoites);

  const desconto = pricingLongStayDiscount(totalNoites);
  const descontoValor = desconto ? pricingRound2(subtotal * desconto.percent / 100) : 0;

  const minStay = pricingMinStayRequired(noites);

  // Se a diária normal não foi configurada (ainda em 0), consideramos que
  // o apartamento não tem preço publicado ainda — não mostra estimativa
  // pra não exibir R$ 0,00 (ou uma conta zerada) pro hóspede.
  const configurado = Number(cfg.normal) > 0;

  const total = pricingRound2(subtotal - descontoValor + cleaningFee + extraGuestTotal);

  return {
    noites, subtotal, cleaningFee, total, configurado,
    composicao: pricingComposicaoNoites(noites),
    baseGuests, hospedesExtra, extraGuestFee, extraGuestTotal,
    desconto, descontoValor,
    minStayCategoria: minStay.categoria,
    minStayRequired: minStay.minNights,
    minStayOk: totalNoites >= minStay.minNights
  };
}
