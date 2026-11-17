// Groningen ve kuzey (Friesland, Wadden kıyısı, Drenthe) görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.groningen = {
  id: "groningen",
  name: "Groningen",
  subtitle: "& the north",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Local", "Stadjer", "Echte Stadjer"],
  areas: {
    merkez: "Binnenstad",
    kuzey: "North & Noorderplantsoen",
    guney: "South & Station",
    dogu: "East & Oosterpoort",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[53.195, 6.520], [53.240, 6.610]],
  coords: {
    martinitoren: [53.2194, 6.5682], forum: [53.2188, 6.5706], pepergasthuis: [53.2172, 6.5722], prinsentuin: [53.2215, 6.5693],
    vismarkt: [53.2170, 6.5640], eierbal: [53.2183, 6.5718], martinus: [53.2162, 6.5732], bommenberend: [53.2187, 6.5672],
    noorderplantsoen: [53.2240, 6.5560], noorderzon: [53.2228, 6.5568],
    museum: [53.2123, 6.5660], station: [53.2107, 6.5645],
    esns: [53.2134, 6.5745], euroborg: [53.2063, 6.5913],
    wadlopen: [53.3987, 6.4535], schiermonnikoog: [53.4790, 6.1625], bourtange: [53.0066, 7.1920], hunebed: [52.9313, 6.7990],
    oldehove: [53.2030, 5.7897], planetarium: [53.1873, 5.5438], zoutkamp: [53.3369, 6.2998], beerenburg: [53.0312, 5.6603]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🗼", name: "Martini Wolf" },
    kuzey: { icon: "🌳", name: "Plantsoen Wanderer" },
    guney: { icon: "🚉", name: "Station Scout" },
    dogu: { icon: "🎸", name: "Oosterpoort Spirit" },
    cevre: { icon: "🦭", name: "Ommeland Explorer" }
  },
  quests: [
    // ---------- GÖRÜLECEK ----------
    { id: "martinitoren", cat: "gor", area: "merkez", title: "Climb the Martinitoren",
      desc: "Stadjers call the roughly 97-metre tower 'd'Olle Grieze' (the Old Grey One), and it's the symbol of the city. From the top you see just how flat the plain is that Groningen sits in the middle of.",
      tip: "The steps are narrow and there are many; check ticket and climbing times in advance, and pick a clear day.", q: "Martinitoren Groningen" },
    { id: "pepergasthuis", cat: "gor", area: "merkez", title: "Find the Pepergasthuis courtyard",
      desc: "Behind a door on the Peperstraat hides a 15th-century almshouse courtyard (hofje): small houses, a chapel and an old water pump. A surprising silence two steps from the bar street.",
      tip: "If the door is open during the day you can go in; people still live here, so keep quiet.", q: "Pepergasthuis Groningen", tags: ["free"] },
    { id: "museum", cat: "gor", area: "guney", title: "Take in the colours of the Groninger Museum",
      desc: "The museum standing in the canal across from the station was designed by Alessandro Mendini: a golden-yellow tower and pavilions each made by a different designer. The building itself was as much debated as the collection.",
      tip: "The mosaic-covered spiral staircase inside is one of the most photographed spots in the city.", q: "Groninger Museum", tags: ["rainy day"] },
    { id: "station", cat: "gor", area: "guney", title: "Look up at the ceiling of the Hoofdstation",
      desc: "The 1896 station building counts as one of the most beautiful stations in the Netherlands. The ornate ceiling and tile panels of the hall you hurry through deserve one stop to look.",
      tip: "There has been construction around the station for a long time; the historic hall is still open.", q: "Station Groningen", tags: ["free", "rainy day"] },
    { id: "bourtange", cat: "gor", area: "cevre", title: "Walk the star of Bourtange",
      desc: "The star-shaped fortress village on the German border was built in the Eighty Years' War to cut off the road to Groningen, and was rebuilt as it looked in the 18th century. Moats, drawbridges and earthen bastions are all in place.",
      tip: "Do a full circuit on the path along the ramparts; that's the only way the star shape makes sense.", q: "Vesting Bourtange" },
    { id: "hunebed", cat: "gor", area: "cevre", title: "The biggest hunebed in Borger",
      desc: "Drenthe's tombs of giant stones (hunebedden) are about five thousand years old, older than the pyramids. The largest in the Netherlands stands in Borger, right next to the Hunebedcentrum.",
      tip: "The stones themselves are outdoors; the museum part is good for a visit with kids.", q: "Hunebedcentrum Borger" },
    { id: "oldehove", cat: "gor", area: "cevre", title: "Leeuwarden's leaning tower, the Oldehove",
      desc: "The tower, left unfinished when it began to tilt during construction in the 16th century, is the symbol of the Frisian capital. The lean is visible to the naked eye, and it's slightly curved, too.",
      tip: "In season you can climb to the top. Less than an hour by train from Groningen.", q: "Oldehove Leeuwarden" },
    { id: "planetarium", cat: "gor", area: "cevre", title: "The solar system on the ceiling in Franeker",
      desc: "In the 18th century, wool carder Eise Eisinga built a working model of the solar system on his living room ceiling. The world's oldest planetarium still in operation is now a UNESCO World Heritage Site.",
      tip: "Don't leave without seeing the wooden gear mechanism in the attic. Franeker is one of the Elfsteden (Eleven Cities).", q: "Koninklijk Eise Eisinga Planetarium Franeker", tags: ["rainy day"] },

    // ---------- YENİLECEK ----------
    { id: "eierbal", cat: "ye", area: "merkez", title: "Eat an eierbal",
      desc: "A hard-boiled egg hidden inside a curry-flavoured ragout, rolled in breadcrumbs and deep-fried. Groningen's own snack; you almost never find it in the rest of the country.",
      tip: "Nearly every snackbar has it. Eating one around the Poelestraat after a night out is a Stadjer tradition.", q: "eierbal Groningen" },
    { id: "vismarkt", cat: "ye", area: "merkez", title: "Buy dry sausage and mustard at the Vismarkt",
      desc: "The market set up on the square in front of the Korenbeurs is the city's kitchen. Clove-spiced Groninger droge worst and sharp Groninger mosterd are the region's two classics.",
      tip: "The market runs on Tuesday, Friday and Saturday; Saturday is the busiest day.", q: "Vismarkt Groningen" },
    { id: "prinsentuin", cat: "ye", area: "merkez", title: "Have tea in the Prinsentuin",
      desc: "The Renaissance garden behind the Martinikerk: rose beds, green tunnel paths and a sundial above its gate. In summer the tea garden inside the garden opens.",
      tip: "Enter through the gate on the Turfsingel side. The tea garden is only open in the warm months and in nice weather.", q: "Prinsentuin Groningen", months: [5, 6, 7, 8, 9], tags: ["free"] },
    { id: "martinus", cat: "ye", area: "merkez", title: "Taste the city's own beer",
      desc: "Brouwerij Martinus brews beer in an old printing house on the narrow Kostersgang alley in the centre. You sit beside the kettles and try the beers that carry the city's name.",
      tip: "It's not open every day; check the opening days before you go, and ask for a tasting board.", q: "Brouwerij Martinus Groningen", tags: ["rainy day"] },
    { id: "zoutkamp", cat: "ye", area: "cevre", title: "Eat shrimp in Zoutkamp",
      desc: "An old fishing village that opened onto the sea before the Lauwerszee was closed off. The Wadden's small grey shrimp (Hollandse garnalen) are its trade; the old fishing boats in the harbour and the museum tell of those days.",
      tip: "Ask for a shrimp sandwich ('broodje garnalen'); then walk along the Reitdiep.", q: "Visserijmuseum Zoutkamp" },
    { id: "beerenburg", cat: "ye", area: "cevre", title: "Taste Beerenburg in Sneek",
      desc: "Friesland's herbal bitter, Beerenburg, has been sold at Weduwe Joustra in Sneek since the 19th century. The shop's old counter and barrels are still in place.",
      tip: "Sneek's landmark, the Waterpoort, is a few minutes' walk away; during Sneekweek in early August the town fills with sailboats.", q: "Weduwe Joustra Sneek" },

    // ---------- DENEYİM ----------
    { id: "forum", cat: "dene", area: "merkez", title: "Go up to the Forum's roof",
      desc: "The Forum, which brings a library, cinema and exhibition halls under one roof, is the city's new living room. Ride the escalators to the top and you're eye to eye with the Martinitoren.",
      tip: "The roof terrace is free; go up close to sunset.", q: "Forum Groningen", tags: ["free", "rainy day"] },
    { id: "bommenberend", cat: "dene", area: "merkez", title: "Celebrate Bommen Berend on 28 August",
      desc: "Every year Groningen celebrates the day in 1672 when it was freed from the siege of the Bishop of Münster ('Bommen Berend'), under the name Gronings Ontzet. That day the city has a public-holiday feel, with a funfair and fireworks in the evening.",
      tip: "Grab a spot early for the fireworks; the programme changes a little every year.", q: "Grote Markt Groningen", months: [8], tags: ["free"] },
    { id: "noorderplantsoen", cat: "dene", area: "kuzey", title: "Walk the old ramparts in the Noorderplantsoen",
      desc: "The city's old walls and moats were turned into an English-style park in the 19th century. The little hills and ponds are really the traces of the bastions and the moat.",
      tip: "On a sunny day the whole student population is here; early morning is the calmest.", q: "Noorderplantsoen Groningen", tags: ["free"] },
    { id: "noorderzon", cat: "dene", area: "kuzey", title: "Spend an evening at Noorderzon",
      desc: "Every August the Noorderplantsoen becomes a festival village of theatre, music and food tents for eleven days. Wandering the park is free; most of the shows are ticketed.",
      tip: "Go even without a ticket: the free concerts and lights by the pond are enough.", q: "Noorderzon Groningen", months: [8], tags: ["free"] },
    { id: "esns", cat: "dene", area: "dogu", title: "Discover tomorrow's band at ESNS",
      desc: "Every January Europe's music industry flocks to Groningen for Eurosonic Noorderslag. Hundreds of new bands play in the city's bars and at De Oosterpoort.",
      tip: "Come even without a ticket: there are free concerts in the centre during the festival.", q: "De Oosterpoort Groningen", months: [1], tags: ["rainy day"] },
    { id: "euroborg", cat: "dene", area: "dogu", title: "See an FC Groningen match at the Euroborg",
      desc: "Cheer for the 'Trots van het Noorden' (Pride of the North) in the stadium fans call the 'Green Cathedral'. You can feel what it means to be the north's only big club in the stands.",
      tip: "It's easier to find tickets for an ordinary league match than for the big games.", q: "Euroborg Groningen", months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] },
    { id: "wadlopen", cat: "dene", area: "cevre", title: "Go mudflat walking on the Wadden",
      desc: "When the sea recedes, the floor of the Wadden Sea is exposed and you can walk through the mud with a guide. Wadlopen is a tradition unique to this coast; the Wadden Sea is a UNESCO World Heritage Site.",
      tip: "Guided tours only, from around Pieterburen. A change of clothes and old shoes that hold your ankles are a must.", q: "Wadloopcentrum Pieterburen", months: [5, 6, 7, 8, 9] },
    { id: "schiermonnikoog", cat: "dene", area: "cevre", title: "Hop on a bike on Schiermonnikoog",
      desc: "The smallest inhabited Wadden island is almost entirely national park. Visitors leave their cars on the mainland; on the island there are dunes, salt marshes and a very wide beach.",
      tip: "The ferry leaves from Lauwersoog. Rent a bike on the island and pedal to the beach.", q: "Schiermonnikoog" }
  ]
};
