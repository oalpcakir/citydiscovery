// Zwolle ve IJssel bölgesi (Hanze şehirleri, Giethoorn, Weerribben-Wieden) görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.zwolle = {
  id: "zwolle",
  name: "Zwolle",
  subtitle: "ve IJssel",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Zwollenaar", "Echte Blauwvinger"],
  areas: {
    merkez: "Binnenstad",
    guney: "Assendorp & Güney",
    ijssel: "IJssel kıyısı",
    dogu: "Doğu & Vecht",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[52.490, 6.055], [52.545, 6.140]],
  coords: {
    peperbus: [52.5117, 6.0917], fundatie: [52.5105, 6.0927], sassenpoort: [52.5097, 6.0957], glazenengel: [52.5123, 6.0940],
    balletjes: [52.5120, 6.0947], blauwvingers: [52.5127, 6.0932], waanders: [52.5138, 6.0952], stadsgracht: [52.5141, 6.0890],
    assendorp: [52.5078, 6.1000], bevrijding: [52.5081, 6.1083],
    engelsewerk: [52.4941, 6.0690], hanzeboog: [52.4920, 6.0690],
    agnietenberg: [52.5365, 6.1265], pec: [52.5170, 6.1197],
    kampen: [52.5591, 5.9161], zutphen: [52.1398, 6.1958], deventerkoek: [52.2517, 6.1603], dickens: [52.2520, 6.1632],
    hattem: [52.4746, 6.0713], urk: [52.6633, 5.6220], giethoorn: [52.7222, 6.0898], weerribben: [52.8065, 5.9285]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🏰", name: "Hanze Kurdu" },
    guney: { icon: "🏘️", name: "Assendorper" },
    ijssel: { icon: "🌊", name: "IJssel Yolcusu" },
    dogu: { icon: "🌾", name: "Vecht Gezgini" },
    cevre: { icon: "🛶", name: "Çevre Kâşifi" }
  },
  quests: [
    // ---------- GÖRÜLECEK ----------
    { id: "peperbus", cat: "gor", area: "merkez", title: "Peperbus'a tırman",
      desc: "Onze-Lieve-Vrouwe bazilikasının kulesine, kubbesinin biçimi yüzünden herkes 'Peperbus' (biberlik) diyor. Tepesinden yıldız biçimli şehir hendeği ve IJssel ovası görünüyor.",
      tip: "Kule her gün açık değil; çıkış günlerine önceden bak.", q: "Peperbus Zwolle" },
    { id: "fundatie", cat: "gor", area: "merkez", title: "Fundatie'nin çatısındaki 'bulut'a çık",
      desc: "Neoklasik eski adliye binasının çatısına, binlerce mavi-beyaz seramik karoyla kaplı yumurta biçimli bir ek kondu. Museum de Fundatie'nin bu bölümündeki dev pencere şehre yukarıdan bakıyor.",
      tip: "Binayı önce kanalın karşı kıyısından gör, sonra içeriden en üst kata çık.", q: "Museum de Fundatie Zwolle", tags: ["yağmurda"] },
    { id: "sassenpoort", cat: "gor", area: "merkez", title: "Sassenpoort'un altından geç",
      desc: "1409 tarihli şehir kapısı, Zwolle'nin zengin bir Hanze şehri olduğu günlerden kalan en gösterişli yapı. Sivri kuleleri şehrin kartpostal görüntüsü.",
      tip: "İçi sadece belirli günlerde geziliyor; dışarıdan en iyi görüntü hendek tarafından.", q: "Sassenpoort Zwolle", tags: ["ücretsiz"] },
    { id: "glazenengel", cat: "gor", area: "merkez", title: "Cam meleği bul",
      desc: "Grote Kerk'in yanında duran camdan başmelek Mikail, şehrin koruyucu azizi. Zwollenaar'lar ona kısaca 'de Glazen Engel' diyor; kilisenin içinde ise ünlü Schnitger orgu var.",
      tip: "Kilise açıksa içeri gir ve orga bak; yazın org konserleri oluyor.", q: "Glazen Engel Grote Kerkplein Zwolle", tags: ["ücretsiz"] },
    { id: "assendorp", cat: "gor", area: "guney", title: "Assendorperstraat'ı yürü, manastıra uğra",
      desc: "İstasyonun arkasındaki Assendorp, küçük bağımsız dükkânları ve kahvecileriyle şehrin en mahalle gibi mahallesi. Caddenin sonunda hâlâ kullanılan büyük Dominiken manastırı duruyor.",
      tip: "Manastırın kilisesi ve bahçesi açık olduğunda içeri girilebiliyor.", q: "Dominicanenklooster Zwolle", tags: ["ücretsiz"] },
    { id: "engelsewerk", cat: "gor", area: "ijssel", title: "Engelse Werk'te IJssel'e in",
      desc: "Şehrin eski savunma hatlarının üzerine 19. yüzyılda kurulan İngiliz tarzı park. Kıvrımlı yolları, göletleri ve yaşlı ağaçları doğrudan IJssel seddine açılıyor.",
      tip: "Seddin üstüne çık ve nehir boyunca yürü; su yüksekken taşkın alanları göle dönüyor.", q: "Park het Engelse Werk Zwolle", tags: ["ücretsiz"] },
    { id: "kampen", cat: "gor", area: "cevre", title: "Kampen'de kuleye asılan ineği gör",
      desc: "IJssel kıyısındaki Hanze şehri Kampen'in şakacı hikâyelerinden (Kamper uien) birine göre halk, kulenin tepesinde biten otu yesin diye bir ineği yukarı çekmiş. Yaz aylarında Nieuwe Toren'den bir inek maketi sarkıtılıyor.",
      tip: "Trenle gelirsen şehre köprüden yürüyerek gir; nehir cephesi ve üç şehir kapısı en iyi buradan görünür.", q: "Nieuwe Toren Kampen", tags: ["ücretsiz"] },
    { id: "zutphen", cat: "gor", area: "cevre", title: "Zutphen'de zincirli kütüphane",
      desc: "Walburgiskerk'in içindeki 16. yüzyıl Librije'sinde kitaplar hâlâ okuma sıralarına zincirli. Avrupa'da özgün hâliyle kalan birkaç zincirli kütüphaneden biri.",
      tip: "Librije sadece rehberli ya da belirli saatlerde geziliyor; gitmeden kontrol et.", q: "Librije Walburgiskerk Zutphen", tags: ["yağmurda"] },

    // ---------- YENİLECEK ----------
    { id: "balletjes", cat: "ye", area: "merkez", title: "Zwolse balletjes tat",
      desc: "19. yüzyıldan beri aynı tarifle elde yapılan, yastık biçimli sert şekerler. Tarifi hâlâ sır ve sadece Grote Kerkplein'daki Zwolse Balletjeshuis'ta satılıyor.",
      tip: "Klasik tadı sor; dükkânın eski tezgâhı ve kavanozları da görülmeye değer.", q: "Zwolse Balletjeshuis Zwolle" },
    { id: "blauwvingers", cat: "ye", area: "merkez", title: "Bir kutu Blauwvingers al",
      desc: "Efsaneye göre Zwolle, çan takımını Kampen'e satınca parası bakır kuruşlarla ödenmiş ve sayanların parmakları mavileşmiş. Zwollenaar'ların lakabı 'Blauwvingers' buradan geliyor; ucu çikolatalı parmak kurabiyeler de bu adı taşıyor.",
      tip: "Kurabiyenin adresi Grote Markt'taki Banketbakkerij Van Orsouw.", q: "Banketbakkerij Van Orsouw Zwolle" },
    { id: "waanders", cat: "ye", area: "merkez", title: "Broerenkerk'te kitapların arasında kahve iç",
      desc: "15. yüzyıldan kalma Dominiken kilisesi bugün Waanders In de Broeren adlı bir kitabevi. Tavan resimlerinin ve orgun altında, raflar arasındaki kafede oturuyorsun.",
      tip: "En üst kata çık: tonoz resimlerine en yakın olduğun yer orası.", q: "Waanders In de Broeren Zwolle", tags: ["yağmurda"] },
    { id: "deventerkoek", cat: "ye", area: "cevre", title: "Deventer'de Deventer koek",
      desc: "Baharatlı, ballı Deventer keki yüzyıllardır bu Hanze şehrinin ihraç malı. Brink meydanındaki eski kek dükkânında tezgâhtan dilim dilim satılıyor.",
      tip: "Meydandaki Waag'a ve arkasındaki Bergkwartier sokaklarına da gir.", q: "Deventer Koekwinkel Brink Deventer" },
    { id: "hattem", cat: "ye", area: "cevre", title: "Hattem'de fırın müzesinde ekmek kokla",
      desc: "IJssel'in karşı kıyısındaki küçük surlu kasaba Hattem'de Bakkerijmuseum, eski fırınlarda hâlâ ekmek ve kurabiye pişiriyor. Sokakta Dijkpoort kapısı ve değirmen aynı kareye giriyor.",
      tip: "Zwolle'den bisikletle IJssel köprüsünü geçip gelebilirsin; gösteri saatlerine bak.", q: "Bakkerijmuseum Hattem", tags: ["yağmurda"] },
    { id: "urk", cat: "ye", area: "cevre", title: "Urk limanında balık ye",
      desc: "Urk, etrafındaki deniz kurutulana kadar bir adaydı; kendi lehçesi ve balıkçı gelenekleri hâlâ yaşıyor. Limanda kibbeling ya da tütsülenmiş balık yiyip deniz fenerine kadar yürürsün.",
      tip: "Pazar günü kasaba neredeyse tamamen kapalı; başka bir gün git.", q: "Haven Urk" },

    // ---------- DENEYİM ----------
    { id: "stadsgracht", cat: "dene", area: "merkez", title: "Yıldız hendeği sudan dolaş",
      desc: "Zwolle'nin eski şehri, yıldız biçimini koruyan bir hendekle çevrili. Tekneyle, kanoyla ya da SUP ile tam tur atınca surları, Sassenpoort'u ve Thorbeckegracht'taki tekne evleri sudan görürsün.",
      tip: "Tekne turları ve kiralama Rodetorenplein çevresinden; sıcak aylarda çalışıyor.", q: "Rodetorenplein Zwolle", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "bevrijding", cat: "dene", area: "guney", title: "5 Mayıs'ta Bevrijdingsfestival",
      desc: "Kurtuluş Günü'nde Park de Wezenlanden, Overijssel'in dev ve ücretsiz açık hava festivaline ev sahipliği yapıyor. Birkaç sahne, on binlerce kişi ve özgürlük ateşi.",
      tip: "Bisikletle gel; öğleden sonra park çok kalabalıklaşıyor.", q: "Park de Wezenlanden Zwolle", months: [5], tags: ["ücretsiz"] },
    { id: "hanzeboog", cat: "dene", area: "ijssel", title: "Hanzeboog'dan IJssel'i bisikletle geç",
      desc: "Kırmızı kemerli demiryolu köprüsü Hanzeboog'un yanında bisiklet ve yayalar için bir yol var. Trenler yanından geçerken nehri aşıp Veluwe tarafına geçiyorsun.",
      tip: "Karşı kıyıdan sedde sap ve Hattem'e kadar devam et.", q: "Hanzeboog Zwolle", tags: ["ücretsiz"] },
    { id: "agnietenberg", cat: "dene", area: "dogu", title: "Agnietenberg'de Vecht kıyısına git",
      desc: "Thomas a Kempis, dünyanın en çok okunan dini kitaplarından 'De Imitatione Christi'yi buradaki manastırda yazdı. Manastırdan geriye tepe ve mezarlık kaldı; yanı başındaki gölet ve Vecht kıyısı yazın şehrin plajı.",
      tip: "Bisikletle Vecht seddini takip et; yazın yüzmek için mayo al.", q: "Agnietenberg Zwolle", tags: ["ücretsiz"] },
    { id: "pec", cat: "dene", area: "dogu", title: "PEC Zwolle maçına git",
      desc: "Küçük stadyum, yeşil-beyaz atkılar ve tribünde tanıdık yüzler: şehrin kulübü PEC Zwolle'yi izlemek büyük stadyumlara benzemez.",
      tip: "Stadyum merkezden bisikletle birkaç dakika; biletleri kulübün sitesinden al.", q: "PEC Zwolle stadion", months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] },
    { id: "dickens", cat: "dene", area: "cevre", title: "Deventer'de Dickens Festijn",
      desc: "Aralıkta bir hafta sonu Deventer'in ortaçağdan kalma Bergkwartier mahallesi 19. yüzyıl Londra'sına dönüşüyor. Yüzlerce kostümlü kişi Scrooge'u, Oliver Twist'i ve baca temizleyicilerini canlandırıyor.",
      tip: "Giriş ücretsiz ama kuyruk uzun olabiliyor; sabah erken git.", q: "Bergkerk Deventer", months: [12], tags: ["ücretsiz"] },
    { id: "giethoorn", cat: "dene", area: "cevre", title: "Giethoorn'da kendi tekneni sür",
      desc: "Köyün eski kısmında yol yok: sazdan çatılı evler küçük adacıklarda duruyor ve birbirine ahşap köprülerle bağlanıyor. Elektrikli 'fısıltı teknesi' ya da kano ile kanalları ve arkadaki gölü dolaşırsın.",
      tip: "Yaz hafta sonlarında çok kalabalık; hafta içi sabah erken ya da sezon dışında git.", q: "Museum Giethoorn 't Olde Maat Uus", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "weerribben", cat: "dene", area: "cevre", title: "Weerribben'de sazlıklar arasında kürek çek",
      desc: "Weerribben-Wieden, Kuzeybatı Avrupa'nın en büyük alçak bataklık alanlarından. Turba kesiminden kalan dar su yolları sazlıkların arasından geçiyor; burada su samurları yaşıyor.",
      tip: "Ossenzijl'deki ziyaretçi merkezinin yanından kano kiralanıyor; işaretli rotaları takip et.", q: "Bezoekerscentrum De Weerribben Ossenzijl", months: [4, 5, 6, 7, 8, 9, 10] }
  ]
};
