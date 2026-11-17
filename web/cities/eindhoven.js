// Eindhoven ve Brabant görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.eindhoven = {
  id: "eindhoven",
  name: "Eindhoven",
  subtitle: "& Brabant",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Eindhovenaar", "Echte Lampegatter"],
  areas: {
    merkez: "Centre",
    strijp: "Strijp",
    kuzey: "Woensel",
    guney: "South & West",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[51.405, 5.410], [51.480, 5.530]],
  coords: {
    philips: [51.4392, 5.4757], vanabbe: [51.4343, 5.4819], stratumseind: [51.4363, 5.4808], glow: [51.4380, 5.4797],
    worstenbrood: [51.4395, 5.4790],
    strijps: [51.4472, 5.4585], veem: [51.4490, 5.4550], evoluon: [51.4434, 5.4470], ddw: [51.4484, 5.4571],
    psv: [51.4417, 5.4675],
    kruisstraat: [51.4491, 5.4744], woenselmarkt: [51.4510, 5.4725],
    watermolen: [51.4231, 5.4703], watt: [51.4353, 5.4865], hovenring: [51.4327, 5.4190],
    sintjan: [51.6879, 5.3083], bosschebol: [51.6904, 5.2958], efteling: [51.6500, 5.0480], duinen: [51.6450, 5.1150],
    nuenen: [51.4768, 5.5509], breda: [51.5903, 4.7785], lochal: [51.5613, 5.0861]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "💡", name: "Lichtstad Wolf" },
    strijp: { icon: "🏭", name: "Strijp Designer" },
    kuzey: { icon: "🧺", name: "Woensel Local" },
    guney: { icon: "🚲", name: "Dommel Wanderer" },
    cevre: { icon: "🎡", name: "Brabant Explorer" }
  },
  quests: [
    // GÖRÜLECEK
    { id: "philips", cat: "gor", area: "merkez", title: "Step into Philips's first lightbulb factory",
      desc: "Gerard Philips made his first lightbulbs in 1891 in this small factory on Emmasingel; this is where Eindhoven's change from a village into the 'Lichtstad' (City of Light) began. Today the building is the Philips Museum.",
      tip: "Start with the old production workshop at the entrance; this is where you'll see why half the city carries the Philips name.", q: "Philips Museum Eindhoven", tags: ["rainy day"] },
    { id: "vanabbe", cat: "gor", area: "merkez", title: "Find the Lissitzky at the Van Abbemuseum",
      desc: "A modern art museum donated to the city by a cigar manufacturer, with one of the biggest El Lissitzky collections outside Russia. The new wing sits right over the Dommel stream.",
      tip: "See the old building's clock tower from the outside and the new wing from the inside; the cafe terrace looks onto the water.", q: "Van Abbemuseum Eindhoven", tags: ["rainy day"] },
    { id: "strijps", cat: "gor", area: "strijp", title: "Walk under the pipes of Strijp-S",
      desc: "Philips's walled-off factory complex was known for years as the 'Forbidden City'. Today it is the city's creative quarter, with the Klokgebouw, the Hoge Rug buildings and the Leidingstraat pipeline running overhead.",
      tip: "Walk Torenallee from start to finish; the area around the old boiler house on Ketelhuisplein is the most photogenic spot.", q: "Ketelhuisplein Strijp-S Eindhoven", tags: ["free"] },
    { id: "evoluon", cat: "gor", area: "strijp", title: "Look at the Evoluon's flying saucer",
      desc: "Opened in 1966 for Philips's 75th anniversary, this flying-saucer-shaped concrete dome is Eindhoven's best-known silhouette. After being closed for many years, it reopened to visitors as the Next Nature Museum.",
      tip: "Look at it from the edge of the pond below the dome; lit up at night, it really looks like it has landed.", q: "Evoluon Eindhoven" },
    { id: "watermolen", cat: "gor", area: "guney", title: "See the water mill Van Gogh painted",
      desc: "Van Gogh painted the Genneper Watermolen on the Dommel during his years in Nuenen. It's ten minutes by bike from the city centre, but its surroundings are still meadow and stream.",
      tip: "Come through the Genneper Parken; the shop at the nearby Genneper Hoeve farm sells its own produce.", q: "Genneper Watermolen Eindhoven", tags: ["free"] },
    { id: "sintjan", cat: "gor", area: "cevre", title: "Look for the angel with a mobile phone at Sint-Jan",
      desc: "The Sint-Janskathedraal in 's-Hertogenbosch is the most spectacular example of Brabant Gothic. Among the new statues added during restoration is an angel in jeans holding a mobile phone.",
      tip: "The angel is up high on the exterior; binoculars or your phone's zoom will help. Don't miss the small figures perched on the flying buttresses either.", q: "Sint-Janskathedraal 's-Hertogenbosch", tags: ["free"] },
    { id: "nuenen", cat: "gor", area: "cevre", title: "Follow Van Gogh's trail in Nuenen",
      desc: "Van Gogh lived with his family in Nuenen from 1883 to 1885 and painted 'The Potato Eaters' here. The little church where his father preached and the family home are still standing.",
      tip: "Start at the Van Gogh Village Museum, then walk the marked spots around the village. You can get there from Eindhoven by bike.", q: "Van Gogh Village Museum Nuenen" },
    { id: "breda", cat: "gor", area: "cevre", title: "Step into the Begijnhof courtyard in Breda",
      desc: "Right in the middle of the city is a courtyard where the noise cuts out once you pass the gate: small houses where devout women (beguines) lived for centuries, with a medicinal herb garden in the middle.",
      tip: "When you leave, walk through Valkenberg park towards the tower of the Grote Kerk.", q: "Begijnhof Breda", tags: ["free"] },

    // YENİLECEK
    { id: "worstenbrood", cat: "ye", area: "merkez", title: "Eat a hot worstenbroodje",
      desc: "Soft bread wrapped around spiced minced meat is Brabant's best-loved snack and officially on the cultural heritage list. It is eaten fresh out of the oven, never cold.",
      tip: "Don't ask for mustard or ketchup: Brabanders eat it plain.", q: "Houben Worstenbrood Eindhoven" },
    { id: "stratumseind", cat: "ye", area: "merkez", title: "Have a beer on Stratumseind",
      desc: "The longest pub street in the Netherlands: dozens of bars fit into a narrow street a few hundred metres long. The meeting place of the student city and PSV fans.",
      tip: "Early evenings on weekdays are calm; on Saturday night the street is shoulder to shoulder.", q: "Stratumseind Eindhoven" },
    { id: "veem", cat: "ye", area: "strijp", title: "Browse the stalls at Vershal het Veem",
      desc: "The ground floor of Veem, an old Philips warehouse, is now a fresh produce market: baker, cheesemonger, fishmonger and stalls from world cuisines, all in one place.",
      tip: "Go at lunchtime on the weekend; you can eat what you buy at the tables in the middle.", q: "Vershal het Veem Eindhoven", tags: ["rainy day"] },
    { id: "kruisstraat", cat: "ye", area: "kuzey", title: "Take a world tour on Kruisstraat",
      desc: "Just north of the station, Kruisstraat is Eindhoven's most multicultural street: Turkish bakeries, Asian groceries (toko) and Surinamese restaurants side by side.",
      tip: "Go hungry and don't sit down in just one place: eat piece by piece from a bakery, a toko and a pastry shop.", q: "Kruisstraat Eindhoven" },
    { id: "watt", cat: "ye", area: "guney", title: "Taste the city beer at 100 Watt",
      desc: "Stadsbrouwerij Eindhoven brews its beer in the old Schellens textile factory on the Dommel. Even the name is a nod to the city of light.",
      tip: "Ask for a tasting board; the brewing kettles stand right in the hall.", q: "100 Watt Brewery Bleekweg Eindhoven", tags: ["rainy day"] },
    { id: "bosschebol", cat: "ye", area: "cevre", title: "Eat a Bossche bol at Jan de Groot",
      desc: "A fist-sized pastry ball filled with whipped cream and coated in dark chocolate, the symbol of Den Bosch. Everyone in town buys theirs at the Jan de Groot pastry shop near the station.",
      tip: "Don't bother with a fork and knife; eat it with your hands and a napkin. The queue at the door moves fast.", q: "Banketbakkerij Jan de Groot 's-Hertogenbosch" },

    // DENEYİM
    { id: "glow", cat: "dene", area: "merkez", title: "Walk the light route at GLOW",
      desc: "Every November, for one week, buildings, churches and parks turn into light art installations. The most crowded celebration of the city's light identity.",
      tip: "The route changes every year and is free. It gets very busy on weekends; pick a weekday evening and dress warm.", q: "Catharinakerk Eindhoven", months: [11], tags: ["free"] },
    { id: "ddw", cat: "dene", area: "strijp", title: "Explore Dutch Design Week",
      desc: "Every October the city hosts the biggest design event in Northern Europe. The Klokgebouw in Strijp-S and the Design Academy graduation show are the heart of it.",
      tip: "It won't fit in one day: plan a day for Strijp-S, a day for the centre and Sectie-C. Buy your ticket in advance.", q: "Klokgebouw Eindhoven", months: [10] },
    { id: "psv", cat: "dene", area: "strijp", title: "Watch a PSV match at the Philips Stadion",
      desc: "PSV was founded as the sports club of Philips workers and still plays where its first pitch stood, right in the middle of the city. On match day the whole city is red and white.",
      tip: "The stadium is within walking distance of the station; mingle with the fans in the bars around it before the match.", q: "Philips Stadion Eindhoven", months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] },
    { id: "woenselmarkt", cat: "dene", area: "kuzey", title: "Shop at the Saturday Woensel market",
      desc: "The Saturday market on the Woenselse Markt is the biggest in the city. A very different, neighbourhood Eindhoven from the shops in the centre.",
      tip: "Go in the morning; eat kibbeling standing at the fish stall.", q: "Woenselse Markt Eindhoven", tags: ["free"] },
    { id: "hovenring", cat: "dene", area: "guney", title: "Take a lap in the air on the Hovenring",
      desc: "Hanging from a single pylon over the junction between Eindhoven and Veldhoven, this cycle roundabout counts among the first of its kind in the world. Cars below, you up above.",
      tip: "Go once it gets dark: the whole ring is lit up.", q: "Hovenring Eindhoven", tags: ["free"] },
    { id: "efteling", cat: "dene", area: "cevre", title: "Get lost in the Fairy Tale Forest at Efteling",
      desc: "Efteling in Kaatsheuvel began in the 1950s with the Sprookjesbos (Fairy Tale Forest) drawn by the artist Anton Pieck. The childhood memories of the Dutch are stored here.",
      tip: "Visit the Sprookjesbos before the roller coasters, and feed a scrap of paper to Holle Bolle Gijs, the bin that shouts 'Papier hier'.", q: "Efteling Kaatsheuvel" },
    { id: "duinen", cat: "dene", area: "cevre", title: "Walk in Brabant's desert",
      desc: "The Loonse en Drunense Duinen are among the biggest areas of shifting sand in Western Europe. You step out of the forest and suddenly find yourself in the middle of sand dunes; locals call it the 'Brabant Sahara'.",
      tip: "On a windy day the sand blows around, so bring glasses. Walking in sand is tiring; pick a short route and finish at one of the cafes by the forest edge.", q: "Nationaal Park Loonse en Drunense Duinen", tags: ["free"] },
    { id: "lochal", cat: "dene", area: "cevre", title: "Spend an afternoon at LocHal in Tilburg",
      desc: "The railways' old locomotive workshop, right behind the station, has become a giant library and meeting place. The fabric curtains, six storeys high, are a nod to Tilburg, the textile city.",
      tip: "Climb to the top of the wide stairs, then look at the tracks from the glass balcony. If you come in July, the city is full of the Tilburgse Kermis, the biggest fair in the Benelux.", q: "LocHal Tilburg", tags: ["free", "rainy day"] }
  ]
};
