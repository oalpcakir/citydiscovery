// Amsterdam ve çevresi görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.amsterdam = {
  id: "amsterdam",
  name: "Amsterdam",
  subtitle: "ve çevresi",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Amsterdammer", "Echte Amsterdammer"],
  areas: {
    merkez: "Merkez & Kanallar",
    jordaan: "Jordaan",
    zuid: "Zuid & De Pijp",
    oost: "Oost & Plantage",
    noord: "Noord",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[52.335, 4.840], [52.405, 4.960]],
  coords: {
    begijnhof: [52.3694, 4.8901], onslieveheer: [52.3751, 4.8993], wynand: [52.3723, 4.8952], vleminckx: [52.3683, 4.8903],
    prinsengrachtconcert: [52.3729, 4.8838], winkel43: [52.3797, 4.8859], karthuizerhof: [52.3790, 4.8822],
    albertcuyp: [52.3558, 4.8935], rijkspassage: [52.3600, 4.8852], openluchttheater: [52.3579, 4.8672],
    brouwerijhetij: [52.3667, 4.9264], hortus: [52.3668, 4.9082], ndsm: [52.4012, 4.8925], eye: [52.3843, 4.9009],
    teylers: [52.3803, 4.6403], jopenkerk: [52.3812, 4.6297], zaanseschans: [52.4740, 4.8185], zandvoort: [52.3765, 4.5275],
    marken: [52.4587, 5.1040], volendam: [52.4943, 5.0750], muiderslot: [52.3343, 5.0713], alkmaar: [52.6318, 4.7505]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🛶", name: "Kanal Kurdu" },
    jordaan: { icon: "🏘️", name: "Jordanees" },
    zuid: { icon: "🎨", name: "Pijp Müdavimi" },
    oost: { icon: "🌿", name: "Oost Gezgini" },
    noord: { icon: "⛴️", name: "Noorderling" },
    cevre: { icon: "🧀", name: "Çevre Kâşifi" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "begijnhof", cat: "gor", area: "merkez", title: "Begijnhof'taki ahşap evi bul",
      desc: "Kalverstraat'ın gürültüsünden bir kapı ötede, ortaçağdan kalma sessiz bir avlu. Het Houten Huys şehirde ayakta kalan son iki ahşap cepheli evden biri.",
      tip: "Burada hâlâ insanlar yaşıyor: sessiz ol. Avludaki evlerin arasına gizlenmiş Katolik şapelini de ara.", q: "Begijnhof Amsterdam", tags: ["ücretsiz"] },
    { id: "onslieveheer", cat: "gor", area: "merkez", title: "Çatı katındaki gizli kiliseye çık",
      desc: "Ons' Lieve Heer op Solder, 17. yüzyılda Katolik ayinlerin yasak olduğu dönemde bir tüccar evinin çatı katına kurulmuş eksiksiz bir kilise. Dışarıdan sıradan bir kanal evi.",
      tip: "Dar merdivenleri çıkarken evin 17. yüzyıl mutfağına ve odalarına da bak.", q: "Museum Ons' Lieve Heer op Solder Amsterdam", tags: ["yağmurda"] },
    { id: "karthuizerhof", cat: "gor", area: "jordaan", title: "Karthuizerhof'un avlusuna gir",
      desc: "Jordaan, kapı arkasına saklanmış hofje'lerle dolu. 1650 tarihli Karthuizerhof, dul kadınlar için yapılmış en büyüklerinden; ortasında iki eski su tulumbası duruyor.",
      tip: "Kapı açıksa girebilirsin ama burası insanların evi: sessizce gez, fotoğrafı kısa tut.", q: "Karthuizerhof Amsterdam", tags: ["ücretsiz"] },
    { id: "hortus", cat: "gor", area: "oost", title: "Hortus Botanicus'un palmiye serasına gir",
      desc: "1638'de şifalı bitki bahçesi olarak kurulan Hortus, dünyanın en eski botanik bahçelerinden. Doğu Hindistan Şirketi gemilerinin getirdiği bitkilerin torunları hâlâ burada.",
      tip: "Yüzlerce yıllık dev sikas bitkisini ve kelebek serasını atlama; kışın sıcak seralar iyi bir kaçış.", q: "Hortus Botanicus Amsterdam", tags: ["yağmurda"] },
    { id: "eye", cat: "gor", area: "noord", title: "Eye Filmmuseum'un terasından IJ'ye bak",
      desc: "IJ kıyısındaki beyaz, köşeli bina Hollanda'nın film müzesi. Bilet almadan da içeri girip dev camların önündeki basamaklardan şehre bakabilirsin.",
      tip: "Centraal'ın arkasından kalkan ücretsiz Buiksloterweg vapuru birkaç dakikada karşıya geçiriyor.", q: "Eye Filmmuseum Amsterdam", tags: ["yağmurda"] },
    { id: "teylers", cat: "gor", area: "cevre", title: "Haarlem'de Teylers Museum'un Oval Salonu",
      desc: "1784'te açılan Teylers, Hollanda'nın en eski müzesi. Oval Salon, fosilleri ve bilim aletleriyle 18. yüzyıldaki hâlini neredeyse aynen koruyor.",
      tip: "Salon gün ışığıyla aydınlanıyor; kapalı kış günlerinde erken git. Sonra Spaarne kıyısından Grote Markt'a yürü.", q: "Teylers Museum Haarlem", tags: ["yağmurda"] },
    { id: "zaanseschans", cat: "gor", area: "cevre", title: "Zaanse Schans'ta çalışan bir değirmene gir",
      desc: "Zaan bölgesi bir zamanlar yüzlerce sanayi değirmeniyle dünyanın ilk sanayi bölgelerinden biriydi. Zaanse Schans'taki değirmenler hâlâ boya, yağ ve kereste üretiyor.",
      tip: "Alanda dolaşmak ücretsiz, değirmenlere giriş ayrı. Boya değirmeni De Kat'ı seç ve sabah erken git.", q: "Zaanse Schans Zaandam" },
    { id: "muiderslot", cat: "gor", area: "cevre", title: "Muiderslot'un surlarında yürü",
      desc: "Vecht'in IJmeer'e döküldüğü yerde, 13. yüzyılda Kont Floris V'in yaptırdığı hendekli şato. Hollanda'nın en iyi korunmuş ortaçağ kalelerinden.",
      tip: "Sezonda Muiden'den Pampus kale adasına tekne kalkıyor; ikisini aynı güne sığdırabilirsin.", q: "Muiderslot Muiden" },

    // YENİLECEK
    { id: "wynand", cat: "ye", area: "merkez", title: "Wynand Fockink'te eğilerek jenever iç",
      desc: "Dam Meydanı'nın arkasındaki dar sokakta, 17. yüzyıldan beri açık olan tadım evi. Kadeh ağzına kadar doldurulur; ilk yudumu eller arkada, eğilerek almak gelenek.",
      tip: "Oturacak yer yok, ayakta içilir. Barmene damak zevkini söyle, likör ya da jenever önersin.", q: "Wynand Fockink Amsterdam", tags: ["yağmurda"] },
    { id: "vleminckx", cat: "ye", area: "merkez", title: "Vleminckx'ten külahta patat al",
      desc: "Voetboogstraat'taki küçük pencere onlarca yıldır sadece patates satıyor ve kuyruğu hiç bitmiyor. Amsterdamlıların 'en iyi patat' tartışmasındaki sabit aday.",
      tip: "'Oorlog' iste: mayonez, fıstık sosu ve çiğ soğan bir arada.", q: "Vleminckx de Sausmeester Amsterdam" },
    { id: "winkel43", cat: "ye", area: "jordaan", title: "Winkel 43'te elmalı turta ye",
      desc: "Noordermarkt'ın köşesindeki kafenin kalın kabuklu, iri elma parçalı appeltaart'ı şehrin en ünlüsü.",
      tip: "Cumartesi günü meydanda organik pazar, pazartesi sabahı bit pazarı kuruluyor; kuyruk o günlerde uzun.", q: "Winkel 43 Amsterdam" },
    { id: "albertcuyp", cat: "ye", area: "zuid", title: "Albert Cuyp pazarında sıcak stroopwafel",
      desc: "De Pijp'in ortasındaki sokak pazarı 1900'lerin başından beri kuruluyor. Gözünün önünde ütülenen, karameli akan taze stroopwafel buranın klasiği.",
      tip: "Pazar günleri kurulmuyor. Balık tezgâhlarından kibbeling ya da ringa da dene.", q: "Albert Cuypmarkt Amsterdam" },
    { id: "brouwerijhetij", cat: "ye", area: "oost", title: "Değirmenin dibinde Brouwerij 't IJ birası",
      desc: "Şehrin en bilinen küçük bira üreticisi, De Gooyer yel değirmeninin yanındaki eski hamam binasında. Etiketteki devekuşu Amsterdam barlarının tanıdık yüzü.",
      tip: "Tadım salonu öğleden sonra açılıyor; güneşli günde teras çabuk dolar.", q: "Brouwerij 't IJ Amsterdam" },
    { id: "jopenkerk", cat: "ye", area: "cevre", title: "Haarlem'de kilisenin içinde bira iç",
      desc: "Jopen, Haarlem'in ortaçağ bira tariflerini yeniden canlandırdı ve bira kazanlarını eski bir kilisenin içine kurdu. Vitrayların altında kazanların yanında oturuyorsun.",
      tip: "Eski tariflerden yapılan Koyt ve Hoppenbier'i tadım tahtasında dene.", q: "Jopenkerk Haarlem", tags: ["yağmurda"] },
    { id: "volendam", cat: "ye", area: "cevre", title: "Volendam limanında füme yılan balığı",
      desc: "Eski bir Zuiderzee balıkçı köyü olan Volendam, füme yılan balığıyla (gerookte paling) bilinir. Rıhtımdaki balıkçılardan ekmek arası alınır.",
      tip: "Hediyelik dükkânların olduğu rıhtımdan ayrıl, arkadaki dar sokaklı Doolhof mahallesine gir.", q: "Haven Volendam" },

    // DENEYİM
    { id: "prinsengrachtconcert", cat: "dene", area: "merkez", title: "Prinsengrachtconcert'i sudan dinle",
      desc: "Her ağustosta Prinsengracht'taki bir dubanın üstünde klasik müzik konseri veriliyor. Seyirciler rıhtımda ve kanala dizilmiş yüzlerce teknede.",
      tip: "Konser 'Aan de Amsterdamse grachten' şarkısıyla bitiyor; sözlerini önceden öğren, herkes eşlik ediyor.", q: "Prinsengrachtconcert Pulitzer Amsterdam", months: [8], tags: ["ücretsiz"] },
    { id: "rijkspassage", cat: "dene", area: "zuid", title: "Rijksmuseum'un altından bisikletle geç",
      desc: "Müzenin tam ortasından geçen tonozlu geçit bir bisiklet yolu. Amsterdamlılar restorasyon sırasında kapatılmasına karşı çıktı ve kazandı.",
      tip: "Geçitte çalan sokak müzisyenlerini dinlemek için in; camlardan müzenin avlularını görebilirsin.", q: "Rijksmuseum passage Amsterdam", tags: ["ücretsiz"] },
    { id: "openluchttheater", cat: "dene", area: "zuid", title: "Vondelpark Açık Hava Tiyatrosu'nda bir gösteri",
      desc: "Yaz hafta sonlarında parkın ortasındaki sahnede müzik, dans ve çocuk gösterileri oluyor. Giriş serbest, şapka dolaşıyor.",
      tip: "Program yazdan önce açıklanıyor. Oturma yerleri çabuk doluyor, erken gel.", q: "Vondelpark Openluchttheater", months: [6, 7, 8], tags: ["ücretsiz"] },
    { id: "ndsm", cat: "dene", area: "noord", title: "Ücretsiz vapurla NDSM tersanesine geç",
      desc: "Centraal'ın arkasından kalkan vapurlar ücretsiz ve bisikletini de alıyor. NDSM, dev hangarları sanatçı atölyelerine ve sokak sanatına dönüşmüş eski bir tersane.",
      tip: "Hangarda düzenli aralıklarla kurulan IJ-Hallen bit pazarının tarihine bak.", q: "NDSM-werf Amsterdam", tags: ["ücretsiz"] },
    { id: "zandvoort", cat: "dene", area: "cevre", title: "Trenle Zandvoort plajına in",
      desc: "Amsterdam Centraal'dan kalkan tren yaklaşık yarım saatte doğrudan Kuzey Denizi'ne varıyor. İstasyondan plaja birkaç dakikalık yürüyüş.",
      tip: "Kalabalıktan kaçmak için plajdan güneye, kumulların başladığı yere doğru yürü. Kışın fırtınalı günlerde de güzel.", q: "Zandvoort aan Zee strand", tags: ["ücretsiz"] },
    { id: "marken", cat: "dene", area: "cevre", title: "Marken'de fenere kadar yürü",
      desc: "Marken yüzyıllarca bir adaydı; 1957'de bir setle karaya bağlandı. Sel baskınlarına karşı tepeciklerin ve kazıkların üstüne kurulmuş yeşil ahşap evler hâlâ duruyor.",
      tip: "Set boyunca 'Paard van Marken' fenerine yürü. Volendam ile arasında tekne çalışıyor; kışın sefer azalıyor.", q: "Haven Marken", tags: ["ücretsiz"] },
    { id: "alkmaar", cat: "dene", area: "cevre", title: "Alkmaar peynir pazarını izle",
      desc: "Waagplein'da renkli şapkalı peynir taşıyıcıları loncası, sarı tekerleri ahşap kızaklarla koşarak tartıya taşıyor. Gelenek yüzyıllardır sürüyor.",
      tip: "Bahardan eylül sonuna kadar cuma sabahları. Çanın çalındığı açılışı görmek için erken git.", q: "Kaasmarkt Waagplein Alkmaar", months: [4, 5, 6, 7, 8, 9], tags: ["ücretsiz"] }
  ]
};
