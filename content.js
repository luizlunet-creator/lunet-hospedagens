// Todo o conteudo editavel do site vive aqui.
// O painel "Editar" le e modifica este objeto, e pode exportar uma copia atualizada deste arquivo.

// Links dos anuncios no Airbnb — cole aqui assim que tiver os links reais.
// Enquanto estiverem vazios, o botao "Reservar pelo Airbnb" fica desativado
// e mostra "Link em atualizacao" no lugar de quebrar ou apontar pra lugar nenhum.
const AIRBNB_AP05_URL = "https://www.airbnb.com.br/rooms/1711839118134063258";
const AIRBNB_AP06_URL = "https://www.airbnb.com.br/rooms/1711835880981110744";

const SITE_CONTENT = {
  business: {
    brand: "Lunet Hospedagens",
    tagline: "Apartamentos para temporada em Itajaí, SC",
    city: "Itajaí, Santa Catarina",
    address: "Rua Professora Eroltides da Silva Fontes, 1500 — esquina com Rua Joaçaba, Itajaí - SC",
    whatsapp: "5547997191415",
    instagram: "https://www.instagram.com/apartamento_em_itajai/",
    heroPhoto: "assets/listings/airbnb06/cozinha-geral.jpg",
    heroVideo: null,
    intro: "Conforto, praticidade e uma localização estratégica em Itajaí. Nossos apartamentos foram preparados para receber famílias, casais e profissionais que procuram uma hospedagem organizada, segura e confortável.",
    mapsEmbedUrl: "",
    houseRules: "Acesso ao apartamento\nOs hóspedes têm acesso total ao apartamento reservado: quartos, cozinha completa, banheiro e sacada com vista. Também podem usar as áreas comuns do prédio, como corredores e escadas. O acesso é por fechadura eletrônica — não precisa de chave, só da tag fornecida no check-in.\n\nAtendimento durante a estadia\nRespondemos rapidamente pelo WhatsApp a qualquer dúvida, antes ou durante a estadia.\n\nRegras da casa\n• Não é permitido fumar dentro do apartamento.\n• Não são permitidas festas ou eventos.\n• Não é permitido hospedar animais de estimação.\n• Por se tratar de prédio residencial, pedimos silêncio das 22h às 8h.\n• O acesso ao apartamento é feito por escada (sem elevador).\n\nQualquer dúvida, é só chamar no WhatsApp.",
    privacyPolicy: "Este site é estático e não coleta dados automaticamente: não usa formulários que enviem informações para servidores, não usa cookies de rastreamento e não compartilha dados com terceiros para fins de publicidade. Ao clicar em WhatsApp, Instagram ou Airbnb, você é direcionado para o aplicativo correspondente, que segue a própria política de privacidade dele.\n\nComo usamos suas informações\nQuando você entra em contato pelo WhatsApp, Instagram ou Airbnb, a conversa acontece diretamente no aplicativo correspondente — nada fica registrado neste site.\n\nA ficha de check-in (quando preenchida) monta uma mensagem que você mesmo revisa e envia pelo seu WhatsApp — nenhum dado fica salvo neste site nem em nenhum servidor.\n\nOs dados que você compartilha conosco (nome, telefone, datas da estadia e, quando exigido por lei, documento de identificação) ficam guardados apenas em nosso controle interno, usados só para confirmar sua reserva, dar suporte durante a estadia e cumprir obrigações legais de hospedagem. Não vendemos nem compartilhamos esses dados com terceiros para fins comerciais.\n\nSeus direitos (LGPD)\nVocê pode pedir a qualquer momento para saber quais dados temos sobre você, corrigi-los ou solicitar a exclusão — é só chamar no WhatsApp."
  },

  // Coordenadas reais (OpenStreetMap) pro mapa do site. O primeiro ponto é o
  // próprio prédio; os demais são referências pra situar o hóspede na região.
  mapPoints: [
    { name: "Lunet Hospedagens", lat: -26.9092, lng: -48.7020, kind: "home", blurb: "Rua Prof. Eroltides da Silva Fontes, esquina com Rua Joaçaba" },
    { name: "Praia Brava", lat: -26.9489, lng: -48.6372, kind: "poi" },
    { name: "Marina de Itajaí", lat: -26.9119, lng: -48.6521, kind: "poi" },
    { name: "Centreventos Itajaí", lat: -26.9096, lng: -48.6530, kind: "poi" },
    { name: "Balneário Camboriú (Centro)", lat: -26.9926, lng: -48.6324, kind: "poi" },
    { name: "Beto Carrero World", lat: -26.8042, lng: -48.6204, kind: "poi" }
  ],

  listings: [
    {
      id: "airbnb06",
      title: "Apartamento AP 06",
      subtitle: "Cozinha em mármore preto e dourado",
      badge: "Avaliação 5,0",
      badgeSupport: "Apartamento já aprovado pelos nossos hóspedes",
      rating: 5.0,
      bedrooms: 2,
      beds: 2,
      guests: 4,
      description: "Apartamento equipado no Lunet Hospedagens, a poucos minutos do centro de Itajaí e do bairro São Vicente. Cozinha completa com bancada em mármore preto e dourado, dois quartos com ar-condicionado, banheiro com box de vidro e frigobar sempre abastecido — tudo pensado para você chegar e já se sentir em casa.",
      amenities: [
        "Cozinha completa (fogão, air fryer, cafeteira, chaleira elétrica)",
        "2 quartos com ar-condicionado",
        "TV",
        "Wi-Fi",
        "Banheiro com box de vidro",
        "Secador de cabelo",
        "Frigobar abastecido",
        "Estacionamento em frente ao prédio"
      ],
      photos: [
        "assets/listings/airbnb06/cozinha-geral.jpg",
        "assets/listings/airbnb06/cozinha-bancada.jpg",
        "assets/listings/airbnb06/cozinha-bar.jpg",
        "assets/listings/airbnb06/quarto1-cama.jpg",
        "assets/listings/airbnb06/quarto2-tv.jpg",
        "assets/listings/airbnb06/quarto2.jpg",
        "assets/listings/airbnb06/banheiro-box.jpg",
        "assets/listings/airbnb06/banheiro-cuba.jpg",
        "assets/listings/airbnb06/banheiro-nicho.jpg",
        "assets/listings/airbnb06/banheiro-toalhas.jpg",
        "assets/listings/airbnb06/frigobar.jpg",
        "assets/listings/airbnb06/corredor.jpg"
      ],
      videos: [],
      avisoVideo: null,
      // Video-tour proprio do apartamento (arquivo .mp4 hospedado aqui no
      // site, nao Instagram/YouTube). So aparece na ficha do apartamento se
      // "src" estiver preenchido -- deixe null pra esconder o bloco.
      videoTour: {
        src: "assets/listings/airbnb06/AP06_video_site_otimizado.mp4",
        poster: "assets/listings/airbnb06/AP06_video_thumb.jpg",
        title: "Conheça o AP 06 em vídeo",
        subtitle: "Veja um tour rápido pelo apartamento."
      },
      airbnbUrl: AIRBNB_AP06_URL
    },
    {
      id: "airbnb5",
      title: "Apartamento AP 05",
      subtitle: "Cozinha em mármore branco com veios pretos",
      badge: "Apartamento novo",
      badgeSupport: "Uma nova opção de hospedagem em Itajaí",
      rating: null,
      bedrooms: 2,
      beds: 2,
      guests: 4,
      description: "O mais novo apartamento do Lunet Hospedagens, com cozinha integrada à sala, bancada em mármore branco com veios pretos e cantinho para refeições. Fotos do banheiro e versões sem legenda das demais fotos chegando em breve — fale pelo WhatsApp ou consulte o Airbnb para disponibilidade e valores.",
      amenities: [
        "Cozinha completa integrada à sala",
        "Sala com sofá",
        "2 quartos",
        "Wi-Fi",
        "Fechadura eletrônica",
        "Estacionamento em frente ao prédio"
      ],
      // Os arquivos "-pdf.jpg" sao recortes do material/PDF enviado pelo dono —
      // fotos reais do AP 05, mas com titulo e legenda promocional queimados
      // na imagem (a pedido explicito do dono, como solucao temporaria).
      // Troque cada um pela foto limpa (sem texto) assim que ela chegar,
      // pelo botao "Trocar" no painel de edicao ou editando o caminho aqui.
      photos: [
        "assets/listings/airbnb5/cozinha-pdf.jpg",
        "assets/listings/airbnb5/sala-pdf.jpg",
        "assets/listings/airbnb5/mesa-pdf.jpg",
        "assets/listings/airbnb5/quarto1-pdf.jpg",
        "assets/listings/airbnb5/quarto2-pdf.jpg"
      ],
      videos: [],
      avisoVideo: null,
      // Video-tour proprio do apartamento (arquivo .mp4 hospedado aqui no
      // site, nao Instagram/YouTube). So aparece na ficha do apartamento se
      // "src" estiver preenchido -- deixe null pra esconder o bloco.
      // poster: o arquivo AP05_video_thumb.jpg (a capa definitiva) ainda nao
      // foi enviado -- usando por enquanto a primeira foto da galeria como
      // capa temporaria. Troque pra "assets/listings/airbnb5/AP05_video_thumb.jpg"
      // assim que o arquivo chegar.
      videoTour: {
        src: "assets/listings/airbnb5/AP05_video_site_otimizado.mp4",
        poster: "assets/listings/airbnb5/cozinha-pdf.jpg",
        title: "Conheça o AP 05 em vídeo",
        subtitle: "Veja um tour rápido pelo apartamento."
      },
      airbnbUrl: AIRBNB_AP05_URL
    }
  ],

  touristPoints: [
    { name: "Praia da Atalaia", photo: "assets/photos/praia-atalaia.jpg", blurb: "Uma das praias mais procuradas de Itajaí, com boa estrutura de bares e quiosques à beira-mar." },
    { name: "Bico do Papagaio", photo: "assets/photos/bico-papagaio.jpg", blurb: "Mirante natural com vista panorâmica da cidade e do encontro do rio com o mar." },
    { name: "Marejada", photo: "assets/photos/marejada.jpg", blurb: "A tradicional festa de outubro de Itajaí, com comidas típicas alemãs e açorianas." },
    { name: "Porto de Itajaí", photo: "assets/photos/porto-itajai.jpg", blurb: "Um dos maiores portos do Brasil, símbolo da cidade e ótimo point para fotos à beira do rio." },
    { name: "Igreja Matriz", photo: "assets/photos/igreja-matriz.jpg", blurb: "Igreja histórica no coração do centro de Itajaí." },
    { name: "Museu", photo: "assets/photos/museu.jpg", blurb: "Museu local com a história da cidade e da colonização da região." },
    { name: "Estádio Marcílio Dias", photo: "assets/photos/estadio.jpg", blurb: "Estádio do time local, tradição do futebol catarinense." }
  ]
};
