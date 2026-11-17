// Antwerpen ve çevresi görevleri (Mechelen, Lier, liman ve Doel dahil).
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.antwerpen = {
  id: "antwerpen",
  name: "Antwerpen",
  subtitle: "ve çevresi",
  country: "Belçika",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Sinjoor", "Echte Sinjoor"],
  areas: {
    merkez: "Tarihi merkez",
    eilandje: "Eilandje & liman",
    zuid: "Zuid & Berchem",
    istasyon: "İstasyon & Zurenborg",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[51.175, 4.370], [51.246, 4.450]],
  coords: {
    kathedraal: [51.2203, 4.4014], vlaeykensgang: [51.2197, 4.4003], plantin: [51.2184, 4.3978], annatunnel: [51.2189, 4.3962],
    handjes: [51.2166, 4.4035], vogelenmarkt: [51.2146, 4.4085], waterbus: [51.2224, 4.3964],
    mas: [51.2289, 4.4048], havenhuis: [51.2416, 4.4072],
    kmska: [51.2087, 4.3946], bolleke: [51.1995, 4.4172], middelheim: [51.1821, 4.4128],
    centraal: [51.2172, 4.4211], cogels: [51.2068, 4.4335], dageraad: [51.2113, 4.4322], kleinblatt: [51.2125, 4.4265],
    romboutstoren: [51.0289, 4.4792], anker: [51.0327, 4.4728], zimmertoren: [51.1291, 4.5707], vlaaikes: [51.1313, 4.5697],
    doel: [51.3110, 4.2655], kalmthout: [51.3690, 4.4370]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "✋", name: "Brabo'nun Eli" },
    eilandje: { icon: "⚓", name: "Dok Kaptanı" },
    zuid: { icon: "🎨", name: "Zuid Ruhu" },
    istasyon: { icon: "🚂", name: "Zurenborg Gezgini" },
    cevre: { icon: "🚲", name: "Çevre Kâşifi" }
  },
  quests: [
    // ───────────── GÖRÜLECEK ─────────────
    { id: "kathedraal", cat: "gor", area: "merkez", title: "Katedralde Rubens'in karşısına geç",
      desc: "Onze-Lieve-Vrouwekathedraal'in 123 metrelik kulesi Benelüks'ün en yüksek kilise kulesi. İçeride Rubens'in dev altar tabloları, yapıldıkları şehirde ve asıldıkları yerde duruyor.",
      tip: "'Kruisafneming' (Çarmıhtan İndiriliş) tablosunun yan kanatlarını da incele; kulenin ikizinin neden hiç tamamlanmadığını rehber panolarından oku.", q: "Onze-Lieve-Vrouwekathedraal Antwerpen", tags: ["yağmurda"] },
    { id: "vlaeykensgang", cat: "gor", area: "merkez", title: "Vlaeykensgang'ın kapısını bul",
      desc: "1591'den kalma bu dar geçit, bir zamanlar ayakkabıcıların ve şehrin en yoksullarının yaşadığı iç avluları birbirine bağlıyor. Kalabalık caddeden iki adımda 16. yüzyıla giriyorsun.",
      tip: "Giriş Oude Koornmarkt 16 numaradaki sıradan görünen kapı; diğer ucu Pelgrimstraat'a çıkıyor.", q: "Vlaeykensgang Antwerpen", tags: ["ücretsiz"] },
    { id: "plantin", cat: "gor", area: "merkez", title: "Dünyanın en eski matbaa preslerini gör",
      desc: "Museum Plantin-Moretus, 16. yüzyılın en büyük matbaasının hem atölyesi hem aile evi; UNESCO Dünya Mirası listesindeki ilk müze. Dünyanın bilinen en eski iki matbaa presi burada.",
      tip: "İç avludaki bahçeye çık ve dizgi odasındaki kurşun harf kasalarına yakından bak.", q: "Museum Plantin-Moretus Antwerpen", tags: ["yağmurda"] },
    { id: "mas", cat: "gor", area: "eilandje", title: "MAS'ın çatısına ücretsiz çık",
      desc: "Eski dokların ortasındaki kırmızı taş kule, Antwerpen'in liman ve dünya ile ilişkisini anlatan müze. Yürüyen merdivenli cam 'bulvar' ve çatıdaki seyir terası bilet almadan gezilebiliyor.",
      tip: "Gün batımına yakın çık: bir yanda katedral, diğer yanda liman vinçleri. Cephedeki küçük metal elleri de fark et.", q: "MAS Museum aan de Stroom Antwerpen", tags: ["ücretsiz", "yağmurda"] },
    { id: "havenhuis", cat: "gor", area: "eilandje", title: "Havenhuis'in elmasına bak",
      desc: "Zaha Hadid, eski bir itfaiye binasının üzerine gemi pruvasını andıran, elmas gibi yontulmuş cam bir gövde oturttu. Liman idaresinin merkezi, elmas şehrinin limanına selam veriyor.",
      tip: "İçi sadece önceden ayrılan rehberli turla gezilebiliyor; dışarıdan en iyi görüntü rıhtımın karşı kıyısından.", q: "Havenhuis Antwerpen", tags: ["ücretsiz"] },
    { id: "kmska", cat: "gor", area: "zuid", title: "KMSKA'da Rubens'ten Ensor'a yürü",
      desc: "Kraliyet Güzel Sanatlar Müzesi on bir yıl süren yenilemeden sonra 2022'de yeniden açıldı. Eski salonların içine gizlenmiş bembeyaz yeni müze ve dünyanın en büyük James Ensor koleksiyonu burada.",
      tip: "Rubens salonundaki dev tabloların önündeki banklara otur; yeni bölümdeki uzun beyaz merdiveni atlama.", q: "KMSKA Antwerpen", tags: ["yağmurda"] },
    { id: "centraal", cat: "gor", area: "istasyon", title: "Demiryolu katedralinde yukarı bak",
      desc: "Antwerpen-Centraal'e şehirde 'Spoorwegkathedraal' (demiryolu katedrali) derler: 1905 tarihli kubbe, mermer salon ve demir-cam peron çatısı. Trenler bugün üst üste birkaç katta duruyor.",
      tip: "En alt perona inip yukarı doğru katların arasından kubbeye bak; her gün koşarak geçtiğin yerde bir kez dur.", q: "Station Antwerpen-Centraal", tags: ["ücretsiz", "yağmurda"] },
    { id: "cogels", cat: "gor", area: "istasyon", title: "Cogels-Osylei'de ev seç",
      desc: "Zurenborg mahallesinin bu caddesi Belle Époque'un açık hava kataloğu: art nouveau, neogotik, neoklasik cepheler yan yana ve hepsi birbirinden gösterişli.",
      tip: "Waterloostraat ile Generaal Van Merlenstraat'ın köşesindeki dört mevsim evlerini (Lente, Zomer, Herfst, Winter) bul.", q: "Cogels-Osylei Antwerpen", tags: ["ücretsiz"] },
    { id: "zimmertoren", cat: "gor", area: "cevre", title: "Lier'de Zimmertoren'in saatini çöz",
      desc: "Saatçi Louis Zimmer 1930'da ortaçağdan kalma bir kuleye on üç kadranlı Jübile Saati'ni yerleştirdi: saat, gelgit, ayın evreleri, burçlar ve daha fazlası tek cephede.",
      tip: "Öğle vakti kulenin yan cephesindeki figürlerin geçişini izle; sonra Begijnhof'a ve Nete kıyısına yürü.", q: "Zimmertoren Lier" },
    { id: "doel", cat: "gor", area: "cevre", title: "Hayalet köy Doel'de yürü",
      desc: "Liman genişlemesi yüzünden onlarca yıl boşaltılan polder köyünde bir avuç insan kaldı; terk edilmiş evlerin duvarları sokak sanatıyla kaplandı. Arkada nükleer santralin soğutma kuleleri, setin üzerinde 17. yüzyıl değirmeni.",
      tip: "Evlere girme, hâlâ yaşayanlar var. Setin üstüne çıkıp Schelde'den geçen konteyner gemilerini izle.", q: "Doel Beveren", tags: ["ücretsiz"] },

    // ───────────── YENİLECEK ─────────────
    { id: "handjes", cat: "ye", area: "merkez", title: "Antwerpse handjes ye",
      desc: "El biçimli bademli bisküviler ve çikolatalar şehrin resmî tatlısı. Şekil, Brabo'nun devin elini kesip Schelde'ye attığı efsaneden geliyor: şehrin adının 'hand werpen' (el atmak) olduğu söylenir.",
      tip: "Korte Gasthuisstraat'taki Philip's Biscuits bisküvi olanını taze satıyor; çikolatalısı için çevredeki çikolatacılara bak.", q: "Philip's Biscuits Korte Gasthuisstraat Antwerpen" },
    { id: "bolleke", cat: "ye", area: "zuid", title: "Bira fabrikasında bir 'bolleke' iç",
      desc: "Antwerpen'de bira istemenin yolu 'een bolleke' demek: yuvarlak kadehte gelen kehribar renkli De Koninck. 1833'ten beri şehrin içinde üretiliyor.",
      tip: "Mechelsesteenweg'deki fabrikada interaktif tur var; aynı avluda peynirci, kasap ve çikolatacı da bulunuyor.", q: "Stadsbrouwerij De Koninck Antwerpen", tags: ["yağmurda"] },
    { id: "kleinblatt", cat: "ye", area: "istasyon", title: "Yahudi mahallesinin fırınına uğra",
      desc: "Gar çevresindeki elmas bölgesi Avrupa'nın en büyük Ortodoks Yahudi topluluklarından birine ev sahipliği yapıyor. Kleinblatt, bir asrı aşkın süredir mahallenin cheesecake'ini, challah ekmeğini ve tarçınlı çöreklerini yapıyor.",
      tip: "Cumartesi kapalı (Şabat); cuma öğleden önce gidersen tezgâh en dolu hâlinde olur.", q: "Bakkerij Kleinblatt Provinciestraat Antwerpen" },
    { id: "anker", cat: "ye", area: "cevre", title: "Mechelen'de Gouden Carolus tadımı",
      desc: "Het Anker, Belçika'nın en eski bira üreticilerinden: kökeni Mechelen begijnhof'undaki kadınların yaptığı biraya uzanıyor. Gouden Carolus adını Mechelen'de büyüyen V. Karl'ın altın sikkesinden alıyor.",
      tip: "Fabrika turuna önceden yer ayırt; brasserie'de tadım tahtası iste. Antwerpen'den trenle yaklaşık yirmi dakika.", q: "Brouwerij Het Anker Mechelen", tags: ["yağmurda"] },
    { id: "vlaaikes", cat: "ye", area: "cevre", title: "Lier'de bir Liers vlaaike ye",
      desc: "Avuç içi kadar, koyu renkli, baharatlı küçük turta sadece Lier'de yapılıyor ve tanınmış bir yöre ürünü. Tarifin birkaç yüzyıllık olduğu söyleniyor.",
      tip: "Grote Markt çevresindeki fırınlarda 'Liers vlaaike' tabelasını ara; kahvenin yanında ılık yenir.", q: "Grote Markt Lier" },

    // ───────────── DENEYİM ─────────────
    { id: "annatunnel", cat: "dene", area: "merkez", title: "Ahşap merdivenle Schelde'nin altına in",
      desc: "1933'te açılan Sint-Annatunnel yayaları ve bisikletlileri nehrin 30 metre altından karşıya geçiriyor. Orijinal ahşap yürüyen merdivenler hâlâ çalışıyor.",
      tip: "Sint-Jansvliet'teki binadan gir, yarım kilometre yürü; Linkeroever tarafında şehrin en iyi silueti seni bekliyor.", q: "Sint-Annatunnel Sint-Jansvliet Antwerpen", tags: ["ücretsiz", "yağmurda"] },
    { id: "vogelenmarkt", cat: "dene", area: "merkez", title: "Pazar sabahı Vogelenmarkt'ta dolaş",
      desc: "Kuş pazarı diye anılan pazar yüzyıllardır pazar sabahları kuruluyor: çiçek, yiyecek, giysi, hırdavat ve tezgâhtarların Antwerpen ağzıyla bağırışları.",
      tip: "Theaterplein ve çevresinde, öğlene kadar. Cumartesi aynı meydanda yiyecek ağırlıklı 'Exotische Markt' var.", q: "Vogelenmarkt Theaterplein Antwerpen", tags: ["ücretsiz"] },
    { id: "waterbus", cat: "dene", area: "merkez", title: "Waterbus ile Schelde'de yol al",
      desc: "Nehir Antwerpen'in varlık sebebi ama şehirliler onu çoğu zaman sadece kıyıdan görüyor. DeWaterbus, Het Steen'in önünden kalkıp nehir boyunca köylere ve liman yönüne gidiyor.",
      tip: "Bisikletini tekneye al, bir iskelede in ve nehir setinden pedallayarak dön.", q: "DeWaterbus Steenplein Antwerpen" },
    { id: "middelheim", cat: "dene", area: "zuid", title: "Middelheim'da heykellerin arasında kaybol",
      desc: "1950'den beri bir parkın içine yayılan açık hava heykel müzesi: Rodin'den günümüz sanatçılarına yüzlerce eser ağaçların arasında duruyor ve giriş ücretsiz.",
      tip: "Bisikletle git; yan yana duran Nachtegalenpark ve Den Brandt parklarıyla birleştir.", q: "Middelheimmuseum Antwerpen", tags: ["ücretsiz"] },
    { id: "dageraad", cat: "dene", area: "istasyon", title: "Dageraadplaats'ta yıldızların altında otur",
      desc: "Zurenborg'un mahalle meydanı: ortada basket sahası ve oyun parkı, çevrede kafeler. Hava kararınca meydanın üzerine gerilmiş ışıklar yapay bir yıldızlı gök oluşturuyor.",
      tip: "Sıcak bir akşam git; terasta yer bulamazsan içeceğini alıp meydandaki banklara geç.", q: "Dageraadplaats Antwerpen", tags: ["ücretsiz"] },
    { id: "romboutstoren", cat: "dene", area: "cevre", title: "Mechelen'de Sint-Romboutstoren'e tırman",
      desc: "538 basamak, yolda iki carillon ve dev saat mekanizması, tepede açık hava 'skywalk'. Mechelenlilere 'Maneblussers' (ay söndürenler) denmesinin sebebi bu kule: 1687'de sisin ardındaki ay ışığını yangın sanıp söndürmeye koştular.",
      tip: "Açık bir gün seç: tepeden Antwerpen limanı ve Brüksel'deki Atomium görülebiliyor.", q: "Sint-Romboutstoren Mechelen" },
    { id: "kalmthout", cat: "dene", area: "cevre", title: "Kalmthoutse Heide'de fundalıkta yürü",
      desc: "Hollanda sınırına uzanan fundalık, kumul ve göletlerden oluşan sınır ötesi doğa parkı. Liman şehrinin yarım saat kuzeyinde bambaşka bir manzara.",
      tip: "Fundalar ağustos ortasından eylül başına kadar mor açıyor. Heide tren istasyonundan yürüyerek girilebiliyor.", q: "Kalmthoutse Heide De Vroente Kalmthout", tags: ["ücretsiz"] }
  ]
};
