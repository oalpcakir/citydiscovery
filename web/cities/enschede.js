// Quests for the Enschede region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.enschede = {
  id: "enschede",
  name: "Enschede",
  subtitle: "& Twente",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Tukker at heart", "Echte Tukker"],
  areas: {
    merkez: "Enschede",
    cevre: "Twente"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[52.191, 6.844], [52.252, 6.944]],
  coords: {
    villamondriaan: [51.9717, 6.7236], berenschot: [51.9467, 6.7060], twickel: [52.2664, 6.7150],
    rijksmuseumtwenthe: [52.2278, 6.8969], plechelmus: [52.3125, 6.9283], canadesebegraafplaats: [52.2995, 6.4280],
    twentsebier: [52.2560, 6.7905], vloggelen: [52.4081, 6.8973], paasvuurespelo: [52.3020, 6.4230],
    sallandseheuvelrug: [52.3544, 6.4635]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🧵", name: "Textile Town Regular" },
    cevre: { icon: "🌳", name: "Twente Rambler" }
  },
  quests: [
    { id: "villamondriaan", cat: "gor", area: "cevre", title: "Meet young Mondriaan in Winterswijk",
      desc: "Long before his grids of red, yellow and blue, Piet Mondriaan grew up in this house in Winterswijk. Villa Mondriaan shows his early landscapes next to work by other artists.",
      tip: "It is a short walk from Winterswijk station; afterwards cycle out into the hedged farmland that he painted.", q: "Villa Mondriaan Winterswijk", tags: ["rainy day"], src: ["https://nl.wikipedia.org/wiki/Villa_Mondriaan", "https://en.wikivoyage.org/wiki/Winterswijk"] },
    { id: "berenschot", cat: "ye", area: "cevre", title: "Have lunch at Berenschot's watermill",
      desc: "South of Winterswijk, a water mill from 1652 on the edge of a small nature reserve now houses a restaurant. Its wheel still turns on the stream outside.",
      tip: "Cycle there from Winterswijk through the Achterhoek coulisse landscape of hedges and small fields.", q: "Berenschot's Watermolen Winterswijk", src: ["https://en.wikivoyage.org/wiki/Winterswijk", "https://en.wikivoyage.org/wiki/Achterhoek"] },
    { id: "twickel", cat: "gor", area: "cevre", title: "Stroll the gardens of Twickel near Delden",
      desc: "Twickel is one of the great country estates of the Netherlands, with a moated castle, formal gardens, an orangery and dozens of protected farmhouses spread around Delden.",
      tip: "In summer the orangery has a tearoom and the vegetable gardens open on set days; the castle interior is only shown for a short spell in August.", q: "Kasteel Twickel Delden", months: [4, 5, 6, 7, 8, 9, 10], src: ["https://en.wikipedia.org/wiki/Twickel"] },
    { id: "rijksmuseumtwenthe", cat: "gor", area: "merkez", title: "Visit Rijksmuseum Twenthe in Enschede",
      desc: "The largest art museum in the east of the country spans medieval manuscripts, Ruisdael landscapes, Impressionists and contemporary art, in the rebuilt Roombeek district.",
      tip: "It is about a ten minute walk northeast of Enschede station; combine it with a stroll through Roombeek's new architecture.", q: "Rijksmuseum Twenthe Enschede", tags: ["rainy day"], src: ["https://en.wikipedia.org/wiki/Rijksmuseum_Twenthe"] },
    { id: "plechelmus", cat: "gor", area: "cevre", title: "Meet the 'Oude Grijze' in Oldenzaal",
      desc: "The Romanesque Sint-Plechelmusbasiliek dates back to the 12th century, and its sturdy tower, nicknamed the 'Oude Grijze' (old grey one), carries a 49-bell carillon.",
      tip: "Time your visit with a carillon recital and listen from the terraces on the square around the church.", q: "Sint-Plechelmusbasiliek Oldenzaal", src: ["https://nl.wikipedia.org/wiki/Sint-Plechelmusbasiliek"] },
    { id: "canadesebegraafplaats", cat: "gor", area: "cevre", title: "Pay respects at the Canadian War Cemetery in Holten",
      desc: "On the wooded slope of the Holterberg lie 1,393 Canadian soldiers who fell during the liberation of the Netherlands; the rows of white headstones under the pines are deeply moving.",
      tip: "Visit the small visitor centre first for the soldiers' stories, then continue into the Sallandse Heuvelrug on foot.", q: "Canadese Begraafplaats Holten", tags: ["free"], src: ["https://en.wikipedia.org/wiki/Sallandse_Heuvelrug_National_Park"] },
    { id: "twentsebier", cat: "ye", area: "cevre", title: "Taste Twente beer at the brewery in Hengelo",
      desc: "The Twentse Bierbrouwerij brews in the old Hazemeyer factory buildings, and its tasting room pours ten Twente-brewed specialty beers alongside dishes made with local products.",
      tip: "On Saturdays there is a small tour of the brewing lab; reserve in advance.", q: "Twentse Bierbrouwerij Haaksbergerstraat Hengelo", src: ["https://www.twentsebierbrouwerijproeflokaal.nl/proeflokaal", "https://nl.wikipedia.org/wiki/Twentse_Bierbrouwerij"] },
    { id: "vloggelen", cat: "dene", area: "cevre", title: "Join the Vlöggelen in Ootmarsum at Easter",
      desc: "On Easter Sunday and Easter Monday the eight Poaskearls lead a singing, hand-in-hand chain of townspeople through the streets, houses and cafés of Ootmarsum before the Easter fire burns.",
      tip: "Anyone may join the line behind the Poaskearls; follow the crowd from the church and the Paaskamp fire in the late afternoon.", q: "Markt Ootmarsum", months: [3, 4], tags: ["free"], src: ["https://nl.wikipedia.org/wiki/Vl%C3%B6ggelen", "https://nl.wikipedia.org/wiki/Ootmarsum"] },
    { id: "paasvuurespelo", cat: "dene", area: "cevre", title: "Watch the giant Easter fire of Espelo",
      desc: "Around Holten, neighbourhoods compete each year for the biggest Easter fire; Espelo once built one of nearly 46 metres, a world record.",
      tip: "Fires are lit on the evening of Easter Sunday; check which neighbourhood fires are open to visitors and dress for smoke.", q: "Paasvuur Espelo Holten", months: [3, 4], tags: ["free"], src: ["https://nl.wikipedia.org/wiki/Paasvuur"] },
    { id: "sallandseheuvelrug", cat: "dene", area: "cevre", title: "Hike the heath of the Sallandse Heuvelrug",
      desc: "Between Nijverdal and Holten rises a ridge of ice-age hills covered in vast heathland, topped by the Koningsbelt at 75 m, one of the highest points in the region.",
      tip: "Start at the Staatsbosbeheer visitor centre in Nijverdal; come in late summer when the heather turns purple.", q: "Bezoekerscentrum Sallandse Heuvelrug Nijverdal", tags: ["free"], src: ["https://en.wikipedia.org/wiki/Sallandse_Heuvelrug_National_Park"] }
  ]
};
