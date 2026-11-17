// Arnhem, Nijmegen ve Veluwe görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.arnhem = {
  id: "arnhem",
  name: "Arnhem & Nijmegen",
  subtitle: "ve Veluwe",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Gelderlander", "Ernemmer & Nimwegenaar"],
  areas: {
    arnhem: "Arnhem Merkez",
    sonsbeek: "Sonsbeek & Kuzey Arnhem",
    nijmegen: "Nijmegen Merkez",
    waal: "Waal & Ooijpolder",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (iki şehir birlikte) ve görev konumları [enlem, boylam].
  bounds: [[51.815, 5.800], [52.020, 5.960]],
  coords: {
    eusebius: [51.9787, 5.9122], johnfrost: [51.9757, 5.9118], trolley: [51.9850, 5.8990], korenmarkt: [51.9825, 5.9043],
    museumarnhem: [51.9832, 5.8880],
    waterval: [51.9930, 5.9005], openlucht: [52.0105, 5.9075], burgers: [52.0093, 5.8990],
    valkhof: [51.8482, 5.8707], vierdaagse: [51.8385, 5.8600], hemel: [51.8481, 5.8641], blaauwehand: [51.8476, 5.8651],
    oversteek: [51.8570, 5.8390], spiegelwaal: [51.8560, 5.8640], oortjeshekken: [51.8530, 5.9230],
    kmm: [52.0953, 5.8169], hogeveluwe: [52.0795, 5.8355], hetloo: [52.2343, 5.9457], posbank: [52.0287, 6.0213],
    hartenstein: [51.9877, 5.8328], mosterd: [52.0118, 6.1375], waag: [52.0130, 6.1385]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    arnhem: { icon: "🚎", name: "Trolley Yolcusu" },
    sonsbeek: { icon: "🌳", name: "Sonsbeek Gezgini" },
    nijmegen: { icon: "🏛️", name: "Valkhof Bekçisi" },
    waal: { icon: "🌊", name: "Waal Yolcusu" },
    cevre: { icon: "🦌", name: "Veluwe Kâşifi" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "johnfrost", cat: "gor", area: "arnhem", title: "John Frostbrug'un başında dur",
      desc: "Eylül 1944'te İngiliz paraşütçüler Ren üzerindeki bu köprünün kuzey ucunu günlerce tuttu; 'Bir Köprü Çok Uzak' filminin köprüsü burası. Bugünkü köprü, direnişi yöneten subay John Frost'un adını taşıyor.",
      tip: "Rıhtımdaki Airborne at the Bridge bilgi merkezi ücretsiz ve köprüye tam karşıdan bakıyor.", q: "Airborne at the Bridge Arnhem", tags: ["ücretsiz"] },
    { id: "museumarnhem", cat: "gor", area: "arnhem", title: "Museum Arnhem'in bahçesinden Ren'e bak",
      desc: "Müze, buzul çağından kalma bir sırtın kenarında duruyor ve yeni kanadı yamacın üzerinden boşluğa doğru uzanıyor. Heykel bahçesinden nehir ve ovadaki Betuwe ayaklarının altında.",
      tip: "Bahçeye girmek için bilet gerekmiyor; içeride Hollanda büyülü gerçekçiliği koleksiyonuna bak.", q: "Museum Arnhem Utrechtseweg", tags: ["yağmurda"] },
    { id: "waterval", cat: "gor", area: "sonsbeek", title: "Sonsbeek şelalesinin arkasından geç",
      desc: "Arnhem'in tam ortasındaki Sonsbeek parkı, düz Hollanda'da görmeye alışık olmadığın kadar inişli çıkışlı. Büyük şelalenin arkasındaki kaya geçidinden suyun içinden bakabilirsin.",
      tip: "Şelaleden sonra yokuşu tırmanıp tepedeki beyaz villanın terasından parka bak.", q: "Grote Waterval Park Sonsbeek Arnhem", tags: ["ücretsiz"] },
    { id: "burgers", cat: "gor", area: "sonsbeek", title: "Burgers' Bush'ta yağmur ormanına gir",
      desc: "Burgers' Zoo'nun dev kapalı tropik salonu Bush, türünün Avrupa'daki ilk ve en büyük örneklerinden. Kuşlar ve yarasalar başının üstünde serbestçe uçuyor; yanında çöl ve okyanus bölümleri var.",
      tip: "Kışın soğuk bir günde git: içerisi sıcak ve nemli, kat kat giyin. Bush'tan çöle tünelle geçiliyor.", q: "Koninklijke Burgers' Zoo Arnhem", tags: ["yağmurda"] },
    { id: "valkhof", cat: "gor", area: "nijmegen", title: "Valkhof'ta bin yıllık şapele gir",
      desc: "Hollanda'nın en eski şehri Nijmegen'in kalbi bu tepe: Romalılar da Şarlman da buradaydı. Sekizgen Sint-Nicolaaskapel ülkenin ayakta kalan en eski yapılarından; yanında Barbarossa'nın sarayından kalan apsis duruyor.",
      tip: "Parkın kuzey ucundaki surdan Waal nehrine ve köprüye bak; şapel sezonda belirli günlerde açık.", q: "Sint-Nicolaaskapel Valkhof Nijmegen", tags: ["ücretsiz"] },
    { id: "kmm", cat: "gor", area: "cevre", title: "Kröller-Müller'de Van Gogh'ları gör",
      desc: "Ormanın ortasındaki müze, dünyanın ikinci büyük Van Gogh koleksiyonuna sahip. Avrupa'nın en büyük heykel bahçelerinden biri de binanın arkasında, ağaçların arasına yayılıyor.",
      tip: "Müzeye girmek için önce De Hoge Veluwe parkına giriş yapman gerekiyor; biletleri birlikte ve önceden al.", q: "Kröller-Müller Museum Otterlo", tags: ["yağmurda"] },
    { id: "hetloo", cat: "gor", area: "cevre", title: "Paleis Het Loo'nun bahçelerinde yürü",
      desc: "Apeldoorn'daki saray üç yüzyıl boyunca Oranje hanedanının yazlık eviydi. Simetrik barok bahçeleri özgün planına göre yeniden kuruldu; büyük yenilemenin ardından yer altına gömülü yeni bir kanatla tekrar açıldı.",
      tip: "Sarayın çatısına çık: bahçenin desenini ancak yukarıdan görebilirsin.", q: "Paleis Het Loo Apeldoorn" },
    { id: "hartenstein", cat: "gor", area: "cevre", title: "Oosterbeek'te Hartenstein'ı gez",
      desc: "Arnhem Muharebesi'nde İngiliz karargâhı olan villa bugün Airborne Museum. Bodrum katı, kuşatma günlerini ses ve ışıkla yeniden yaşatıyor.",
      tip: "Yakındaki Airborne mezarlığına da yürü. Her eylülde anma törenleri ve büyük Airborne yürüyüşü yapılır.", q: "Airborne Museum Hartenstein Oosterbeek", tags: ["yağmurda"] },

    // YENİLECEK
    { id: "korenmarkt", cat: "ye", area: "arnhem", title: "Korenmarkt'ta bir akşam geçir",
      desc: "Eski tahıl pazarı meydanı Arnhem'in gece hayatının merkezi: dört yanı bar ve teraslarla çevrili. Şehrin öğrencisi de emeklisi de akşam buraya iner.",
      tip: "Güneşli günde teraslar erken dolar; yan sokaklardaki özel bira kafelerine de bak.", q: "Korenmarkt Arnhem" },
    { id: "hemel", cat: "ye", area: "nijmegen", title: "De Hemel'de manastır avlusunda bira iç",
      desc: "Stadsbrouwerij De Hemel (Cennet), ortaçağdan kalma Commanderie van Sint-Jan binasında bira yapıyor. Aynı çatı altında sirke, hardal ve damıtık içkiler de üretiliyor.",
      tip: "Tadım tahtasıyla başla; yazın iç avluda otur.", q: "Stadsbrouwerij De Hemel Nijmegen", tags: ["yağmurda"] },
    { id: "blaauwehand", cat: "ye", area: "nijmegen", title: "In de Blaauwe Hand'e uğra",
      desc: "16. yüzyıldan beri açık olan bu küçük kahve Nijmegen'in en eskisi. Adını, yandaki kumaş halinde çalışan ve elleri çivit mavisine boyanan boyacılardan alıyor.",
      tip: "Grote Markt'ın hemen arkasında, kilise geçidinin yanında; içerisi küçük, erken git.", q: "In de Blaauwe Hand Nijmegen", tags: ["yağmurda"] },
    { id: "oortjeshekken", cat: "ye", area: "waal", title: "Ooijpolder'de set üstünde mola ver",
      desc: "Nijmegen'in bittiği yerde Ooijpolder başlıyor: taşkın ovaları, yarı yabani atlar ve kıvrılan setler. Setin üstündeki Oortjeshekken, yürüyüşçülerin ve bisikletçilerin klasik durağı.",
      tip: "Şehirden Ooypoort yaya köprüsüyle çık ve set boyunca yürü ya da pedalla; dönüşte güneş Waal'ın üstünde batar.", q: "Oortjeshekken Ooij" },
    { id: "mosterd", cat: "ye", area: "cevre", title: "Doesburg hardalını kaynağından al",
      desc: "IJssel kıyısındaki Hansa kasabası Doesburg'un adı hardalla anılır. Eski hardal fabrikası bugün müze: taş değirmenleri ve ahşap fıçılarıyla hâlâ üretim yapıyor.",
      tip: "Tezgâhtan taze hardal al; iri taneli ve keskin, market hardalına benzemez.", q: "Doesburgsche Mosterdfabriek Doesburg", tags: ["yağmurda"] },
    { id: "waag", cat: "ye", area: "cevre", title: "De Waag'da hardal çorbası iç",
      desc: "Doesburg'un basamaklı çatılı gotik tartı evi 15. yüzyıldan kalma ve ülkenin en eski lokantalarından biri sayılıyor. Yöresel hardal çorbası için en doğru adres.",
      tip: "İçerideki eski tartıya bak; sonra kasabanın ana sokağını IJssel'e kadar yürü.", q: "Stadsbierhuys De Waag Doesburg" },

    // DENEYİM
    { id: "eusebius", cat: "dene", area: "arnhem", title: "Eusebiuskerk'in cam balkonuna çık",
      desc: "Arnhem Muharebesi'nde yıkılan kilisenin kulesi savaştan sonra yeniden yapıldı. Asansörle tepeye çıkınca kulenin dışına taşan, tabanı da cam olan balkonlara adım atıyorsun.",
      tip: "Aşağı bakmaya cesaret et: tam altında meydan var. Açık havada Ren'i ve John Frost köprüsünü görürsün.", q: "Eusebiuskerk Arnhem" },
    { id: "trolley", cat: "dene", area: "arnhem", title: "Trolleybüse bin",
      desc: "Arnhem, Hollanda'da trolleybüsü olan tek şehir: tellere bağlı sessiz otobüsler savaştan beri tramvayın yerini tutuyor. Her gün bindiysen bile bir kez özel olduğunu bilerek bin.",
      tip: "Arnhem Centraal'dan kalkıyor. Binmeden önce garın içindeki kıvrılan dev beton kolona da bak.", q: "Arnhem Centraal" },
    { id: "openlucht", cat: "dene", area: "sonsbeek", title: "Openluchtmuseum'da eski tramvaya bin",
      desc: "Ülkenin dört yanından sökülüp getirilen çiftlikler, değirmenler ve atölyeler ormanın içinde yeniden kuruldu. Aralarında eski tramvaylar dolaşıyor; Hollanda'nın son birkaç yüzyılı tek bir yürüyüşte.",
      tip: "Bir tam gün ayır. Fırında taze ekmek, tezgâhta poffertjes kokusu seni bulur.", q: "Nederlands Openluchtmuseum Arnhem" },
    { id: "vierdaagse", cat: "dene", area: "nijmegen", title: "Vierdaagse'de yürüyüşçüleri karşıla",
      desc: "Her temmuzda on binlerce kişi Nijmegen çevresinde dört gün üst üste yürür: dünyanın en büyük çok günlü yürüyüş etkinliği. Son gün St. Annastraat 'Via Gladiola' olur ve bitirenlere glayöl verilir.",
      tip: "Yürümesen de aynı hafta şehirdeki Vierdaagsefeesten konserleri ücretsiz. Via Gladiola için sabahtan yer tut.", q: "St. Annastraat Nijmegen", months: [7], tags: ["ücretsiz"] },
    { id: "oversteek", cat: "dene", area: "waal", title: "Sunset March'a katıl",
      desc: "De Oversteek köprüsü, 1944'te Waal'ı küçük botlarla geçerken ölen 48 Amerikan askerinin anısına yapıldı. Gün batımında 48 çift lamba yürüyüş temposuyla sırayla yanar ve her akşam bir gazi ışıklarla birlikte köprüyü yürür.",
      tip: "Saat gün batımına göre her gün değişir; gazinin arkasından sessizce yürümek herkese açık.", q: "De Oversteek Nijmegen", tags: ["ücretsiz"] },
    { id: "spiegelwaal", cat: "dene", area: "waal", title: "Spiegelwaal kıyısında yaz günü geçir",
      desc: "Nijmegen'i selden korumak için Waal'a ikinci bir kol kazıldı ve ortada Veur-Lent adası oluştu. Yan kol Spiegelwaal'ın suyu sakin; kumsalları yazın şehrin plajı.",
      tip: "Merkezden köprüyle adaya geç, sonra yaya köprüsü Lentloper'den suya in. Akşam güneşi şehir siluetinin arkasından batar.", q: "Spiegelwaal Nijmegen", months: [5, 6, 7, 8, 9], tags: ["ücretsiz"] },
    { id: "hogeveluwe", cat: "dene", area: "cevre", title: "Hoge Veluwe'yi beyaz bisikletle gez",
      desc: "Millî parkın girişlerinde yüzlerce ücretsiz beyaz bisiklet bekler: birini al, fundalıkların, kum tepelerinin ve çam ormanlarının arasından sür. Şansın varsa geyik ve yaban koyunu görürsün.",
      tip: "Sonbaharda geyiklerin kızışma dönemi için gün batımına yakın gel. Kuzeydeki Jachthuis Sint Hubertus'a kadar pedalla.", q: "Bezoekerscentrum De Hoge Veluwe" },
    { id: "posbank", cat: "dene", area: "cevre", title: "Posbank'ta mor fundalıkları yürü",
      desc: "Veluwezoom'un tepeleri ağustos sonunda çiçek açan fundalarla mora boyanır. Düz ülkede ufka kadar dalgalanan tepeler ve aralarında otlayan İskoç sığırları.",
      tip: "Çiçek zamanı hafta sonu yollar tıkanır: gün doğumunda gel ya da Rheden'den yürüyerek çık.", q: "Posbank Rheden", months: [8, 9], tags: ["ücretsiz"] }
  ]
};
