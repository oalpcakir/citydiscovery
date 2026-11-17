// Utrecht ve çevresi görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.utrecht = {
  id: "utrecht",
  name: "Utrecht",
  subtitle: "& surroundings",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Utrechter", "Echte Utrechter"],
  areas: {
    merkez: "Centre",
    dogu: "East",
    bati: "Lombok & West",
    guney: "South & Amelisweerd",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[52.060, 5.030], [52.125, 5.185]],
  coords: {
    domtoren: [52.0907, 5.1213], pandhof: [52.0904, 5.1226], nijntje: [52.0957, 5.1165], trajectumlumen: [52.0922, 5.1196],
    werfkelder: [52.0915, 5.1190], oudaen: [52.0931, 5.1172], broodjemario: [52.0922, 5.1171], nff: [52.0853, 5.1245],
    schroderhuis: [52.0853, 5.1475], maliebaan: [52.0942, 5.1380],
    kanaalstraat: [52.0918, 5.1015], hogewoerd: [52.0868, 5.0425],
    amelisweerd: [52.0673, 5.1590], rhijnauwen: [52.0699, 5.1779],
    dehaar: [52.1215, 4.9862], koppelpoort: [52.1589, 5.3838], drieringen: [52.1583, 5.3847], fortvechten: [52.0586, 5.1684],
    raadhuishilversum: [52.2290, 5.1672], pyramide: [52.0904, 5.3428], vecht: [52.1722, 5.0038], heksenwaag: [52.0252, 4.8693]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "⛪", name: "Dom Wolf" },
    dogu: { icon: "🟥", name: "Rietveld Fan" },
    bati: { icon: "🧿", name: "Lombok Local" },
    guney: { icon: "🛶", name: "Kromme Rijn Wanderer" },
    cevre: { icon: "🏰", name: "Surroundings Scout" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "pandhof", cat: "gor", area: "merkez", title: "Find the Dom's hidden courtyard, the Pandhof",
      desc: "A cloister garden with Gothic arcades, squeezed between the cathedral and the university building. A few steps from the crowds on Domplein, it holds a completely different kind of quiet, with a fountain and medicinal herbs in the middle.",
      tip: "The stone carvings in the arcade show scenes from the life of Saint Martin. And remember that the gap between the Dom Church and the tower is where the nave collapsed in the 1674 storm.", q: "Pandhof Domkerk Utrecht", tags: ["free"] },
    { id: "nijntje", cat: "gor", area: "merkez", title: "Stop by Nijntje's square",
      desc: "Dick Bruna, who drew the world-famous rabbit Nijntje (Miffy), spent his whole life in Utrecht. On the little Nijntje Pleintje stands a bronze statue of the rabbit.",
      tip: "There is also a pedestrian light in the centre shaped like Nijntje; find that one too. If you're with kids, carry on to the Nijntje Museum.", q: "Nijntje Pleintje Utrecht", tags: ["free"] },
    { id: "schroderhuis", cat: "gor", area: "dogu", title: "Slide the walls of the Rietveld Schröderhuis",
      desc: "Designed by Gerrit Rietveld for Truus Schröder in 1924, this house is the only truly liveable example of the De Stijl movement and a UNESCO World Heritage site. The walls of the upper floor slide away and turn it into one single room.",
      tip: "The interior can only be visited with a prior reservation; tickets are sold through the Centraal Museum and sell out fast.", q: "Rietveld Schröderhuis Utrecht" },
    { id: "hogewoerd", cat: "gor", area: "bati", title: "See the Roman ship at Castellum Hoge Woerd",
      desc: "In the middle of Leidsche Rijn's new housing estates stands a full-size reconstruction of a fort on the northern border of the Roman Empire. Inside, a 2000-year-old river ship, dug up nearby, is on display.",
      tip: "You can walk on top of the walls. The city farm next door is a good break for kids.", q: "Castellum Hoge Woerd Utrecht", tags: ["free"] },
    { id: "dehaar", cat: "gor", area: "cevre", title: "Get lost in the gardens of Kasteel de Haar",
      desc: "The biggest castle in the Netherlands was rebuilt in the late 19th century on top of a medieval ruin by Pierre Cuypers, the architect of the Rijksmuseum. The whole village of Haarzuilens was moved to make room for the park.",
      tip: "In the village, all the houses have red and white shutters, the castle's colours. A lovely half-day bike trip from Utrecht.", q: "Kasteel de Haar Haarzuilens" },
    { id: "koppelpoort", cat: "gor", area: "cevre", title: "Walk through the Koppelpoort in Amersfoort",
      desc: "This 15th-century gate closed off both land and water: the barrier over the river was raised and lowered by the strength of men walking inside a wooden wheel.",
      tip: "After the gate, follow the 'Muurhuizen' street built into the city walls; you'll loop around the old town and come out where you started.", q: "Koppelpoort Amersfoort", tags: ["free"] },
    { id: "fortvechten", cat: "gor", area: "cevre", title: "Flood the country at Fort bij Vechten",
      desc: "For centuries the Netherlands planned to hold off its enemies by flooding its own land. The museum of the UNESCO-listed Nieuwe Hollandse Waterlinie sits in one of the biggest forts of that defence line.",
      tip: "On the giant outdoor model in the courtyard you can open the sluices yourself and watch how the land floods.", q: "Waterliniemuseum Fort bij Vechten Bunnik" },
    { id: "raadhuishilversum", cat: "gor", area: "cevre", title: "Dudok's town hall in Hilversum",
      desc: "Finished by Willem Dudok in 1931, the yellow-brick Raadhuis is a modernist classic that architects travel from all over the world to see. Its tower, reflected in the pond, is the symbol of the town.",
      tip: "Walk all the way around the building and look at it from every side. On certain days there are guided tours and tower climbs.", q: "Raadhuis Hilversum Dudok", tags: ["free"] },

    // YENİLECEK
    { id: "werfkelder", cat: "ye", area: "merkez", title: "Eat at water level, in a werfkelder",
      desc: "The two-level wharves of the Oudegracht are a structure found nowhere else in the world: the storage cellars of medieval merchants, under the street, are now restaurants and cafes. Your table sits right on the edge of the canal.",
      tip: "Take the stairs down to the wharf near Stadhuisbrug and pick a spot with a table by the water.", q: "Oudegracht werfkelders Utrecht" },
    { id: "oudaen", cat: "ye", area: "merkez", title: "Home-brewed beer at Stadskasteel Oudaen",
      desc: "A 13th-century town castle on the Oudegracht and the best-preserved example of the medieval tower houses along the canal. It brews its own beer in the cellar.",
      tip: "Step into the high-ceilinged main hall; in summer the terrace at wharf level opens up too.", q: "Stadskasteel Oudaen Utrecht", tags: ["rainy day"] },
    { id: "broodjemario", cat: "ye", area: "merkez", title: "Eat a Broodje Mario",
      desc: "The Italian sandwich with salami, cheese and hot peppers from the little stand on the Oudegracht has been Utrecht's street food for decades. It's always on Utrechters' homesickness list.",
      tip: "Eat it standing, leaning on the canal railing. If you don't like heat, don't forget to say so.", q: "Broodje Mario Oudegracht Utrecht" },
    { id: "kanaalstraat", cat: "ye", area: "bati", title: "Shop and eat on Kanaalstraat",
      desc: "The main street of the Lombok neighbourhood: Turkish bakeries, Moroccan butchers, Surinamese stalls and spice shops side by side. The mosque and the square at the end are the heart of the neighbourhood.",
      tip: "It's at its liveliest on Saturday. Walk on to De Ster, the timber mill at the other end of the neighbourhood.", q: "Kanaalstraat Lombok Utrecht" },
    { id: "rhijnauwen", cat: "ye", area: "guney", title: "Pannenkoek at the Rhijnauwen tea house",
      desc: "Theehuis Rhijnauwen, in the woods on the bank of the Kromme Rijn, is where Utrechters have ended their Sunday walks for generations. A huge Dutch pancake and a view of the river.",
      tip: "In nice weather the queue gets long; go on a weekday or early in the morning. You can also come from the city by canoe along the river.", q: "Theehuis Rhijnauwen Bunnik" },
    { id: "drieringen", cat: "ye", area: "cevre", title: "Taste Amersfoort's city beer",
      desc: "Right next to the Koppelpoort, on the waterside, De Drie Ringen is Amersfoort's own brewery. In the Middle Ages the city was famous for its hundreds of breweries.",
      tip: "Ask for a tasting board and look at the view of the gate from the terrace.", q: "Stadsbrouwerij De Drie Ringen Amersfoort" },

    // DENEYİM
    { id: "domtoren", cat: "dene", area: "merkez", title: "Climb the 465 steps of the Domtoren",
      desc: "At 112 metres, the Dom Tower is the tallest church tower in the Netherlands. For a long time it was an unwritten rule that no building in Utrecht could be taller than it.",
      tip: "You can only climb with a guided tour, so book your ticket in advance. In the open air you can see Amsterdam and Rotterdam.", q: "Domtoren Utrecht" },
    { id: "trajectumlumen", cat: "dene", area: "merkez", title: "Walk the Trajectum Lumen route in the dark",
      desc: "After sunset, the bridges, churches and passageways in the centre light up with light art. The route makes you look with fresh eyes at places you pass every day.",
      tip: "Don't skip the colour-changing tunnel at Ganzenmarkt and the works around the Dom. Perfect for winter evenings.", q: "Trajectum Lumen Utrecht", tags: ["free"] },
    { id: "nff", cat: "dene", area: "merkez", title: "Watch a film at the Nederlands Film Festival",
      desc: "Every autumn Dutch cinema gathers in Utrecht and the Gouden Kalf (Golden Calf) awards are handed out here. For ten days the city turns into a red carpet.",
      tip: "Pick a screening at the Louis Hartlooper Complex, a former police station; its cafe is lovely outside the festival too.", q: "Louis Hartlooper Complex Utrecht", months: [9, 10], tags: ["rainy day"] },
    { id: "maliebaan", cat: "dene", area: "dogu", title: "Ride the first bike path in the Netherlands",
      desc: "The lane opened in 1885 on the tree-lined Maliebaan is considered the country's first bike path. This is where the cycling nation began.",
      tip: "At the end of the road is the Spoorwegmuseum in the old Maliebaan station; from there carry on to Wilhelminapark.", q: "Maliebaan Utrecht", tags: ["free"] },
    { id: "amelisweerd", cat: "dene", area: "guney", title: "Walk in the Amelisweerd woods",
      desc: "Old estate woodlands on the edge of the city, stretching along the Kromme Rijn. In the 1980s Utrechters climbed into the trees here to protect them from being cut down for a motorway.",
      tip: "In early spring the forest floor is in bloom. Follow the river on to Rhijnauwen.", q: "Landgoed Oud Amelisweerd", tags: ["free"] },
    { id: "pyramide", cat: "dene", area: "cevre", title: "Climb the Pyramid of Austerlitz",
      desc: "In the middle of the Utrechtse Heuvelrug forests stands an earth pyramid that General Marmont had built in 1804 for Napoleon's soldiers, who were bursting with boredom.",
      tip: "The hilltop can be climbed in season. The forest paths around it are at their best in autumn.", q: "Pyramide van Austerlitz", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "vecht", cat: "dene", area: "cevre", title: "Cycle village to village along the Vecht",
      desc: "In the 17th and 18th centuries, wealthy Amsterdam merchants lined the Vecht with summer estates and waterside tea pavilions. Brooklyn in New York takes its name from Breukelen here.",
      tip: "Follow the river from Utrecht through Oud-Zuilen, Maarssen and Breukelen all the way to Loenen; you can take the train back.", q: "Vechtbrug Breukelen", tags: ["free"] },
    { id: "heksenwaag", cat: "dene", area: "cevre", title: "Prove you're not a witch in Oudewater",
      desc: "In the years of the witch hunts, Oudewater's scales were famous for their honesty: nobody weighed here ever came out light enough to fly on a broomstick. Today you can be weighed and get your 'not a witch' certificate.",
      tip: "The museum may be closed in the winter months. Wander the town's streets too, which tell of its old rope-making past.", q: "Museum de Heksenwaag Oudewater", months: [4, 5, 6, 7, 8, 9, 10] }
  ]
};
