// Eindhoven ve Brabant görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.eindhoven = {
  id: "eindhoven",
  name: "Eindhoven",
  subtitle: "ve Brabant",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Eindhovenaar", "Echte Lampegatter"],
  areas: {
    merkez: "Merkez",
    strijp: "Strijp",
    kuzey: "Woensel",
    guney: "Güney & Batı",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[51.405, 5.410], [51.480, 5.530]],
  coords: {
    philips: [51.4392, 5.4757], vanabbe: [51.4343, 5.4819], stratumseind: [51.4363, 5.4808], glow: [51.4380, 5.4797],
    worstenbrood: [51.4395, 5.4790],
    strijps: [51.4472, 5.4585], veem: [51.4490, 5.4550], evoluon: [51.4434, 5.4470], ddw: [51.4484, 5.4571],
    psv: [51.4417, 5.4675],
    kruisstraat: [51.4491, 5.4744], woenselmarkt: [51.4510, 5.4725],
    watermolen: [51.4231, 5.4703], watt: [51.4353, 5.4865], hovenring: [51.4327, 5.4190],
    sintjan: [51.6879, 5.3083], bosschebol: [51.6904, 5.2958], efteling: [51.6500, 5.0480], duinen: [51.6450, 5.1150],
    nuenen: [51.4768, 5.5509], breda: [51.5903, 4.7785], lochal: [51.5613, 5.0861]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "💡", name: "Lichtstad Kurdu" },
    strijp: { icon: "🏭", name: "Strijp Tasarımcısı" },
    kuzey: { icon: "🧺", name: "Woensel Mahallelisi" },
    guney: { icon: "🚲", name: "Dommel Gezgini" },
    cevre: { icon: "🎡", name: "Brabant Kâşifi" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "philips", cat: "gor", area: "merkez", title: "Philips'in ilk ampul fabrikasına gir",
      desc: "Gerard Philips 1891'de ilk ampullerini Emmasingel'deki bu küçük fabrikada üretti; Eindhoven'ın bir köyden 'Lichtstad'a (Işık Şehri) dönüşmesi burada başladı. Bina bugün Philips Museum.",
      tip: "Girişteki eski üretim atölyesinden başla; şehrin yarısının neden Philips adını taşıdığını burada anlarsın.", q: "Philips Museum Eindhoven", tags: ["yağmurda"] },
    { id: "vanabbe", cat: "gor", area: "merkez", title: "Van Abbemuseum'da Lissitzky'yi bul",
      desc: "Bir puro fabrikatörünün şehre armağan ettiği modern sanat müzesi, Rusya dışındaki en büyük El Lissitzky koleksiyonlarından birine sahip. Yeni kanadı Dommel deresinin üzerine oturuyor.",
      tip: "Eski binanın saat kulesini dışarıdan, yeni kanadı içeriden gör; kafenin terası suya bakıyor.", q: "Van Abbemuseum Eindhoven", tags: ["yağmurda"] },
    { id: "strijps", cat: "gor", area: "strijp", title: "Strijp-S'te boruların altından yürü",
      desc: "Philips'in dış dünyaya kapalı fabrika alanı yıllarca 'Yasak Şehir' diye anıldı. Bugün Klokgebouw, Hoge Rug binaları ve başının üstünden geçen Leidingstraat boru hattıyla şehrin yaratıcı mahallesi.",
      tip: "Torenallee'yi baştan sona yürü; Ketelhuisplein'daki eski kazan dairesinin çevresi en fotoğraflık yer.", q: "Ketelhuisplein Strijp-S Eindhoven", tags: ["ücretsiz"] },
    { id: "evoluon", cat: "gor", area: "strijp", title: "Evoluon'un uçan dairesine bak",
      desc: "Philips'in 75. yılı için 1966'da açılan uçan daire biçimli beton kubbe Eindhoven'ın en tanınan silueti. Uzun yıllar kapalı kaldıktan sonra Next Nature Museum olarak yeniden ziyarete açıldı.",
      tip: "Kubbenin altındaki havuzun kenarından bak; gece ışıklandırıldığında gerçekten yere inmiş gibi duruyor.", q: "Evoluon Eindhoven" },
    { id: "watermolen", cat: "gor", area: "guney", title: "Van Gogh'un çizdiği su değirmenini gör",
      desc: "Dommel üzerindeki Genneper Watermolen'i Van Gogh, Nuenen'de yaşadığı yıllarda resmetti. Şehir merkezine bisikletle on dakika uzaklıkta ama çevresi hâlâ çayır ve dere.",
      tip: "Genneper Parken'in içinden gel; yakındaki Genneper Hoeve çiftliğinin dükkânı kendi ürünlerini satıyor.", q: "Genneper Watermolen Eindhoven", tags: ["ücretsiz"] },
    { id: "sintjan", cat: "gor", area: "cevre", title: "Sint-Jan'da cep telefonlu meleği ara",
      desc: "'s-Hertogenbosch'taki Sint-Janskathedraal Brabant gotiğinin en gösterişli örneği. Restorasyonda eklenen yeni heykellerden biri kot pantolonlu, elinde cep telefonu tutan bir melek.",
      tip: "Melek dış cephede, yüksekte; dürbün ya da telefonun zumu işe yarar. Payandaların üstüne oturmuş küçük figürleri de kaçırma.", q: "Sint-Janskathedraal 's-Hertogenbosch", tags: ["ücretsiz"] },
    { id: "nuenen", cat: "gor", area: "cevre", title: "Nuenen'de Van Gogh'un izini sür",
      desc: "Van Gogh 1883-1885 arasında ailesinin yanında Nuenen'de yaşadı ve 'Patates Yiyenler'i burada yaptı. Babasının vaaz verdiği küçük kilise ve aile evi hâlâ yerinde.",
      tip: "Van Gogh Village Museum'dan başla, sonra köyün içindeki işaretli noktaları yürüyerek dolaş. Eindhoven'dan bisikletle gidilir.", q: "Van Gogh Village Museum Nuenen" },
    { id: "breda", cat: "gor", area: "cevre", title: "Breda'da Begijnhof'un avlusuna gir",
      desc: "Şehrin tam ortasında, kapıdan geçince sesin kesildiği bir avlu: yüzyıllarca dindar kadınların (begijn) yaşadığı küçük evler ve ortada şifalı bitki bahçesi.",
      tip: "Çıkınca Valkenberg parkından geçip Grote Kerk'in kulesine doğru yürü.", q: "Begijnhof Breda", tags: ["ücretsiz"] },

    // YENİLECEK
    { id: "worstenbrood", cat: "ye", area: "merkez", title: "Sıcak bir worstenbroodje ye",
      desc: "İçine baharatlı kıyma sarılmış yumuşak ekmek Brabant'ın en sevilen atıştırmalığı ve resmen kültürel miras listesinde. Soğuk değil, fırından yeni çıkmış hâliyle yenir.",
      tip: "Hardal ya da ketçap isteme: Brabantlılar sade yer.", q: "Houben Worstenbrood Eindhoven" },
    { id: "stratumseind", cat: "ye", area: "merkez", title: "Stratumseind'de bir bira iç",
      desc: "Hollanda'nın en uzun bar sokağı: birkaç yüz metrelik dar bir sokağa onlarca bar sığıyor. Öğrenci şehrinin ve PSV taraftarının buluşma yeri.",
      tip: "Hafta içi erken akşam sakin olur; cumartesi gecesi sokak omuz omuza.", q: "Stratumseind Eindhoven" },
    { id: "veem", cat: "ye", area: "strijp", title: "Vershal het Veem'de tezgâh gez",
      desc: "Eski Philips deposu Veem'in zemin katı bugün taze ürün pazarı: fırıncı, peynirci, balıkçı ve dünya mutfağından tezgâhlar bir arada.",
      tip: "Hafta sonu öğle saatinde git; aldığını ortadaki masalarda yiyebilirsin.", q: "Vershal het Veem Eindhoven", tags: ["yağmurda"] },
    { id: "kruisstraat", cat: "ye", area: "kuzey", title: "Kruisstraat'ta dünya turu yap",
      desc: "Garın hemen kuzeyindeki Kruisstraat, Eindhoven'ın en çok kültürlü caddesi: Türk fırınları, Asya marketleri (toko) ve Surinam lokantaları yan yana.",
      tip: "Aç git, tek bir yerde oturma: bir fırından, bir tokodan, bir tatlıcıdan parça parça ye.", q: "Kruisstraat Eindhoven" },
    { id: "watt", cat: "ye", area: "guney", title: "100 Watt'ta şehir birası tat",
      desc: "Dommel kıyısındaki eski Schellens tekstil fabrikasında bira yapan Stadsbrouwerij Eindhoven. Adı bile ışık şehrine selam.",
      tip: "Tadım tahtası iste; kazanlar salonun içinde duruyor.", q: "100 Watt Brewery Bleekweg Eindhoven", tags: ["yağmurda"] },
    { id: "bosschebol", cat: "ye", area: "cevre", title: "Bossche bol'u Jan de Groot'ta ye",
      desc: "Yumruk büyüklüğünde, içi krem şanti dolu, dışı bitter çikolata kaplı hamur topu Den Bosch'un simgesi. Şehirde herkes onu garın yakınındaki Jan de Groot pastanesinden alır.",
      tip: "Çatal bıçakla uğraşma, peçeteyle elinle ye. Kapıdaki kuyruk hızlı ilerler.", q: "Banketbakkerij Jan de Groot 's-Hertogenbosch" },

    // DENEYİM
    { id: "glow", cat: "dene", area: "merkez", title: "GLOW'da ışık rotasını yürü",
      desc: "Her kasımda bir hafta boyunca binalar, kiliseler ve parklar ışık sanatı eserlerine dönüşüyor. Işık şehri kimliğinin en kalabalık kutlaması.",
      tip: "Rota her yıl değişir ve ücretsizdir. Hafta sonu çok kalabalık; hafta içi akşamını seç ve sıcak giyin.", q: "Catharinakerk Eindhoven", months: [11], tags: ["ücretsiz"] },
    { id: "ddw", cat: "dene", area: "strijp", title: "Dutch Design Week'i gez",
      desc: "Her ekimde şehir Kuzey Avrupa'nın en büyük tasarım etkinliğine ev sahipliği yapıyor. Strijp-S'teki Klokgebouw ve Design Academy mezuniyet sergisi işin kalbi.",
      tip: "Tek günde bitmez: bir gün Strijp-S, bir gün merkez ve Sectie-C planla. Biletini önceden al.", q: "Klokgebouw Eindhoven", months: [10] },
    { id: "psv", cat: "dene", area: "strijp", title: "Philips Stadion'da PSV maçı izle",
      desc: "PSV, Philips işçilerinin spor kulübü olarak kuruldu ve hâlâ ilk sahasının bulunduğu yerde, şehrin tam ortasında oynuyor. Maç günü bütün şehir kırmızı beyaz.",
      tip: "Stadyum gardan yürüme mesafesinde; maçtan önce çevredeki barlarda taraftara karış.", q: "Philips Stadion Eindhoven", months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] },
    { id: "woenselmarkt", cat: "dene", area: "kuzey", title: "Cumartesi Woensel pazarından alışveriş yap",
      desc: "Woenselse Markt'ta kurulan cumartesi pazarı şehrin en büyüğü. Merkezdeki mağazalardan çok farklı, mahalleli bir Eindhoven.",
      tip: "Sabah git; balık tezgâhında ayakta kibbeling ye.", q: "Woenselse Markt Eindhoven", tags: ["ücretsiz"] },
    { id: "hovenring", cat: "dene", area: "guney", title: "Hovenring'de havada tur at",
      desc: "Eindhoven ile Veldhoven arasındaki kavşağın üzerinde tek bir direğe asılı duran, dünyada ilk örneklerden sayılan bisiklet döner kavşağı. Arabalar altta, sen yukarıda.",
      tip: "Hava kararınca git: halkanın tamamı ışıklandırılıyor.", q: "Hovenring Eindhoven", tags: ["ücretsiz"] },
    { id: "efteling", cat: "dene", area: "cevre", title: "Efteling'de Masal Ormanı'nda kaybol",
      desc: "Kaatsheuvel'deki Efteling 1950'lerde ressam Anton Pieck'in çizdiği Sprookjesbos (Masal Ormanı) ile başladı. Hollandalıların çocukluk hafızası burada saklı.",
      tip: "Hız trenlerinden önce Sprookjesbos'u gez; 'Papier hier' diye bağıran çöp kutusu Holle Bolle Gijs'e bir kâğıt at.", q: "Efteling Kaatsheuvel" },
    { id: "duinen", cat: "dene", area: "cevre", title: "Brabant'ın çölünde yürü",
      desc: "Loonse en Drunense Duinen, Batı Avrupa'nın en büyük hareketli kum alanlarından biri. Ormanın içinden çıkıp bir anda kum tepelerinin ortasında kalıyorsun; yerliler 'Brabant Sahrası' der.",
      tip: "Rüzgârlı günde kum uçuşur, gözlük al. Kumda yürümek yorar, kısa bir rota seç ve sonunda orman kenarındaki kafelerden birinde otur.", q: "Nationaal Park Loonse en Drunense Duinen", tags: ["ücretsiz"] },
    { id: "lochal", cat: "dene", area: "cevre", title: "Tilburg'da LocHal'de bir öğleden sonra geçir",
      desc: "Demiryollarının eski lokomotif atölyesi, garın hemen arkasında dev bir kütüphaneye ve buluşma yerine dönüştü. Altı kat yüksekliğindeki kumaş perdeler, tekstil şehri Tilburg'a selam.",
      tip: "Geniş merdivenlerin tepesine çık, sonra cam balkondan raylara bak. Temmuzda gelirsen şehir, Benelüks'ün en büyük panayırı Tilburgse Kermis ile dolu olur.", q: "LocHal Tilburg", tags: ["ücretsiz", "yağmurda"] }
  ]
};
