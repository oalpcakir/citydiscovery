// Brüksel ve çevresi (Leuven, Waterloo, Tervuren, Hallerbos, Meise) görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.brussel = {
  id: "brussel",
  name: "Brussels",
  subtitle: "& surroundings",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbourhood Regular", "Bruxellois", "Ketje"],
  areas: {
    merkez: "Centre",
    marolles: "Marolles, Sablon & Midi",
    avrupa: "European Quarter",
    ixelles: "Ixelles & Saint-Gilles",
    laeken: "Laeken & Heysel",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[50.815, 4.310], [50.905, 4.410]],
  coords: {
    grandplace: [50.8467, 4.3525], pis: [50.8485, 4.3540], bd: [50.8453, 4.3503], dandoy: [50.8471, 4.3512],
    mortsubite: [50.8487, 4.3560], merdunord: [50.8504, 4.3480],
    poelaert: [50.8370, 4.3525], jeudeballe: [50.8368, 4.3455], sablon: [50.8405, 4.3557], cantillon: [50.8415, 4.3355],
    antoine: [50.8373, 4.3818], parlamentarium: [50.8388, 4.3742],
    horta: [50.8243, 4.3556], chatelain: [50.8246, 4.3600],
    atomium: [50.8949, 4.3415], serres: [50.8891, 4.3571],
    leuven: [50.8789, 4.7012], oudemarkt: [50.8777, 4.7000], waterloo: [50.6785, 4.4048], tervuren: [50.8309, 4.5186],
    hallerbos: [50.7009, 4.2767], meise: [50.9285, 4.3280]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🏛️", name: "Grand-Place Regular" },
    marolles: { icon: "🧺", name: "Marollien" },
    avrupa: { icon: "🇪🇺", name: "Euro Commuter" },
    ixelles: { icon: "🌿", name: "Art Nouveau Hunter" },
    laeken: { icon: "⚛️", name: "Heysel Wanderer" },
    cevre: { icon: "🌲", name: "Brabant Explorer" }
  },
  quests: [
    // ---------- GÖRÜLECEK ----------
    { id: "grandplace", cat: "gor", area: "merkez", title: "Read the guild houses on the Grand-Place",
      desc: "After the French bombardment of 1695, the guilds rebuilt this square within a few years, and today it is a UNESCO World Heritage Site. Every house has a name and an emblem on top: a swan, a fox, a wheelbarrow.",
      tip: "Notice that the town hall tower is not centred; it sits off to one side of the doorway. In even-numbered years a flower carpet covers the square in August.", q: "Grand-Place Bruxelles", tags: ["free"] },
    { id: "poelaert", cat: "gor", area: "marolles", title: "Take in the city from Place Poelaert",
      desc: "The Palais de Justice, one of the largest buildings in the world when it was built, was planted on top of the working-class Marolles district. The terrace in front is Brussels' widest free view: on a clear day you can see the Atomium.",
      tip: "The glass lift on the square takes you down to the Marolles for free.", q: "Place Poelaert Bruxelles", tags: ["free"] },
    { id: "horta", cat: "gor", area: "ixelles", title: "Climb the staircase in Horta's house",
      desc: "The home and studio of Victor Horta, one of the founders of Art Nouveau: the curling ironwork, stained glass and light well are all his work down to the smallest detail. The house is a UNESCO World Heritage Site.",
      tip: "Visitor numbers are limited, so book ahead. The surrounding streets have more Art Nouveau facades.", q: "Musée Horta Saint-Gilles", tags: ["rainy day"] },
    { id: "atomium", cat: "gor", area: "laeken", title: "Step inside the spheres of the Atomium",
      desc: "Built for the 1958 World's Fair, this 102-metre structure represents an iron crystal magnified billions of times. It was meant to be temporary; it became the symbol of the city and stayed.",
      tip: "The lit-up escalators between the spheres are the most fun part. Book a timed ticket online.", q: "Atomium Bruxelles" },
    { id: "leuven", cat: "gor", area: "cevre", title: "Count the statues on Leuven's town hall",
      desc: "The facade of the 15th-century Gothic Stadhuis is carved like lace, with 236 statues standing in its niches. It is the showpiece of a university town less than half an hour from Brussels by train.",
      tip: "Step into the Sint-Pieterskerk across the way, then walk to the square by the university library.", q: "Stadhuis Leuven", tags: ["free"] },
    { id: "waterloo", cat: "gor", area: "cevre", title: "Climb the Lion's Mound at Waterloo",
      desc: "An artificial hill was heaped up on the battlefield where Napoleon was defeated in 1815, topped with a cast-iron lion. At the end of 226 steps you look out over the plain and see where the armies stood.",
      tip: "The underground museum and the panorama painting at the foot of the mound are included in the same ticket.", q: "Butte du Lion Waterloo" },
    { id: "tervuren", cat: "gor", area: "cevre", title: "Visit the AfricaMuseum in Tervuren",
      desc: "This palace museum was built by King Leopold II as a colonial showcase. After a long renovation it has reopened as a place that questions both Congolese history and its own past. It is where Belgium confronts its colonial legacy.",
      tip: "Hop on tram 44 from Montgomery: the ride runs through the Sonian Forest and is half the fun.", q: "AfricaMuseum Tervuren", tags: ["rainy day"] },
    { id: "meise", cat: "gor", area: "cevre", title: "Wander the greenhouses at Meise Botanic Garden",
      desc: "One of the largest botanic gardens in the world, set in a vast park around a castle. In the Plantenpaleis greenhouses you walk through climates from rainforest to desert.",
      tip: "The garden is big, so set aside half a day. Even on a rainy day the greenhouses and the castle are enough.", q: "Plantentuin Meise", tags: ["rainy day"] },

    // ---------- YENİLECEK ----------
    { id: "dandoy", cat: "ye", area: "merkez", title: "Tell a Brussels waffle from a Liège waffle",
      desc: "The Brussels waffle is rectangular, light and crisp; the Liège waffle is round-cornered, dense and studded with pearl sugar. Maison Dandoy, baking speculoos since 1829, makes both.",
      tip: "Skip the mountains of sauce at the tourist stalls: a real Brussels waffle is eaten with just powdered sugar.", q: "Maison Dandoy Rue au Beurre Bruxelles" },
    { id: "mortsubite", cat: "ye", area: "merkez", title: "Drink a gueuze at À la Mort Subite",
      desc: "A café that has barely changed since 1928: mirrors, long benches and waiters in aprons. The name comes from a dice game, and the star of the menu is gueuze, Brussels' sour beer.",
      tip: "Ask for a tartine with cheese or 'tête pressée' (brawn) on the side. It is right at the exit of the Galeries Royales Saint-Hubert arcade.", q: "A la Mort Subite Bruxelles", tags: ["rainy day"] },
    { id: "merdunord", cat: "ye", area: "merkez", title: "Eat fish standing up at Sainte-Catherine",
      desc: "At the open counter of Noordzee - Mer du Nord, on the corner of the old fish market, you place your order and wait on the square until your name is called. The shrimp croquette is one of Brussels' favourite bites.",
      tip: "Go at lunchtime; a glass of white wine on the side is the local custom here.", q: "Noordzee Mer du Nord Bruxelles" },
    { id: "sablon", cat: "ye", area: "marolles", title: "Pick your pralines one by one at the Sablon",
      desc: "The praline was invented in Brussels, and the city's great chocolatiers sit side by side around the Place du Grand Sablon. Choosing them one at a time from the window beats a ready-made box.",
      tip: "Buy a few from two different shops and compare them on the square. On weekends an antiques market sets up there.", q: "Place du Grand Sablon Bruxelles" },
    { id: "cantillon", cat: "ye", area: "marolles", title: "Taste lambic at Cantillon",
      desc: "Run by the same family since 1900, this brewery is one of the last traditional makers in the city of lambic, a beer fermented by yeast caught from the air. You explore on your own among the barrels, copper kettles and the cooling tun in the attic.",
      tip: "There is a tasting at the end of the tour. It tastes sour and surprising, so don't judge on the first sip.", q: "Brasserie Cantillon Anderlecht", tags: ["rainy day"] },
    { id: "antoine", cat: "ye", area: "avrupa", title: "Get a cone of frites from Maison Antoine",
      desc: "The stand in the middle of Place Jourdan has been selling twice-fried Belgian potatoes since 1948. In the queue, EU officials, students and locals wait side by side.",
      tip: "At the cafés on the square with a 'frites acceptées' sign, you can order a drink and eat your cone at the table. Try the 'andalouse' sauce.", q: "Maison Antoine Place Jourdan" },
    { id: "oudemarkt", cat: "ye", area: "cevre", title: "Have a beer at Leuven's 'longest bar'",
      desc: "All four sides of the Oude Markt square are lined with cafés and terraces, and Leuveners call it the longest bar in the world. Stella Artois is brewed in this town.",
      tip: "Come on a sunny late afternoon; outside the student term the square is noticeably calmer.", q: "Oude Markt Leuven" },

    // ---------- DENEYİM ----------
    { id: "pis", cat: "dene", area: "merkez", title: "Complete the peeing trio",
      desc: "Everyone knows Manneken Pis; his sister Jeanneke Pis hides in a dead-end alley, and the dog Zinneke Pis is tucked away on a pavement corner. Finding all three is a way to get to know the city's humour, which loves to poke fun at itself.",
      tip: "Jeanneke is in Impasse de la Fidélité; Zinneke is on Rue des Chartreux. Manneken's hundreds of costumes are in the little museum on Rue du Chêne.", q: "Jeanneke Pis Bruxelles", tags: ["free"] },
    { id: "bd", cat: "dene", area: "merkez", title: "Follow the comic strip murals",
      desc: "Brussels, home of Tintin, the Smurfs and Lucky Luke, has painted its heroes on building facades. Dozens of murals are scattered across the centre's streets and make up a route.",
      tip: "Start at the Tintin mural on Rue de l'Étuve; the tourist office has a map of the route.", q: "Fresque Tintin Rue de l'Etuve Bruxelles", tags: ["free"] },
    { id: "jeudeballe", cat: "dene", area: "marolles", title: "Haggle at the Jeu de Balle flea market",
      desc: "On the square in the heart of the Marolles, a flea market sets up every morning of the year. Records, frames, boxes from emptied houses: Bruxellois call it the 'Vieux Marché'.",
      tip: "Go early in the morning; it packs up in the afternoon. Nearby Rue Blaes and Rue Haute are full of antique dealers.", q: "Place du Jeu de Balle Bruxelles", tags: ["free"] },
    { id: "parlamentarium", cat: "dene", area: "avrupa", title: "Decode the EU at the Parlamentarium",
      desc: "The European Parliament's interactive visitor centre explains what goes on inside those glass buildings you pass every day. It is the tidiest place to see why Brussels is called the 'capital of Europe'.",
      tip: "Entry is free; bring your ID. On your way out, mingle with the officials in the Thursday evening crowd at Place du Luxembourg.", q: "Parlamentarium Bruxelles", tags: ["free", "rainy day"] },
    { id: "chatelain", cat: "dene", area: "ixelles", title: "Go to the Châtelain market on a Wednesday evening",
      desc: "The market held every Wednesday afternoon on Place du Châtelain is less about shopping than a neighbourhood get-together. People eat cheese and oysters from the stalls standing up, glass in hand.",
      tip: "It is liveliest around after-work hours; afterwards everyone scatters to the nearby bars.", q: "Place du Châtelain Ixelles", tags: ["free"] },
    { id: "serres", cat: "dene", area: "laeken", title: "Catch the Royal Greenhouses while they're open",
      desc: "Built for Leopold II, these giant Art Nouveau glass-and-iron greenhouses sit in the royal palace gardens and open to the public for only a few weeks a year, in spring. A long walk among camellias, palms and glass domes.",
      tip: "Tickets are sold online for timed slots and go fast; keep an eye on the dates in March.", q: "Serres Royales de Laeken", months: [4, 5] },
    { id: "hallerbos", cat: "dene", area: "cevre", title: "Walk the blue carpet in Hallerbos",
      desc: "Every spring the floor of the beech forest near Halle turns purple for a few weeks with millions of wild bluebells. With light filtering through the freshly opened leaves, it looks like a fairy tale.",
      tip: "The bloom usually runs from mid-April to early May; check the forest's website for the current status and stay on the path.", q: "Hallerbos Halle", months: [4, 5], tags: ["free"] }
  ]
};
