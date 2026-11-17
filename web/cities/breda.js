// Quests for the Breda & Tilburg region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.breda = {
  id: "breda",
  name: "Breda & Tilburg",
  subtitle: "& West Brabant",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Brabander", "Echte Brabander"],
  areas: {
    breda: "Breda",
    tilburg: "Tilburg",
    cevre: "Surroundings"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[51.526, 4.718], [51.602, 5.141]],
  coords: {
    breda: [51.5903, 4.7785], efteling: [51.6500, 5.0480], lochal: [51.5613, 5.0861],
    markiezenhof: [51.4961, 4.2855], tongerlohuys: [51.5340, 4.4585], blindwalls: [51.5942, 4.7844],
    depont: [51.5673, 5.0745], latrappe: [51.5436, 5.1297], karvansara: [51.5538, 5.1028],
    foodmarkettilburg: [51.5615, 5.0845], mozesbrug: [51.5289, 4.3011], baarle: [51.4420, 4.9310],
    oisterwijkvennen: [51.5730, 5.2155], biesbosch: [51.7081, 4.8086]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    breda: { icon: "🏰", name: "Nassau Knight" },
    tilburg: { icon: "🎡", name: "Kruikenzeiker" },
    cevre: { icon: "🌲", name: "Brabant Wanderer" }
  },
  quests: [
    { id: "breda", cat: "gor", area: "breda", title: "Step into the Begijnhof courtyard in Breda",
      desc: "Right in the middle of the city is a courtyard where the noise cuts out once you pass the gate: small houses where devout women (beguines) lived for centuries, with a medicinal herb garden in the middle.",
      tip: "When you leave, walk through Valkenberg park towards the tower of the Grote Kerk.", q: "Begijnhof Breda", tags: ["free"] },
    { id: "efteling", cat: "dene", area: "cevre", title: "Get lost in the Fairy Tale Forest at Efteling",
      desc: "Efteling in Kaatsheuvel began in the 1950s with the Sprookjesbos (Fairy Tale Forest) drawn by the artist Anton Pieck. The childhood memories of the Dutch are stored here.",
      tip: "Visit the Sprookjesbos before the roller coasters, and feed a scrap of paper to Holle Bolle Gijs, the bin that shouts 'Papier hier'.", q: "Efteling Kaatsheuvel" },
    { id: "lochal", cat: "dene", area: "tilburg", title: "Spend an afternoon at LocHal in Tilburg",
      desc: "The railways' old locomotive workshop, right behind the station, has become a giant library and meeting place. The fabric curtains, six storeys high, are a nod to Tilburg, the textile city.",
      tip: "Climb to the top of the wide stairs, then look at the tracks from the glass balcony. If you come in July, the city is full of the Tilburgse Kermis, the biggest fair in the Benelux.", q: "LocHal Tilburg", tags: ["free", "rainy day"] },
    { id: "markiezenhof", cat: "gor", area: "cevre", title: "Explore the marquises' palace in Bergen op Zoom",
      desc: "The Markiezenhof, begun in 1485, is one of the oldest and finest city palaces in the Low Countries, with a carved chimneypiece in its great hall. It also tells the story of the Bergse Vastenavend, the town's wild carnival.",
      tip: "Climb to the attic for the old fairground collection, then walk to the Gevangenpoort, the only surviving city gate.", q: "Het Markiezenhof Bergen op Zoom", tags: ["rainy day"], src: ["https://www.vvvbrabantsewal.nl/en/brabant-wall/bergen-op-zoom"] },
    { id: "tongerlohuys", cat: "gor", area: "cevre", title: "Discover Roosendaal's past in the Tongerlohuys",
      desc: "This elegant 1762 house was a refuge of the Belgian abbey of Tongerlo, from where its priests ran the local parish while Catholic worship was banned in public. Now it is the city museum of Roosendaal.",
      tip: "Look for the Louis XV door frames and the original stucco ceilings before heading into the exhibitions.", q: "Museum Tongerlohuys Molenstraat Roosendaal", tags: ["rainy day"], src: ["https://nl.wikipedia.org/wiki/Tongerlohuys"] },
    { id: "blindwalls", cat: "gor", area: "breda", title: "Hunt for murals of Blind Walls Gallery in Breda",
      desc: "More than 80 large murals by Dutch and international artists cover blank walls all over Breda, making the city an open-air street art gallery that costs nothing to visit.",
      tip: "Use the Blind Walls app or map to build your own route, or rent a bike: the walls are spread far beyond the old centre.", q: "Blind Walls Gallery Breda", tags: ["free"], src: ["https://www.travelvalley.nl/dagjeweg/de-acht-leukste-unieke-dingen-die-je-alleen-in-brabant-kunt-doen"] },
    { id: "depont", cat: "gor", area: "tilburg", title: "See Kapoor's Sky Mirror at De Pont in Tilburg",
      desc: "Tilburg's contemporary art museum fills a former wool-spinning mill, and you can still sense the factory in its big halls. Anish Kapoor's Sky Mirror reflects the clouds at the entrance.",
      tip: "Entry is free on Thursday evenings and for visitors under 26; it is a short walk from Tilburg station.", q: "Museum De Pont Wilhelminapark Tilburg", tags: ["rainy day"], src: ["https://amsterdamian.com/see/photos/things-to-do-in-tilburg/"] },
    { id: "latrappe", cat: "ye", area: "tilburg", title: "Taste Trappist beer at Koningshoeven",
      desc: "Monks of the Koningshoeven abbey in Berkel-Enschot, on the edge of Tilburg, have brewed beer since 1884. La Trappe is the only Dutch Trappist you can drink at the abbey itself.",
      tip: "Book a brewery tour, then sit in the proeflokaal (tasting room); from Tilburg it is about 20 minutes by bike.", q: "La Trappe Trappist Koningshoeven Berkel-Enschot", src: ["https://www.travelvalley.nl/dagjeweg/de-acht-leukste-unieke-dingen-die-je-alleen-in-brabant-kunt-doen", "https://en.wikipedia.org/wiki/Koningshoeven_Abbey"] },
    { id: "karvansara", cat: "ye", area: "tilburg", title: "Have Persian ice cream at the Piushaven",
      desc: "Tilburg's old industrial harbour is now its liveliest waterfront, with terraces along the quay and a bridge that swings sideways. By the bridge, the little Karvansara caravan serves Persian ice cream and tea.",
      tip: "Walk the full loop along the quay, about one and a half kilometres, and finish with ice cream by the bridge.", q: "Piushaven Tilburg", months: [4, 5, 6, 7, 8, 9], src: ["https://amsterdamian.com/see/photos/things-to-do-in-tilburg/"] },
    { id: "foodmarkettilburg", cat: "ye", area: "tilburg", title: "Pick a dinner at Foodmarket Tilburg",
      desc: "In the Spoorzone next to the station, this food hall gathers more than a dozen kitchens in an old railway building, with trains rolling past.",
      tip: "Combine it with an afternoon at the LocHal and a climb of the Kempentoren lookout in the Spoorpark across the tracks.", q: "Foodmarket Tilburg Spoorzone", tags: ["rainy day"], src: ["https://amsterdamian.com/see/photos/things-to-do-in-tilburg/"] },
    { id: "mozesbrug", cat: "dene", area: "cevre", title: "Cross the Moses Bridge at Fort de Roovere",
      desc: "Near Halsteren, close to Bergen op Zoom, a sunken wooden bridge cuts through the moat of a 17th century earthen fort, so you walk between two walls of water.",
      tip: "Climb the 129 steps of the Pompejus lookout tower nearby for a view over the fort and the Brabantse Wal.", q: "Mozesbrug Fort de Roovere Halsteren", tags: ["free"], src: ["https://en.wikipedia.org/wiki/Moses_Bridge", "https://www.travelvalley.nl/dagjeweg/de-acht-leukste-unieke-dingen-die-je-alleen-in-brabant-kunt-doen"] },
    { id: "baarle", cat: "dene", area: "cevre", title: "Hop across the border in Baarle-Nassau",
      desc: "Baarle is a patchwork of Dutch and Belgian pieces, with Belgian enclaves inside the Netherlands and Dutch ones inside those. Rows of markers in the pavement show which country you are standing in.",
      tip: "Find the house on Loveren where the border runs through the front door, giving it two house numbers.", q: "Baarle-Nassau", tags: ["free"], src: ["https://en.wikipedia.org/wiki/Baarle-Nassau", "https://www.travelvalley.nl/dagjeweg/de-acht-leukste-unieke-dingen-die-je-alleen-in-brabant-kunt-doen"] },
    { id: "oisterwijkvennen", cat: "dene", area: "cevre", title: "Walk the fens of Oisterwijk",
      desc: "Between Tilburg and Den Bosch, the Oisterwijkse Bossen en Vennen hide dozens of quiet forest fens, saved from development by Natuurmonumenten in 1913.",
      tip: "Take the train to Oisterwijk and start at the visitor centre on the Van Tienhovenlaan; the marked routes pass a string of fens.", q: "Bezoekerscentrum Oisterwijkse Bossen en Vennen Oisterwijk", tags: ["free"], src: ["https://nl.wikipedia.org/wiki/Oisterwijkse_Bossen_en_Vennen", "https://www.visitbrabant.com/en/tips/10-amazing-cycling-and-hiking-experiences-in-north-brabant"] },
    { id: "biesbosch", cat: "dene", area: "cevre", title: "Look for beavers in the Biesbosch from Drimmelen",
      desc: "The Biesbosch is one of Europe's largest freshwater tidal wetlands, a maze of creeks and willow forest where beavers and white-tailed eagles live.",
      tip: "Rent a canoe or take a boat from the harbour of Drimmelen; the MuseumEiland has a roof you can walk on.", q: "Jachthaven Drimmelen", src: ["https://www.travelvalley.nl/dagjeweg/de-acht-leukste-unieke-dingen-die-je-alleen-in-brabant-kunt-doen", "https://exploringthenetherlands.com/day-trips-from-den-bosch/"] }
  ]
};
