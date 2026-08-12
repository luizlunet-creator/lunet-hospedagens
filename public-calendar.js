// Calendario publico de disponibilidade + pedido de reserva pelo WhatsApp.
// Le so window.LUNET_AVAILABILITY (datas ocupadas anonimizadas). Nenhum dado
// de hospede/valor aqui. Sem backend: o "pedido" abre o WhatsApp com o
// apartamento e as datas escolhidas ja preenchidos. As datas ficam sujeitas a
// confirmacao (a disponibilidade e atualizada manualmente pelo dono).
(function () {
  const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const APT_LABEL = { airbnb06: 'AP 06', airbnb5: 'AP 05' };

  const grid = document.getElementById('pubCalGrid');
  if (!grid) return; // secao nao existe nesta pagina

  const now = new Date();
  let pubYear = now.getFullYear();
  let pubMonth = now.getMonth();
  let pubApt = 'airbnb06';
  let selIn = null;
  let selOut = null;
  let pubGuests = 2;

  function currentListing() {
    const list = (typeof SITE_CONTENT !== 'undefined' && SITE_CONTENT.listings) || [];
    return list.find(l => l.id === pubApt) || {};
  }
  function formatMoneyPub(v) {
    return 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function renderGuestOptions() {
    const sel = document.getElementById('pubCalGuests');
    if (!sel) return;
    const max = currentListing().guests || 6;
    if (pubGuests > max) pubGuests = max;
    sel.innerHTML = Array.from({ length: max }, (_, i) => i + 1)
      .map(n => `<option value="${n}" ${n === pubGuests ? 'selected' : ''}>${n} hóspede${n === 1 ? '' : 's'}</option>`).join('');
  }

  function isoOf(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
  function todayISO() { return isoOf(now.getFullYear(), now.getMonth(), now.getDate()); }
  function brDate(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); return m ? `${m[3]}/${m[2]}/${m[1]}` : iso; }
  function nights(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }

  function blocksForApt(apt) {
    const av = window.LUNET_AVAILABILITY || { blocks: [] };
    return (av.blocks || []).filter(b => b && b.apt === apt && b.from && b.to);
  }
  function isOccupied(dayISO, apt) {
    return blocksForApt(apt).some(b => b.from <= dayISO && dayISO < b.to);
  }
  // algum "noite" no intervalo [from, to) esta ocupada?
  function rangeHasOccupied(fromISO, toISO, apt) {
    return blocksForApt(apt).some(b => fromISO < b.to && b.from < toISO);
  }

  function inSelectedRange(dayISO) {
    if (selIn && !selOut) return dayISO === selIn;
    if (selIn && selOut) return dayISO >= selIn && dayISO <= selOut;
    return false;
  }

  function render() {
    document.querySelectorAll('[data-pub-apt]').forEach(b => b.classList.toggle('is-active', b.dataset.pubApt === pubApt));
    const title = document.getElementById('pubCalTitle');
    if (title) title.textContent = `${MONTHS[pubMonth]} de ${pubYear}`;

    const first = new Date(pubYear, pubMonth, 1).getDay();
    const days = new Date(pubYear, pubMonth + 1, 0).getDate();
    const today = todayISO();

    let html = WEEK.map(w => `<div class="pub-cal-wd">${w}</div>`).join('');
    for (let i = 0; i < first; i++) html += '<div class="pub-cal-cell pub-cal-empty"></div>';

    for (let d = 1; d <= days; d++) {
      const iso = isoOf(pubYear, pubMonth, d);
      const past = iso < today;
      const occ = isOccupied(iso, pubApt);
      let cls = 'pub-cal-cell';
      let clickable = true;
      if (past) { cls += ' pub-cal-past'; clickable = false; }
      else if (occ) { cls += ' pub-cal-occ'; clickable = false; }
      else cls += ' pub-cal-free';
      if (inSelectedRange(iso)) cls += ' pub-cal-sel-day';
      if (iso === selIn) cls += ' pub-cal-sel-start';
      if (iso === selOut) cls += ' pub-cal-sel-end';
      html += `<div class="${cls}" ${clickable ? `data-day="${iso}"` : ''}>${d}</div>`;
    }
    grid.innerHTML = html;
    updateSelectionUI();
  }

  function updateTripBox() {
    const box = document.getElementById('pubCalTrip');
    if (!box) return null;
    if (!selIn || !selOut) { box.style.display = 'none'; return null; }

    const n = nights(selIn, selOut);
    const listing = currentListing();
    const diaria = Number(listing.diariaBase) || 0;
    const limpeza = Number(listing.taxaLimpeza) || 0;
    const subtotal = diaria * n;
    const total = subtotal + limpeza;

    box.style.display = diaria ? '' : 'none';
    if (!diaria) return null;

    document.getElementById('pubCalTripDatas').textContent = `${brDate(selIn)} → ${brDate(selOut)}`;
    document.getElementById('pubCalTripNoites').textContent = `${n} noite${n === 1 ? '' : 's'}`;
    document.getElementById('pubCalTripHospedes').textContent = `${pubGuests} hóspede${pubGuests === 1 ? '' : 's'}`;
    document.getElementById('pubCalTripSubtotal').textContent = `${n} noite${n === 1 ? '' : 's'} × ${formatMoneyPub(diaria)} = ${formatMoneyPub(subtotal)}`;
    const limpezaRow = document.getElementById('pubCalTripLimpezaRow');
    if (limpezaRow) limpezaRow.style.display = limpeza ? '' : 'none';
    document.getElementById('pubCalTripLimpeza').textContent = formatMoneyPub(limpeza);
    document.getElementById('pubCalTripTotal').textContent = formatMoneyPub(total);
    return { n, diaria, limpeza, subtotal, total };
  }

  function updateSelectionUI() {
    const sel = document.getElementById('pubCalSel');
    const btn = document.getElementById('pubCalWhats');
    if (!selIn) {
      if (sel) sel.textContent = 'Toque na data de entrada (check-in) e depois na de saída (check-out).';
      if (btn) { btn.classList.add('is-disabled'); btn.removeAttribute('href'); }
      updateTripBox();
      return;
    }
    if (selIn && !selOut) {
      if (sel) sel.textContent = `Entrada: ${brDate(selIn)}. Agora toque na data de saída.`;
      if (btn) { btn.classList.add('is-disabled'); btn.removeAttribute('href'); }
      updateTripBox();
      return;
    }
    const n = nights(selIn, selOut);
    if (sel) sel.textContent = `${APT_LABEL[pubApt]} · ${brDate(selIn)} → ${brDate(selOut)} · ${n} noite${n === 1 ? '' : 's'}. Sujeito a confirmação.`;
    const trip = updateTripBox();
    if (btn) {
      const b = (typeof SITE_CONTENT !== 'undefined' && SITE_CONTENT.business) || {};
      const brand = b.brand || 'Prédio Lunet';
      const estimativa = trip ? ` O site mostrou uma estimativa de ${formatMoneyPub(trip.total)}.` : '';
      const msg = `Olá! Gostaria de reservar o ${APT_LABEL[pubApt]} do ${brand} de ${brDate(selIn)} a ${brDate(selOut)} (${n} noite${n === 1 ? '' : 's'}) para ${pubGuests} hóspede${pubGuests === 1 ? '' : 's'}.${estimativa} Essas datas estão disponíveis?`;
      btn.href = `https://wa.me/${b.whatsapp || ''}?text=${encodeURIComponent(msg)}`;
      btn.classList.remove('is-disabled');
    }
  }

  function onDayClick(dayISO) {
    // sem inicio, ou intervalo ja fechado -> comeca de novo
    if (!selIn || (selIn && selOut)) { selIn = dayISO; selOut = null; render(); return; }
    // tocou o mesmo dia de novo -> continua sendo o inicio
    if (dayISO === selIn) { render(); return; }
    // dois toques sempre formam um intervalo, em QUALQUER ordem: se a pessoa
    // tocar primeiro na data de saida e depois na de entrada, a gente inverte
    // sozinho em vez de descartar a primeira escolha (antes isso fazia parecer
    // que so um dia ficava marcado).
    let a = selIn, b = dayISO;
    if (b < a) { const t = a; a = b; b = t; }
    // valida que nenhuma noite entre inicio e fim esta ocupada
    if (rangeHasOccupied(a, b, pubApt)) {
      selIn = dayISO; selOut = null;
      render();
      const sel = document.getElementById('pubCalSel');
      if (sel) sel.textContent = 'Esse período passa por datas ocupadas — recomecei do dia que você tocou. Agora toque na outra data.';
      return;
    }
    selIn = a;
    selOut = b;
    render();
  }

  grid.addEventListener('click', e => {
    const cell = e.target.closest('[data-day]');
    if (cell) onDayClick(cell.dataset.day);
  });
  document.querySelectorAll('[data-pub-apt]').forEach(b =>
    b.addEventListener('click', () => { pubApt = b.dataset.pubApt; selIn = selOut = null; renderGuestOptions(); render(); })
  );
  const guestsSelect = document.getElementById('pubCalGuests');
  if (guestsSelect) guestsSelect.addEventListener('change', () => { pubGuests = parseInt(guestsSelect.value, 10) || 1; updateSelectionUI(); });
  const prev = document.getElementById('pubCalPrev');
  const next = document.getElementById('pubCalNext');
  if (prev) prev.addEventListener('click', () => { pubMonth--; if (pubMonth < 0) { pubMonth = 11; pubYear--; } render(); });
  if (next) next.addEventListener('click', () => { pubMonth++; if (pubMonth > 11) { pubMonth = 0; pubYear++; } render(); });
  const whats = document.getElementById('pubCalWhats');
  if (whats) whats.addEventListener('click', e => { if (whats.classList.contains('is-disabled')) e.preventDefault(); });

  renderGuestOptions();
  render();
})();
