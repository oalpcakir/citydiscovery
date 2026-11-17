// Quests for the Den Haag region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, copy a file like this,
// change the id, add a <script> line to index.html and re-run tools/build_regions.py.
window.CITIES = window.CITIES || {};
window.CITIES.denhaag = {
  id: "denhaag",
  name: "Den Haag",
  subtitle: "& surroundings",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Hagenaar", "Echte Hagenees"],
  areas: {
    merkez: "Centre",
    scheveningen: "Scheveningen",
    bati: "West side",
    dogu: "Haagse Bos & East",
    cevre: "Surroundings"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
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
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🏛️", name: "Hofstad Wolf" },
    scheveningen: { icon: "🌊", name: "Scheveninger" },
    bati: { icon: "🕊️", name: "West Wanderer" },
    dogu: { icon: "🌳", name: "Forest Keeper" },
    cevre: { icon: "🌷", name: "Surroundings Scout" }
  },
  quests: [
    // SEE
    { id: "hofvijver", cat: "gor", area: "merkez", title: "Spot the Torentje from the Hofvijver",
      desc: "Look across the pond at the Binnenhof, where Dutch politics has been done for centuries. The little octagonal tower right at the water's edge is the Torentje, the prime ministers' traditional office.",
      tip: "The Binnenhof has been under restoration for a long time. The best view is from the Lange Vijverberg side, once the evening lights come on.", q: "Hofvijver Den Haag", tags: ["free"] },
    { id: "mauritshuis", cat: "gor", area: "merkez", title: "Meet the Girl with a Pearl Earring",
      desc: "Vermeer's most famous painting, Rembrandt's Anatomy Lesson of Dr. Tulp and Fabritius's The Goldfinch all live in the same small 17th-century palace. Small enough to see in an hour, good enough to remember for a lifetime.",
      tip: "The rooms empty out closer to closing time, which gives you a better shot at having the painting to yourself.", q: "Mauritshuis Den Haag", tags: ["rainy day"] },
    { id: "vredespaleis", cat: "gor", area: "bati", title: "Find the flame at the Peace Palace gate",
      desc: "Opened in 1913, the Vredespaleis is home to the International Court of Justice and the reason Den Haag is called the 'city of peace and justice'. Beside the gate burns a peace flame, ringed by stones from all over the world.",
      tip: "The visitor centre at the gate is free. The building's interior and gardens are only open on certain days, with a guided tour.", q: "Vredespaleis Den Haag", tags: ["free"] },
    { id: "kunstmuseum", cat: "gor", area: "bati", title: "See Victory Boogie Woogie",
      desc: "The Kunstmuseum holds the largest Mondriaan collection in the world, including the last painting he never finished. Berlage's yellow-brick building is a work of art in itself.",
      tip: "Walk the Mondriaan rooms in order, from his early landscapes to the abstract works, and you can watch the change happen step by step.", q: "Kunstmuseum Den Haag", tags: ["rainy day"] },
    { id: "japansetuin", cat: "gor", area: "dogu", title: "Step into the Japanese garden at Clingendael",
      desc: "In the early 20th century the lady of the estate built it with lanterns and bridges she brought back from Japan. It is so delicate that it opens for only a few weeks a year.",
      tip: "It opens for the azaleas in spring and the maples in autumn. The municipality announces the dates every year.", q: "Japanse Tuin Clingendael Den Haag", months: [4, 5, 6, 10], tags: ["free"] },
    { id: "beeldenaanzee", cat: "gor", area: "scheveningen", title: "Count the fairy-tale statues on the boulevard",
      desc: "In front of Museum Beelden aan Zee, Tom Otterness's bronze fairy-tale figures are scattered along the boulevard: a giant eating herring, Hansel and Gretel, Gulliver. The museum itself, tucked into the dunes, is the only sculpture museum in the Netherlands.",
      tip: "The outdoor sculptures are free and kids can climb all over them.", q: "Museum Beelden aan Zee Scheveningen", tags: ["free"] },
    { id: "hortusleiden", cat: "gor", area: "cevre", title: "Visit the garden of the first Dutch tulips in Leiden",
      desc: "Founded in 1590, the Hortus botanicus Leiden is the oldest botanical garden in the country. Carolus Clusius planted the first Dutch tulip bulbs here, and a re-created version of his garden is open to visit.",
      tip: "Walk there along the Rapenburg canal: Leiden's prettiest canal and the university's historic building are on the same route.", q: "Hortus botanicus Leiden" },
    { id: "keukenhof", cat: "gor", area: "cevre", title: "Catch Keukenhof while it's open",
      desc: "The park in Lisse is planted by hand every autumn with millions of bulbs, and it is open for only a few weeks in spring. Living nearby and never having been is the most common confession.",
      tip: "Tickets are timed and bought in advance. Pick a weekday morning, first slot; mid-April is usually the most colourful stretch.", q: "Keukenhof Lisse", months: [3, 4, 5] },
    { id: "voorlinden", cat: "gor", area: "cevre", title: "Walk on the bottom of a pool at Voorlinden",
      desc: "A private contemporary art museum in the dune landscape of Wassenaar, flooded with natural daylight. In Leandro Erlich's 'Swimming Pool' you stay dry while standing under the water.",
      tip: "The garden and the dune walking path around the museum are included in your ticket too, so leave time if the weather is nice.", q: "Museum Voorlinden Wassenaar", tags: ["rainy day"] },

    // EAT & DRINK
    { id: "florencia", cat: "ye", area: "merkez", title: "Ice cream and coffee at Florencia",
      desc: "The Italian ice cream parlour on Torenstraat has been Den Haag's meeting spot for generations. Ministers and students alike sit at the same plastic tables.",
      tip: "Decide what you want while you wait in line. Service is quick and impatient, and that is part of the tradition.", q: "Florencia Torenstraat Den Haag" },
    { id: "posthoorn", cat: "ye", area: "merkez", title: "Bitterballen on Lange Voorhout",
      desc: "Lime-tree-lined Lange Voorhout, with its embassies and palaces, is the city's most elegant avenue. The terrace of Bodega De Posthoorn is an old hangout of politicians, artists and journalists.",
      tip: "In summer, pair it with the open-air sculpture exhibition in the middle of the avenue.", q: "Bodega De Posthoorn Den Haag" },
    { id: "haagsemarkt", cat: "ye", area: "bati", title: "Eat your way along the Haagse Markt",
      desc: "One of the biggest open-air markets in Europe and the most multicultural face of the city. A Surinamese snack bar, fresh stroopwafel, kibbeling and Turkish stalls, all side by side.",
      tip: "It runs on Monday, Wednesday, Friday and Saturday. Near closing time, crates of fruit and veg go cheap.", q: "Haagse Markt Den Haag" },
    { id: "simonis", cat: "ye", area: "scheveningen", title: "Kibbeling from Simonis at the harbour",
      desc: "Scheveningen is still a working fishing port. At the Simonis family's fish stall by the harbour, the catch straight off the boat is served on a tray and eaten standing up.",
      tip: "Skip the branches on the boulevard and go to the one at the harbour ('aan de Haven'). Try a 'lekkerbekje' too.", q: "Simonis aan de Haven Scheveningen" },
    { id: "hutspot", cat: "ye", area: "cevre", title: "Eat hutspot in Leiden on 3 October",
      desc: "Every 3 October Leiden celebrates the end of the Spanish siege of 1574. According to legend, the pot of mashed carrots, onions and potatoes left behind by the fleeing soldiers is eaten across the whole city that day.",
      tip: "In the morning, herring and white bread are handed out at the Waag, and there is a funfair and a parade all day. The trains get very crowded.", q: "Stadhuis Leiden", months: [10] },
    { id: "leidsekaas", cat: "ye", area: "cevre", title: "Buy cumin cheese at the Leiden market",
      desc: "Leidse kaas is a local cheese dotted with cumin seeds; the crossed keys on its rind come from the city's coat of arms. The market along the Nieuwe Rijn canal is one of the nicest in the country.",
      tip: "The market runs on Wednesday and Saturday. Grab your cheese and sit on one of the terrace boats on the canal.", q: "Markt Nieuwe Rijn Leiden" },

    // DO
    { id: "prinsjesdag", cat: "dene", area: "merkez", title: "Wait for the royal carriage on Prinsjesdag",
      desc: "On the third Tuesday of September the King rides through the city in a horse-drawn carriage to read out the government's plans for the year. Hats, brass bands and the wave from the balcony of Paleis Noordeinde.",
      tip: "The route is announced in advance every year. For a good spot, head to the Lange Voorhout area early in the morning.", q: "Paleis Noordeinde Den Haag", months: [9], tags: ["free"] },
    { id: "haagsebos", cat: "dene", area: "dogu", title: "Cycle through the Haagse Bos",
      desc: "The forest starts right behind Central Station and is a remnant of one of the oldest forests in the Netherlands. Inside it stands Paleis Huis ten Bosch, where the King lives.",
      tip: "You can't enter the palace, but you can pass right by the fence. At the far end of the forest you can carry on towards Wassenaar.", q: "Haagse Bos Den Haag", tags: ["free"] },
    { id: "vlaggetjesdag", cat: "dene", area: "scheveningen", title: "Taste the first herring on Vlaggetjesdag",
      desc: "In June the new herring season opens in Scheveningen harbour with boats dressed in flags. Traditional costumes, old crafts and the year's first 'Hollandse Nieuwe'.",
      tip: "Usually a Saturday in mid-June. Take the tram to the harbour; there's no parking to be found.", q: "Vlaggetjesdag Scheveningen haven", months: [6], tags: ["free"] },
    { id: "nieuwjaarsduik", cat: "dene", area: "scheveningen", title: "Run into the North Sea on 1 January",
      desc: "The country's biggest New Year's dive takes place on Scheveningen beach: thousands of people in orange hats run into the ice-cold water at midday.",
      tip: "You need to register in advance to take part. Just watching counts too, but then the quest is only half done.", q: "Nieuwjaarsduik Scheveningen", months: [1] },
    { id: "surfles", cat: "dene", area: "scheveningen", title: "Catch a wave in Scheveningen",
      desc: "Scheveningen is the surf capital of the Netherlands: on the Noorderstrand next to the harbour pier you'll see surfers all year round. Lessons are available for beginners.",
      tip: "The surf schools also provide wetsuits; the water is cool even in summer. Pick a windless day with gentle waves.", q: "Hart Beach Scheveningen", months: [5, 6, 7, 8, 9, 10] },
    { id: "bollenvelden", cat: "dene", area: "cevre", title: "Cycle between the tulip fields",
      desc: "Outside Keukenhof's fence, the fields between Lisse and Noordwijkerhout turn into stripes of colour. You don't need a ticket for this, just a bike.",
      tip: "Mid-April is usually the best time. Don't walk into the fields, look from the edge: the bulbs are the farmers' livelihood. In April you might also catch the Bloemencorso flower parade.", q: "Loosterweg Noord Lisse", months: [4], tags: ["free"] },
    { id: "duinen", cat: "dene", area: "cevre", title: "Ride through the dunes to Wassenaarse Slag",
      desc: "North of Scheveningen, a cycle path runs through the Meijendel dunes without touching a single settlement and comes out on Wassenaar's beach. Den Haag's drinking water is filtered in these dunes.",
      tip: "If you keep going you'll reach Katwijk. Pick the direction that puts the wind at your back; you'll pay for it on the way home.", q: "Wassenaarse Slag", tags: ["free"] }
  ]
};
