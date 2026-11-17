// Quests for the Leeuwarden region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.leeuwarden = {
  id: "leeuwarden",
  name: "Leeuwarden",
  subtitle: "& Friesland",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Frisian at heart", "Echte Fries"],
  areas: {
    merkez: "Leeuwarden",
    cevre: "Friesland & islands"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[53.171, 5.75], [53.231, 5.85]],
  coords: {
    oldehove: [53.2030, 5.7897], planetarium: [53.1873, 5.5438], beerenburg: [53.0312, 5.6603],
    schiermonnikoog: [53.4790, 6.1625], princessehof: [53.2030, 5.7921], harlingenhaven: [53.1747, 5.4135],
    hindeloopen: [52.9433, 5.3987], dokkum: [53.3270, 5.9985], bornrif: [53.4489, 5.6256],
    suikerbroodsneek: [53.0297, 5.6602], lickebaert: [53.2964, 5.0731], cranberryterschelling: [53.3600, 5.2160],
    blokhuispoort: [53.1998, 5.8010], kaatsen: [53.1866, 5.5381], skutsjesilen: [53.0948, 5.8509],
    oerol: [53.3600, 5.2150], vliehors: [53.2600, 4.9800]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🐄", name: "Us Mem's Friend" },
    cevre: { icon: "⛵", name: "Skûtsje Skipper" }
  },
  quests: [
    { id: "oldehove", cat: "gor", area: "merkez", title: "Leeuwarden's leaning tower, the Oldehove",
      desc: "The tower, left unfinished when it began to tilt during construction in the 16th century, is the symbol of the Frisian capital. The lean is visible to the naked eye, and it's slightly curved, too.",
      tip: "In season you can climb to the top. Less than an hour by train from Groningen.", q: "Oldehove Leeuwarden" },
    { id: "planetarium", cat: "gor", area: "cevre", title: "The solar system on the ceiling in Franeker",
      desc: "In the 18th century, wool carder Eise Eisinga built a working model of the solar system on his living room ceiling. The world's oldest planetarium still in operation is now a UNESCO World Heritage Site.",
      tip: "Don't leave without seeing the wooden gear mechanism in the attic. Franeker is one of the Elfsteden (Eleven Cities).", q: "Koninklijk Eise Eisinga Planetarium Franeker", tags: ["rainy day"] },
    { id: "beerenburg", cat: "ye", area: "cevre", title: "Taste Beerenburg in Sneek",
      desc: "Friesland's herbal bitter, Beerenburg, has been sold at Weduwe Joustra in Sneek since the 19th century. The shop's old counter and barrels are still in place.",
      tip: "Sneek's landmark, the Waterpoort, is a few minutes' walk away; during Sneekweek in early August the town fills with sailboats.", q: "Weduwe Joustra Sneek" },
    { id: "schiermonnikoog", cat: "dene", area: "cevre", title: "Hop on a bike on Schiermonnikoog",
      desc: "The smallest inhabited Wadden island is almost entirely national park. Visitors leave their cars on the mainland; on the island there are dunes, salt marshes and a very wide beach.",
      tip: "The ferry leaves from Lauwersoog. Rent a bike on the island and pedal to the beach.", q: "Schiermonnikoog" },
    { id: "princessehof", cat: "gor", area: "merkez", title: "See the tiles of the Princessehof in Leeuwarden",
      desc: "Leeuwarden's ceramics museum fills a small 17th-century palace with tiles, Chinese porcelain and modern ceramics. M.C. Escher was born in the middle house of the building.",
      tip: "The courtyard café is a lovely break; the Oldehove tower is a five-minute walk away.", q: "Keramiekmuseum Princessehof Leeuwarden", tags: ["rainy day"], src: ["https://en.wikipedia.org/wiki/Keramiekmuseum_Princessehof", "https://www.roughguides.com/article/leeuwarden-the-coolest-dutch-city-youve-never-heard-of"] },
    { id: "harlingenhaven", cat: "gor", area: "cevre", title: "Walk the old harbours of Harlingen",
      desc: "Between the Noorderhaven and Zuiderhaven, gabled merchant houses from the 16th to 18th centuries look out on traditional sailing barges. Harlingen is still a working port with a fishing fleet and shipyard.",
      tip: "Harlingen is the ferry port for Terschelling and Vlieland, so this makes a great stop before or after an island trip. Trains from Leeuwarden take about half an hour.", q: "Noorderhaven Harlingen", tags: ["free"], src: ["https://www.roughguides.com/destinations/europe/netherlands/north-and-the-frisian-islands/makkum", "https://www.dutchnews.nl/features/2019/07/11-cities-of-friesland/"] },
    { id: "hindeloopen", cat: "gor", area: "cevre", title: "Discover painted Hindeloopen",
      desc: "This tiny Elfsteden town on the IJsselmeer developed its own style of furniture painting, with flowers and curls on red, green or blue backgrounds, plus its own costumes. Cobbled lanes, wooden bridges and captains' houses complete the picture.",
      tip: "Museum Hindeloopen shows the painting and costumes; the shops on the main street still sell painted pieces made in the old style.", q: "Museum Hindeloopen", src: ["https://www.roughguides.com/destinations/europe/netherlands/north-and-the-frisian-islands/makkum", "https://www.dutchnews.nl/features/2019/07/11-cities-of-friesland/"] },
    { id: "dokkum", cat: "gor", area: "cevre", title: "Circle the ramparts of Dokkum",
      desc: "The northernmost of the Eleven Cities still has its well-preserved bastions (bolwerken), crowned by two windmills, Zeldenrust and De Hoop. Saint Boniface was killed nearby in 754, and a chapel and park honour him.",
      tip: "Walk the ring of the bolwerken, then visit the Bonifatius park. Buses run from Leeuwarden and Groningen.", q: "Molen Zeldenrust Dokkum", tags: ["free"], src: ["https://en.wikipedia.org/wiki/Dokkum", "https://www.dutchnews.nl/features/2019/07/11-cities-of-friesland/"] },
    { id: "bornrif", cat: "gor", area: "cevre", title: "Climb the striped lighthouse of Ameland",
      desc: "The red-and-white Bornrif lighthouse near Hollum has stood since 1881 and is now a museum. From the balcony, after more than 230 steps, you see the whole island and on clear days its neighbours.",
      tip: "Ferries to Ameland leave from Holwerd; rent a bike in Nes and cycle west to Hollum.", q: "Vuurtoren Ameland Hollum", src: ["https://nl.wikipedia.org/wiki/Bornrif_(vuurtoren)", "https://en.wikivoyage.org/wiki/Ameland"] },
    { id: "suikerbroodsneek", cat: "ye", area: "cevre", title: "Buy Frisian suikerbrood in Sneek",
      desc: "Fries suikerbrood is a soft bread packed with pearl sugar and cinnamon, and it tastes best fresh from a Frisian bakery. Bakkerij De Haan in Sneek is a local favourite, and also bakes oranjekoek.",
      tip: "Eat a slice with butter, then walk to the Waterpoort, Sneek's water gate.", q: "Bakkerij De Haan Sneek", src: ["https://www.dutchnews.nl/features/2018/11/dutch-destinations-enjoy-suikerbrood-and-sailing-in-sneek/"] },
    { id: "lickebaert", cat: "ye", area: "cevre", title: "Eat poffertjes at De Lickebaert on Vlieland",
      desc: "On car-free Vlieland the pancake house De Lickebaert on the Dorpsstraat is the classic stop for a plate of fluffy poffertjes with powdered sugar.",
      tip: "Ferries to Vlieland leave from Harlingen; everyone on the island gets around by bike.", q: "De Lickebaert Vlieland", src: ["https://en.wikivoyage.org/wiki/Vlieland"] },
    { id: "cranberryterschelling", cat: "ye", area: "cevre", title: "Taste Terschelling cranberries",
      desc: "Cranberries grow wild in Terschelling's wet dune valleys, supposedly since a barrel washed ashore in 1845. Islanders turn them into chutney, cordial, wine and sweets you will hardly find on the mainland.",
      tip: "Look for cranberry products in the shops around the Torenstraat in West-Terschelling, and order cranberry juice or cake in the island cafés.", q: "West-Terschelling", src: ["https://nl.wikipedia.org/wiki/Terschelling", "https://www.dutchnews.nl/features/2019/05/dutch-destinations-the-wadden-sea-island-of-terschelling"] },
    { id: "blokhuispoort", cat: "dene", area: "merkez", title: "Roam the old prison of the Blokhuispoort in Leeuwarden",
      desc: "Leeuwarden's former prison is now a cultural hub with the city library, studios, small shops, cafés and a hostel in the old cells. Walking its galleries and corridors is free.",
      tip: "Spend the night at the Alibi Hostel if you want to sleep behind bars.", q: "Blokhuispoort Leeuwarden", tags: ["free", "rainy day"], src: ["https://www.roughguides.com/article/leeuwarden-the-coolest-dutch-city-youve-never-heard-of", "https://www.blokhuispoort.nl/"] },
    { id: "kaatsen", cat: "dene", area: "cevre", title: "Watch kaatsen at the PC in Franeker",
      desc: "Kaatsen is Friesland's own ball game, a kind of handball with tennis-like scoring. Its big tournament, the PC, has been played in Franeker since 1854 and calls itself the oldest regular sports tournament in the world.",
      tip: "The whole town comes out for the PC in summer; check the date and combine it with the Eise Eisinga Planetarium.", q: "Sjûkelân Franeker", months: [7, 8], src: ["https://en.wikipedia.org/wiki/Kaatsen", "https://www.roughguides.com/destinations/europe/netherlands/north-and-the-frisian-islands/makkum"] },
    { id: "skutsjesilen", cat: "dene", area: "cevre", title: "Cheer on the skûtsjes on the Frisian lakes",
      desc: "Every summer the old Frisian cargo sailing boats, the skûtsjes, race across the Frisian lakes in a series of regattas that draws crowds to the shores. Friesland is built around its lakes, and this is when they come alive.",
      tip: "Ask a tourist office for the race calendar; around Sneek and Grou you can watch from the shore or from a spectator boat.", q: "Pikmeer Grou", months: [7, 8], tags: ["free"], src: ["https://www.roughguides.com/destinations/europe/netherlands/north-and-the-frisian-islands/sloten"] },
    { id: "oerol", cat: "dene", area: "cevre", title: "Cycle between shows at Oerol on Terschelling",
      desc: "For ten days every June the whole island becomes a stage, with theatre in the dunes, barns, bunkers and on the beach. The name comes from the island word for 'everywhere'.",
      tip: "Book your bed months ahead and bring or rent a bike; much of the street theatre is free.", q: "Oerol Terschelling", months: [6], src: ["https://en.wikipedia.org/wiki/Oerol", "https://www.dutchnews.nl/features/2019/05/dutch-destinations-the-wadden-sea-island-of-terschelling"] },
    { id: "vliehors", cat: "dene", area: "cevre", title: "Ride the Vliehors Express on Vlieland",
      desc: "A big off-road truck carries you across the Vliehors, a vast sand plain at the west end of Vlieland that feels like a desert. With luck you see seals on the way without getting on a boat.",
      tip: "Tours leave from Het Posthuys; book ahead in summer.", q: "Het Posthuys Vlieland", src: ["https://en.wikivoyage.org/wiki/Vlieland"] }
  ]
};
