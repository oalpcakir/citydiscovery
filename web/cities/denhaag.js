// Den Haag ve çevresi görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.denhaag = {
  id: "denhaag",
  name: "Den Haag",
  subtitle: "ve çevresi",
  country: "Hollanda",
  levels: ["Turist", "Yeni gelen", "Meraklı", "Mahalleli", "Hagenaar", "Echte Hagenees"],
  areas: {
    merkez: "Merkez",
    scheveningen: "Scheveningen",
    bati: "Batı yakası",
    dogu: "Haagse Bos & Doğu",
    cevre: "Çevre"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[52.040, 4.230], [52.118, 4.380]],
  coords: {
    hofvijver: [52.0808, 4.3120], mauritshuis: [52.0804, 4.3143], florencia: [52.0790, 4.3040], posthoorn: [52.0825, 4.3135],
    prinsjesdag: [52.0808, 4.3070], vredespaleis: [52.0865, 4.2955], kunstmuseum: [52.0899, 4.2806], haagsemarkt: [52.0644, 4.2993],
    japansetuin: [52.1025, 4.3280], haagsebos: [52.0912, 4.3352],
    beeldenaanzee: [52.1106, 4.2776], simonis: [52.1008, 4.2641], vlaggetjesdag: [52.1012, 4.2625],
    nieuwjaarsduik: [52.1158, 4.2805], surfles: [52.1036, 4.2656],
    hortusleiden: [52.1562, 4.4838], hutspot: [52.1584, 4.4905], leidsekaas: [52.1591, 4.4928],
    keukenhof: [52.2700, 4.5466], bollenvelden: [52.2695, 4.5426], voorlinden: [52.1193, 4.3472], duinen: [52.1617, 4.3493]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🏛️", name: "Hofstad Kurdu" },
    scheveningen: { icon: "🌊", name: "Scheveninger" },
    bati: { icon: "🕊️", name: "Batı Gezgini" },
    dogu: { icon: "🌳", name: "Orman Bekçisi" },
    cevre: { icon: "🌷", name: "Çevre Kâşifi" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "hofvijver", cat: "gor", area: "merkez", title: "Hofvijver'den Torentje'yi bul",
      desc: "Göletin karşı kıyısından Binnenhof'a bak: Hollanda siyasetinin yüzyıllardır döndüğü yer. Suya değen küçük sekizgen kule, başbakanların geleneksel ofisi olan Torentje.",
      tip: "Binnenhof uzun süredir restorasyonda; en iyi görüntü Lange Vijverberg tarafındaki kıyıdan, akşam ışıkları yanınca.", q: "Hofvijver Den Haag", tags: ["ücretsiz"] },
    { id: "mauritshuis", cat: "gor", area: "merkez", title: "İnci Küpeli Kız'la göz göze gel",
      desc: "Vermeer'in en ünlü tablosu, Rembrandt'ın Dr. Tulp'un Anatomi Dersi ve Fabritius'un Saka Kuşu aynı küçük 17. yüzyıl sarayında. Bir saatte gezilecek kadar küçük, bir ömür hatırlanacak kadar iyi.",
      tip: "Kapanışa yakın saatlerde salonlar boşalıyor; tablonun önünde yalnız kalma şansın artar.", q: "Mauritshuis Den Haag", tags: ["yağmurda"] },
    { id: "vredespaleis", cat: "gor", area: "bati", title: "Barış Sarayı'nın kapısındaki aleve bak",
      desc: "1913'te açılan Vredespaleis, Uluslararası Adalet Divanı'nın evi ve Den Haag'ın 'barış ve adalet şehri' unvanının kaynağı. Kapının yanında dünyanın dört yanından taşlarla çevrili barış alevi yanıyor.",
      tip: "Kapıdaki ziyaretçi merkezi ücretsiz. Binanın içi ve bahçesi yalnızca belirli günlerde rehberli turla geziliyor.", q: "Vredespaleis Den Haag", tags: ["ücretsiz"] },
    { id: "kunstmuseum", cat: "gor", area: "bati", title: "Victory Boogie Woogie'yi gör",
      desc: "Kunstmuseum dünyanın en büyük Mondriaan koleksiyonuna sahip; ressamın bitiremediği son tablo da burada. Berlage'nin sarı tuğlalı binası başlı başına bir eser.",
      tip: "Mondriaan'ın erken dönem manzaralarından soyut işlerine uzanan salonları sırayla gez; değişimi adım adım görürsün.", q: "Kunstmuseum Den Haag", tags: ["yağmurda"] },
    { id: "japansetuin", cat: "gor", area: "dogu", title: "Clingendael'deki Japon bahçesine gir",
      desc: "20. yüzyıl başında malikânenin sahibesi Japonya'dan getirdiği fenerler ve köprülerle kurdu. O kadar kırılgan ki yılda yalnızca birkaç hafta açılıyor.",
      tip: "İlkbaharda açelyalar, sonbaharda akçaağaçlar için açılıyor; tarihler her yıl belediye tarafından duyurulur.", q: "Japanse Tuin Clingendael Den Haag", months: [4, 5, 6, 10], tags: ["ücretsiz"] },
    { id: "beeldenaanzee", cat: "gor", area: "scheveningen", title: "Bulvardaki masal heykellerini say",
      desc: "Museum Beelden aan Zee'nin önünde, Tom Otterness'in bronz masal figürleri bulvara yayılmış: ringa yiyen dev, Hansel ile Gretel, Gulliver. Kumulun içine gömülü müze ise Hollanda'nın tek heykel müzesi.",
      tip: "Dışarıdaki heykeller ücretsiz ve çocuklar üstlerine tırmanabiliyor.", q: "Museum Beelden aan Zee Scheveningen", tags: ["ücretsiz"] },
    { id: "hortusleiden", cat: "gor", area: "cevre", title: "Leiden'de Hollanda'nın ilk lalelerinin bahçesi",
      desc: "1590'da kurulan Hortus botanicus Leiden ülkenin en eski botanik bahçesi. Carolus Clusius Hollanda'nın ilk lale soğanlarını burada dikti; bahçesinin yeniden kurulmuş hâli gezilebiliyor.",
      tip: "Rapenburg kanalı boyunca yürüyerek git; Leiden'in en güzel kanalı ve üniversitenin tarihi binası aynı yolda.", q: "Hortus botanicus Leiden" },
    { id: "keukenhof", cat: "gor", area: "cevre", title: "Keukenhof'u açıkken yakala",
      desc: "Lisse'deki park her sonbaharda elle dikilen milyonlarca soğanla baharda yalnızca birkaç hafta açık kalıyor. Yakınında yaşayıp hiç gitmemiş olmak en yaygın itiraf.",
      tip: "Biletler saatli ve önceden alınıyor. Hafta içi sabah ilk saatleri seç; nisan ortası genelde en renkli dönem.", q: "Keukenhof Lisse", months: [3, 4, 5] },
    { id: "voorlinden", cat: "gor", area: "cevre", title: "Voorlinden'de havuzun dibinde yürü",
      desc: "Wassenaar'daki kumul arazisinde, gün ışığıyla aydınlanan özel bir çağdaş sanat müzesi. Leandro Erlich'in 'Swimming Pool' işinde suyun altında kuru kalıyorsun.",
      tip: "Müzenin etrafındaki bahçe ve kumul yürüyüş yolu da biletin içinde; hava güzelse vakit ayır.", q: "Museum Voorlinden Wassenaar", tags: ["yağmurda"] },

    // YENİLECEK
    { id: "florencia", cat: "ye", area: "merkez", title: "Florencia'da dondurma ve kahve",
      desc: "Torenstraat'taki İtalyan dondurmacı kuşaklardır Den Haag'ın buluşma yeri. Bakandan öğrenciye herkes aynı plastik masalarda oturuyor.",
      tip: "Sırada beklerken ne isteyeceğine karar ver; servis hızlı ve sabırsız, bu da geleneğin parçası.", q: "Florencia Torenstraat Den Haag" },
    { id: "posthoorn", cat: "ye", area: "merkez", title: "Lange Voorhout'ta bitterballen",
      desc: "Ihlamur ağaçlı Lange Voorhout, elçilikleri ve saraylarıyla şehrin en zarif caddesi. Bodega De Posthoorn'un terası siyasetçilerin, sanatçıların ve gazetecilerin eski uğrağı.",
      tip: "Yazın caddenin ortasındaki açık hava heykel sergisiyle birleştir.", q: "Bodega De Posthoorn Den Haag" },
    { id: "haagsemarkt", cat: "ye", area: "bati", title: "Haagse Markt'ta tezgâh tezgâh ye",
      desc: "Avrupa'nın en büyük açık pazarlarından biri ve şehrin en çok kültürlü yüzü. Surinam barası, taze stroopwafel, kibbeling ve Türk tezgâhları yan yana.",
      tip: "Pazartesi, çarşamba, cuma ve cumartesi kuruluyor. Kapanışa yakın meyve sebze kasayla ucuza gider.", q: "Haagse Markt Den Haag" },
    { id: "simonis", cat: "ye", area: "scheveningen", title: "Limanda Simonis'ten kibbeling",
      desc: "Scheveningen hâlâ çalışan bir balıkçı limanı. Simonis ailesinin limandaki balıkçısında tekneden gelen balık tepsiyle, ayaküstü yenir.",
      tip: "Bulvardaki şubeler yerine limandakine git ('aan de Haven'); 'lekkerbekje' de dene.", q: "Simonis aan de Haven Scheveningen" },
    { id: "hutspot", cat: "ye", area: "cevre", title: "3 Ekim'de Leiden'de hutspot ye",
      desc: "Leiden her 3 Ekim'de 1574'teki İspanyol kuşatmasının bitişini kutluyor. Efsaneye göre kaçan askerlerin bıraktığı tenceredeki havuçlu soğanlı patates ezmesi o gün bütün şehirde yenir.",
      tip: "Sabah Waag'da ringa ve beyaz ekmek dağıtılıyor, gün boyu lunapark ve geçit töreni var. Trenler çok kalabalık olur.", q: "Stadhuis Leiden", months: [10] },
    { id: "leidsekaas", cat: "ye", area: "cevre", title: "Leiden pazarından kimyonlu peynir al",
      desc: "Leidse kaas, kimyon taneli yöresel peynir; kabuğundaki çapraz anahtarlar şehrin armasından geliyor. Nieuwe Rijn kanalı boyunca kurulan pazar ülkenin en güzellerinden.",
      tip: "Pazar çarşamba ve cumartesi kuruluyor. Peynirini alıp kanal üstündeki teras teknelerinden birine otur.", q: "Markt Nieuwe Rijn Leiden" },

    // DENEYİM
    { id: "prinsjesdag", cat: "dene", area: "merkez", title: "Prinsjesdag'da kraliyet arabasını bekle",
      desc: "Eylülün üçüncü salısı Kral, atlı arabayla şehrin içinden geçip yılın hükümet programını okuyor. Şapkalar, bandolar ve Paleis Noordeinde'nin balkonundan el sallama sahnesi.",
      tip: "Güzergâh her yıl önceden duyurulur; iyi bir yer için sabah erkenden Lange Voorhout çevresine git.", q: "Paleis Noordeinde Den Haag", months: [9], tags: ["ücretsiz"] },
    { id: "haagsebos", cat: "dene", area: "dogu", title: "Haagse Bos'tan bisikletle geç",
      desc: "Merkez garın hemen arkasından başlayan orman, Hollanda'nın en eski ormanlarından birinin kalıntısı. İçinde Kral'ın yaşadığı Paleis Huis ten Bosch var.",
      tip: "Saraya girilmiyor ama parmaklıkların önünden geçiliyor. Ormanın sonundan Wassenaar yönüne devam edebilirsin.", q: "Haagse Bos Den Haag", tags: ["ücretsiz"] },
    { id: "vlaggetjesdag", cat: "dene", area: "scheveningen", title: "Vlaggetjesdag'da ilk ringayı tat",
      desc: "Haziranda yeni ringa sezonu Scheveningen limanında bayraklarla süslenmiş teknelerle açılıyor. Geleneksel kıyafetler, eski zanaatlar ve yılın ilk 'Hollandse Nieuwe'si.",
      tip: "Genelde haziran ortasında bir cumartesi. Limana tramvayla git, park yeri bulunmaz.", q: "Vlaggetjesdag Scheveningen haven", months: [6], tags: ["ücretsiz"] },
    { id: "nieuwjaarsduik", cat: "dene", area: "scheveningen", title: "1 Ocak'ta Kuzey Denizi'ne koş",
      desc: "Ülkenin en büyük yılbaşı dalışı Scheveningen plajında: binlerce kişi öğle vakti turuncu bereleriyle buz gibi suya koşuyor.",
      tip: "Katılım için önceden kayıt gerekiyor. Sadece izlemek de sayılır ama o zaman görev yarım kalır.", q: "Nieuwjaarsduik Scheveningen", months: [1] },
    { id: "surfles", cat: "dene", area: "scheveningen", title: "Scheveningen'de dalgaya gir",
      desc: "Scheveningen Hollanda'nın sörf başkenti: liman mendireğinin yanındaki Noorderstrand'da yıl boyu sörfçü görürsün. Yeni başlayanlar için dersler veriliyor.",
      tip: "Sörf okulları neopren kıyafeti de veriyor; su yazın bile serin. Rüzgârsız, hafif dalgalı bir gün seç.", q: "Hart Beach Scheveningen", months: [5, 6, 7, 8, 9, 10] },
    { id: "bollenvelden", cat: "dene", area: "cevre", title: "Lale tarlalarının arasında pedal çevir",
      desc: "Keukenhof'un çitinin dışında, Lisse ile Noordwijkerhout arasındaki tarlalar renk şeritlerine dönüyor. Bunun için bilet gerekmiyor, sadece bisiklet.",
      tip: "Nisan ortası genelde en iyi zaman. Tarlalara girme, kenardan bak: soğanlar çiftçinin ekmeği. Nisanda geçen Bloemencorso çiçek geçidine de denk gelebilirsin.", q: "Loosterweg Noord Lisse", months: [4], tags: ["ücretsiz"] },
    { id: "duinen", cat: "dene", area: "cevre", title: "Kumulların içinden Wassenaarse Slag'a git",
      desc: "Scheveningen'den kuzeye, Meijendel kumullarının içinden geçen bisiklet yolu hiçbir yerleşime uğramadan Wassenaar'ın plajına çıkıyor. Den Haag'ın içme suyu bu kumullarda süzülüyor.",
      tip: "Yola devam edersen Katwijk'e varırsın. Rüzgârı arkana alacak yönü seç, dönüşte acısı çıkar.", q: "Wassenaarse Slag", tags: ["ücretsiz"] }
  ]
};
