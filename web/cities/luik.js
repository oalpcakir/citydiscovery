// Liège ve Ardenler görevleri (Namur, Dinant, Spa, Durbuy, Hautes Fagnes, Bouillon, Han-sur-Lesse dahil).
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.luik = {
  id: "luik",
  name: "Liège",
  subtitle: "ve Ardenler",
  country: "Belçika",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Liégeois", "Vrai Tchantchès"],
  areas: {
    merkez: "Merkez",
    tepeler: "Hors-Château & Coteaux",
    outremeuse: "Outremeuse",
    guillemins: "Guillemins & Boverie",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[50.615, 5.545], [50.660, 5.600]],
  coords: {
    perron: [50.6456, 5.5741], boulets: [50.6458, 5.5747], gaufre: [50.6463, 5.5752], peket: [50.6451, 5.5753],
    batte: [50.6468, 5.5795], lacquemant: [50.6365, 5.5665],
    bueren: [50.6478, 5.5771], nocturne: [50.6474, 5.5785], fonts: [50.6481, 5.5826],
    tchantches: [50.6403, 5.5830], aout: [50.6398, 5.5845],
    guillemins: [50.6244, 5.5666], boverie: [50.6282, 5.5765],
    namur: [50.4597, 4.8630], couque: [50.2588, 4.9117], spa: [50.4923, 5.8655], durbuy: [50.3523, 5.4563],
    fagnes: [50.5013, 6.0932], bouillon: [49.7933, 5.0647], han: [50.1253, 5.1868], blegny: [50.6862, 5.7235]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🧇", name: "Cité Ardente" },
    tepeler: { icon: "🪜", name: "Bueren Fatihi" },
    outremeuse: { icon: "🎭", name: "Tchantchès'in Dostu" },
    guillemins: { icon: "🚄", name: "Meuse Yolcusu" },
    cevre: { icon: "🌲", name: "Arden Kâşifi" }
  },
  quests: [
    // ───────────── GÖRÜLECEK ─────────────
    { id: "perron", cat: "gor", area: "merkez", title: "Le Perron'un önünde dur",
      desc: "Place du Marché'deki çeşmenin üzerinde yükselen sütun, Liège'in yüzyıllarca bir prens-piskopos tarafından yönetilen bağımsız bir devlet olduğu günlerden kalan özgürlük simgesi. Şehrin armasında da o var.",
      tip: "Cesur Charles 1468'de şehri cezalandırırken sütunu söküp Brugge'ye götürmüştü; hemen arkadaki prens-piskoposlar sarayının avlusuna da göz at.", q: "Le Perron Place du Marché Liège", tags: ["ücretsiz"] },
    { id: "fonts", cat: "gor", area: "tepeler", title: "Saint-Barthélemy'nin vaftiz teknesini gör",
      desc: "12. yüzyılda tek parça pirinçten dökülen vaftiz teknesi ortaçağ Maas sanatının başyapıtı sayılıyor ve küçük öküz heykellerinin sırtında duruyor. Belçika'nın yedi harikasından biri diye anılır.",
      tip: "Kilisenin kırmızı-beyaz boyalı dış cephesi de şehrin en fotojenik yapılarından; Hors-Château caddesinden yürüyerek gel.", q: "Collégiale Saint-Barthélemy Liège", tags: ["yağmurda"] },
    { id: "tchantches", cat: "gor", area: "outremeuse", title: "Tchantchès ile tanış",
      desc: "Kocaman burunlu, mavi önlüklü, inatçı ama altın kalpli kukla Tchantchès gerçek Liège'linin simgesi. Efsaneye göre Outremeuse'de iki kaldırım taşının arasında doğdu.",
      tip: "Musée Tchantchès'te geleneksel çubuk kukla gösterileri sezonluk yapılıyor ve dili Fransızca ile Valonca; programa önceden bak.", q: "Musée Tchantchès Liège", tags: ["yağmurda"] },
    { id: "guillemins", cat: "gor", area: "guillemins", title: "Guillemins garının altında yürü",
      desc: "Santiago Calatrava'nın tasarladığı garın cephesi yok: çelik ve camdan dev beyaz bir kubbe peronların üzerine dalga gibi kapanıyor. Hızlı trenler buradan geçiyor.",
      tip: "Arka taraftaki tepeye çıkan yaya geçidinden gara yukarıdan bak; güneşli bir günde gölgeler ayrı bir gösteri.", q: "Gare de Liège-Guillemins", tags: ["ücretsiz", "yağmurda"] },
    { id: "boverie", cat: "gor", area: "guillemins", title: "Yaya köprüsünden La Boverie'ye geç",
      desc: "Gardan çıkıp Meuse'ü 'La Belle Liégeoise' yaya köprüsüyle geçince kendini nehrin ortasındaki adada, bir parkın içinde buluyorsun. 1905 Dünya Fuarı'ndan kalan sarayda şehrin güzel sanatlar müzesi var.",
      tip: "Müzeye girmesen de parkın ucundaki gül bahçesine ve nehir kıyısına kadar yürü.", q: "La Boverie Liège", tags: ["ücretsiz"] },
    { id: "namur", cat: "gor", area: "cevre", title: "Namur kalesinden iki nehre bak",
      desc: "Sambre ile Meuse'ün birleştiği kayalığın üzerindeki kale Avrupa'nın en büyüklerinden. Kilometrelerce yeraltı galerisi yüzünden Napolyon'un ona 'Avrupa'nın termit yuvası' dediği anlatılır.",
      tip: "Şehir merkezinden teleferikle çık, yürüyerek in; surlardaki altın kaplumbağa heykelini bul.", q: "Citadelle de Namur" },
    { id: "durbuy", cat: "gor", area: "cevre", title: "Durbuy'un taş sokaklarında kaybol",
      desc: "Ourthe nehrinin kıvrımındaki Durbuy, 14. yüzyılda aldığı şehir unvanına dayanarak kendine 'dünyanın en küçük şehri' diyor. Arnavut kaldırımlı birkaç sokak, bir şato ve tepesinde kıvrılmış dev bir kaya.",
      tip: "Hafta sonu çok kalabalık; hafta içi ya da kışın git. Şekilli budanmış ağaçların parkına da uğra.", q: "Durbuy Vieille Ville" },
    { id: "bouillon", cat: "gor", area: "cevre", title: "Bouillon şatosunun surlarında yürü",
      desc: "Semois nehrinin dar bir kıvrımına kurulu kale, Birinci Haçlı Seferi'nin önderi Godefroy de Bouillon'un. Sefere para bulmak için kaleyi Liège prens-piskoposuna devretmişti.",
      tip: "Sezonda avluda yırtıcı kuş gösterisi yapılıyor; kasabanın karşısındaki tepeden kalenin tamamını gör.", q: "Château de Bouillon" },

    // ───────────── YENİLECEK ─────────────
    { id: "gaufre", cat: "ye", area: "merkez", title: "Sıcak bir Liège gofreti ye",
      desc: "Gerçek gaufre de Liège yoğun, mayalı bir hamurdan yapılır; içindeki iri inci şekeri ütüde eriyip karamelleşir. Üzerine hiçbir şey konmadan, elde yenir.",
      tip: "Rue des Mineurs'deki Une Gaufrette Saperlipopette'te tarçınlısını dene; kuyruk varsa doğru yerdesin.", q: "Une Gaufrette Saperlipopette Liège" },
    { id: "boulets", cat: "ye", area: "merkez", title: "Boulets à la liégeoise sipariş et",
      desc: "İki büyük köfte, patates kızartması ve tatlı-ekşi koyu bir sos: şehrin milli yemeği. 'Sauce lapin' adını tavşandan değil bir Madame Lapin'den alır ve içinde elma-armut pekmezi sirop de Liège vardır.",
      tip: "Place du Marché çevresindeki brasserie'lerin çoğunda menüde 'boulets-frites' bulunur; yanına elma püresi iste.", q: "Place du Marché Liège", tags: ["yağmurda"] },
    { id: "peket", cat: "ye", area: "merkez", title: "Maison du Pékèt'te pékèt tat",
      desc: "Pékèt, Valonya'nın ardıç aromalı içkisi; Liège'de küçük bardaklarda, sade ya da onlarca meyve aromasıyla içilir. Eski taş evlerdeki Maison du Pékèt şehrin bu işteki adresi.",
      tip: "Belediye binasının hemen arkasında. Önce sade olanı, sonra bir meyvelisini dene.", q: "La Maison du Peket Liège", tags: ["yağmurda"] },
    { id: "lacquemant", cat: "ye", area: "merkez", title: "Foire d'octobre'da lacquemant ye",
      desc: "Ülkenin en eski panayırlarından biri her sonbahar haftalarca Boulevard d'Avroy boyunca kuruluyor. Panayırın tatlısı lacquemant: ortadan açılıp portakal çiçeği kokulu şurupla doldurulan ince bir gofret.",
      tip: "Ekim başından kasım ortasına kadar sürer. Şurup akar, peçeteyi fazla al.", q: "Foire d'octobre Boulevard d'Avroy Liège", months: [10, 11] },
    { id: "couque", cat: "ye", area: "cevre", title: "Dinant'ta bir couque al",
      desc: "Couque de Dinant sadece un ve baldan yapılır, oyma ahşap kalıplarda şekillendirilir ve taş gibi serttir. Isırılmaz: küçük parçalar koparılıp ağızda eritilir.",
      tip: "Rue Grande'daki Maison Jacobs vitrinindeki kalıplara bak. Sonra saksofonun mucidi Adolphe Sax'ın evine ve kayalıktaki kaleye çık.", q: "Couques de Dinant Jacobs Dinant" },

    // ───────────── DENEYİM ─────────────
    { id: "bueren", cat: "dene", area: "tepeler", title: "Montagne de Bueren'in 374 basamağını çık",
      desc: "Dağ değil, dümdüz göğe çıkan bir merdiven: 19. yüzyılda kaledeki askerlerin şehre hızlı inmesi için yapıldı. Basamakların iki yanında hâlâ insanlar oturuyor.",
      tip: "Tepede sola dön, Coteaux de la Citadelle patikalarından terasların arasından in.", q: "Montagne de Bueren Liège", tags: ["ücretsiz"] },
    { id: "nocturne", cat: "dene", area: "tepeler", title: "Mum ışığında Nocturne des Coteaux",
      desc: "Ekimin ilk cumartesi akşamı Bueren merdivenleri, Hors-Château'nun çıkmaz sokakları ve yamaçtaki bahçeler binlerce mumla aydınlatılıyor. Şehrin normalde kapalı avluları o gece açık.",
      tip: "Çok kalabalık olur; erken gel ve ana merdiven yerine yan çıkmazlardan (impasses) başla.", q: "Hors-Château Liège", months: [10], tags: ["ücretsiz"] },
    { id: "batte", cat: "dene", area: "merkez", title: "Pazar sabahı La Batte'yi baştan sona yürü",
      desc: "Meuse rıhtımı boyunca uzanan La Batte, ülkenin en eski ve en uzun pazarlarından: peynir, tavuk, kumaş, kitap, canlı hayvan. Hollanda ve Almanya'dan bile gelen var.",
      tip: "Pazar sabahları kuruluyor, öğleden sonra toplanıyor. Bir külah sıcak yiyecek al ve nehir tarafından yürü.", q: "Marché de la Batte Liège", tags: ["ücretsiz"] },
    { id: "aout", cat: "dene", area: "outremeuse", title: "15 Ağustos'ta Outremeuse'e geç",
      desc: "Nehrin öbür yakasındaki mahalle kendini 'Özgür Outremeuse Cumhuriyeti' ilan etmiş durumda ve 15 Ağustos'ta bunu kutluyor: Siyah Meryem alayı, dev kuklalar, sokak konserleri ve bolca pékèt.",
      tip: "Ertesi gün yapılan, bir jambon kemiğinin gömüldüğü şaka cenaze töreni 'Matî l'Ohê'yi de kaçırma.", q: "Rue Puits-en-Sock Liège", months: [8], tags: ["ücretsiz"] },
    { id: "spa", cat: "dene", area: "cevre", title: "Spa'da kaynaktan su iç",
      desc: "Dünyadaki bütün 'spa'lar adını bu Arden kasabasından alıyor; Avrupa'nın büyük kaplıca kentleriyle birlikte UNESCO listesinde. Pouhon Pierre le Grand kaynağı, burada şifa arayan Rus çarı Büyük Petro'nun adını taşıyor.",
      tip: "Demirli suyun tadına hazırlıklı ol. Füniküler ile tepedeki termal havuzlara çık ya da ormandaki kaynak yürüyüşünü yap.", q: "Pouhon Pierre le Grand Spa" },
    { id: "fagnes", cat: "dene", area: "cevre", title: "Hautes Fagnes'ta tahta yoldan yürü",
      desc: "Belçika'nın çatısı: turbalıklar, sis ve ufka kadar uzanan boş bir plato. Ülkenin en yüksek noktası Signal de Botrange 694 metrede ve bataklığın üzerinden ahşap yürüyüş yolları geçiyor.",
      tip: "Kışın kar tutan ilk yer burası. Yangın riski olduğunda kırmızı bayrak çekilir ve patikalar kapanır; yola çıkmadan kontrol et.", q: "Signal de Botrange", tags: ["ücretsiz"] },
    { id: "han", cat: "dene", area: "cevre", title: "Han mağaralarına eski tramvayla git",
      desc: "Lesse nehri Han-sur-Lesse'de bir tepenin altına girip kayboluyor ve öbür taraftan çıkıyor; arada Avrupa'nın en etkileyici mağara sistemlerinden biri var. Girişe köyden kalkan asırlık bir tramvay götürüyor.",
      tip: "İçerisi yıl boyu serin, yanına bir kat al. Aynı biletle gezilen yaban hayatı parkına da vakit ayır.", q: "Grottes de Han Han-sur-Lesse", tags: ["yağmurda"] },
    { id: "blegny", cat: "dene", area: "cevre", title: "Blegny-Mine'da madene in",
      desc: "Liège'i sanayi devi yapan kömürdü. Blegny'deki ocak UNESCO listesindeki dört Valon maden alanından biri ve ziyaretçilerin kafesle gerçek galerilere inebildiği nadir yerlerden.",
      tip: "Turlar rehberli ve saatli, önceden yer ayırt. Yeraltı serin ve nemli; kapalı ayakkabı giy.", q: "Blegny-Mine", tags: ["yağmurda"] }
  ]
};
