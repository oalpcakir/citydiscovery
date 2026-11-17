// Brüksel ve çevresi (Leuven, Waterloo, Tervuren, Hallerbos, Meise) görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.brussel = {
  id: "brussel",
  name: "Brüksel",
  subtitle: "ve çevresi",
  country: "Belçika",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Brükselli", "Ketje"],
  areas: {
    merkez: "Merkez",
    marolles: "Marolles, Sablon & Midi",
    avrupa: "Avrupa Mahallesi",
    ixelles: "Ixelles & Saint-Gilles",
    laeken: "Laeken & Heysel",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[50.815, 4.310], [50.905, 4.410]],
  coords: {
    grandplace: [50.8467, 4.3525], pis: [50.8485, 4.3540], bd: [50.8453, 4.3503], dandoy: [50.8471, 4.3512],
    mortsubite: [50.8487, 4.3560], merdunord: [50.8504, 4.3480],
    poelaert: [50.8370, 4.3525], jeudeballe: [50.8368, 4.3455], sablon: [50.8405, 4.3557], cantillon: [50.8415, 4.3355],
    antoine: [50.8373, 4.3818], parlamentarium: [50.8388, 4.3742],
    horta: [50.8243, 4.3556], chatelain: [50.8246, 4.3600],
    atomium: [50.8949, 4.3415], serres: [50.8891, 4.3571],
    leuven: [50.8789, 4.7012], oudemarkt: [50.8777, 4.7000], waterloo: [50.6785, 4.4048], tervuren: [50.8309, 4.5186],
    hallerbos: [50.7009, 4.2767], meise: [50.9285, 4.3280]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🏛️", name: "Grand-Place Kurdu" },
    marolles: { icon: "🧺", name: "Marollien" },
    avrupa: { icon: "🇪🇺", name: "Avrupa Yolcusu" },
    ixelles: { icon: "🌿", name: "Art Nouveau Avcısı" },
    laeken: { icon: "⚛️", name: "Heysel Gezgini" },
    cevre: { icon: "🌲", name: "Brabant Kâşifi" }
  },
  quests: [
    // ---------- GÖRÜLECEK ----------
    { id: "grandplace", cat: "gor", area: "merkez", title: "Grand-Place'ta lonca evlerini oku",
      desc: "1695'teki Fransız bombardımanından sonra loncaların birkaç yılda yeniden kurduğu meydan UNESCO Dünya Mirası. Her evin bir adı ve tepesinde bir simgesi var: kuğu, tilki, el arabası.",
      tip: "Belediye binasının kulesi tam ortada değil; kapıya göre kaymış olduğunu fark et. Çift yıllarda ağustosta meydana çiçek halısı seriliyor.", q: "Grand-Place Bruxelles", tags: ["ücretsiz"] },
    { id: "poelaert", cat: "gor", area: "marolles", title: "Place Poelaert'ten şehre bak",
      desc: "Yapıldığında dünyanın en büyük binalarından olan Palais de Justice, işçi mahallesi Marolles'in tepesine oturtuldu. Önündeki teras Brüksel'in en geniş ücretsiz manzarası: açık havada Atomium görünür.",
      tip: "Meydandaki camlı asansör seni ücretsiz olarak aşağıya, Marolles'e indirir.", q: "Place Poelaert Bruxelles", tags: ["ücretsiz"] },
    { id: "horta", cat: "gor", area: "ixelles", title: "Horta'nın evinde merdiveni çık",
      desc: "Art Nouveau'nun kurucularından Victor Horta'nın kendi evi ve atölyesi: kıvrılan demir, vitray ve ışık kuyusu en ince ayrıntısına kadar onun elinden çıktı. Ev UNESCO Dünya Mirası listesinde.",
      tip: "Ziyaretçi sayısı sınırlı, önceden yer ayırt. Çevredeki sokaklarda başka Art Nouveau cepheler de var.", q: "Musée Horta Saint-Gilles", tags: ["yağmurda"] },
    { id: "atomium", cat: "gor", area: "laeken", title: "Atomium'un kürelerine gir",
      desc: "1958 Dünya Fuarı için yapılan 102 metrelik yapı, milyarlarca kez büyütülmüş bir demir kristalini temsil ediyor. Geçici olması planlanmıştı; şehrin simgesi olunca kaldı.",
      tip: "Küreler arasındaki ışıklı yürüyen merdivenler işin en eğlenceli kısmı; biletini internetten saatli al.", q: "Atomium Bruxelles" },
    { id: "leuven", cat: "gor", area: "cevre", title: "Leuven belediye binasındaki heykelleri say",
      desc: "15. yüzyıldan kalma gotik Stadhuis'in cephesi dantel gibi işlenmiş ve nişlerinde 236 heykel duruyor. Brüksel'den trenle yarım saatten kısa süren üniversite şehrinin gösterişli yüzü.",
      tip: "Karşısındaki Sint-Pieterskerk'e de gir; ardından üniversite kütüphanesinin meydanına yürü.", q: "Stadhuis Leuven", tags: ["ücretsiz"] },
    { id: "waterloo", cat: "gor", area: "cevre", title: "Waterloo'da Aslan Tepesi'ne çık",
      desc: "Napolyon'un 1815'te yenildiği savaş alanına yapay bir tepe yığıldı ve üstüne dökme demir bir aslan kondu. 226 basamağın sonunda ovaya bakınca orduların nerede durduğunu anlıyorsun.",
      tip: "Tepenin dibindeki yeraltı müzesi ve panorama resmi aynı bilete dahil.", q: "Butte du Lion Waterloo" },
    { id: "tervuren", cat: "gor", area: "cevre", title: "Tervuren'de AfricaMuseum",
      desc: "Kral II. Leopold'un sömürge vitrini olarak kurduğu saray müzesi, uzun bir yenilemeden sonra Kongo tarihini ve kendi geçmişini sorgulayan bir yer olarak yeniden açıldı. Belçika'nın sömürge mirasıyla yüzleştiği yer.",
      tip: "Montgomery'den 44 numaralı tramvaya bin: yol Sonian Ormanı'nın içinden geçiyor ve gezinin yarısı o.", q: "AfricaMuseum Tervuren", tags: ["yağmurda"] },
    { id: "meise", cat: "gor", area: "cevre", title: "Meise botanik bahçesinde sera gez",
      desc: "Dünyanın en büyük botanik bahçelerinden biri, bir şatonun etrafındaki geniş parkta. Plantenpaleis seralarında yağmur ormanından çöle iklim iklim yürüyorsun.",
      tip: "Bahçe büyük, yarım gün ayır. Yağmurlu günde bile seralar ve şato yeter.", q: "Plantentuin Meise", tags: ["yağmurda"] },

    // ---------- YENİLECEK ----------
    { id: "dandoy", cat: "ye", area: "merkez", title: "Brüksel waffle'ı ile Liège waffle'ını ayırt et",
      desc: "Brüksel waffle'ı dikdörtgen, hafif ve çıtır; Liège waffle'ı yuvarlak köşeli, yoğun ve inci şekerli. 1829'dan beri speculoos pişiren Maison Dandoy ikisini de yapıyor.",
      tip: "Turistik tezgâhlardaki sos yığınlarını boş ver: gerçek Brüksel waffle'ı sadece pudra şekeriyle yenir.", q: "Maison Dandoy Rue au Beurre Bruxelles" },
    { id: "mortsubite", cat: "ye", area: "merkez", title: "À la Mort Subite'te gueuze iç",
      desc: "1928'den beri neredeyse hiç değişmeyen kafe: aynalar, uzun sıralar ve önlüklü garsonlar. Adını bir zar oyunundan alıyor; menünün yıldızı Brüksel'in ekşi birası gueuze.",
      tip: "Yanına peynirli ya da 'tête pressée'li tartine iste. Galeries Royales Saint-Hubert pasajının hemen çıkışında.", q: "A la Mort Subite Bruxelles", tags: ["yağmurda"] },
    { id: "merdunord", cat: "ye", area: "merkez", title: "Sainte-Catherine'de ayakta balık ye",
      desc: "Eski balık pazarının köşesindeki Noordzee - Mer du Nord'un açık tezgâhında siparişini verip adın bağırılana kadar meydanda beklersin. Karides kroketi Brüksel'in en sevdiği lokmalardan.",
      tip: "Öğle saatinde git; yanına bir kadeh beyaz şarap almak buranın âdeti.", q: "Noordzee Mer du Nord Bruxelles" },
    { id: "sablon", cat: "ye", area: "marolles", title: "Sablon'da tek tek pralin seç",
      desc: "Pralin Brüksel'de icat edildi ve şehrin büyük çikolatacıları Place du Grand Sablon'un çevresinde yan yana duruyor. Hazır kutu yerine vitrinden tane tane seçmek asıl keyif.",
      tip: "İki ayrı dükkândan birkaç tane al ve meydanda karşılaştır. Hafta sonu meydanda antika pazarı kuruluyor.", q: "Place du Grand Sablon Bruxelles" },
    { id: "cantillon", cat: "ye", area: "marolles", title: "Cantillon'da lambik tat",
      desc: "1900'den beri aynı ailenin işlettiği bira imalathanesi, mayayı havadan kapan lambik biranın şehirdeki son geleneksel temsilcilerinden. Fıçıların, bakır kazanların ve çatıdaki soğutma teknesinin arasında kendi başına geziyorsun.",
      tip: "Tur sonunda tadım var. Tadı ekşi ve şaşırtıcı; ilk yudumda karar verme.", q: "Brasserie Cantillon Anderlecht", tags: ["yağmurda"] },
    { id: "antoine", cat: "ye", area: "avrupa", title: "Maison Antoine'dan patates kızartması al",
      desc: "Place Jourdan'ın ortasındaki büfe 1948'den beri iki kez kızartılmış Belçika patatesi satıyor. Kuyruğunda AB memurları, öğrenciler ve mahalleli yan yana bekliyor.",
      tip: "Meydandaki 'frites acceptées' yazan kafelerde bir içecek söyleyip külahını masada yiyebilirsin. Sos olarak 'andalouse' dene.", q: "Maison Antoine Place Jourdan" },
    { id: "oudemarkt", cat: "ye", area: "cevre", title: "Leuven'de 'en uzun bar'da bira iç",
      desc: "Oude Markt meydanının dört kenarı baştan sona kafe ve teras; Leuven'liler buraya dünyanın en uzun barı diyor. Stella Artois bu şehirde üretiliyor.",
      tip: "Güneşli bir akşamüstü gel; öğrenci dönemi dışında meydan belirgin şekilde sakin.", q: "Oude Markt Leuven" },

    // ---------- DENEYİM ----------
    { id: "pis", cat: "dene", area: "merkez", title: "İşeyen üçlüyü tamamla",
      desc: "Manneken Pis'i herkes bilir; kız kardeşi Jeanneke Pis bir çıkmaz sokakta, köpek Zinneke Pis ise bir kaldırım köşesinde saklı. Üçünü de bulmak şehrin kendisiyle dalga geçen mizahını tanımanın yolu.",
      tip: "Jeanneke, Impasse de la Fidélité'de; Zinneke, Rue des Chartreux'de. Manneken'in yüzlerce kostümü Rue du Chêne'deki küçük müzede.", q: "Jeanneke Pis Bruxelles", tags: ["ücretsiz"] },
    { id: "bd", cat: "dene", area: "merkez", title: "Çizgi roman duvarlarını takip et",
      desc: "Tenten'in, Şirinler'in ve Red Kit'in memleketi Brüksel, kahramanlarını bina cephelerine çizdi. Onlarca duvar resmi merkezin sokaklarına dağılmış bir rota oluşturuyor.",
      tip: "Rue de l'Étuve'deki Tenten duvarından başla; turizm ofisinde rotanın haritası var.", q: "Fresque Tintin Rue de l'Etuve Bruxelles", tags: ["ücretsiz"] },
    { id: "jeudeballe", cat: "dene", area: "marolles", title: "Jeu de Balle bitpazarında pazarlık yap",
      desc: "Marolles'in kalbindeki meydanda yılın her günü sabahları eski eşya pazarı kuruluyor. Plaklar, çerçeveler, boşaltılmış evlerden çıkan koliler: Brükselliler buraya 'Vieux Marché' diyor.",
      tip: "Sabah erken git, öğleden sonra toplanıyor. Çevredeki Rue Blaes ve Rue Haute antikacılarla dolu.", q: "Place du Jeu de Balle Bruxelles", tags: ["ücretsiz"] },
    { id: "parlamentarium", cat: "dene", area: "avrupa", title: "Parlamentarium'da AB'yi çöz",
      desc: "Her gün önünden geçilen cam binaların içinde ne olduğunu anlatan, Avrupa Parlamentosu'nun etkileşimli ziyaretçi merkezi. Brüksel'in neden 'Avrupa'nın başkenti' olduğunu en derli toplu burada görürsün.",
      tip: "Giriş ücretsiz; kimliğini yanına al. Çıkışta Place du Luxembourg'da memurların perşembe akşamı kalabalığına karış.", q: "Parlamentarium Bruxelles", tags: ["ücretsiz", "yağmurda"] },
    { id: "chatelain", cat: "dene", area: "ixelles", title: "Çarşamba akşamı Châtelain pazarına git",
      desc: "Place du Châtelain'de her çarşamba öğleden sonra kurulan pazar, alışverişten çok bir mahalle buluşması. İnsanlar tezgâhlardan aldıkları peynir ve istiridyeyi ellerinde kadehle ayakta yiyor.",
      tip: "İş çıkışı saatinde en canlı hâlinde; sonra çevredeki barlara dağılınır.", q: "Place du Châtelain Ixelles", tags: ["ücretsiz"] },
    { id: "serres", cat: "dene", area: "laeken", title: "Kraliyet Seraları'nı açıkken yakala",
      desc: "II. Leopold için yapılan cam ve demirden dev Art Nouveau seralar kraliyet sarayının bahçesinde ve yılda sadece birkaç hafta, ilkbaharda halka açılıyor. Kamelyalar, palmiyeler ve cam kubbeler arasında uzun bir yürüyüş.",
      tip: "Biletler internetten, saatli satılıyor ve çabuk bitiyor; tarihleri mart ayında takip et.", q: "Serres Royales de Laeken", months: [4, 5] },
    { id: "hallerbos", cat: "dene", area: "cevre", title: "Hallerbos'ta mavi halıda yürü",
      desc: "Her ilkbahar Halle yakınındaki kayın ormanının zemini birkaç haftalığına milyonlarca yabani sümbülle mora boyanıyor. Yeni açan yaprakların arasından süzülen ışıkla birlikte masal gibi bir manzara.",
      tip: "Çiçeklenme genelde nisan ortası ile mayıs başı arasında; ormanın sitesindeki güncel durumu kontrol et ve patikadan çıkma.", q: "Hallerbos Halle", months: [4, 5], tags: ["ücretsiz"] }
  ]
};
