#!/usr/bin/env node
// ============================================================================
// Sincroniza a disponibilidade publica do site (disponibilidade.js) a partir
// dos calendarios iCal/ICS do Airbnb e do Booking.com.
//
// Uso:
//   node scripts/sync-calendars.js <caminho-do-disponibilidade.js>
//
// Le os links ICS de variaveis de ambiente (GitHub Actions Secrets):
//   AIRBNB_ICS_AP05, BOOKING_ICS_AP05, AIRBNB_ICS_AP06, BOOKING_ICS_AP06
// Uma variavel vazia/ausente = fonte "nao configurada ainda" (nao e' erro).
//
// Sem dependencias externas: usa o fetch nativo do Node 20+ e um parser ICS
// bem pequeno, escrito na mao so pra extrair DTSTART/DTEND de VEVENT — nao
// usamos nenhuma lib de ICS porque essas so trariam risco de conversao de
// fuso-horario (varias libs convertem VALUE=DATE pra Date local/UTC e podem
// deslocar o dia). Aqui a gente le o AAAAMMDD cru, sem conversao nenhuma.
//
// Regra de seguranca (pedida explicitamente pelo dono): uma falha numa fonte
// NUNCA apaga disponibilidade anterior. Ver computeApartmentBlocks() abaixo.
// ============================================================================

'use strict';

const fs = require('fs');

const APT_SOURCES = {
  ap05: { apt: 'airbnb5', label: 'AP 05', airbnbEnv: 'AIRBNB_ICS_AP05', bookingEnv: 'BOOKING_ICS_AP05' },
  ap06: { apt: 'airbnb06', label: 'AP 06', airbnbEnv: 'AIRBNB_ICS_AP06', bookingEnv: 'BOOKING_ICS_AP06' }
};

const FETCH_TIMEOUT_MS = 20000;

// ---- ICS parsing (sem biblioteca externa) ----------------------------------

// Desdobra continuacao de linha do RFC5545 (uma linha que comeca com espaco
// ou tab e' continuacao da linha anterior).
function unfoldICS(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function isValidICS(text) {
  return typeof text === 'string' && text.includes('BEGIN:VCALENDAR');
}

// Extrai so o que precisamos de cada VEVENT: DTSTART/DTEND, sempre como
// "AAAA-MM-DD" (os 8 primeiros digitos da propriedade, ignorando VALUE=DATE,
// TZID ou um eventual "Thmmss" de DATE-TIME — pra disponibilidade so o dia
// importa).
function parseICSBlocks(rawText) {
  if (!isValidICS(rawText)) {
    throw new Error('ICS_INVALID');
  }
  const text = unfoldICS(rawText);
  const blocks = [];
  const eventRe = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let m;
  while ((m = eventRe.exec(text))) {
    const body = m[1];
    const dtStart = /^DTSTART[^:\n]*:(\d{8})/m.exec(body);
    const dtEnd = /^DTEND[^:\n]*:(\d{8})/m.exec(body);
    if (!dtStart) continue; // evento sem data de inicio reconhecivel — ignora
    const from = toISODate(dtStart[1]);
    // Sem DTEND reconhecivel: trata como bloqueio de 1 noite (defensivo).
    const to = dtEnd ? toISODate(dtEnd[1]) : addDaysISO(from, 1);
    if (to <= from) continue; // intervalo degenerado — ignora
    blocks.push({ from, to });
  }
  return blocks;
}

function toISODate(yyyymmdd) {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function addDaysISO(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---- Uniao/merge de intervalos ---------------------------------------------

// Junta intervalos [from,to) sobrepostos ou consecutivos (to de um == from do
// seguinte) numa lista minima e ordenada. from/to em formato "AAAA-MM-DD".
function mergeIntervals(blocks) {
  const sorted = blocks.slice().sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  const out = [];
  for (const b of sorted) {
    const last = out[out.length - 1];
    if (last && b.from <= last.to) {
      if (b.to > last.to) last.to = b.to;
    } else {
      out.push({ from: b.from, to: b.to });
    }
  }
  return out;
}

// ---- Download com timeout, sem nunca logar a URL (contem o token/segredo) --

async function fetchICS(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const err = new Error('HTTP_ERROR');
      err.httpStatus = res.status;
      throw err;
    }
    return await res.text();
  } catch (e) {
    if (e && e.name === 'AbortError') {
      const err = new Error('TIMEOUT');
      throw err;
    }
    // Nunca repassa e.message/e.cause daqui pra cima sem tratar: erros de
    // rede do fetch as vezes embutem a URL (com o token) na mensagem.
    if (e && (e.message === 'HTTP_ERROR' || e.message === 'ICS_INVALID')) throw e;
    const err = new Error('NETWORK_ERROR');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAndParse(url, timeoutMs) {
  const text = await fetchICS(url, timeoutMs);
  return parseICSBlocks(text);
}

// ---- Resultado por apartamento, com a regra de seguranca -------------------
//
// - Nenhuma fonte configurada -> mantem os blocos anteriores, sem tocar.
// - Todas as fontes configuradas tiveram sucesso -> blocos totalmente novos
//   (autoritativos).
// - Sucesso parcial (uma fonte falhou, outra nao) -> uniao do que veio de
//   fresco com o que ja estava publicado antes pra esse apartamento (nunca
//   transforma uma noite potencialmente ocupada em livre so por causa de uma
//   fonte fora do ar).
// - Todas as fontes configuradas falharam -> mantem os blocos anteriores.
async function computeApartmentBlocks(key, previousBlocksByApt, log) {
  const cfg = APT_SOURCES[key];
  const sources = [
    { name: 'Airbnb', url: process.env[cfg.airbnbEnv] || '' },
    { name: 'Booking', url: process.env[cfg.bookingEnv] || '' }
  ].filter(s => s.url.trim() !== '');

  const previous = previousBlocksByApt[cfg.apt] || [];

  if (sources.length === 0) {
    log(`${cfg.label} - Airbnb: nao configurado`);
    log(`${cfg.label} - Booking: nao configurado`);
    return { blocks: previous, anyFreshSuccess: false, allConfiguredFailed: false };
  }

  const results = await Promise.allSettled(
    sources.map(s => fetchAndParse(s.url, FETCH_TIMEOUT_MS))
  );

  const okBlocks = [];
  let successCount = 0;
  results.forEach((r, i) => {
    const name = sources[i].name;
    if (r.status === 'fulfilled') {
      successCount++;
      log(`${cfg.label} - ${name}: OK (${r.value.length} bloqueio${r.value.length === 1 ? '' : 's'})`);
      okBlocks.push(...r.value);
    } else {
      const reason = r.reason && r.reason.message ? r.reason.message : 'ERRO_DESCONHECIDO';
      const detail = reason === 'HTTP_ERROR' && r.reason.httpStatus ? ` (status ${r.reason.httpStatus})` : '';
      log(`::warning::${cfg.label} - ${name}: FALHOU - ${reason}${detail}`);
    }
  });

  if (successCount === sources.length) {
    // todas as fontes configuradas responderam -> substitui de vez
    return { blocks: mergeIntervals(okBlocks), anyFreshSuccess: true, allConfiguredFailed: false };
  }
  if (successCount === 0) {
    log(`::warning::${cfg.label}: todas as fontes configuradas falharam nesta execucao — mantendo disponibilidade anterior.`);
    return { blocks: previous, anyFreshSuccess: false, allConfiguredFailed: true };
  }
  // sucesso parcial -> uniao conservadora com o que ja estava publicado
  return { blocks: mergeIntervals([...okBlocks, ...previous]), anyFreshSuccess: true, allConfiguredFailed: false };
}

// ---- Leitura do arquivo anterior --------------------------------------------

function readPrevious(filePath) {
  let raw = '';
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return { generatedAt: '', blocksByApt: {} };
  }
  const m = /window\.LUNET_AVAILABILITY\s*=\s*(\{[\s\S]*\});?\s*$/m.exec(raw.trim());
  if (!m) return { generatedAt: '', blocksByApt: {} };
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch (e) {
    // arquivo anterior nao estava no formato JSON gerado por este script
    // (ex.: primeira execucao, com generatedAt:"" e blocks:[] escritos a
    // mao) -> equivale a "sem dados anteriores".
    return { generatedAt: '', blocksByApt: {} };
  }
  const blocksByApt = {};
  (data.blocks || []).forEach(b => {
    if (!b || !b.apt || !b.from || !b.to) return;
    (blocksByApt[b.apt] = blocksByApt[b.apt] || []).push({ from: b.from, to: b.to });
  });
  return { generatedAt: data.generatedAt || '', blocksByApt };
}

function renderFile(data) {
  return `// Disponibilidade publica do site — SOMENTE apartamento + periodo
// ocupado (sem nome de hospede, telefone, e-mail, numero de reserva, valor
// ou plataforma de origem). E' a mesma informacao que o Airbnb/Booking ja
// mostram publicamente nos calendarios deles.
//
// Este arquivo e' gerado automaticamente pela GitHub Action
// ".github/workflows/sync-calendars.yml" (scripts/sync-calendars.js), que le
// os calendarios iCal do Airbnb e do Booking a cada 30 minutos e faz o merge
// aqui. Uma falha ao baixar/ler um calendario NUNCA apaga a disponibilidade
// anterior — nesse caso o arquivo so' e' deixado como estava.
window.LUNET_AVAILABILITY = ${JSON.stringify(data, null, 2)};
`;
}

// ---- Execucao principal ------------------------------------------------------

async function run(filePath) {
  const logs = [];
  const log = (msg) => { logs.push(msg); console.log(msg); };

  const previous = readPrevious(filePath);

  log('== Sincronizacao de disponibilidade (Airbnb/Booking) ==');

  const perApt = {};
  let anyFreshSuccessOverall = false;
  for (const key of Object.keys(APT_SOURCES)) {
    const result = await computeApartmentBlocks(key, previous.blocksByApt, log);
    perApt[key] = result;
    if (result.anyFreshSuccess) anyFreshSuccessOverall = true;
  }

  const blocks = [];
  for (const key of Object.keys(APT_SOURCES)) {
    const apt = APT_SOURCES[key].apt;
    perApt[key].blocks.forEach(b => blocks.push({ apt, from: b.from, to: b.to }));
  }
  blocks.sort((a, b) =>
    a.apt !== b.apt ? (a.apt < b.apt ? -1 : 1) : a.from !== b.from ? (a.from < b.from ? -1 : 1) : (a.to < b.to ? -1 : a.to > b.to ? 1 : 0)
  );

  const generatedAt = anyFreshSuccessOverall ? new Date().toISOString() : previous.generatedAt;

  log(`generatedAt: ${anyFreshSuccessOverall ? `atualizado para ${generatedAt}` : `mantido (${generatedAt || 'nunca sincronizado'})`}`);
  log(`Total de bloqueios publicados: ${blocks.length}`);

  fs.writeFileSync(filePath, renderFile({ generatedAt, blocks }), 'utf8');

  return { generatedAt, blocks, logs };
}

module.exports = {
  parseICSBlocks,
  mergeIntervals,
  computeApartmentBlocks,
  readPrevious,
  renderFile,
  toISODate,
  addDaysISO,
  fetchICS,
  fetchAndParse,
  run,
  APT_SOURCES
};

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Uso: node scripts/sync-calendars.js <caminho-do-disponibilidade.js>');
    process.exit(1);
  }
  run(filePath).catch(e => {
    console.error('Falha inesperada na sincronizacao:', e && e.message);
    process.exit(1);
  });
}
