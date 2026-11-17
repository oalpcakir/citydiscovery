// Maastricht ve Limburg görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.maastricht = {
  id: "maastricht",
  name: "Maastricht",
  subtitle: "ve Limburg",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Maastrichtenaar", "Echte Sjeng"],
  areas: {
    merkez: "Binnenstad",
    jeker: "Jekerkwartier",
    wyck: "Wyck & Céramique",
    sphinx: "Sphinxkwartier",
    sintpieter: "Sint-Pieter & Jekerdal",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[50.815, 5.650], [50.870, 5.730]],
  coords: {
    sintjan: [50.8488, 5.6869], dominicanen: [50.8500, 5.6897], vogelstruys: [50.8485, 5.6894],
    carnaval: [50.8494, 5.6879], preuvenemint: [50.8490, 5.6886],
    helpoort: [50.8454, 5.6958], bisschopsmolen: [50.8472, 5.6917], zoervleis: [50.8458, 5.6935],
    servaasbrug: [50.8494, 5.6968], bonnefanten: [50.8424, 5.7022],
    sphinxpassage: [50.8552, 5.6885], lumiere: [50.8560, 5.6900],
    grotten: [50.8335, 5.6850], enci: [50.8242, 5.6825], apostelhoeve: [50.8255, 5.6680],
    kerststad: [50.8624, 5.8287], cauberg: [50.8589, 5.8221], drielandenpunt: [50.7560, 6.0192],
    gulpener: [50.8158, 5.8905], thorn: [51.1612, 5.8408], roermond: [51.1937, 5.9880], margraten: [50.8185, 5.8052]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "⛪", name: "Vrijthof Müdavimi" },
    jeker: { icon: "🏰", name: "Sur Bekçisi" },
    wyck: { icon: "🌉", name: "Wyck Geçişçisi" },
    sphinx: { icon: "🏭", name: "Sphinx Ustası" },
    sintpieter: { icon: "⛰️", name: "Mergel Madencisi" },
    cevre: { icon: "🚵", name: "Heuvelland Kâşifi" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "dominicanen", cat: "gor", area: "merkez", title: "Kilisenin içindeki kitapçıda kaybol",
      desc: "13. yüzyıldan kalma Dominiken kilisesi bugün Boekhandel Dominicanen: gotik tonozların altında üç katlı çelik bir kitaplık yükseliyor. Dünyanın en güzel kitapçıları listelerinin değişmez ismi.",
      tip: "En üst kata çık, tavandaki fresklere göz hizasından bak. Eski koro bölümünde kahve içiliyor.", q: "Boekhandel Dominicanen Maastricht", tags: ["ücretsiz", "yağmurda"] },
    { id: "helpoort", cat: "gor", area: "jeker", title: "Helpoort'un altından geç",
      desc: "1229 tarihli Helpoort (Cehennem Kapısı), Hollanda'da ayakta kalan en eski şehir kapısı. Yanından başlayan ilk sur hattı ve Jeker deresi şehrin en sakin köşesi.",
      tip: "Kapıdan sonra surların üstüne çık ve şehir parkına kadar duvar boyunca yürü.", q: "Helpoort Maastricht", tags: ["ücretsiz"] },
    { id: "servaasbrug", cat: "gor", area: "wyck", title: "Sint Servaasbrug'u yürüyerek geç",
      desc: "13. yüzyılın sonunda yapılan taş kemerli köprü, Hollanda'nın en eski köprüsü kabul ediliyor. Bir yakada eski şehir, diğer yakada Wyck mahallesi.",
      tip: "Wyck tarafından gün batımında geç: karşında kiliselerin kuleleri ve Maas üzerinde akşam ışığı olur.", q: "Sint Servaasbrug Maastricht", tags: ["ücretsiz"] },
    { id: "bonnefanten", cat: "gor", area: "wyck", title: "Bonnefanten'in roket kulesine gir",
      desc: "Aldo Rossi'nin tasarladığı müzenin Maas kıyısındaki çinko kubbeli kulesi şehrin modern simgesi. Eski seramik fabrikası arazisine kurulan Céramique mahallesinin de başlangıç noktası.",
      tip: "Uzun ve dik ana merdiveni çık, sonra kubbenin içine gir; boş mekânın kendisi bir eser gibi.", q: "Bonnefantenmuseum Maastricht", tags: ["yağmurda"] },
    { id: "sphinxpassage", cat: "gor", area: "sphinx", title: "Sphinx Passage'da karo karo tarih oku",
      desc: "Eski Sphinx seramik fabrikasının Eiffel binasındaki yaklaşık 120 metrelik geçidin duvarları, fabrikanın ve işçilerinin hikâyesini anlatan on binlerce karoyla kaplı. Maastricht'in sanayi geçmişinin açık hava albümü.",
      tip: "Girişi ücretsiz ve gün boyu açık. Fabrikada üretilen klozet ve lavaboların karolardaki resimlerini ara.", q: "De Sphinx Passage Maastricht", tags: ["ücretsiz", "yağmurda"] },
    { id: "thorn", cat: "gor", area: "cevre", title: "Beyaz kasaba Thorn'u dolaş",
      desc: "Bir zamanlar soylu kadınların yönettiği minik bir manastır devletinin merkezi. Bütün evleri beyaz badanalı; anlatılana göre Fransız döneminde pencere vergisinden kaçmak için örülen pencerelerin izini gizlemek için boyandılar.",
      tip: "Arnavut kaldırımlı sokakları yürü, sonra Abdijkerk'in bembeyaz barok içine gir.", q: "Abdijkerk Thorn" },
    { id: "roermond", cat: "gor", area: "cevre", title: "Roermond'da Munsterkerk'i gör",
      desc: "Çoğu kişi Roermond'a outlet için gelip eski şehri atlıyor. 13. yüzyıldan kalma Munsterkerk'i, Rijksmuseum'un mimarı Roermondlu Pierre Cuypers restore etti; içinde Gelre kontu ile eşinin mezar anıtı duruyor.",
      tip: "Cuypers'in evi ve atölyesi olan Cuypershuis müzesini de ekle; yazın Maasplassen göllerinde tekne turu var.", q: "Munsterkerk Roermond" },
    { id: "margraten", cat: "gor", area: "cevre", title: "Margraten'deki Amerikan mezarlığını ziyaret et",
      desc: "Hollanda'daki tek Amerikan askerî mezarlığında sekiz binden fazla asker yatıyor. Her mezarı bölgeden bir aile 'evlat edinmiş' durumda ve bu görev kuşaktan kuşağa devrediliyor.",
      tip: "Girişteki duvarlarda kayıp askerlerin adları yazılı; sessiz bir hafta içi sabahı seç.", q: "Netherlands American Cemetery Margraten", tags: ["ücretsiz"] },

    // YENİLECEK
    { id: "vogelstruys", cat: "ye", area: "merkez", title: "In den Ouden Vogelstruys'ta otur",
      desc: "Vrijthof'un köşesindeki bu kahve şehrin en eski içki mekânlarından. Loş ahşap içi, duvarlardaki eski fotoğrafları ve tezgâhtaki müdavimleriyle Maastricht'in oturma odası.",
      tip: "Yerel bir bira ve yanında bir porsiyon peynir ya da kuru sosis iste.", q: "In den Ouden Vogelstruys Maastricht", tags: ["yağmurda"] },
    { id: "preuvenemint", cat: "ye", area: "merkez", title: "Preuvenemint'te tadım yap",
      desc: "Ağustos sonunda Vrijthof birkaç günlüğüne dev bir açık hava sofrasına dönüşür. Şehrin restoranları küçük tabaklar sunar; adı Maastricht lehçesinde 'tatmak' anlamına gelen 'preuve'den gelir.",
      tip: "Ödeme jetonla yapılıyor; akşam kalabalığından önce, öğleden sonra git.", q: "Vrijthof Maastricht", months: [8] },
    { id: "bisschopsmolen", cat: "ye", area: "jeker", title: "Bisschopsmolen'de vlaai ye",
      desc: "Jeker deresinin çevirdiği çarkıyla hâlâ çalışan su değirmeninin içindeki fırın, kendi öğüttüğü kavuzlu buğdaydan (spelt) Limburg'un meşhur meyveli turtası vlaai'yi yapıyor.",
      tip: "Arka tarafa geç: dönen çarkı ve değirmen taşlarını görebilirsin. Kirazlı ya da kayısılı vlaai klasik.", q: "Bisschopsmolen Maastricht" },
    { id: "zoervleis", cat: "ye", area: "jeker", title: "Zoervleis'i patatesle dene",
      desc: "Maastricht'in ekşi tatlı et yahnisi: sirke, elma şurubu ve baharatlı kekle saatlerce pişer, geleneksel olarak at etinden yapılır. Yanında patates kızartması ve elma püresiyle gelir.",
      tip: "Café Sjiek şehirde bu yemekle bilinir; rezervasyon almadığı için erken git. At eti istemezsen dana versiyonunu sor.", q: "Café Sjiek Maastricht" },
    { id: "apostelhoeve", cat: "ye", area: "sintpieter", title: "Apostelhoeve'de Hollanda şarabı tat",
      desc: "Jeker vadisine bakan Louwberg yamacındaki Apostelhoeve, ülkenin en eski şarap üreticilerinden. Hollanda'da bağ olduğuna inanmayanlar için en iyi kanıt.",
      tip: "Tadım ve satış belirli günlerde; gitmeden internet sitesine bak. Jekerdal'dan yürüyerek ya da bisikletle çık.", q: "Wijngoed Apostelhoeve Maastricht" },
    { id: "gulpener", cat: "ye", area: "cevre", title: "Gulpen'de birayı kaynağında iç",
      desc: "Gulpener, 19. yüzyıldan beri aynı köyde üretim yapan bağımsız bir aile bira fabrikası ve arpasını, şerbetçiotunu çevredeki çiftçilerden alıyor.",
      tip: "Fabrikanın yanındaki BrouwLokaal'da tadım tahtası iste; Heuvelland bisiklet turunun ortasına iyi bir mola.", q: "Gulpener BrouwLokaal Gulpen" },

    // DENEYİM
    { id: "sintjan", cat: "dene", area: "merkez", title: "Sint-Jan'ın kırmızı kulesine çık",
      desc: "Vrijthof'taki iki kiliseden küçüğü olan Sint-Janskerk'in kan kırmızısı kulesi şehrin her yerinden görünür. Dar taş merdivenlerin sonunda Maastricht'in çatıları, Maas ve Sint-Pietersberg ayaklarının altında.",
      tip: "Kule sadece sezonda açık; gitmeden kontrol et. Yanındaki Sint-Servaasbasiliek'i de aynı gün gez.", q: "Sint-Janskerk Maastricht", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "carnaval", cat: "dene", area: "merkez", title: "Vastelaovend'de sokağa karış",
      desc: "Maastricht'te karnavalın adı Vastelaovend. Üç gün boyunca şehir kırmızı, sarı, yeşile bürünür; açılışta dev Mooswief (sebzeci kadın) kuklası Vrijthof'ta direğe çekilir ve bandolar sokak sokak gezer.",
      tip: "Kostümsüz gelme: basit bir şapka ve yüz boyası bile yeter. Markt'taki Mooswief heykeline de uğra.", q: "Vrijthof Maastricht", months: [2, 3], tags: ["ücretsiz"] },
    { id: "lumiere", cat: "dene", area: "sphinx", title: "Eski elektrik santralinde film izle",
      desc: "Lumière Cinema, Sphinx fabrikasının eski elektrik santralinde, 't Bassin iç limanının kıyısında. Sanat filmleri, tuğla duvarlar ve dev makinelerden kalan boşluklar.",
      tip: "Filmden önce içerideki restoranda ya da limana bakan terasta otur.", q: "Lumière Cinema Maastricht", tags: ["yağmurda"] },
    { id: "grotten", cat: "dene", area: "sintpieter", title: "Sint-Pietersberg'in altına in",
      desc: "Buradaki 'mağaralar' aslında yüzyıllar boyunca marn taşı (mergel) kesilerek açılmış kilometrelerce galeri. Duvarlarda kömürle yapılmış çizimler var; İkinci Dünya Savaşı'nda 'Gece Devriyesi' dahil müze tabloları bu tepenin içinde saklandı.",
      tip: "Sadece rehberle giriliyor ve içerisi yaz kış serin: ceket al. Tur Fort Sint Pieter'in yanından başlıyor; kalenin üstünden şehir manzarasına da bak.", q: "Grotten Noord Maastricht", tags: ["yağmurda"] },
    { id: "enci", cat: "dene", area: "sintpieter", title: "ENCI ocağına merdivenle in",
      desc: "Bir asra yakın çimento için kazılan dev marn ocağı kapandıktan sonra doğaya bırakıldı. Seyir platformundan turkuaz göle ve beyaz kayalıklara bakınca Hollanda'da olduğuna inanmak zor.",
      tip: "Uzun çelik merdivenle ocağın tabanına inebilirsin; dönüşte aynı basamakları çıkacağını unutma.", q: "ENCI-groeve Maastricht", tags: ["ücretsiz"] },
    { id: "kerststad", cat: "dene", area: "cevre", title: "Valkenburg'da mağarada Noel pazarı gez",
      desc: "Valkenburg her kış 'Kerststad'a dönüşür: Noel pazarları Gemeentegrot ve Fluweelengrot'un yer altı galerilerine kurulur. Marn duvarların arasında ışıklar ve tezgâhlar.",
      tip: "Hafta sonu sıra uzun olur; biletini önceden al, hafta içi git. Çıkınca Hollanda'nın tepe üstündeki tek kalesinin kalıntılarına bak.", q: "Gemeentegrot Valkenburg", months: [11, 12], tags: ["yağmurda"] },
    { id: "cauberg", cat: "dene", area: "cevre", title: "Cauberg'e bisikletle tırman",
      desc: "Valkenburg'dan yükselen bu kısa ama dik yokuş Hollanda bisiklet sporunun en ünlü rampası; her nisanda Amstel Gold Race buradan geçer. Düz ülkenin 'dağ' etabı.",
      tip: "Vitesi baştan küçült, en dik yer ortada. Tepeden sonra Heuvelland'ın köy yollarında devam et.", q: "Cauberg Valkenburg", tags: ["ücretsiz"] },
    { id: "drielandenpunt", cat: "dene", area: "cevre", title: "Vaals'ta üç ülkeye aynı anda bas",
      desc: "Vaalserberg'in tepesinde Hollanda, Belçika ve Almanya tek noktada buluşuyor; burası aynı zamanda Avrupa Hollandası'nın en yüksek yeri. Bir asır boyunca dördüncü bir ülke, minik Neutral Moresnet de buraya sınırdı.",
      tip: "Sınır taşının çevresinde tur at, sonra seyir kulelerinden birine çık. Vaals'tan ormanın içinden yürüyerek çıkmak arabayla gelmekten güzel.", q: "Drielandenpunt Vaals", tags: ["ücretsiz"] }
  ]
};
