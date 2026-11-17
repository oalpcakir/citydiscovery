// Utrecht ve çevresi görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.utrecht = {
  id: "utrecht",
  name: "Utrecht",
  subtitle: "ve çevresi",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Utrechter", "Echte Utrechter"],
  areas: {
    merkez: "Merkez",
    dogu: "Doğu",
    bati: "Lombok & Batı",
    guney: "Güney & Amelisweerd",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[52.060, 5.030], [52.125, 5.185]],
  coords: {
    domtoren: [52.0907, 5.1213], pandhof: [52.0904, 5.1226], nijntje: [52.0957, 5.1165], trajectumlumen: [52.0922, 5.1196],
    werfkelder: [52.0915, 5.1190], oudaen: [52.0931, 5.1172], broodjemario: [52.0937, 5.1181], nff: [52.0853, 5.1245],
    schroderhuis: [52.0853, 5.1475], maliebaan: [52.0900, 5.1320],
    kanaalstraat: [52.0918, 5.1015], hogewoerd: [52.0868, 5.0425],
    amelisweerd: [52.0673, 5.1590], rhijnauwen: [52.0700, 5.1740],
    dehaar: [52.1215, 4.9862], koppelpoort: [52.1589, 5.3838], drieringen: [52.1583, 5.3847], fortvechten: [52.0585, 5.1660],
    raadhuishilversum: [52.2290, 5.1672], pyramide: [52.0995, 5.3350], vecht: [52.1722, 5.0038], heksenwaag: [52.0252, 4.8693]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "⛪", name: "Dom Kurdu" },
    dogu: { icon: "🟥", name: "Rietveld Hayranı" },
    bati: { icon: "🧿", name: "Lombok Dostu" },
    guney: { icon: "🛶", name: "Kromme Rijn Gezgini" },
    cevre: { icon: "🏰", name: "Çevre Kâşifi" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "pandhof", cat: "gor", area: "merkez", title: "Dom'un gizli avlusu Pandhof'u bul",
      desc: "Katedral ile üniversite binası arasına sıkışmış gotik revaklı bir manastır bahçesi. Domplein'ın kalabalığından birkaç adım ötede, ortasındaki çeşme ve şifalı bitkilerle bambaşka bir sessizlik.",
      tip: "Revağın taş oymalarında Aziz Martin'in hayatından sahneler var. Dom Kilisesi ile kule arasındaki boşluğun 1674 fırtınasında yıkılan orta nef olduğunu da unutma.", q: "Pandhof Domkerk Utrecht", tags: ["ücretsiz"] },
    { id: "nijntje", cat: "gor", area: "merkez", title: "Nijntje'nin meydanına uğra",
      desc: "Dünyanın tanıdığı tavşan Nijntje'yi (Miffy) çizen Dick Bruna bütün hayatını Utrecht'te geçirdi. Küçük Nijntje Pleintje'de tavşanın bronz heykeli duruyor.",
      tip: "Merkezde nijntje biçiminde yanan bir yaya ışığı da var; onu da bul. Çocukla geliyorsan Nijntje Museum'a devam et.", q: "Nijntje Pleintje Utrecht", tags: ["ücretsiz"] },
    { id: "schroderhuis", cat: "gor", area: "dogu", title: "Rietveld Schröderhuis'un duvarlarını kaydır",
      desc: "Gerrit Rietveld'in 1924'te Truus Schröder için tasarladığı ev, De Stijl akımının yaşanabilir tek örneği ve UNESCO Dünya Mirası. Üst katın duvarları kayıp tek bir odaya dönüşüyor.",
      tip: "İçi yalnızca önceden rezervasyonla geziliyor; biletler Centraal Museum üzerinden alınıyor ve çabuk tükeniyor.", q: "Rietveld Schröderhuis Utrecht" },
    { id: "hogewoerd", cat: "gor", area: "bati", title: "Castellum Hoge Woerd'de Roma gemisini gör",
      desc: "Leidsche Rijn'in yeni evlerinin ortasında, Roma İmparatorluğu'nun kuzey sınırındaki bir kalenin tam boyutlu yeniden canlandırması. İçinde yakınlarda topraktan çıkarılan 2000 yıllık nehir gemisi sergileniyor.",
      tip: "Surların üstünde yürüyebilirsin. Yanındaki şehir çiftliği çocuklar için iyi bir mola.", q: "Castellum Hoge Woerd Utrecht", tags: ["ücretsiz"] },
    { id: "dehaar", cat: "gor", area: "cevre", title: "Kasteel de Haar'ın bahçelerinde kaybol",
      desc: "Hollanda'nın en büyük şatosu, 19. yüzyıl sonunda Rijksmuseum'un mimarı Pierre Cuypers tarafından ortaçağ harabesinin üzerine yeniden yapıldı. Park açılsın diye Haarzuilens köyü olduğu gibi taşındı.",
      tip: "Köyde bütün evlerin kepenkleri şatonun renkleri olan kırmızı beyaz. Utrecht'ten bisikletle güzel bir yarım günlük tur.", q: "Kasteel de Haar Haarzuilens" },
    { id: "koppelpoort", cat: "gor", area: "cevre", title: "Amersfoort'ta Koppelpoort'un altından geç",
      desc: "15. yüzyıldan kalma bu kapı hem karayı hem suyu kapatıyordu: nehrin üzerindeki bölme, içindeki ahşap çarkta yürüyen adamların gücüyle inip kalkardı.",
      tip: "Kapıdan sonra surların içine yapılmış 'Muurhuizen' sokağını takip et; eski şehri dolaşıp başladığın yere çıkarsın.", q: "Koppelpoort Amersfoort", tags: ["ücretsiz"] },
    { id: "fortvechten", cat: "gor", area: "cevre", title: "Fort bij Vechten'de ülkeyi suya boğ",
      desc: "Hollanda yüzyıllarca düşmanı durdurmak için kendi topraklarını su altında bırakmayı planladı. UNESCO listesindeki Nieuwe Hollandse Waterlinie'nin müzesi bu savunma hattının en büyük kalelerinden birinde.",
      tip: "Avludaki dev açık hava maketinde savakları kendin açıp arazinin nasıl sular altında kaldığını izleyebilirsin.", q: "Waterliniemuseum Fort bij Vechten Bunnik" },
    { id: "raadhuishilversum", cat: "gor", area: "cevre", title: "Hilversum'da Dudok'un belediye binası",
      desc: "Willem Dudok'un 1931'de bitirdiği sarı tuğlalı Raadhuis, dünyanın dört yanından mimarların görmeye geldiği bir modernizm klasiği. Gölete yansıyan kulesi şehrin simgesi.",
      tip: "Binanın çevresini dolaşıp her cepheden bak. Belirli günlerde rehberli tur ve kule çıkışı yapılıyor.", q: "Raadhuis Hilversum Dudok", tags: ["ücretsiz"] },

    // YENİLECEK
    { id: "werfkelder", cat: "ye", area: "merkez", title: "Su seviyesinde, bir werfkelder'de ye",
      desc: "Oudegracht'ın iki katlı rıhtımları dünyada benzeri olmayan bir yapı: ortaçağ tüccarlarının sokağın altındaki depo mahzenleri bugün restoran ve kafe. Masan kanalın hemen kıyısında.",
      tip: "Stadhuisbrug çevresinden merdivenle rıhtıma in ve su kenarında masası olan bir yer seç.", q: "Oudegracht werfkelders Utrecht" },
    { id: "oudaen", cat: "ye", area: "merkez", title: "Stadskasteel Oudaen'de ev yapımı bira",
      desc: "Oudegracht üzerindeki 13. yüzyıl şehir şatosu, kanal boyundaki ortaçağ kule evlerinin ayakta kalan en iyi örneği. Mahzeninde kendi birasını yapıyor.",
      tip: "Yüksek tavanlı ana salona gir; yazın rıhtım seviyesindeki terası da açılıyor.", q: "Stadskasteel Oudaen Utrecht", tags: ["yağmurda"] },
    { id: "broodjemario", cat: "ye", area: "merkez", title: "Broodje Mario ye",
      desc: "Oudegracht'taki küçük büfeden çıkan, salam, peynir ve acı biberli İtalyan sandviçi onlarca yıldır Utrecht'in sokak yemeği. Utrechtlilerin memleket özlemi listesinde hep var.",
      tip: "Kanalın korkuluğuna yaslanıp ayakta yenir. Acıyı sevmiyorsan söylemeyi unutma.", q: "Broodje Mario Oudegracht Utrecht" },
    { id: "kanaalstraat", cat: "ye", area: "bati", title: "Kanaalstraat'ta alışveriş ve yemek",
      desc: "Lombok mahallesinin ana caddesi: Türk fırınları, Faslı kasaplar, Surinam tezgâhları ve baharatçılar yan yana. Ucundaki cami ve meydan mahallenin kalbi.",
      tip: "Cumartesi günü en canlı hâlinde. Mahallenin diğer ucundaki kereste değirmeni De Ster'e kadar yürü.", q: "Kanaalstraat Lombok Utrecht" },
    { id: "rhijnauwen", cat: "ye", area: "guney", title: "Rhijnauwen çay evinde pannenkoek",
      desc: "Kromme Rijn kıyısındaki ormanın içinde duran Theehuis Rhijnauwen, Utrechtlilerin kuşaklardır pazar yürüyüşünü bitirdiği yer. Koca bir Hollanda krepi ve nehir manzarası.",
      tip: "Güzel havada sıra uzar; hafta içi ya da sabah erken git. Şehirden nehir boyunca kanoyla da gelinebiliyor.", q: "Theehuis Rhijnauwen Bunnik" },
    { id: "drieringen", cat: "ye", area: "cevre", title: "Amersfoort'un şehir birasını tat",
      desc: "Koppelpoort'un hemen yanında, su kenarındaki De Drie Ringen Amersfoort'un kendi bira üreticisi. Ortaçağda şehir yüzlerce bira imalathanesiyle ünlüydü.",
      tip: "Tadım tahtası iste ve terastan kapının manzarasına bak.", q: "Stadsbrouwerij De Drie Ringen Amersfoort" },

    // DENEYİM
    { id: "domtoren", cat: "dene", area: "merkez", title: "Domtoren'in 465 basamağını çık",
      desc: "112 metrelik Dom Kulesi Hollanda'nın en yüksek kilise kulesi. Utrecht'te hiçbir binanın ondan yüksek olmaması uzun süre yazısız bir kuraldı.",
      tip: "Sadece rehberli turla çıkılıyor, bileti önceden al. Açık havada Amsterdam ve Rotterdam'ı görebilirsin.", q: "Domtoren Utrecht" },
    { id: "trajectumlumen", cat: "dene", area: "merkez", title: "Karanlıkta Trajectum Lumen rotasını yürü",
      desc: "Gün batımından sonra merkezdeki köprüler, kiliseler ve geçitler ışık sanatıyla aydınlanıyor. Rota seni her gün yanından geçtiğin yerlere başka bir gözle baktırıyor.",
      tip: "Ganzenmarkt'taki renk değiştiren tüneli ve Dom çevresindeki işleri atlama. Kış akşamları için ideal.", q: "Trajectum Lumen Utrecht", tags: ["ücretsiz"] },
    { id: "nff", cat: "dene", area: "merkez", title: "Nederlands Film Festival'de bir film izle",
      desc: "Her sonbahar Hollanda sineması Utrecht'te toplanıyor ve Altın Buzağı (Gouden Kalf) ödülleri burada veriliyor. Şehir on gün boyunca kırmızı halıya dönüyor.",
      tip: "Eski bir karakol binası olan Louis Hartlooper Complex'te bir seans seç; kafesi festival dışında da güzel.", q: "Louis Hartlooper Complex Utrecht", months: [9, 10], tags: ["yağmurda"] },
    { id: "maliebaan", cat: "dene", area: "dogu", title: "Hollanda'nın ilk bisiklet yolunda sür",
      desc: "Ağaçlı Maliebaan'da 1885'te açılan şerit, ülkenin ilk bisiklet yolu kabul ediliyor. Bisiklet ülkesinin başladığı yer burası.",
      tip: "Yolun sonunda eski Maliebaan istasyonundaki Spoorwegmuseum var; oradan Wilhelminapark'a devam et.", q: "Maliebaan Utrecht", tags: ["ücretsiz"] },
    { id: "amelisweerd", cat: "dene", area: "guney", title: "Amelisweerd ormanında yürü",
      desc: "Şehrin kıyısında, Kromme Rijn boyunca uzanan eski malikâne ormanları. Utrechtliler 1980'lerde otoyol için kesilecek ağaçları korumak adına burada ağaçlara çıktı.",
      tip: "Erken ilkbaharda orman zemini çiçek açıyor. Nehir boyunca Rhijnauwen'e kadar devam et.", q: "Landgoed Oud Amelisweerd", tags: ["ücretsiz"] },
    { id: "pyramide", cat: "dene", area: "cevre", title: "Austerlitz Piramidi'ne tırman",
      desc: "Utrechtse Heuvelrug ormanlarının ortasında, 1804'te Napolyon'un can sıkıntısından patlayan askerlerine General Marmont'un yaptırdığı toprak piramit.",
      tip: "Tepeye sezonda çıkılabiliyor. Çevredeki orman yolları sonbaharda en güzel hâlinde.", q: "Pyramide van Austerlitz", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "vecht", cat: "dene", area: "cevre", title: "Vecht boyunca köyden köye bisiklet",
      desc: "Amsterdamlı zengin tüccarlar 17. ve 18. yüzyılda Vecht kıyısına yazlık malikâneler ve su kenarında çay köşkleri dizdi. New York'taki Brooklyn adını buradaki Breukelen'den alıyor.",
      tip: "Utrecht'ten nehri takip ederek Oud-Zuilen, Maarssen ve Breukelen üzerinden Loenen'e kadar git; dönüşte treni kullanabilirsin.", q: "Vechtbrug Breukelen", tags: ["ücretsiz"] },
    { id: "heksenwaag", cat: "dene", area: "cevre", title: "Oudewater'da cadı olmadığını kanıtla",
      desc: "Cadı avı yıllarında Oudewater'ın tartısı dürüstlüğüyle ünlüydü: burada tartılan kimse süpürgeyle uçacak kadar hafif çıkmadı. Bugün de tartılıp 'cadı değildir' belgeni alıyorsun.",
      tip: "Müze kış aylarında kapalı olabiliyor. Kasabanın eski halat yapımcılığı geçmişini anlatan sokaklarında da dolaş.", q: "Museum de Heksenwaag Oudewater", months: [4, 5, 6, 7, 8, 9, 10] }
  ]
};
