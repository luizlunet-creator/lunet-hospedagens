const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function waLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function youtubeEmbedUrl(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function youtubeThumbUrl(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

function getListing(id) {
  return SITE_CONTENT.listings.find(x => x.id === id);
}

function isPlaceholderPhoto(item) {
  return item && typeof item === 'object' && item.placeholder;
}

function filenameToLabel(src) {
  const base = src.split('/').pop().replace(/\.[a-z0-9]+$/i, '');
  const words = base.replace(/[-_]+/g, ' ').replace(/\d+/g, '').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function photoAlt(item, listing) {
  if (isPlaceholderPhoto(item)) return `${item.label} do ${listing.title} — foto em breve`;
  return `${filenameToLabel(item)} — ${listing.title}`;
}

function placeholderSlideHtml(label, tagClass) {
  return `
    <div class="photo-placeholder ${tagClass || ''}">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10.5" r="1.6"/><path d="m4 17 5-4.5 3 2.5 4-4 4 4"/></svg>
      <span class="placeholder-label">${label}</span>
      <span class="placeholder-sub">Nova foto em breve</span>
    </div>
  `;
}

function ratingBadgeHtml(l) {
  if (!l.rating) return '';
  return `<span class="badge-rating">★ ${l.rating.toFixed(1).replace('.', ',')}</span>`;
}

function apartmentBadgeHtml(l) {
  if (!l.badge) return '';
  const cls = l.rating ? 'badge-established' : 'badge-new';
  return `<span class="apt-badge ${cls}">${l.badge}</span>`;
}

// Enquanto o link do Airbnb nao estiver cadastrado, o botao fica escondido
// (nada de "Link em atualizacao" -- isso passa sensacao de site inacabado).
function airbnbButtonHtml(url, size) {
  if (!url || !url.trim()) return '';
  const cls = size === 'sm' ? 'btn-airbnb btn-airbnb-sm' : 'btn-airbnb';
  return `<a class="${cls}" href="${url}" target="_blank" rel="noopener">Reservar pelo Airbnb</a>`;
}

/* ---------------- Comodidades padronizadas ---------------- */
// Os dois cards mostram exatamente as mesmas categorias. Um item so aparece
// como presente se estiver escrito de verdade na lista de comodidades daquele
// apartamento -- nunca assumido/copiado do outro card.
const FEATURE_MATCHERS = [
  { label: 'Cozinha equipada', re: /cozinha/i },
  { label: 'Ar-condicionado', re: /ar.?condicionado/i },
  { label: 'TV', re: /\btv\b/i },
  { label: 'Banheiro privativo', re: /banheiro/i },
  { label: 'Garagem', re: /estacionamento|garagem/i },
  { label: 'Wi-Fi', re: /wi-?fi/i }
];
function standardFeatures(listing) {
  const amen = (listing.amenities || []).join(' | ');
  return FEATURE_MATCHERS.filter(f => f.re.test(amen));
}
function statsChipsHtml(listing) {
  const chips = [];
  if (listing.guests) chips.push(`<div class="stat-chip"><strong>${listing.guests}</strong><span>hóspedes</span></div>`);
  if (listing.bedrooms) chips.push(`<div class="stat-chip"><strong>${listing.bedrooms}</strong><span>quarto${listing.bedrooms > 1 ? 's' : ''}</span></div>`);
  if (listing.beds) chips.push(`<div class="stat-chip"><strong>${listing.beds}</strong><span>cama${listing.beds > 1 ? 's' : ''}</span></div>`);
  if (!chips.length) return '';
  return `<div class="stat-chips">${chips.join('')}</div>`;
}
function featureChipsHtml(listing) {
  const feats = standardFeatures(listing);
  if (!feats.length) return '';
  return `<ul class="feature-chips">${feats.map(f => `<li>${f.label}</li>`).join('')}</ul>`;
}

/* ---------------- Public render ---------------- */

function renderBusinessUI() {
  const b = SITE_CONTENT.business;

  const heroMedia = $('#heroMedia');
  if (b.heroVideo && b.heroVideo.type === 'youtube') {
    const embed = youtubeEmbedUrl(b.heroVideo.src);
    heroMedia.innerHTML = embed
      ? `<iframe src="${embed}?autoplay=1&mute=1&controls=0&loop=1&playlist=${embed.split('/').pop()}" allow="autoplay" style="pointer-events:none" title="Vídeo de capa"></iframe>`
      : `<img src="${b.heroPhoto}" alt="${b.brand}">`;
  } else {
    heroMedia.innerHTML = `<img src="${b.heroPhoto}" alt="${b.brand}">`;
  }

  $('#heroTagline').textContent = b.tagline;
  $('#heroTitle').textContent = b.brand;
  $('#heroIntro').textContent = b.intro;

  const msg = `Olá! Vi o site do ${b.brand} e quero saber mais sobre disponibilidade.`;
  $('#heroWhatsapp').href = waLink(b.whatsapp, msg);
  $('#navWhatsapp').href = waLink(b.whatsapp, msg);
  $('#contactWhatsapp').href = waLink(b.whatsapp, msg);
  $('#contactInstagram').href = b.instagram || '#';

  const groupMsg = `Olá! Estamos em grupo e gostaria de saber sobre reservar as duas unidades (AP 05 e AP 06) do ${b.brand}, conforme disponibilidade.`;
  const groupBtn = $('#groupWhatsapp');
  if (groupBtn) groupBtn.href = waLink(b.whatsapp, groupMsg);
  $('#contactAddress').textContent = b.address;

  renderMapsSection(b);
  renderFooter(b);
}

function renderMapsSection(b) {
  const wrap = $('#mapsEmbedWrap');
  if (!wrap) return;
  const query = encodeURIComponent(b.address || b.city || '');
  const embedSrc = (b.mapsEmbedUrl && b.mapsEmbedUrl.trim()) || `https://www.google.com/maps?q=${query}&output=embed`;
  wrap.innerHTML = `<iframe src="${embedSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="Mapa — ${b.brand}"></iframe>`;
  $('#mapsAddressText').textContent = b.address || '';
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  $('#mapsDirections').href = dirUrl;
  $('#mapsAppLink').href = `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function footerInfoLinkHtml(key, label, text) {
  if (!text || !text.trim()) return '';
  return `<button type="button" class="footer-link" data-footer-info="${key}" data-footer-label="${label}">${label}</button>`;
}

function renderFooter(b) {
  const footer = $('#siteFooter');
  if (!footer) return;
  const listingLinks = (SITE_CONTENT.listings || []).map(l => `<button type="button" class="footer-link" data-open-listing="${l.id}">${l.title}</button>`).join('');
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-col footer-brand-col">
        <img src="assets/logo-lunet-cropped.png" alt="${b.brand}" class="footer-logo">
        <p class="footer-brand-name">${b.brand}</p>
        <p class="footer-address">${b.address || ''}</p>
      </div>
      <div class="footer-col">
        <h5>Contato</h5>
        <a href="${waLink(b.whatsapp, 'Olá! Vi o site do ' + b.brand + ' e quero saber mais.')}" target="_blank" rel="noopener" class="footer-link">WhatsApp</a>
        ${b.instagram ? `<a href="${b.instagram}" target="_blank" rel="noopener" class="footer-link">Instagram</a>` : ''}
      </div>
      <div class="footer-col">
        <h5>Apartamentos</h5>
        ${listingLinks}
      </div>
      <div class="footer-col">
        <h5>Informações</h5>
        ${footerInfoLinkHtml('houseRules', 'Regras da hospedagem', b.houseRules || 'Em breve — fale com a gente pelo WhatsApp para saber mais sobre as regras da hospedagem.')}
        ${footerInfoLinkHtml('privacyPolicy', 'Política de privacidade', b.privacyPolicy)}
      </div>
    </div>
    <p class="footer-airbnb-notice">Reservas feitas pelo Airbnb são pagas exclusivamente pela plataforma Airbnb.</p>
    <p class="footer-copy">${b.brand} · Itajaí, SC</p>
  `;
  $$('[data-footer-info]', footer).forEach(btn => {
    btn.addEventListener('click', () => openFooterInfo(btn.dataset.footerInfo, btn.dataset.footerLabel));
  });
  $$('[data-open-listing]', footer).forEach(btn => {
    btn.addEventListener('click', () => openListingDetail(btn.dataset.openListing));
  });
}

function openFooterInfo(key, label) {
  const b = SITE_CONTENT.business;
  const text = key === 'houseRules'
    ? (b.houseRules && b.houseRules.trim()) || 'Em breve — fale com a gente pelo WhatsApp para saber mais sobre as regras da hospedagem.'
    : b.privacyPolicy || '';
  $('#footerInfoTitle').textContent = label;
  $('#footerInfoText').textContent = text;
  $('#footerInfoModal').dataset.active = 'true';
}

function listingCardPhotoHtml(listing) {
  const photos = listing.photos || [];
  const real = photos.filter(p => !isPlaceholderPhoto(p));
  const cover = real[0];
  const countLabel = real.length ? `Ver todas as fotos (${real.length})` : 'Fotos em breve';
  if (!cover) {
    return placeholderSlideHtml(listing.title, 'photo-placeholder-cover') + `<span class="photo-count">${countLabel}</span>`;
  }
  return `<img src="${cover}" alt="${photoAlt(cover, listing)}" loading="lazy" decoding="async"><span class="photo-count photo-count-btn">${countLabel}</span>`;
}

function renderListingGrid() {
  const grid = $('#listingGrid');
  grid.innerHTML = SITE_CONTENT.listings.map(l => `
    <article class="listing-card" data-listing-card="${l.id}">
      <div class="listing-card-photo">
        ${listingCardPhotoHtml(l)}
        ${ratingBadgeHtml(l)}
      </div>
      <div class="listing-card-body">
        ${apartmentBadgeHtml(l)}
        <h3>${l.title}</h3>
        <p class="subtitle">${l.subtitle || ''}</p>
        ${statsChipsHtml(l)}
        ${featureChipsHtml(l)}
        <div class="listing-card-actions">
          <button type="button" class="btn-ghost btn-sm" data-open-listing="${l.id}">Ver detalhes</button>
          <a class="btn-whatsapp btn-sm" href="${waLink(SITE_CONTENT.business.whatsapp, `Olá! Tenho interesse no ${l.title}. Pode me passar disponibilidade e valores?`)}" target="_blank" rel="noopener">WhatsApp</a>
          ${airbnbButtonHtml(l.airbnbUrl, 'sm')}
        </div>
      </div>
    </article>
  `).join('');
  $$('.listing-card', grid).forEach(card => {
    const id = card.dataset.listingCard;
    card.querySelector('[data-open-listing]').addEventListener('click', e => {
      e.stopPropagation();
      openListingDetail(id);
    });
    card.querySelector('.listing-card-photo').addEventListener('click', () => openListingDetail(id));
  });
  renderVideoSection();
}

function detailSlideInnerHtml(item, listing, index) {
  if (isPlaceholderPhoto(item)) return placeholderSlideHtml(item.label);
  return `<img class="zoomable" data-photo-index="${index}" src="${item}" alt="${photoAlt(item, listing)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">`;
}

function detailCarouselHtml(listing) {
  const photos = listing.photos || [];
  if (!photos.length) {
    return `<div class="detail-no-photos">Fotos em breve</div>`;
  }
  if (photos.length === 1) {
    return `<div class="detail-gallery"><div class="detail-carousel"><div class="detail-slide">${detailSlideInnerHtml(photos[0], listing, 0)}</div></div></div>`;
  }
  return `
    <div class="detail-gallery">
      <div class="detail-carousel" id="detailCarouselEl">
        ${photos.map((item, i) => `<div class="detail-slide">${detailSlideInnerHtml(item, listing, i)}</div>`).join('')}
      </div>
      <button class="detail-arrow detail-arrow-prev" id="detailPrev" aria-label="Foto anterior">‹</button>
      <button class="detail-arrow detail-arrow-next" id="detailNext" aria-label="Próxima foto">›</button>
      <span class="detail-counter" id="detailCounter">1 de ${photos.length}</span>
    </div>
    <div class="detail-dots">${photos.map((_, i) => `<button class="detail-dot" data-dot="${i}"></button>`).join('')}</div>
    <div class="detail-thumbs" id="detailThumbs">
      ${photos.map((item, i) => `
        <button class="detail-thumb" data-thumb="${i}">
          ${isPlaceholderPhoto(item) ? '<span class="thumb-placeholder">?</span>' : `<img src="${item}" alt="" loading="lazy">`}
        </button>
      `).join('')}
    </div>
  `;
}

function setupDetailCarousel() {
  const carousel = $('#detailCarouselEl');
  if (!carousel) return;
  const dots = $$('.detail-dot');
  const thumbs = $$('.detail-thumb');
  const slides = $$('.detail-slide', carousel);
  const counter = $('#detailCounter');
  const total = slides.length;

  const goTo = i => {
    i = Math.max(0, Math.min(total - 1, i));
    slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };
  const currentIndex = () => Math.round(carousel.scrollLeft / carousel.clientWidth);
  const setActive = i => {
    dots.forEach((d, di) => d.classList.toggle('active', di === i));
    thumbs.forEach((t, ti) => t.classList.toggle('active', ti === i));
    if (counter) counter.textContent = `${i + 1} de ${total}`;
  };

  setActive(0);
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
  const prevBtn = $('#detailPrev');
  const nextBtn = $('#detailNext');
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));

  let ticking = false;
  carousel.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setActive(currentIndex());
      ticking = false;
    });
  });
}

function videoEmbedHtml(v) {
  if (v.type === 'youtube') {
    const embed = youtubeEmbedUrl(v.src);
    if (!embed) return '';
    return `<div class="detail-video-wrap"><iframe src="${embed}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Vídeo"></iframe></div>`;
  }
  if (v.type === 'instagram') {
    return `<div class="detail-video-wrap" style="aspect-ratio:auto; background:none; height:auto;"><a class="btn-ghost" href="${v.src}" target="_blank" rel="noopener">Ver vídeo no Instagram ↗</a></div>`;
  }
  return '';
}

// Vídeo de aviso importante (regras da casa, instruções de check-in etc.),
// separado do vídeo de apresentação -- some da pagina se nao tiver link.
function avisoVideoHtml(listing) {
  if (!listing.avisoVideo || !listing.avisoVideo.src) return '';
  const embed = videoEmbedHtml(listing.avisoVideo);
  if (!embed) return '';
  return `<div class="detail-aviso-box"><p class="detail-aviso-label">⚠ Aviso importante</p>${embed}</div>`;
}

/* ---------------- Seção de vídeo por apartamento (home) ---------------- */

function renderVideoSection() {
  const section = $('#videoSection');
  const grid = $('#videoGrid');
  if (!section || !grid) return;
  const withVideo = SITE_CONTENT.listings.filter(l => l.videos && l.videos.length && l.videos[0].src);
  if (!withVideo.length) { section.style.display = 'none'; grid.innerHTML = ''; return; }
  section.style.display = '';
  grid.innerHTML = withVideo.map(l => {
    const v = l.videos[0];
    const real = (l.photos || []).filter(p => !isPlaceholderPhoto(p));
    const cover = (v.type === 'youtube' && youtubeThumbUrl(v.src)) || real[0] || '';
    return `
      <div class="video-card" data-video-card="${l.id}">
        <button type="button" class="video-cover" data-play-video="${l.id}" aria-label="Reproduzir vídeo do ${l.title}">
          ${cover ? `<img src="${cover}" alt="Capa do vídeo — ${l.title}" loading="lazy">` : ''}
          <span class="video-play-btn">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </button>
        <h4>Conheça o ${l.title.replace('Apartamento ', '')}</h4>
      </div>
    `;
  }).join('');
  $$('[data-play-video]', grid).forEach(btn => {
    btn.addEventListener('click', () => playVideoCard(btn.dataset.playVideo));
  });
}

function playVideoCard(listingId) {
  const l = getListing(listingId);
  const card = $(`.video-card[data-video-card="${listingId}"] .video-cover`);
  if (!l || !card || !l.videos || !l.videos[0]) return;
  const html = videoEmbedHtml(l.videos[0]);
  if (!html) return;
  card.outerHTML = `<div class="video-cover video-cover-playing">${html}</div>`;
}

function openListingDetail(id) {
  const l = getListing(id);
  if (!l) return;
  const msg = `Olá! Tenho interesse no ${l.title} do ${SITE_CONTENT.business.brand}. Pode me passar disponibilidade e valores?`;
  $('#detailBody').innerHTML = `
    <div class="detail-media-wrap">
      ${detailCarouselHtml(l)}
      ${ratingBadgeHtml(l)}
    </div>
    <div class="detail-info">
      ${apartmentBadgeHtml(l)}
      <h2>${l.title}</h2>
      ${l.subtitle ? `<p class="subtitle">${l.subtitle}</p>` : ''}
      ${l.badgeSupport ? `<p class="badge-support">${l.badgeSupport}</p>` : ''}
      ${statsChipsHtml(l)}
      ${featureChipsHtml(l)}
      ${avisoVideoHtml(l)}
      ${l.description ? `<p class="description">${l.description}</p>` : ''}
      ${l.amenities && l.amenities.length ? `<ul class="detail-amenities">${l.amenities.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
      ${l.videos && l.videos.length ? `<div class="detail-videos">${l.videos.map(videoEmbedHtml).join('')}</div>` : ''}
      <div class="detail-actions">
        ${airbnbButtonHtml(l.airbnbUrl)}
        <a class="btn-whatsapp btn-secondary" href="${waLink(SITE_CONTENT.business.whatsapp, msg)}" target="_blank" rel="noopener">Falar pelo WhatsApp</a>
      </div>
      <p class="booking-note">Consulte datas, valores e disponibilidade diretamente pelo Airbnb ou fale conosco.</p>
    </div>
  `;
  setupDetailCarousel();
  wireZoomables($('#detailBody'), l);
  $('#detailOverlay').dataset.active = 'true';
  document.body.style.overflow = 'hidden';
}

function closeListingDetail() {
  $('#detailOverlay').dataset.active = 'false';
  document.body.style.overflow = '';
}

function renderTouristGrid() {
  const grid = $('#touristGrid');
  grid.innerHTML = SITE_CONTENT.touristPoints.map(p => `
    <article class="tourist-card">
      ${p.photo ? `<img class="zoomable" src="${p.photo}" alt="${p.name} — ponto turístico em Itajaí" loading="lazy" decoding="async">` : ''}
      <div class="tourist-card-body">
        <h4>${p.name}</h4>
        <p>${p.blurb || ''}</p>
      </div>
    </article>
  `).join('');
  wireZoomables(grid);
}

/* ---------------- Lightbox (com navegação em tela cheia) ---------------- */

let lightboxCtx = { items: [], index: 0 };

function wireZoomables(root, listing) {
  const imgs = $$('.zoomable', root);
  const items = imgs.map(img => ({ src: img.src, alt: img.alt }));
  imgs.forEach((img, i) => {
    img.addEventListener('click', () => openLightboxAt(items, i));
  });
}

function openLightboxAt(items, index) {
  lightboxCtx = { items, index };
  renderLightbox();
  $('#lightbox').dataset.active = 'true';
}

function renderLightbox() {
  const { items, index } = lightboxCtx;
  const item = items[index];
  if (!item) return;
  $('#lightboxImg').src = item.src;
  $('#lightboxImg').alt = item.alt;
  const multi = items.length > 1;
  $('#lightboxCounter').textContent = multi ? `${index + 1} de ${items.length}` : '';
  $('#lightboxPrev').style.display = multi ? 'flex' : 'none';
  $('#lightboxNext').style.display = multi ? 'flex' : 'none';
}

function lightboxNav(delta) {
  const { items } = lightboxCtx;
  if (!items.length) return;
  lightboxCtx.index = (lightboxCtx.index + delta + items.length) % items.length;
  renderLightbox();
}

function closeLightbox() {
  $('#lightbox').dataset.active = 'false';
}

/* Arrastar com o dedo dentro da tela cheia (lightbox) */
function wireLightboxSwipe() {
  const box = $('#lightbox');
  let startX = null;
  box.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) lightboxNav(dx < 0 ? 1 : -1);
    startX = null;
  }, { passive: true });
}

/* ---------------- Pré-visualização ao vivo no painel protegido ---------------- */
// Se essa pagina estiver aberta dentro do iframe do painel.html, o painel
// manda o SITE_CONTENT atualizado por postMessage a cada edicao, pra
// pre-visualizacao ficar sempre em dia sem duplicar HTML em dois arquivos.
// Pra qualquer visitante normal do site publico isso nunca dispara.
window.addEventListener('message', e => {
  if (!e.data || e.data.source !== 'lunet-painel' || !e.data.content) return;
  Object.keys(SITE_CONTENT).forEach(k => delete SITE_CONTENT[k]);
  Object.assign(SITE_CONTENT, e.data.content);
  renderBusinessUI();
  renderListingGrid();
  renderTouristGrid();
});

/* ---------------- Wire up ---------------- */

$('#detailClose').addEventListener('click', closeListingDetail);
$('#detailOverlay').addEventListener('click', e => { if (e.target.id === 'detailOverlay') closeListingDetail(); });
$('#lightboxClose').addEventListener('click', closeLightbox);
$('#lightboxPrev').addEventListener('click', () => lightboxNav(-1));
$('#lightboxNext').addEventListener('click', () => lightboxNav(1));
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
document.addEventListener('keydown', e => {
  if ($('#lightbox').dataset.active !== 'true') return;
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  else if (e.key === 'ArrowRight') lightboxNav(1);
  else if (e.key === 'Escape') closeLightbox();
});
wireLightboxSwipe();

const footerInfoModal = $('#footerInfoModal');
if (footerInfoModal) {
  $('#footerInfoClose').addEventListener('click', () => { footerInfoModal.dataset.active = 'false'; });
  footerInfoModal.addEventListener('click', e => { if (e.target === footerInfoModal) footerInfoModal.dataset.active = 'false'; });
}

const navToggle = $('#navToggle');
const topnav = $('#topnav');
if (navToggle && topnav) {
  navToggle.addEventListener('click', () => {
    const open = topnav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a', topnav).forEach(a => a.addEventListener('click', () => {
    topnav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

renderBusinessUI();
renderListingGrid();
renderTouristGrid();
