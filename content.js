// Todo o conteudo editavel do site vive aqui.
// O painel "Editar" le e modifica este objeto, e pode exportar uma copia atualizada deste arquivo.

// Links dos anuncios no Airbnb — cole aqui assim que tiver os links reais.
// Enquanto estiverem vazios, o botao "Reservar pelo Airbnb" fica desativado
// e mostra "Link em atualizacao" no lugar de quebrar ou apontar pra lugar nenhum.
const AIRBNB_AP05_URL = "https://www.airbnb.com.br/rooms/1711839118134063258";
const AIRBNB_AP06_URL = "https://www.airbnb.com.br/rooms/1711835880981110744";

const SITE_CONTENT = {
  business: {
    brand: "Prédio Lunet",
    tagline: "Apartamentos para temporada em Itajaí, SC",
    city: "Itajaí, Santa Catarina",
    address: "Rua Professora Eroltides da Silva Fontes, 1500 — esquina com Rua Joaçaba, Itajaí - SC",
    whatsapp: "5547997191415",
    instagram: "https://www.instagram.com/apartamento_em_itajai/",
    heroPhoto: "assets/listings/airbnb06/cozinha-geral.jpg",
    heroVideo: null,
    intro: "Conforto, praticidade e uma localização estratégica em Itajaí. Nossos apartamentos foram preparados para receber famílias, casais e profissionais que procuram uma hospedagem organizada, segura e confortável.",
    mapsEmbedUrl: "",
    houseRules: "",
    privacyPolicy: "Este site não usa formulários que coletem seus dados nem cookies de rastreamento. Ao clicar em WhatsApp, Instagram ou Airbnb, você é direcionado para o aplicativo correspondente, que segue a própria política de privacidade dele."
  },

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
      description: "Apartamento equipado no Prédio Lunet, a poucos minutos do centro de Itajaí e do bairro São Vicente. Cozinha completa com bancada em mármore preto e dourado, dois quartos com ar-condicionado, banheiro com box de vidro e frigobar sempre abastecido — tudo pensado para você chegar e já se sentir em casa.",
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
      description: "O mais novo apartamento do Prédio Lunet, com cozinha integrada à sala, bancada em mármore branco com veios pretos e cantinho para refeições. Fotos do banheiro e versões sem legenda das demais fotos chegando em breve — fale pelo WhatsApp ou consulte o Airbnb para disponibilidade e valores.",
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
