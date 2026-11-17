// Brugge ve sahil görevleri (Damme, Oostende, De Haan, Knokke/Zwin, Ieper ve Westhoek dahil).
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.brugge = {
  id: "brugge",
  name: "Brugge",
  subtitle: "ve sahil",
  country: "Belçika",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Bruggeling", "Brugse Zot"],
  areas: {
    merkez: "Markt & Burg",
    guney: "Begijnhof & Minnewater",
    anna: "Sint-Anna & değirmenler",
    kuzey: "Hanze mahallesi & Sint-Gillis",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[51.190, 3.200], [51.228, 3.250]],
  coords: {
    belfort: [51.2082, 3.2249], heiligbloed: [51.2083, 3.2266], processie: [51.2088, 3.2242], garre: [51.2084, 3.2258],
    rozenhoedkaai: [51.2071, 3.2270], dumon: [51.2095, 3.2237],
    begijnhof: [51.2012, 3.2227], halvemaan: [51.2026, 3.2243], madonna: [51.2047, 3.2244],
    molens: [51.2166, 3.2387], vlissinghe: [51.2124, 3.2305], kant: [51.2127, 3.2339],
    hanze: [51.2114, 3.2268], langerei: [51.2185, 3.2287],
    damme: [51.2517, 3.2817], garnaal: [51.2325, 2.9225], kusttram: [51.2284, 2.9262], dehaan: [51.2729, 3.0343],
    zwin: [51.3625, 3.3495], lastpost: [50.8520, 2.8911], westvleteren: [50.8957, 2.7213]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🔔", name: "Belfort Bekçisi" },
    guney: { icon: "🦢", name: "Minnewater Kuğusu" },
    anna: { icon: "🌬️", name: "Değirmenci" },
    kuzey: { icon: "⚖️", name: "Hanze Tüccarı" },
    cevre: { icon: "🌊", name: "Sahil Kâşifi" }
  },
  quests: [
    // ───────────── GÖRÜLECEK ─────────────
    { id: "heiligbloed", cat: "gor", area: "merkez", title: "Kutsal Kan Bazilikası'nın iki katını gez",
      desc: "Burg meydanının köşesindeki küçük bazilika, Haçlı Seferleri'nden getirildiğine inanılan kutsal kan emanetini saklıyor. Altta loş bir Romanesk şapel, üstte rengârenk bir neogotik salon var.",
      tip: "Çoğu ziyaretçi sadece üst kata çıkar; alt kattaki Sint-Basilius şapeline de gir.", q: "Basiliek van het Heilig Bloed Brugge", tags: ["yağmurda"] },
    { id: "rozenhoedkaai", cat: "gor", area: "merkez", title: "Rozenhoedkaai'ye sabah erken git",
      desc: "Belfort'un, kanalın ve eğik çatıların aynı kareye girdiği, şehrin en çok fotoğraflanan köşesi. Kalabalık gelmeden önce bambaşka bir yer.",
      tip: "Gün doğarken ya da akşam ışıkları yandıktan sonra git; gündüz hâlini zaten biliyorsun.", q: "Rozenhoedkaai Brugge", tags: ["ücretsiz"] },
    { id: "begijnhof", cat: "gor", area: "guney", title: "Begijnhof'ta sessizce yürü",
      desc: "13. yüzyılda kurulan, beyaz evlerin çevrelediği avlu bir zamanlar dindar kadınların (begijnen) kendi kendini yöneten mahallesiydi. Bugün Benedikten rahibeleri yaşıyor ve sessizlik kuralı hâlâ geçerli.",
      tip: "Mart sonunda avludaki çimen nergislerle kaplanır; çıkışta Minnewater gölünün köprüsüne yürü.", q: "Begijnhof Brugge", tags: ["ücretsiz"] },
    { id: "madonna", cat: "gor", area: "guney", title: "Michelangelo'nun Madonna'sını gör",
      desc: "Onze-Lieve-Vrouwekerk'teki mermer 'Meryem ve Çocuk', Michelangelo'nun sağlığında İtalya dışına çıkan tek heykeli; Brugge'li tüccarlar satın alıp getirdi. Kilisenin tuğla kulesi dünyanın en yükseklerinden.",
      tip: "Heykel müze bölümünde; aynı yerde Burgonya düklerinin süslü mezarları da var.", q: "Onze-Lieve-Vrouwekerk Brugge", tags: ["yağmurda"] },
    { id: "molens", cat: "gor", area: "anna", title: "Surlardaki yel değirmenlerini say",
      desc: "Eski şehir surunun toprak seti Kruisvest üzerinde dört yel değirmeni sıralanıyor. Bir zamanlar surların üzerinde yirmiden fazlası dönüyordu.",
      tip: "Sint-Janshuismolen sezonda ziyarete açık ve hâlâ un öğütüyor. Setin üzerindeki yol bisikletle de güzel.", q: "Sint-Janshuismolen Brugge", tags: ["ücretsiz"] },
    { id: "hanze", cat: "gor", area: "kuzey", title: "Jan van Eyckplein'da tüccarların izini sür",
      desc: "Brugge'nin altın çağında gemiler buraya kadar gelirdi: gümrük binası Tolhuis, tüccar kulübü Poortersloge ve çevrede yabancı tüccar topluluklarının adını taşıyan sokaklar.",
      tip: "Spiegelrei boyunca yürü, sonra Oosterlingenplein ve Spanjaardstraat tabelalarını ara.", q: "Jan van Eyckplein Brugge", tags: ["ücretsiz"] },
    { id: "dehaan", cat: "gor", area: "cevre", title: "De Haan'ın Belle Époque villaları",
      desc: "Belçika sahilinde yüksek apartmanlardan kurtulmuş nadir kasaba: kıvrımlı sokaklarda 1900'lerin beyaz villaları ve masal gibi bir tramvay istasyonu. Einstein 1933'te aylarca burada kaldı.",
      tip: "Sahil tramvayında 'De Haan aan Zee' durağında in, Concessie mahallesinde dolaş ve bankta oturan Einstein heykelini bul.", q: "Tramstation De Haan aan Zee", tags: ["ücretsiz"] },

    // ───────────── YENİLECEK ─────────────
    { id: "garre", cat: "ye", area: "merkez", title: "De Garre'nin gizli sokağını bul",
      desc: "Markt ile Burg arasındaki Breidelstraat'tan açılan, şehrin en dar sokaklarından birinin dibinde Staminee De Garre var. Evin kendi tripel birası sadece burada, bir parça peynirle servis ediliyor.",
      tip: "Bira çok güçlü; yukarı kattaki ahşap galeride otur ve acele etme.", q: "Staminee De Garre Brugge", tags: ["yağmurda"] },
    { id: "dumon", cat: "ye", area: "merkez", title: "Aile işi bir çikolatacıdan pralin seç",
      desc: "Brugge'de vitrinler çikolata dolu ama hepsi yerinde yapılmıyor. Dumon gibi aile işletmeleri pralinlerini hâlâ kendi atölyesinde üretiyor.",
      tip: "Eiermarkt'taki küçük dükkânda kutu yerine tek tek seç; satıcıya hangisinin o hafta yapıldığını sor.", q: "Chocolatier Dumon Eiermarkt Brugge" },
    { id: "halvemaan", cat: "ye", area: "guney", title: "Boru hattıyla taşınan birayı kaynağında iç",
      desc: "De Halve Maan, tarihi merkezde kalan aile bira fabrikası. Tankerler dar sokaklara giremediği için bira, şehrin altından geçen üç kilometrelik bir boru hattıyla şişeleme tesisine akıyor. Brugse Zot burada doğdu.",
      tip: "Tur çatıdaki manzarayla bitiyor; avluda filtrelenmemiş Brugse Zot sadece burada içilebiliyor.", q: "Brouwerij De Halve Maan Brugge", tags: ["yağmurda"] },
    { id: "vlissinghe", cat: "ye", area: "anna", title: "1515'ten beri açık kafede otur",
      desc: "Café Vlissinghe beş yüz yılı aşkın süredir aynı yerde ve Brugge'nin en eski kafesi sayılıyor. Koyu ahşap paneller, eski tablolar ve ortada kocaman bir soba.",
      tip: "Yazın arka bahçede pétanque oynanıyor; haftanın bazı günleri kapalı, önceden bak.", q: "Café Vlissinghe Brugge", tags: ["yağmurda"] },
    { id: "garnaal", cat: "ye", area: "cevre", title: "Oostende'de gri karides ye",
      desc: "Kuzey Denizi'nin küçük gri karidesi Belçika sahilinin gururu. Oostende'de balıkçı rıhtımındaki Vistrap tezgâhlarında taze ayıklanmışını, restoranlarda kroketini (garnaalkroketten) bulursun.",
      tip: "Visserskaai boyunca yürü; kroketin yanına kızarmış maydanoz ve limon gelmesi gerekir.", q: "Vistrap Visserskaai Oostende" },
    { id: "westvleteren", cat: "ye", area: "cevre", title: "Manastırın karşısında Westvleteren iç",
      desc: "Sint-Sixtus manastırının keşişleri dünyanın en çok aranan biralarından birini sadece ihtiyaçları kadar üretiyor ve neredeyse hiç dağıtmıyor. Onu sorunsuzca içebileceğin yer, manastırın tam karşısındaki In de Vrede kafesi.",
      tip: "Kafenin kapalı günleri var, önceden bak. Şoför olmayanlar için: 12 numara en koyu ve en güçlüsü.", q: "In de Vrede Westvleteren" },

    // ───────────── DENEYİM ─────────────
    { id: "belfort", cat: "dene", area: "merkez", title: "Belfort'un 366 basamağını tırman",
      desc: "Markt'taki 83 metrelik çan kulesi ortaçağda şehrin hazinesini ve imtiyaz belgelerini korurdu. Yukarıda 47 çanlı carillon ve bütün Brugge'nin çatıları seni bekliyor.",
      tip: "Bilet saatli ve merdiven dar; ilk seansı ayırt. Carillon çalarken meydanda olmak da ayrı güzel.", q: "Belfort Brugge" },
    { id: "processie", cat: "dene", area: "merkez", title: "Kutsal Kan Alayı'nı izle",
      desc: "Her yıl Göğe Yükseliş Günü'nde kutsal emanet, ortaçağ kostümleri giymiş yüzlerce Brugge'liyle birlikte sokaklarda dolaştırılıyor. Yüzyıllardır süren gelenek UNESCO'nun somut olmayan miras listesinde.",
      tip: "Tarih Paskalya'ya göre değişir, çoğunlukla mayısta. Tribün bileti almadan da güzergâh boyunca ayakta izlenir.", q: "Heilig Bloedprocessie Markt Brugge", months: [5, 6], tags: ["ücretsiz"] },
    { id: "kant", cat: "dene", area: "anna", title: "Dantelcilerin parmaklarını izle",
      desc: "Brugge danteli kopanaki tekniğiyle, onlarca tahta makaranın çaprazlanmasıyla örülüyor. Kantcentrum'da ustalar bunu gözünün önünde yapıyor.",
      tip: "Gösteriler öğleden sonra; hemen yanındaki tuhaf kuleli Jeruzalemkerk'i de gez.", q: "Kantcentrum Brugge", tags: ["yağmurda"] },
    { id: "langerei", cat: "dene", area: "kuzey", title: "Langerei boyunca kuzeye yürü",
      desc: "Turist tekneleri Jan van Eyckplein'da geri döner; ondan sonrası Brugge'lilerin. Langerei kanalı boyunca sessiz evler, küçük köprüler ve Sint-Gillis mahallesi uzanıyor.",
      tip: "Dampoort'a kadar yürü, dönüşte Potterierei tarafını kullan.", q: "Langerei Brugge", tags: ["ücretsiz"] },
    { id: "damme", cat: "dene", area: "cevre", title: "Kavaklı kanal boyunca Damme'ye pedalla",
      desc: "Damse Vaart kanalı, rüzgârdan eğilmiş kavakların arasında Brugge'yi bir zamanlar şehrin dış limanı olan Damme'ye bağlıyor. Küçük kasaba bugün bir kitap köyü ve Tijl Uilenspiegel'in memleketi.",
      tip: "Yaklaşık yedi kilometre, dümdüz. Sezonda aynı yolu Lamme Goedzak teknesi de yapıyor.", q: "Damme Markt", tags: ["ücretsiz"] },
    { id: "kusttram", cat: "dene", area: "cevre", title: "Sahil tramvayına bin",
      desc: "Kusttram, De Panne'den Knokke'ye bütün Belçika sahilini 67 kilometre boyunca kat ediyor ve dünyanın en uzun tramvay hattı sayılıyor. Yer yer kumulların ve denizin hemen yanından geçiyor.",
      tip: "Günlük bilet al, canının istediği durakta in. Oostende istasyonu Brugge'den trenle gelenler için en kolay başlangıç.", q: "Kusttram Oostende Station" },
    { id: "zwin", cat: "dene", area: "cevre", title: "Zwin'de kuşları izle",
      desc: "Brugge'yi denize bağlayan ve ortaçağda zengin eden deniz kolu Zwin kumla dolunca şehrin altın çağı bitti. Geriye Knokke'nin ucunda gelgitle dolup boşalan bir tuzlu bataklık ve binlerce göçmen kuş kaldı.",
      tip: "Zwin Natuur Park'tan gir; leylek yuvalarına bak. Yaz sonunda bataklık deniz lavantasıyla mora döner.", q: "Zwin Natuur Park Knokke-Heist" },
    { id: "lastpost", cat: "dene", area: "cevre", title: "Ieper'de Last Post'u dinle",
      desc: "Menenpoort anıtının altında 1928'den beri her akşam saat sekizde borazancılar Birinci Dünya Savaşı'nda kaybolan askerler için Last Post'u çalıyor. Duvarlarda mezarı bilinmeyen on binlerce askerin adı yazılı.",
      tip: "Yarım saat erken gel. Gündüzü In Flanders Fields Museum ve Passendale yakınındaki Tyne Cot mezarlığıyla doldur.", q: "Menenpoort Ieper", tags: ["ücretsiz"] }
  ]
};
