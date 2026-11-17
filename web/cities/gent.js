// Gent ve çevresi görevleri (Oudenaarde, Flaman Ardenleri, Laarne, Aalst, Leie boyu dahil).
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.gent = {
  id: "gent",
  name: "Gent",
  subtitle: "ve çevresi",
  country: "Belçika",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Stroppendrager", "Echte Gentenaar"],
  areas: {
    merkez: "Tarihi merkez",
    patershol: "Patershol & Prinsenhof",
    guney: "Kouter & sanat mahallesi",
    dogu: "Portus Ganda",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[51.025, 3.690], [51.075, 3.760]],
  coords: {
    lamgods: [51.0530, 3.7272], gravensteen: [51.0573, 3.7206], werregaren: [51.0553, 3.7246], lantaarn: [51.0569, 3.7214],
    neuzen: [51.0558, 3.7223], graslei: [51.0546, 3.7208], feesten: [51.0566, 3.7283], dullegriet: [51.0569, 3.7262],
    waterzooi: [51.0583, 3.7228], prinsenhof: [51.0583, 3.7168],
    stam: [51.0437, 3.7177], vooruit: [51.0478, 3.7277], kouter: [51.0503, 3.7241],
    baafsabdij: [51.0539, 3.7363], vaneyck: [51.0545, 3.7352], gruut: [51.0575, 3.7302],
    kwaremont: [50.7819, 3.5260], mattentaart: [50.7727, 3.8822], laarne: [51.0280, 3.8387], aalst: [50.9384, 4.0390],
    latem: [51.0056, 3.6032], liefmans: [50.8465, 3.6159]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🏰", name: "Kuip Kurdu" },
    patershol: { icon: "🪢", name: "Stroppendrager" },
    guney: { icon: "💐", name: "Kouter Müdavimi" },
    dogu: { icon: "⛵", name: "Portus Ganda Kaptanı" },
    cevre: { icon: "🚴", name: "Flandrien" }
  },
  quests: [
    // ───────────── GÖRÜLECEK ─────────────
    { id: "lamgods", cat: "gor", area: "merkez", title: "Lam Gods'un eksik panelini bul",
      desc: "Van Eyck kardeşlerin 1432'de tamamladığı 'Kuzuya Tapınma' altar tablosu, yapıldığı kilisede, Sint-Baafskathedraal'de duruyor. 'Adil Yargıçlar' paneli 1934'te çalındı ve hâlâ bulunamadı; gördüğün bir kopya.",
      tip: "Bilet saatli; önceden al. Restore edilmiş kuzunun insan gibi bakan gözlerine yakından bak.", q: "Sint-Baafskathedraal Gent", tags: ["yağmurda"] },
    { id: "gravensteen", cat: "gor", area: "merkez", title: "Gravensteen'in surlarına çık",
      desc: "Flandre kontlarının 12. yüzyıl kalesi şehrin tam ortasında, hendeğiyle birlikte duruyor. 1949'da öğrenciler bira zammını protesto etmek için kaleyi işgal etmişti; Gent hâlâ bununla övünür.",
      tip: "Sesli rehberi atlama: bir komedyen anlatıyor ve müze rehberi gibi değil. Surlardan üç kulenin sıralanışına bak.", q: "Gravensteen Gent" },
    { id: "werregaren", cat: "gor", area: "merkez", title: "Graffiti sokağından geç",
      desc: "Werregarenstraat'ın duvarlarına boya sıkmak serbest; dar geçit yıllardır şehrin yasal tuvali ve her geçişinde başka görünüyor.",
      tip: "Hoogpoort ile Onderstraat arasında. Geçen ay çektiğin fotoğrafla bugünküne bak.", q: "Werregarenstraat Gent", tags: ["ücretsiz"] },
    { id: "lantaarn", cat: "gor", area: "merkez", title: "Bebek doğunca yanan lambaları bekle",
      desc: "Sint-Veerleplein'daki sokak lambaları şehrin doğumhanelerine bağlı: Gent'te bir bebek doğduğunda ebeveynler düğmeye basıyor ve lambalar yavaşça yanıp sönüyor. Alberto Garutti'nin 'Ai Nati Oggi' adlı eseri.",
      tip: "Hava karardıktan sonra meydandaki bir terasta otur ve gözünü lambalardan ayırma.", q: "Sint-Veerleplein Gent", tags: ["ücretsiz"] },
    { id: "prinsenhof", cat: "gor", area: "patershol", title: "Prinsenhof'ta ilmekli adamı bul",
      desc: "V. Karl 1500'de burada doğdu; 1540'ta ise isyan eden Gentlileri boyunlarında ilmekle yürüttü. Gentliler o günden beri kendilerine gururla 'stroppendragers' (ilmek taşıyanlar) diyor.",
      tip: "Saraydan geriye kalan tek parça Donkere Poort kapısı; ilmekli heykel hemen yakınındaki küçük meydanda.", q: "Prinsenhof Gent", tags: ["ücretsiz"] },
    { id: "stam", cat: "gor", area: "guney", title: "STAM'da Gent'in üstünde yürü",
      desc: "Eski Bijloke manastırındaki şehir müzesinin ilk salonunda Gent'in dev hava fotoğrafı zemine serili: üzerinde yürüyerek kendi sokağını arıyorsun.",
      tip: "Galoşları giyip önce kendi evini, sonra şehrin eski su yollarını bul.", q: "STAM Stadsmuseum Gent", tags: ["yağmurda"] },
    { id: "baafsabdij", cat: "gor", area: "dogu", title: "Sint-Baafsabdij'in yıkıntılarına gir",
      desc: "Gent, Leie ile Schelde'nin birleştiği bu noktada, 7. yüzyılda kurulan manastırın çevresinde doğdu. V. Karl 1540'ta cezalandırdığı şehrin manastırını da yıktırıp yerine kale yaptırdı; geriye sessiz bir yıkıntı bahçesi kaldı.",
      tip: "Sadece belirli günlerde, çoğunlukla sıcak aylarda açık; gitmeden kontrol et.", q: "Sint-Baafsabdij Gent", tags: ["ücretsiz"] },
    { id: "laarne", cat: "gor", area: "cevre", title: "Laarne'nin hendekli şatosu",
      desc: "Gent'in birkaç kilometre doğusunda, suyla çevrili ortaçağ kalesi: köşe kuleleri, taş köprüsü ve içinde ünlü bir gümüş koleksiyonu.",
      tip: "İçi sınırlı günlerde ziyarete açık; kapalıysa hendeğin çevresindeki yürüyüş de değer.", q: "Kasteel van Laarne" },

    // ───────────── YENİLECEK ─────────────
    { id: "neuzen", cat: "ye", area: "merkez", title: "Groentenmarkt'ta Gentse neuzen al",
      desc: "Dışı sert, içi akışkan, ahududu aromalı mor koniler: cuberdon ya da Gent ağzıyla 'neuzekes' (burunlar). Birkaç haftada şekerlendiği için uzağa gönderilemiyor, taze yenmesi gerek.",
      tip: "Meydanda yan yana duran el arabalarının rekabeti şehirde 'burun savaşı' diye bilinir. Aynı meydandaki Tierenteyn-Verlent'ten fıçıdan doldurulan hardalı da al.", q: "Groentenmarkt Gent" },
    { id: "waterzooi", cat: "ye", area: "patershol", title: "Patershol'de Gentse waterzooi ye",
      desc: "Gent'in kendi yemeği: sebzeli, kremalı, çorba ile güveç arası bir kap. Aslı Leie ve Schelde'nin balıklarıyla yapılırdı; bugün çoğunlukla tavukla geliyor.",
      tip: "Patershol'ün ortaçağdan kalma dar sokaklarındaki restoranlarda menüde 'Gentse waterzooi' ara; balıklısını bulursan onu dene.", q: "Patershol Gent" },
    { id: "vooruit", cat: "ye", area: "guney", title: "Vooruit'un kafesinde bir şey iç",
      desc: "1913'te sosyalist kooperatifin işçiler için yaptırdığı 'halk sarayı': balo salonu, tiyatro ve dev bir kafe. Bugün VIERNULVIER adlı sanat merkezi ama Gentliler hâlâ Vooruit der.",
      tip: "Öğrencilerin ders çalıştığı yüksek tavanlı kafede otur, sonra akşam programına bak.", q: "VIERNULVIER Vooruit Sint-Pietersnieuwstraat Gent", tags: ["yağmurda"] },
    { id: "kouter", cat: "ye", area: "guney", title: "Pazar sabahı Kouter'de istiridye",
      desc: "Kouter meydanındaki çiçek pazarı her pazar sabahı kuruluyor. Gentlilerin geleneği, çiçeklerini aldıktan sonra mavi kiosk'ta ayakta istiridye ve bir kadeh köpüklü şarapla haftayı kapatmak.",
      tip: "De Blauwe Kiosk meydanın köşesinde; öğlene doğru kalabalıklaşır, erken git.", q: "De Blauwe Kiosk Kouter Gent" },
    { id: "gruut", cat: "ye", area: "dogu", title: "Şerbetçiotsuz Gent birası iç",
      desc: "Ortaçağda bira, şerbetçiotu yerine 'gruut' denen bir ot karışımıyla tatlandırılırdı ve bu karışımın vergisi şehirleri zengin etti. Gentse Gruut Stadsbrouwerij bu yöntemi şehrin içinde sürdürüyor.",
      tip: "Tadım setiyle birkaç çeşidini yan yana dene; açık olduğu günlere önceden bak.", q: "Gentse Gruut Stadsbrouwerij Gent", tags: ["yağmurda"] },
    { id: "mattentaart", cat: "ye", area: "cevre", title: "Geraardsbergen'de mattentaart ye",
      desc: "Kesilmiş sütten yapılan, milföy hamuruna sarılı küçük turta sadece bu yörede üretilebiliyor ve Avrupa Birliği'nin coğrafi işaret korumasına sahip.",
      tip: "Markt çevresindeki fırınlardan al, sonra arnavut kaldırımlı 'Muur' yokuşunu tepedeki şapele kadar tırman.", q: "Markt Geraardsbergen" },
    { id: "liefmans", cat: "ye", area: "cevre", title: "Oudenaarde'de kahverengi bira tat",
      desc: "Oudenaarde'nin ekşimsi koyu birası 'Oudenaards bruin' başlı başına bir bira türü. Schelde kıyısındaki Liefmans 17. yüzyıldan beri üretiyor ve şişelerini hâlâ kâğıda sarıyor.",
      tip: "Fabrika ziyareti rezervasyonla; olmazsa Oudenaarde Markt'taki bir kafede Goudenband iste ve gotik belediye binasına bak.", q: "Brouwerij Liefmans Oudenaarde" },

    // ───────────── DENEYİM ─────────────
    { id: "graslei", cat: "dene", area: "merkez", title: "Graslei'de rıhtıma otur",
      desc: "Ortaçağ lonca evlerinin dizildiği Graslei ve karşısındaki Korenlei şehrin eski limanı. Gentliler güneşi gördüğü an ayaklarını rıhtımdan sarkıtıp burada oturur.",
      tip: "İçeceğini kendin getir, Sint-Michielsbrug'dan üç kulenin aynı karede göründüğü noktayı da bul.", q: "Graslei Gent", tags: ["ücretsiz"] },
    { id: "feesten", cat: "dene", area: "merkez", title: "Gentse Feesten'de sabahla",
      desc: "Her temmuzda on gün boyunca bütün tarihi merkez sahneye, sokak tiyatrosuna ve bara dönüyor. Avrupa'nın en büyük şehir festivallerinden biri ve konserlerin çoğu ücretsiz.",
      tip: "Kalbi Sint-Jacobs meydanı. Son güne 'boş cüzdanlar günü' denir; ilmekli Stroppendragers geçidini de yakala.", q: "Sint-Jacobs Gent", months: [7], tags: ["ücretsiz"] },
    { id: "dullegriet", cat: "dene", area: "merkez", title: "Biran için ayakkabını rehin ver",
      desc: "Vrijdagmarkt'taki Dulle Griet'te evin 'Max' birası uzun, tahta saplı dev bir bardakta gelir. Bardak geri gelsin diye bir ayakkabın sepetle tavana çekilir.",
      tip: "Deliksiz çorap giy. Kafenin adını aldığı kırmızı dev top Dulle Griet birkaç adım ötede, su kenarında.", q: "Dulle Griet Vrijdagmarkt Gent", tags: ["yağmurda"] },
    { id: "vaneyck", cat: "dene", area: "dogu", title: "Zwembad Van Eyck'te yüz",
      desc: "1886'da açılan Van Eyck, Belçika'nın en eski kapalı yüzme havuzu. Art deco salonu, galerideki kabinleri ve cam tavanıyla anıt statüsünde ama hâlâ sıradan bir mahalle havuzu.",
      tip: "Kulvar saatlerine önceden bak; çıkışta Portus Ganda yat limanının çevresinde yürü.", q: "Zwembad Van Eyck Gent", tags: ["yağmurda"] },
    { id: "kwaremont", cat: "dene", area: "cevre", title: "Oude Kwaremont'u pedalla çık",
      desc: "Ronde van Vlaanderen'in kaderinin belirlendiği, iki kilometreyi aşan arnavut kaldırımlı yokuş. Flaman Ardenleri'nde bisiklet bir spor değil, din.",
      tip: "Oudenaarde'deki Centrum Ronde van Vlaanderen'den başla: müze, bisiklet kiralama ve işaretli rotalar orada. Islak taşta dikkat.", q: "Oude Kwaremont Kluisbergen", tags: ["ücretsiz"] },
    { id: "aalst", cat: "dene", area: "cevre", title: "Aalst Karnavalı'na karış",
      desc: "Paskalya orucundan önceki üç gün Aalst kendi kurallarıyla yaşar: siyasetçileri hicveden dev arabalar, soğan atma töreni ve salı günü 'Voil Jeanetten' geçidi. Şehirlilere 'ajuinen' (soğanlar) denir.",
      tip: "Pazar günkü büyük geçit için erken yer tut; tarih her yıl Paskalya'ya göre değişir.", q: "Grote Markt Aalst", months: [2, 3], tags: ["ücretsiz"] },
    { id: "latem", cat: "dene", area: "cevre", title: "Leie boyunca Latem'e pedalla",
      desc: "Leie'nin kıvrımları 1900'lerde bir ressam topluluğunu Sint-Martens-Latem köyüne çekti; Flaman dışavurumculuğu bu çayırlarda doğdu. Gent'ten nehri izleyen yol, tabloların içinden geçiyor.",
      tip: "Komşu köy Deurle'deki Museum Dhondt-Dhaenens'te mola ver; dönüşte nehrin öbür kıyısını kullan.", q: "Sint-Martens-Latem kerk", tags: ["ücretsiz"] }
  ]
};
