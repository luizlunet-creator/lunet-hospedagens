// Ficha de check-in publica. NAO salva nada em lugar nenhum (nem localStorage,
// nem servidor): o botao so monta a mensagem e abre o WhatsApp do proprietario
// com a ficha formatada — o proprio hospede revisa e envia.
(function () {
  const $id = s => document.getElementById(s);

  function maskDate(el) {
    el.addEventListener('input', () => {
      const d = el.value.replace(/\D/g, '').slice(0, 8);
      if (d.length > 4) el.value = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
      else if (d.length > 2) el.value = `${d.slice(0, 2)}/${d.slice(2)}`;
      else el.value = d;
    });
  }
  maskDate($id('fcChegada'));
  maskDate($id('fcSaida'));

  function validDateBR(br) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((br || '').trim());
    if (!m) return false;
    const [, d, mo, y] = m;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    return dt.getFullYear() === Number(y) && dt.getMonth() === Number(mo) - 1 && dt.getDate() === Number(d);
  }

  function showError(msg) {
    const el = $id('fcErro');
    el.textContent = msg || '';
    if (msg) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  $id('fcEnviar').addEventListener('click', function (e) {
    e.preventDefault();
    showError('');

    const apt = $id('fcApartamento').value;
    const nome = $id('fcNome').value.trim();
    const doc = $id('fcDocumento').value.trim();
    const tel = $id('fcTelefone').value.trim();
    const cidade = $id('fcCidade').value.trim();
    const chegada = $id('fcChegada').value.trim();
    const saida = $id('fcSaida').value.trim();
    const adultos = parseInt($id('fcAdultos').value, 10) || 0;
    const criancas = parseInt($id('fcCriancas').value, 10) || 0;
    const horario = $id('fcHorario').value.trim();
    const placa = $id('fcPlaca').value.trim();
    const obs = $id('fcObs').value.trim();

    if (!apt) { showError('Escolha o apartamento reservado.'); return; }
    if (!nome) { showError('Preencha o nome completo.'); return; }
    if (!doc) { showError('Preencha o CPF ou documento.'); return; }
    if (!validDateBR(chegada)) { showError('Data de chegada inválida — use o formato DD/MM/AAAA.'); return; }
    if (!validDateBR(saida)) { showError('Data de saída inválida — use o formato DD/MM/AAAA.'); return; }
    if (adultos < 1) { showError('Informe pelo menos 1 adulto.'); return; }

    const linhas = [
      '*Ficha de check-in — Prédio Lunet*',
      `Apartamento: ${apt}`,
      `Nome: ${nome}`,
      `Documento: ${doc}`,
      tel ? `Telefone: ${tel}` : null,
      cidade ? `Vindo de: ${cidade}` : null,
      `Chegada: ${chegada}${horario ? ' — ' + horario : ''}`,
      `Saída: ${saida}`,
      `Hóspedes: ${adultos} adulto${adultos === 1 ? '' : 's'}${criancas ? ` e ${criancas} criança${criancas === 1 ? '' : 's'}` : ''}`,
      placa ? `Placa do carro: ${placa}` : null,
      obs ? `Obs: ${obs}` : null
    ].filter(Boolean);

    const b = (typeof SITE_CONTENT !== 'undefined' && SITE_CONTENT.business) || {};
    const url = `https://wa.me/${b.whatsapp || ''}?text=${encodeURIComponent(linhas.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });
})();
