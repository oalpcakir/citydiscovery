// Arnhem, Nijmegen ve Veluwe görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.arnhem = {
  id: "arnhem",
  name: "Arnhem & Nijmegen",
  subtitle: "& the Veluwe",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Local", "Gelderlander", "Ernemmer & Nimwegenaar"],
  areas: {
    arnhem: "Arnhem Centre",
    sonsbeek: "Sonsbeek & North Arnhem",
    nijmegen: "Nijmegen Centre",
    waal: "Waal & Ooijpolder",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (iki şehir birlikte) ve görev konumları [enlem, boylam].
  bounds: [[51.815, 5.800], [52.020, 5.960]],
  coords: {
    eusebius: [51.9787, 5.9122], johnfrost: [51.9764, 5.9092], trolley: [51.9850, 5.8990], korenmarkt: [51.9825, 5.9043],
    museumarnhem: [51.9855, 5.8922],
    waterval: [51.9930, 5.9005], openlucht: [52.0107, 5.9107], burgers: [52.0093, 5.8990],
    valkhof: [51.8482, 5.8707], vierdaagse: [51.8323, 5.8586], hemel: [51.8481, 5.8641], blaauwehand: [51.8476, 5.8651],
    oversteek: [51.8591, 5.8419], spiegelwaal: [51.8561, 5.8556], oortjeshekken: [51.8632, 5.9335],
    kmm: [52.0953, 5.8169], hogeveluwe: [52.0795, 5.8355], hetloo: [52.2343, 5.9457], posbank: [52.0287, 6.0213],
    hartenstein: [51.9877, 5.8328], mosterd: [52.0118, 6.1375], waag: [52.0130, 6.1385]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    arnhem: { icon: "🚎", name: "Trolley Rider" },
    sonsbeek: { icon: "🌳", name: "Sonsbeek Wanderer" },
    nijmegen: { icon: "🏛️", name: "Valkhof Guardian" },
    waal: { icon: "🌊", name: "Waal Wayfarer" },
    cevre: { icon: "🦌", name: "Veluwe Explorer" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "johnfrost", cat: "gor", area: "arnhem", title: "Stand at the John Frostbrug",
      desc: "In September 1944, British paratroopers held the north end of this bridge over the Rhine for days; this is the bridge from the film 'A Bridge Too Far'. Today's bridge carries the name of John Frost, the officer who led the defence.",
      tip: "The Airborne at the Bridge info centre on the quay is free and looks straight at the bridge.", q: "Airborne at the Bridge Arnhem", tags: ["free"] },
    { id: "museumarnhem", cat: "gor", area: "arnhem", title: "Look at the Rhine from Museum Arnhem's garden",
      desc: "The museum sits on the edge of an ice-age ridge, and its new wing juts out over the slope into thin air. From the sculpture garden, the river and the Betuwe plain lie at your feet.",
      tip: "You don't need a ticket for the garden; inside, check out the Dutch magical realism collection.", q: "Museum Arnhem Utrechtseweg", tags: ["rainy day"] },
    { id: "waterval", cat: "gor", area: "sonsbeek", title: "Walk behind the Sonsbeek waterfall",
      desc: "Sonsbeek park, right in the middle of Arnhem, is hillier than you'd ever expect from flat Holland. Through the rock passage behind the big waterfall you can look out through the water itself.",
      tip: "After the waterfall, climb the slope and look over the park from the terrace of the white villa on top.", q: "Grote Waterval Park Sonsbeek Arnhem", tags: ["free"] },
    { id: "burgers", cat: "gor", area: "sonsbeek", title: "Enter the rainforest at Burgers' Bush",
      desc: "Bush, the giant indoor tropical hall of Burgers' Zoo, was one of the first and is one of the biggest of its kind in Europe. Birds and bats fly freely over your head; desert and ocean sections sit right next to it.",
      tip: "Go on a cold winter day: it's warm and humid inside, so dress in layers. A tunnel leads from the Bush to the desert.", q: "Koninklijke Burgers' Zoo Arnhem", tags: ["rainy day"] },
    { id: "valkhof", cat: "gor", area: "nijmegen", title: "Step into the thousand-year-old chapel at the Valkhof",
      desc: "This hill is the heart of Nijmegen, the oldest city in the Netherlands: the Romans were here, and so was Charlemagne. The octagonal Sint-Nicolaaskapel is among the oldest surviving buildings in the country; next to it stands the apse left from Barbarossa's palace.",
      tip: "From the wall at the north end of the park, look out over the Waal and the bridge; the chapel is open on certain days in season.", q: "Sint-Nicolaaskapel Valkhof Nijmegen", tags: ["free"] },
    { id: "kmm", cat: "gor", area: "cevre", title: "See the Van Goghs at Kröller-Müller",
      desc: "The museum in the middle of the woods holds the world's second-largest Van Gogh collection. One of Europe's biggest sculpture gardens also spreads out among the trees behind the building.",
      tip: "To get to the museum you first have to enter De Hoge Veluwe park; buy the tickets together and in advance.", q: "Kröller-Müller Museum Otterlo", tags: ["rainy day"] },
    { id: "hetloo", cat: "gor", area: "cevre", title: "Stroll the gardens of Paleis Het Loo",
      desc: "The palace in Apeldoorn was the summer home of the House of Orange for three centuries. Its symmetrical baroque gardens were rebuilt to the original plan; after a major renovation it reopened with a new wing buried underground.",
      tip: "Go up to the palace roof: you can only see the garden's pattern from above.", q: "Paleis Het Loo Apeldoorn" },
    { id: "hartenstein", cat: "gor", area: "cevre", title: "Tour Hartenstein in Oosterbeek",
      desc: "The villa that served as the British headquarters in the Battle of Arnhem is now the Airborne Museum. The basement relives the days of the siege with sound and light.",
      tip: "Walk over to the nearby Airborne cemetery too. Every September there are memorial ceremonies and the big Airborne march.", q: "Airborne Museum Hartenstein Oosterbeek", tags: ["rainy day"] },

    // YENİLECEK
    { id: "korenmarkt", cat: "ye", area: "arnhem", title: "Spend an evening on the Korenmarkt",
      desc: "The old grain market square is the centre of Arnhem's nightlife: bars and terraces on all four sides. Students and retirees alike head here in the evening.",
      tip: "On a sunny day the terraces fill up early; peek into the craft beer cafés on the side streets too.", q: "Korenmarkt Arnhem" },
    { id: "hemel", cat: "ye", area: "nijmegen", title: "Have a beer in the monastery courtyard at De Hemel",
      desc: "Stadsbrouwerij De Hemel (Heaven) brews beer in the medieval Commanderie van Sint-Jan. Under the same roof they also make vinegar, mustard and spirits.",
      tip: "Start with a tasting board; in summer, sit in the inner courtyard.", q: "Stadsbrouwerij De Hemel Nijmegen", tags: ["rainy day"] },
    { id: "blaauwehand", cat: "ye", area: "nijmegen", title: "Drop by In de Blaauwe Hand",
      desc: "Open since the 16th century, this little café is the oldest in Nijmegen. It takes its name from the dyers working next door, whose hands turned indigo blue from dyeing cloth.",
      tip: "It's right behind the Grote Markt, next to the church passage; the inside is tiny, so go early.", q: "In de Blaauwe Hand Nijmegen", tags: ["rainy day"] },
    { id: "oortjeshekken", cat: "ye", area: "waal", title: "Take a break on the dyke in the Ooijpolder",
      desc: "Where Nijmegen ends, the Ooijpolder begins: floodplains, semi-wild horses and winding dykes. Oortjeshekken, up on the dyke, is the classic stop for walkers and cyclists.",
      tip: "Leave the city over the Ooypoort pedestrian bridge and walk or pedal along the dyke; on the way back the sun sets over the Waal.", q: "Oortjeshekken Ooij" },
    { id: "mosterd", cat: "ye", area: "cevre", title: "Buy Doesburg mustard at the source",
      desc: "Doesburg, the Hanseatic town on the IJssel, is known for its mustard. The old mustard factory is now a museum that still produces with its stone mills and wooden barrels.",
      tip: "Buy fresh mustard from the counter; it's coarse-grained and sharp, nothing like supermarket mustard.", q: "Doesburgsche Mosterdfabriek Doesburg", tags: ["rainy day"] },
    { id: "waag", cat: "ye", area: "cevre", title: "Slurp mustard soup at De Waag",
      desc: "Doesburg's Gothic weigh house with its stepped gables dates from the 15th century and counts as one of the oldest restaurants in the country. It's the right address for the local mustard soup.",
      tip: "Look at the old scales inside; then walk the town's main street all the way to the IJssel.", q: "Stadsbierhuys De Waag Doesburg" },

    // DENEYİM
    { id: "eusebius", cat: "dene", area: "arnhem", title: "Step onto the glass balcony of the Eusebiuskerk",
      desc: "The church tower, destroyed in the Battle of Arnhem, was rebuilt after the war. Take the lift to the top and you step onto balconies that jut out past the tower, with glass floors.",
      tip: "Dare to look down: the square is right beneath you. In clear weather you can see the Rhine and the John Frost bridge.", q: "Eusebiuskerk Arnhem" },
    { id: "trolley", cat: "dene", area: "arnhem", title: "Ride the trolleybus",
      desc: "Arnhem is the only city in the Netherlands with trolleybuses: silent buses hooked to overhead wires that have stood in for trams since the war. Even if you ride one every day, ride it once knowing it's special.",
      tip: "It leaves from Arnhem Centraal. Before you board, look at the giant curving concrete column inside the station.", q: "Arnhem Centraal" },
    { id: "openlucht", cat: "dene", area: "sonsbeek", title: "Ride the old tram at the Openluchtmuseum",
      desc: "Farms, mills and workshops dismantled from all over the country were rebuilt in the woods. Old trams run between them; the last few centuries of Dutch life in a single walk.",
      tip: "Set aside a full day. The smell of fresh bread from the bakery and poffertjes at the stall will find you.", q: "Nederlands Openluchtmuseum Arnhem" },
    { id: "vierdaagse", cat: "dene", area: "nijmegen", title: "Cheer on the walkers at the Vierdaagse",
      desc: "Every July tens of thousands of people walk around Nijmegen four days in a row: the world's largest multi-day walking event. On the last day St. Annastraat becomes the 'Via Gladiola' and finishers get gladioli.",
      tip: "Even if you don't walk, the Vierdaagsefeesten concerts in the city that week are free. Grab a spot for the Via Gladiola from the morning.", q: "St. Annastraat Nijmegen", months: [7], tags: ["free"] },
    { id: "oversteek", cat: "dene", area: "waal", title: "Join the Sunset March",
      desc: "De Oversteek bridge was built in memory of the 48 American soldiers who died crossing the Waal in small boats in 1944. At sunset, 48 pairs of lamps light up in sequence at marching pace, and every evening a veteran walks the bridge together with the lights.",
      tip: "The time shifts daily with sunset; anyone is welcome to walk quietly behind the veteran.", q: "De Oversteek Nijmegen", tags: ["free"] },
    { id: "spiegelwaal", cat: "dene", area: "waal", title: "Spend a summer day on the Spiegelwaal",
      desc: "To protect Nijmegen from floods, a second channel was dug beside the Waal, creating the island of Veur-Lent in between. The water of the side arm Spiegelwaal is calm, and its beaches are the city's summer seaside.",
      tip: "Cross the bridge from the centre onto the island, then get in the water from the Lentloper footbridge. The evening sun sets behind the city skyline.", q: "Spiegelwaal Nijmegen", months: [5, 6, 7, 8, 9], tags: ["free"] },
    { id: "hogeveluwe", cat: "dene", area: "cevre", title: "Cycle the Hoge Veluwe on a white bike",
      desc: "Hundreds of free white bikes wait at the national park's entrances: grab one and ride through heathland, sand dunes and pine forest. With luck you'll spot deer and wild mouflon.",
      tip: "In autumn come near sunset for the deer rutting season. Pedal all the way to the Jachthuis Sint Hubertus in the north.", q: "Bezoekerscentrum De Hoge Veluwe" },
    { id: "posbank", cat: "dene", area: "cevre", title: "Walk the purple heath at the Posbank",
      desc: "The hills of the Veluwezoom turn purple with heather blooming in late August. In a flat country: hills rolling to the horizon, with Scottish Highland cattle grazing among them.",
      tip: "On bloom-season weekends the roads clog up: come at sunrise or walk up from Rheden.", q: "Posbank Rheden", months: [8, 9], tags: ["free"] }
  ]
};
