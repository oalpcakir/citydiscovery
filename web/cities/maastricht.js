// Maastricht ve Limburg görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.maastricht = {
  id: "maastricht",
  name: "Maastricht",
  subtitle: "& Limburg",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Local", "Maastrichtenaar", "Echte Sjeng"],
  areas: {
    merkez: "Binnenstad",
    jeker: "Jekerkwartier",
    wyck: "Wyck & Céramique",
    sphinx: "Sphinxkwartier",
    sintpieter: "Sint-Pieter & Jekerdal",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[50.815, 5.650], [50.870, 5.730]],
  coords: {
    sintjan: [50.8488, 5.6869], dominicanen: [50.8500, 5.6897], vogelstruys: [50.8485, 5.6894],
    carnaval: [50.8494, 5.6879], preuvenemint: [50.8490, 5.6886],
    helpoort: [50.8454, 5.6958], bisschopsmolen: [50.8472, 5.6917], zoervleis: [50.8458, 5.6935],
    servaasbrug: [50.8494, 5.6968], bonnefanten: [50.8424, 5.7022],
    sphinxpassage: [50.8552, 5.6885], lumiere: [50.8560, 5.6900],
    grotten: [50.8335, 5.6850], enci: [50.8242, 5.6825], apostelhoeve: [50.8255, 5.6680],
    kerststad: [50.8624, 5.8287], cauberg: [50.8589, 5.8221], drielandenpunt: [50.7560, 6.0192],
    gulpener: [50.8158, 5.8905], thorn: [51.1612, 5.8408], roermond: [51.1937, 5.9880], margraten: [50.8185, 5.8052]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "⛪", name: "Vrijthof Regular" },
    jeker: { icon: "🏰", name: "Wall Watcher" },
    wyck: { icon: "🌉", name: "Wyck Crosser" },
    sphinx: { icon: "🏭", name: "Sphinx Master" },
    sintpieter: { icon: "⛰️", name: "Marl Miner" },
    cevre: { icon: "🚵", name: "Heuvelland Explorer" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "dominicanen", cat: "gor", area: "merkez", title: "Get lost in the bookshop inside the church",
      desc: "The 13th-century Dominican church is now Boekhandel Dominicanen: a three-storey steel bookcase rises under the Gothic vaults. A permanent fixture on lists of the world's most beautiful bookshops.",
      tip: "Go up to the top floor and see the ceiling frescoes at eye level. You can have coffee in the old choir section.", q: "Boekhandel Dominicanen Maastricht", tags: ["free", "rainy day"] },
    { id: "helpoort", cat: "gor", area: "jeker", title: "Walk through the Helpoort",
      desc: "The Helpoort (Hell Gate), dating from 1229, is the oldest surviving city gate in the Netherlands. The first city wall starting beside it and the Jeker stream make this the quietest corner of town.",
      tip: "After the gate, climb up onto the walls and follow them all the way to the city park.", q: "Helpoort Maastricht", tags: ["free"] },
    { id: "servaasbrug", cat: "gor", area: "wyck", title: "Walk across the Sint Servaasbrug",
      desc: "The stone arched bridge, built in the late 13th century, is considered the oldest bridge in the Netherlands. The old town lies on one bank, the Wyck district on the other.",
      tip: "Cross from the Wyck side at sunset: you get church towers in front of you and evening light on the Maas.", q: "Sint Servaasbrug Maastricht", tags: ["free"] },
    { id: "bonnefanten", cat: "gor", area: "wyck", title: "Enter the rocket tower of the Bonnefanten",
      desc: "The zinc-domed tower of the museum designed by Aldo Rossi, on the bank of the Maas, is the city's modern icon. It's also the starting point of the Céramique district, built on the grounds of the old ceramics factory.",
      tip: "Climb the long, steep main staircase, then step inside the dome; the empty space is a work of art in itself.", q: "Bonnefantenmuseum Maastricht", tags: ["rainy day"] },
    { id: "sphinxpassage", cat: "gor", area: "sphinx", title: "Read history tile by tile in the Sphinx Passage",
      desc: "The walls of the roughly 120-metre passage in the Eiffel building of the old Sphinx ceramics factory are covered in tens of thousands of tiles telling the story of the factory and its workers. An open-air album of Maastricht's industrial past.",
      tip: "Entry is free and it's open all day. Look for tile pictures of the toilets and sinks the factory made.", q: "De Sphinx Passage Maastricht", tags: ["free", "rainy day"] },
    { id: "thorn", cat: "gor", area: "cevre", title: "Wander the white town of Thorn",
      desc: "Once the centre of a tiny abbey state ruled by noblewomen. All the houses are whitewashed; the story goes they were painted to hide the traces of windows bricked up to dodge the window tax in the French era.",
      tip: "Walk the cobbled streets, then step into the bright white baroque interior of the Abdijkerk.", q: "Abdijkerk Thorn" },
    { id: "roermond", cat: "gor", area: "cevre", title: "See the Munsterkerk in Roermond",
      desc: "Most people come to Roermond for the outlet and skip the old town. The 13th-century Munsterkerk was restored by Roermond native Pierre Cuypers, architect of the Rijksmuseum; inside is the tomb monument of the Count of Guelders and his wife.",
      tip: "Add the Cuypershuis museum, Cuypers' home and workshop; in summer there are boat tours on the Maasplassen lakes.", q: "Munsterkerk Roermond" },
    { id: "margraten", cat: "gor", area: "cevre", title: "Visit the American cemetery at Margraten",
      desc: "More than eight thousand soldiers lie in the only American military cemetery in the Netherlands. Every grave has been 'adopted' by a local family, and the duty is passed down from generation to generation.",
      tip: "The walls at the entrance carry the names of the missing; pick a quiet weekday morning.", q: "Netherlands American Cemetery Margraten", tags: ["free"] },

    // YENİLECEK
    { id: "vogelstruys", cat: "ye", area: "merkez", title: "Take a seat at In den Ouden Vogelstruys",
      desc: "This café on the corner of the Vrijthof is one of the city's oldest drinking spots. With its dim wooden interior, old photographs on the walls and regulars at the bar, it's Maastricht's living room.",
      tip: "Ask for a local beer with a portion of cheese or dry sausage on the side.", q: "In den Ouden Vogelstruys Maastricht", tags: ["rainy day"] },
    { id: "preuvenemint", cat: "ye", area: "merkez", title: "Taste your way through Preuvenemint",
      desc: "In late August the Vrijthof turns into a giant open-air dining table for a few days. The city's restaurants serve small plates; the name comes from 'preuve', which means 'to taste' in the Maastricht dialect.",
      tip: "You pay with tokens; go in the afternoon, before the evening crowds.", q: "Vrijthof Maastricht", months: [8] },
    { id: "bisschopsmolen", cat: "ye", area: "jeker", title: "Eat vlaai at the Bisschopsmolen",
      desc: "The bakery inside the water mill, still working with its wheel turned by the Jeker, makes vlaai, Limburg's famous fruit pie, from spelt it mills itself.",
      tip: "Head to the back: you can see the turning wheel and the millstones. Cherry or apricot vlaai is the classic.", q: "Bisschopsmolen Maastricht" },
    { id: "zoervleis", cat: "ye", area: "jeker", title: "Try zoervleis with fries",
      desc: "Maastricht's sweet-and-sour meat stew: cooked for hours with vinegar, apple syrup and spice cake, traditionally made with horse meat. It comes with fries and apple sauce on the side.",
      tip: "Café Sjiek is known in town for this dish; they don't take reservations, so go early. If you'd rather skip horse, ask about the beef version.", q: "Café Sjiek Maastricht" },
    { id: "apostelhoeve", cat: "ye", area: "sintpieter", title: "Taste Dutch wine at Apostelhoeve",
      desc: "Apostelhoeve, on the Louwberg slope overlooking the Jeker valley, is one of the country's oldest wine producers. The best proof for anyone who doesn't believe there are vineyards in the Netherlands.",
      tip: "Tastings and sales are on certain days; check the website before you go. Walk or cycle up from the Jekerdal.", q: "Wijngoed Apostelhoeve Maastricht" },
    { id: "gulpener", cat: "ye", area: "cevre", title: "Drink the beer at the source in Gulpen",
      desc: "Gulpener is an independent family brewery that has been brewing in the same village since the 19th century, and it buys its barley and hops from farmers nearby.",
      tip: "Ask for a tasting board at BrouwLokaal next to the brewery; a great stop in the middle of a Heuvelland bike tour.", q: "Gulpener BrouwLokaal Gulpen" },

    // DENEYİM
    { id: "sintjan", cat: "dene", area: "merkez", title: "Climb the red tower of Sint-Jan",
      desc: "The blood-red tower of Sint-Janskerk, the smaller of the two churches on the Vrijthof, is visible from all over town. At the end of the narrow stone stairs, Maastricht's rooftops, the Maas and the Sint-Pietersberg lie at your feet.",
      tip: "The tower is only open in season; check before you go. Visit the neighbouring Sint-Servaasbasiliek the same day.", q: "Sint-Janskerk Maastricht", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "carnaval", cat: "dene", area: "merkez", title: "Join the crowds at Vastelaovend",
      desc: "In Maastricht carnival is called Vastelaovend. For three days the city goes red, yellow and green; at the opening the giant Mooswief (market woman) puppet is hoisted up a pole on the Vrijthof, and brass bands roam street by street.",
      tip: "Don't come without a costume: even a simple hat and face paint will do. Stop by the Mooswief statue on the Markt too.", q: "Vrijthof Maastricht", months: [2, 3], tags: ["free"] },
    { id: "lumiere", cat: "dene", area: "sphinx", title: "Watch a film in the old power station",
      desc: "Lumière Cinema is in the Sphinx factory's old power station, on the edge of the 't Bassin inner harbour. Arthouse films, brick walls and the hollow spaces left by giant machines.",
      tip: "Before the film, sit down at the restaurant inside or on the terrace overlooking the harbour.", q: "Lumière Cinema Maastricht", tags: ["rainy day"] },
    { id: "grotten", cat: "dene", area: "sintpieter", title: "Go underground beneath the Sint-Pietersberg",
      desc: "The 'caves' here are really kilometres of galleries opened up over centuries by cutting marl stone (mergel). The walls carry charcoal drawings; in the Second World War, museum paintings including 'The Night Watch' were hidden inside this hill.",
      tip: "Entry is by guided tour only and it's cool inside all year round: bring a jacket. The tour starts near Fort Sint Pieter; take in the city view from on top of the fort too.", q: "Grotten Noord Maastricht", tags: ["rainy day"] },
    { id: "enci", cat: "dene", area: "sintpieter", title: "Take the stairs down into the ENCI quarry",
      desc: "The giant marl quarry, dug for cement for nearly a century, was left to nature after it closed. Looking from the viewing platform at the turquoise lake and white cliffs, it's hard to believe you're in the Netherlands.",
      tip: "A long steel staircase leads down to the quarry floor; remember you'll climb the same steps on the way back.", q: "ENCI-groeve Maastricht", tags: ["free"] },
    { id: "kerststad", cat: "dene", area: "cevre", title: "Browse a Christmas market in the caves of Valkenburg",
      desc: "Every winter Valkenburg turns into 'Kerststad': Christmas markets are set up in the underground galleries of the Gemeentegrot and Fluweelengrot. Lights and stalls among marl walls.",
      tip: "Queues are long on weekends; buy your ticket in advance and go on a weekday. On the way out, check out the ruins of the only hilltop castle in the Netherlands.", q: "Gemeentegrot Valkenburg", months: [11, 12], tags: ["rainy day"] },
    { id: "cauberg", cat: "dene", area: "cevre", title: "Cycle up the Cauberg",
      desc: "This short but steep climb rising from Valkenburg is the most famous ramp in Dutch cycling; the Amstel Gold Race passes here every April. The 'mountain' stage of a flat country.",
      tip: "Shift to an easy gear from the start; the steepest bit is in the middle. After the top, carry on along the village roads of the Heuvelland.", q: "Cauberg Valkenburg", tags: ["free"] },
    { id: "drielandenpunt", cat: "dene", area: "cevre", title: "Stand in three countries at once in Vaals",
      desc: "On top of the Vaalserberg the Netherlands, Belgium and Germany meet at a single point; it's also the highest point of the European Netherlands. For a century a fourth country, tiny Neutral Moresnet, also bordered it here.",
      tip: "Circle the border stone, then climb one of the lookout towers. Walking up through the forest from Vaals beats driving.", q: "Drielandenpunt Vaals", tags: ["free"] }
  ]
};
