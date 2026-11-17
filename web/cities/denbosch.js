// Quests for the 's-Hertogenbosch region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.denbosch = {
  id: "denbosch",
  name: "'s-Hertogenbosch",
  subtitle: "& surroundings",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Bosschenaar", "Echte Bosschenaar"],
  areas: {
    merkez: "Den Bosch",
    cevre: "Surroundings"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[51.668, 5.254], [51.728, 5.354]],
  coords: {
    bloesemtocht: [51.8826, 5.2715], fruitcorso: [51.8873, 5.4131], acquoy: [51.8791, 5.1372],
    zaltbommel: [51.8121, 5.2524], sintjan: [51.6879, 5.3083], bosschebol: [51.6904, 5.2958],
    duinen: [51.6450, 5.1150], heusdenmolens: [51.7350, 5.1393], jancunen: [51.7653, 5.5264],
    heusdenpannenkoek: [51.7333, 5.1385], oeteldonk: [51.6886, 5.3036], binnendieze: [51.6866, 5.3059]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🐉", name: "Dragon Guard" },
    cevre: { icon: "🌾", name: "Meierij Explorer" }
  },
  quests: [
    { id: "bloesemtocht", cat: "dene", area: "cevre", title: "Cycle through the Betuwe blossom",
      desc: "The Betuwe is the fruit basket of the Netherlands, and in spring its apple, pear and cherry orchards turn white and pink. The yearly Bloesemtocht route usually starts in Geldermalsen.",
      tip: "Check the regional blossom barometer before you go; bloom peaks vary per year. Farm stands along the way sell fresh fruit and juice.", q: "Station Geldermalsen", months: [4, 5], tags: ["free"], src: ["https://en.wikivoyage.org/wiki/Betuwe"] },
    { id: "fruitcorso", cat: "dene", area: "cevre", title: "Watch the Fruitcorso in Tiel",
      desc: "Every September since 1961, floats covered in fruit and vegetables parade through Tiel, the jam town of the Betuwe. Tiel's mascot Flipje, born as a jam advert, is everywhere.",
      tip: "Look for the Flipje mosaic at the Waterpoort by the Waal; the free Appelpop festival is held around the same time.", q: "Tiel", months: [9], tags: ["free"], src: ["https://en.wikivoyage.org/wiki/Betuwe", "https://nl.wikipedia.org/wiki/Flipje"] },
    { id: "acquoy", cat: "gor", area: "cevre", title: "See the leaning tower of Acquoy",
      desc: "The 15th-century church tower in the hamlet of Acquoy on the Linge leans almost as much as Pisa's. Builders already tried to correct the tilt halfway up, and you can still see the kink.",
      tip: "Make it a stop on a Betuwe bike ride along the Linge; the village is tiny, so the tower is hard to miss.", q: "Scheve toren Acquoy", tags: ["free"], src: ["https://nl.wikipedia.org/wiki/Acquoy", "https://en.wikivoyage.org/wiki/Betuwe"] },
    { id: "zaltbommel", cat: "gor", area: "cevre", title: "Circle the bastions of Zaltbommel",
      desc: "Zaltbommel's star-shaped ramparts with seven bastions and a wide moat are still easy to trace, now turned into parks. The tall Sint-Maartenskerk and the Gasthuistoren with its bulb top rise above the walled town.",
      tip: "Approach on foot or by bike over the Waal bridge: the view of the water tower, the walls and the church behind them is the classic one.", q: "Sint-Maartenskerk Zaltbommel", tags: ["free"], src: ["https://forten.nl/forten/vesting-zaltbommel/"] },
    { id: "sintjan", cat: "gor", area: "merkez", title: "Look for the angel with a mobile phone at Sint-Jan",
      desc: "The Sint-Janskathedraal in 's-Hertogenbosch is the most spectacular example of Brabant Gothic. Among the new statues added during restoration is an angel in jeans holding a mobile phone.",
      tip: "The angel is up high on the exterior; binoculars or your phone's zoom will help. Don't miss the small figures perched on the flying buttresses either.", q: "Sint-Janskathedraal 's-Hertogenbosch", tags: ["free"] },
    { id: "bosschebol", cat: "ye", area: "merkez", title: "Eat a Bossche bol at Jan de Groot",
      desc: "A fist-sized pastry ball filled with whipped cream and coated in dark chocolate, the symbol of Den Bosch. Everyone in town buys theirs at the Jan de Groot pastry shop near the station.",
      tip: "Don't bother with a fork and knife; eat it with your hands and a napkin. The queue at the door moves fast.", q: "Banketbakkerij Jan de Groot 's-Hertogenbosch" },
    { id: "duinen", cat: "dene", area: "cevre", title: "Walk in Brabant's desert",
      desc: "The Loonse en Drunense Duinen are among the biggest areas of shifting sand in Western Europe. You step out of the forest and suddenly find yourself in the middle of sand dunes; locals call it the 'Brabant Sahara'.",
      tip: "On a windy day the sand blows around, so bring glasses. Walking in sand is tiring; pick a short route and finish at one of the cafes by the forest edge.", q: "Nationaal Park Loonse en Drunense Duinen", tags: ["free"] },
    { id: "heusdenmolens", cat: "gor", area: "cevre", title: "Watch the windmills turn on Heusden's walls",
      desc: "The star-shaped fortress town of Heusden on the Bergsche Maas is one of the best-preserved in the country. Three grain mills on its ramparts once kept the town fed during sieges.",
      tip: "Come on the first Saturday of the month, when the millers set the sails turning and open up. From Den Bosch, bus 135 stops close to the old town.", q: "Molens Stadshaven Heusden", tags: ["free"], src: ["https://www.arrivalguides.com/nl/Travelguide/EINDHOVEN/heusden/windmills-heusden-131610", "https://www.visitbrabant.com/en/travel-ideas/a-weekend-for-slowing-down-in-north-brabant"] },
    { id: "jancunen", cat: "gor", area: "cevre", title: "Visit the margarine villa of Museum Jan Cunen in Oss",
      desc: "Oss grew rich on margarine, and this neoclassical villa was built in 1888 for a son of margarine maker Simon van den Bergh. Today it houses an art museum with Hague School paintings and modern work.",
      tip: "The museum cafe and garden terrace in the newer wing are a good stop even after a short visit. The station is a ten minute walk away.", q: "Museum Jan Cunen Molenstraat Oss", tags: ["rainy day"], src: ["https://nl.wikipedia.org/wiki/Museum_Jan_Cunen"] },
    { id: "heusdenpannenkoek", cat: "ye", area: "cevre", title: "Eat a pancake inside Heusden's fortress walls",
      desc: "After a walk over the ramparts and past the harbour, De Pannenkoekenbakker on the Vismarkt is where visitors to Heusden refuel with a proper Dutch pannenkoek.",
      tip: "Ask for a spek (bacon) pancake with stroop (syrup) to drizzle on top, the way the Dutch eat it.", q: "De Pannenkoekenbakker Vismarkt Heusden", src: ["https://exploringthenetherlands.com/day-trips-from-den-bosch/", "https://www.visitbrabant.com/en/travel-ideas/a-weekend-for-slowing-down-in-north-brabant"] },
    { id: "oeteldonk", cat: "dene", area: "merkez", title: "Celebrate carnival in Oeteldonk",
      desc: "For carnival Den Bosch becomes Oeteldonk, the frog marsh, and the whole city dresses in a farmer's smock (boerenkiel) with a red, white and yellow scarf. The Prince arrives at the station at 11:11 on Sunday and the statue of Knillis rises on the Markt.",
      tip: "Wear the real outfit, kiel, scarf, red handkerchief and white mittens; costumes from elsewhere stand out here.", q: "Markt 's-Hertogenbosch", months: [2, 3], tags: ["free"], src: ["https://nl.wikipedia.org/wiki/Oeteldonk"] },
    { id: "binnendieze", cat: "dene", area: "merkez", title: "Sail under the city on the Binnendieze",
      desc: "Den Bosch's old waterways run beneath houses, streets and fortress walls. A silent boat takes you through tunnels and past medieval cellars, with a guide telling the story of the swamp dragon city.",
      tip: "Book ahead for weekends and check which pier your ticket uses, Molenstraat or Zuidwal; online maps can send you to the wrong spot.", q: "Binnendieze Molenstraat 's-Hertogenbosch", months: [4, 5, 6, 7, 8, 9, 10], src: ["https://dagjedenbosch.com/en/activities/boat-tour-on-the-binnendieze/"] }
  ]
};
