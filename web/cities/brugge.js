// Brugge ve sahil görevleri (Damme, Oostende, De Haan, Knokke/Zwin, Ieper ve Westhoek dahil).
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.brugge = {
  id: "brugge",
  name: "Brugge",
  subtitle: "& the coast",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbourhood Regular", "Bruggeling", "Brugse Zot"],
  areas: {
    merkez: "Markt & Burg",
    guney: "Begijnhof & Minnewater",
    anna: "Sint-Anna & windmills",
    kuzey: "Hanseatic quarter & Sint-Gillis",
    cevre: "Surroundings"
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
    merkez: { icon: "🔔", name: "Belfry Keeper" },
    guney: { icon: "🦢", name: "Minnewater Swan" },
    anna: { icon: "🌬️", name: "Miller" },
    kuzey: { icon: "⚖️", name: "Hanseatic Merchant" },
    cevre: { icon: "🌊", name: "Coast Explorer" }
  },
  quests: [
    // ───────────── GÖRÜLECEK ─────────────
    { id: "heiligbloed", cat: "gor", area: "merkez", title: "Visit both floors of the Basilica of the Holy Blood",
      desc: "The small basilica on the corner of the Burg square keeps a relic of holy blood believed to have been brought back from the Crusades. Below is a dim Romanesque chapel, above a colourful neo-Gothic hall.",
      tip: "Most visitors only go to the upper floor; step into the Sint-Basilius chapel downstairs too.", q: "Basiliek van het Heilig Bloed Brugge", tags: ["rainy day"] },
    { id: "rozenhoedkaai", cat: "gor", area: "merkez", title: "Go to the Rozenhoedkaai early in the morning",
      desc: "The corner where the Belfort, the canal and the slanting rooftops all fit in one frame is the most photographed spot in the city. Before the crowds arrive, it is a completely different place.",
      tip: "Go at sunrise or after the evening lights come on; you already know the daytime version.", q: "Rozenhoedkaai Brugge", tags: ["free"] },
    { id: "begijnhof", cat: "gor", area: "guney", title: "Walk quietly through the Begijnhof",
      desc: "Founded in the 13th century, this courtyard ringed by white houses was once the self-governing quarter of pious women (beguines). Benedictine nuns live here today, and the rule of silence still applies.",
      tip: "At the end of March the lawn in the courtyard is covered in daffodils; on the way out, walk to the bridge over Lake Minnewater.", q: "Begijnhof Brugge", tags: ["free"] },
    { id: "madonna", cat: "gor", area: "guney", title: "See Michelangelo's Madonna",
      desc: "The marble 'Madonna and Child' in the Onze-Lieve-Vrouwekerk is the only Michelangelo sculpture to leave Italy in his lifetime; Bruges merchants bought it and brought it home. The church's brick tower is among the tallest in the world.",
      tip: "The statue is in the museum section; the ornate tombs of the Burgundian dukes are in the same place.", q: "Onze-Lieve-Vrouwekerk Brugge", tags: ["rainy day"] },
    { id: "molens", cat: "gor", area: "anna", title: "Count the windmills on the ramparts",
      desc: "Four windmills line up along the Kruisvest, the earthen bank of the old city wall. At one time more than twenty turned on top of the walls.",
      tip: "The Sint-Janshuismolen is open to visitors in season and still grinds flour. The path along the bank is lovely by bike too.", q: "Sint-Janshuismolen Brugge", tags: ["free"] },
    { id: "hanze", cat: "gor", area: "kuzey", title: "Trace the merchants on Jan van Eyckplein",
      desc: "In Bruges' golden age, ships came right up to here: the customs house Tolhuis, the merchants' club Poortersloge, and around them streets named after the communities of foreign merchants.",
      tip: "Walk along the Spiegelrei, then look for the Oosterlingenplein and Spanjaardstraat signs.", q: "Jan van Eyckplein Brugge", tags: ["free"] },
    { id: "dehaan", cat: "gor", area: "cevre", title: "See the Belle Époque villas of De Haan",
      desc: "A rare town on the Belgian coast spared from high-rise apartments: white villas from the 1900s along winding streets, and a fairy-tale tram station. Einstein stayed here for months in 1933.",
      tip: "Get off the coast tram at the 'De Haan aan Zee' stop, wander the Concessie district and find the statue of Einstein sitting on a bench.", q: "Tramstation De Haan aan Zee", tags: ["free"] },

    // ───────────── YENİLECEK ─────────────
    { id: "garre", cat: "ye", area: "merkez", title: "Find the hidden alley to De Garre",
      desc: "At the end of one of the city's narrowest alleys, off Breidelstraat between the Markt and the Burg, you find Staminee De Garre. The house's own tripel is served only here, with a piece of cheese.",
      tip: "The beer is very strong; sit in the wooden gallery upstairs and take your time.", q: "Staminee De Garre Brugge", tags: ["rainy day"] },
    { id: "dumon", cat: "ye", area: "merkez", title: "Pick pralines from a family-run chocolatier",
      desc: "Bruges' shop windows are full of chocolate, but not all of it is made on the spot. Family businesses like Dumon still make their pralines in their own workshop.",
      tip: "At the little shop on the Eiermarkt, choose them one by one instead of a box; ask the seller which ones were made that week.", q: "Chocolatier Dumon Eiermarkt Brugge" },
    { id: "halvemaan", cat: "ye", area: "guney", title: "Drink the piped beer at its source",
      desc: "De Halve Maan is the family brewery that stayed in the historic centre. Because tankers can't fit through the narrow streets, the beer flows through a three-kilometre pipeline under the city to the bottling plant. Brugse Zot was born here.",
      tip: "The tour ends with a rooftop view; unfiltered Brugse Zot is only drunk here, in the courtyard.", q: "Brouwerij De Halve Maan Brugge", tags: ["rainy day"] },
    { id: "vlissinghe", cat: "ye", area: "anna", title: "Sit in the café that has been open since 1515",
      desc: "Café Vlissinghe has stood in the same place for over five hundred years and is considered the oldest café in Bruges. Dark wood panelling, old paintings and a huge stove in the middle.",
      tip: "In summer they play pétanque in the back garden; it is closed on some days of the week, so check ahead.", q: "Café Vlissinghe Brugge", tags: ["rainy day"] },
    { id: "garnaal", cat: "ye", area: "cevre", title: "Eat grey shrimp in Oostende",
      desc: "The small grey shrimp of the North Sea is the pride of the Belgian coast. In Oostende you'll find them freshly peeled at the Vistrap stalls on the fishermen's quay, and as croquettes (garnaalkroketten) in the restaurants.",
      tip: "Walk along the Visserskaai; the croquette should come with fried parsley and lemon.", q: "Vistrap Visserskaai Oostende" },
    { id: "westvleteren", cat: "ye", area: "cevre", title: "Drink a Westvleteren across from the abbey",
      desc: "The monks of Sint-Sixtus Abbey brew one of the most sought-after beers in the world, only as much as they need, and hardly distribute it at all. The place where you can drink it with no fuss is the In de Vrede café, right across from the abbey.",
      tip: "The café has closing days, so check ahead. For non-drivers: the 12 is the darkest and strongest.", q: "In de Vrede Westvleteren" },

    // ───────────── DENEYİM ─────────────
    { id: "belfort", cat: "dene", area: "merkez", title: "Climb the 366 steps of the Belfort",
      desc: "The 83-metre bell tower on the Markt guarded the city's treasure and its charters in the Middle Ages. At the top, a 47-bell carillon and the rooftops of all of Bruges are waiting.",
      tip: "Tickets are timed and the staircase is narrow; book the first slot. Being on the square while the carillon plays is lovely too.", q: "Belfort Brugge" },
    { id: "processie", cat: "dene", area: "merkez", title: "Watch the Procession of the Holy Blood",
      desc: "Every year on Ascension Day the holy relic is carried through the streets with hundreds of Bruges people in medieval costume. The centuries-old tradition is on UNESCO's intangible heritage list.",
      tip: "The date shifts with Easter, mostly in May. You can watch standing along the route without buying a grandstand ticket.", q: "Heilig Bloedprocessie Markt Brugge", months: [5, 6], tags: ["free"] },
    { id: "kant", cat: "dene", area: "anna", title: "Watch the lacemakers' fingers",
      desc: "Bruges lace is made with the bobbin technique, by crossing dozens of wooden bobbins. At the Kantcentrum, the masters do it right before your eyes.",
      tip: "Demonstrations are in the afternoon; also visit the Jeruzalemkerk with its odd tower right next door.", q: "Kantcentrum Brugge", tags: ["rainy day"] },
    { id: "langerei", cat: "dene", area: "kuzey", title: "Walk north along the Langerei",
      desc: "The tourist boats turn back at Jan van Eyckplein; beyond that belongs to the people of Bruges. Along the Langerei canal stretch quiet houses, small bridges and the Sint-Gillis district.",
      tip: "Walk as far as the Dampoort, and use the Potterierei side on the way back.", q: "Langerei Brugge", tags: ["free"] },
    { id: "damme", cat: "dene", area: "cevre", title: "Pedal to Damme along the poplar-lined canal",
      desc: "The Damse Vaart canal links Bruges to Damme, once the city's outer port, between poplars bent by the wind. The little town is now a book village and the home of Tijl Uilenspiegel.",
      tip: "About seven kilometres, dead flat. In season the Lamme Goedzak boat makes the same trip.", q: "Damme Markt", tags: ["free"] },
    { id: "kusttram", cat: "dene", area: "cevre", title: "Ride the coast tram",
      desc: "The Kusttram covers the whole Belgian coast from De Panne to Knokke, 67 kilometres, and is considered the longest tram line in the world. In places it runs right beside the dunes and the sea.",
      tip: "Buy a day ticket and hop off at any stop you like. Oostende station is the easiest starting point if you come from Brugge by train.", q: "Kusttram Oostende Station" },
    { id: "zwin", cat: "dene", area: "cevre", title: "Watch the birds at the Zwin",
      desc: "When the Zwin, the sea inlet that connected Bruges to the sea and made it rich in the Middle Ages, silted up, the city's golden age ended. What remains at the tip of Knokke is a salt marsh that fills and empties with the tides, and thousands of migratory birds.",
      tip: "Enter through the Zwin Natuur Park and look for the stork nests. At the end of summer the marsh turns purple with sea lavender.", q: "Zwin Natuur Park Knokke-Heist" },
    { id: "lastpost", cat: "dene", area: "cevre", title: "Listen to the Last Post in Ieper",
      desc: "Under the Menenpoort memorial, buglers have played the Last Post every evening at eight o'clock since 1928 for the soldiers lost in the First World War. The walls bear the names of tens of thousands of soldiers with no known grave.",
      tip: "Arrive half an hour early. Fill your day with the In Flanders Fields Museum and the Tyne Cot cemetery near Passendale.", q: "Menenpoort Ieper", tags: ["free"] }
  ]
};
