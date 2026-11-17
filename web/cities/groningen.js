// Groningen ve kuzey (Friesland, Wadden kıyısı, Drenthe) görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.groningen = {
  id: "groningen",
  name: "Groningen",
  subtitle: "ve kuzey",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Stadjer", "Echte Stadjer"],
  areas: {
    merkez: "Binnenstad",
    kuzey: "Kuzey & Noorderplantsoen",
    guney: "Güney & İstasyon",
    dogu: "Doğu & Oosterpoort",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[53.195, 6.520], [53.240, 6.610]],
  coords: {
    martinitoren: [53.2194, 6.5682], forum: [53.2188, 6.5706], pepergasthuis: [53.2172, 6.5722], prinsentuin: [53.2215, 6.5693],
    vismarkt: [53.2170, 6.5640], eierbal: [53.2183, 6.5718], martinus: [53.2162, 6.5732], bommenberend: [53.2187, 6.5672],
    noorderplantsoen: [53.2240, 6.5560], noorderzon: [53.2228, 6.5568],
    museum: [53.2123, 6.5660], station: [53.2107, 6.5645],
    esns: [53.2134, 6.5745], euroborg: [53.2063, 6.5913],
    wadlopen: [53.3987, 6.4535], schiermonnikoog: [53.4790, 6.1625], bourtange: [53.0066, 7.1920], hunebed: [52.9313, 6.7990],
    oldehove: [53.2030, 5.7897], planetarium: [53.1873, 5.5438], zoutkamp: [53.3369, 6.2998], beerenburg: [53.0312, 5.6603]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🗼", name: "Martini Kurdu" },
    kuzey: { icon: "🌳", name: "Plantsoen Gezgini" },
    guney: { icon: "🚉", name: "İstasyon Kaşifi" },
    dogu: { icon: "🎸", name: "Oosterpoort Ruhu" },
    cevre: { icon: "🦭", name: "Ommeland Kâşifi" }
  },
  quests: [
    // ---------- GÖRÜLECEK ----------
    { id: "martinitoren", cat: "gor", area: "merkez", title: "Martinitoren'e tırman",
      desc: "Stadjer'lerin 'd'Olle Grieze' (Yaşlı Gri) dediği, yaklaşık 97 metrelik kule şehrin simgesi. Tepeden bakınca Groningen'in ne kadar düz bir ovanın ortasında durduğunu görürsün.",
      tip: "Basamaklar dar ve çok; bilet ve çıkış saatleri için önceden bak, açık bir gün seç.", q: "Martinitoren Groningen" },
    { id: "pepergasthuis", cat: "gor", area: "merkez", title: "Pepergasthuis avlusunu bul",
      desc: "Peperstraat'taki kapının ardında 15. yüzyıldan kalma bir vakıf avlusu (hofje) saklı: küçük evler, bir şapel ve eski su tulumbası. Barlar sokağının iki adım ötesinde şaşırtıcı bir sessizlik.",
      tip: "Gündüz kapı açıksa içeri girilebiliyor; burada hâlâ insanlar yaşıyor, sessiz ol.", q: "Pepergasthuis Groningen", tags: ["ücretsiz"] },
    { id: "museum", cat: "gor", area: "guney", title: "Groninger Museum'un renklerine bak",
      desc: "İstasyonun karşısında, kanalın ortasında duran müzeyi Alessandro Mendini tasarladı: altın sarısı kule ve her biri başka bir tasarımcının elinden çıkan pavyonlar. Binanın kendisi koleksiyon kadar tartışıldı.",
      tip: "İçerideki mozaik kaplı döner merdiven şehrin en çok fotoğraflanan köşelerinden.", q: "Groninger Museum", tags: ["yağmurda"] },
    { id: "station", cat: "gor", area: "guney", title: "Hoofdstation'ın tavanına bak",
      desc: "1896 tarihli gar binası Hollanda'nın en güzel istasyonlarından sayılıyor. Aceleyle geçtiğin holün süslü tavanı ve çini panoları bir kez durup bakmayı hak ediyor.",
      tip: "İstasyon çevresinde uzun süredir inşaat var; tarihi hol yine de açık.", q: "Station Groningen", tags: ["ücretsiz", "yağmurda"] },
    { id: "bourtange", cat: "gor", area: "cevre", title: "Bourtange'ın yıldızını yürü",
      desc: "Almanya sınırındaki yıldız biçimli kale köyü, Seksen Yıl Savaşı'nda Groningen'e giden yolu kesmek için kuruldu ve 18. yüzyıldaki hâline göre yeniden yapıldı. Hendekler, asma köprüler ve toprak tabyalar yerli yerinde.",
      tip: "Surların üstündeki patikadan tam tur at; yıldız biçimi ancak böyle anlaşılıyor.", q: "Vesting Bourtange" },
    { id: "hunebed", cat: "gor", area: "cevre", title: "Borger'de en büyük hunebed",
      desc: "Drenthe'nin dev taşlardan yapılmış mezarları (hunebedden) yaklaşık beş bin yıllık, yani piramitlerden eski. Hollanda'nın en büyüğü Borger'de, Hunebedcentrum'un hemen yanında duruyor.",
      tip: "Taşların kendisi açık havada; müze kısmı çocuklarla gitmek için iyi.", q: "Hunebedcentrum Borger" },
    { id: "oldehove", cat: "gor", area: "cevre", title: "Leeuwarden'in eğik kulesi Oldehove",
      desc: "16. yüzyılda inşaat sırasında yana yatmaya başlayınca yarım bırakılan kule Friesland başkentinin simgesi. Eğimi çıplak gözle fark ediliyor, üstelik hafifçe kıvrık.",
      tip: "Sezonda tepesine çıkılabiliyor. Groningen'den trenle bir saatten kısa.", q: "Oldehove Leeuwarden" },
    { id: "planetarium", cat: "gor", area: "cevre", title: "Franeker'de tavandaki güneş sistemi",
      desc: "Yün tarakçısı Eise Eisinga 18. yüzyılda oturma odasının tavanına çalışan bir güneş sistemi modeli kurdu. Dünyanın hâlâ çalışan en eski planetaryumu bugün UNESCO Dünya Mirası.",
      tip: "Tavan arasındaki ahşap çark düzeneğini görmeden çıkma. Franeker, Elfsteden şehirlerinden biri.", q: "Koninklijk Eise Eisinga Planetarium Franeker", tags: ["yağmurda"] },

    // ---------- YENİLECEK ----------
    { id: "eierbal", cat: "ye", area: "merkez", title: "Bir eierbal ye",
      desc: "Köri tadında ragunun içine saklanmış haşlanmış yumurta, galeta ununa bulanıp kızartılıyor. Groningen'in kendi atıştırmalığı; ülkenin geri kalanında neredeyse hiç bulunmaz.",
      tip: "Hemen her snackbar'da var. Gece çıkışı Poelestraat çevresinde yemek bir Stadjer geleneği.", q: "eierbal Groningen" },
    { id: "vismarkt", cat: "ye", area: "merkez", title: "Vismarkt'tan kuru sosis ve hardal al",
      desc: "Korenbeurs'ün önündeki meydanda kurulan pazar şehrin mutfağı. Karanfilli Groninger droge worst ve keskin Groninger mosterd bölgenin iki klasiği.",
      tip: "Pazar salı, cuma ve cumartesi kuruluyor; en dolu gün cumartesi.", q: "Vismarkt Groningen" },
    { id: "prinsentuin", cat: "ye", area: "merkez", title: "Prinsentuin'de çay iç",
      desc: "Martinikerk'in arkasındaki Rönesans bahçesi: gül tarhları, yeşil tünel yollar ve kapısının üstünde bir güneş saati. Yazın bahçenin içindeki çay bahçesi açılıyor.",
      tip: "Girişi Turfsingel tarafındaki kapıdan. Çay bahçesi sadece sıcak aylarda ve güzel havada açık.", q: "Prinsentuin Groningen", months: [5, 6, 7, 8, 9], tags: ["ücretsiz"] },
    { id: "martinus", cat: "ye", area: "merkez", title: "Şehrin kendi birasını tat",
      desc: "Brouwerij Martinus, merkezdeki dar Kostersgang sokağında eski bir matbaa binasında bira yapıyor. Kazanların yanında oturup şehrin adını taşıyan biraları deniyorsun.",
      tip: "Her gün açık değil; gitmeden açık olduğu günlere bak ve tadım tahtası iste.", q: "Brouwerij Martinus Groningen", tags: ["yağmurda"] },
    { id: "zoutkamp", cat: "ye", area: "cevre", title: "Zoutkamp'ta karides ye",
      desc: "Lauwerszee kapatılmadan önce denize açılan eski balıkçı köyü. Wadden'in küçük gri karidesi (Hollandse garnalen) buranın işi; limandaki eski balıkçı tekneleri ve müze o günleri anlatıyor.",
      tip: "Karidesli sandviç ('broodje garnalen') iste; ardından Reitdiep kıyısında yürü.", q: "Visserijmuseum Zoutkamp" },
    { id: "beerenburg", cat: "ye", area: "cevre", title: "Sneek'te Beerenburg tat",
      desc: "Friesland'ın bitki özlü acı içkisi Beerenburg, Sneek'teki Weduwe Joustra'da 19. yüzyıldan beri satılıyor. Dükkânın eski tezgâhı ve fıçıları hâlâ yerinde.",
      tip: "Sneek'in simgesi Waterpoort birkaç dakikalık yürüme mesafesinde; ağustos başındaki Sneekweek'te şehir yelkenliyle dolar.", q: "Weduwe Joustra Sneek" },

    // ---------- DENEYİM ----------
    { id: "forum", cat: "dene", area: "merkez", title: "Forum'un çatısına çık",
      desc: "Kütüphane, sinema ve sergi salonlarını tek çatı altında toplayan Forum, şehrin yeni oturma odası. Yürüyen merdivenlerle en üste çıkınca Martinitoren'le göz göze geliyorsun.",
      tip: "Çatı terası ücretsiz; gün batımına yakın çık.", q: "Forum Groningen", tags: ["ücretsiz", "yağmurda"] },
    { id: "bommenberend", cat: "dene", area: "merkez", title: "28 Ağustos'ta Bommen Berend'i kutla",
      desc: "Groningen, 1672'de Münster piskoposunun ('Bommen Berend') kuşatmasından kurtulduğu günü her yıl Gronings Ontzet adıyla kutluyor. O gün şehirde resmi tatil havası, lunapark ve akşam havai fişek var.",
      tip: "Havai fişek için erkenden yer tut; program her yıl biraz değişir.", q: "Grote Markt Groningen", months: [8], tags: ["ücretsiz"] },
    { id: "noorderplantsoen", cat: "dene", area: "kuzey", title: "Noorderplantsoen'da surların üstünde yürü",
      desc: "Şehrin eski surları ve hendekleri 19. yüzyılda İngiliz tarzı bir parka dönüştü. Tepecikler ve göletler aslında tabyaların ve hendeğin izi.",
      tip: "Güneşli günde bütün öğrenci nüfusu burada; sabah erken saat en sakini.", q: "Noorderplantsoen Groningen", tags: ["ücretsiz"] },
    { id: "noorderzon", cat: "dene", area: "kuzey", title: "Noorderzon'da bir akşam geçir",
      desc: "Her ağustosta Noorderplantsoen on bir gün boyunca tiyatro, müzik ve yemek çadırlarıyla dolan bir festival köyüne dönüşüyor. Parkta dolaşmak ücretsiz, gösterilerin çoğu biletli.",
      tip: "Bilet almadan da git: göl kenarındaki ücretsiz konserler ve ışıklar yeter.", q: "Noorderzon Groningen", months: [8], tags: ["ücretsiz"] },
    { id: "esns", cat: "dene", area: "dogu", title: "ESNS'te yarının grubunu keşfet",
      desc: "Her ocakta Eurosonic Noorderslag için Avrupa'nın müzik sektörü Groningen'e akıyor. Yüzlerce yeni grup şehrin barlarında ve De Oosterpoort'ta sahne alıyor.",
      tip: "Biletin yoksa da gel: festival sırasında merkezde ücretsiz konserler oluyor.", q: "De Oosterpoort Groningen", months: [1], tags: ["yağmurda"] },
    { id: "euroborg", cat: "dene", area: "dogu", title: "Euroborg'da FC Groningen maçı",
      desc: "Taraftarın 'Yeşil Katedral' dediği stadyumda 'Trots van het Noorden' (Kuzeyin Gururu) için tezahürat. Kuzeyin tek büyük kulübü olmanın havası tribünde hissediliyor.",
      tip: "Büyük maçlar yerine sıradan bir lig maçına bilet bulmak daha kolay.", q: "Euroborg Groningen", months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] },
    { id: "wadlopen", cat: "dene", area: "cevre", title: "Wadden'de çamur yürüyüşü yap",
      desc: "Deniz çekilince Wadden Denizi'nin tabanı ortaya çıkıyor ve rehberle çamurun içinden yürünebiliyor. Wadlopen bu kıyıya özgü bir gelenek; Wadden Denizi UNESCO Dünya Mirası.",
      tip: "Sadece rehberli turla, Pieterburen çevresinden. Yedek kıyafet ve bileği saran eski ayakkabı şart.", q: "Wadloopcentrum Pieterburen", months: [5, 6, 7, 8, 9] },
    { id: "schiermonnikoog", cat: "dene", area: "cevre", title: "Schiermonnikoog'da bisiklete bin",
      desc: "Wadden adalarının en küçük yerleşimlisi neredeyse tümüyle milli park. Ziyaretçiler arabasını karada bırakıyor; adada kumullar, tuzlu çayırlar ve çok geniş bir plaj var.",
      tip: "Feribot Lauwersoog'dan kalkıyor. Bisikleti adada kirala, plaja kadar pedalla.", q: "Schiermonnikoog" }
  ]
};
