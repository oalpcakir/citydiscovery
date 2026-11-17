// Quests for the Antwerpen region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, copy a file like this,
// change the id, add a <script> line to index.html and re-run tools/build_regions.py.
window.CITIES = window.CITIES || {};
window.CITIES.antwerpen = {
  id: "antwerpen",
  name: "Antwerpen",
  subtitle: "& surroundings",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbourhood Regular", "Sinjoor", "Echte Sinjoor"],
  areas: {
    merkez: "Historic centre",
    eilandje: "Eilandje & port",
    zuid: "Zuid & Berchem",
    istasyon: "Station & Zurenborg",
    cevre: "Surroundings"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[51.175, 4.370], [51.246, 4.450]],
  coords: {
    kathedraal: [51.2203, 4.4014], vlaeykensgang: [51.2197, 4.4003], plantin: [51.2184, 4.3978], annatunnel: [51.2189, 4.3962],
    handjes: [51.2166, 4.4035], vogelenmarkt: [51.2146, 4.4085], waterbus: [51.2224, 4.3964],
    mas: [51.2289, 4.4048], havenhuis: [51.2416, 4.4072],
    kmska: [51.2087, 4.3946], bolleke: [51.1995, 4.4172], middelheim: [51.1821, 4.4128],
    centraal: [51.2172, 4.4211], cogels: [51.2046, 4.4332], dageraad: [51.2072, 4.4306], kleinblatt: [51.2125, 4.4265],
    romboutstoren: [51.0289, 4.4792], anker: [51.0327, 4.4728], zimmertoren: [51.1291, 4.5707], vlaaikes: [51.1313, 4.5697],
    doel: [51.3110, 4.2655], kalmthout: [51.3690, 4.4370]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "✋", name: "Brabo's Hand" },
    eilandje: { icon: "⚓", name: "Dock Captain" },
    zuid: { icon: "🎨", name: "Zuid Spirit" },
    istasyon: { icon: "🚂", name: "Zurenborg Wanderer" },
    cevre: { icon: "🚲", name: "Surroundings Explorer" }
  },
  quests: [
    // ───────────── SEE ─────────────
    { id: "kathedraal", cat: "gor", area: "merkez", title: "Face Rubens in the cathedral",
      desc: "The 123-metre tower of the Onze-Lieve-Vrouwekathedraal is the tallest church tower in the Benelux. Inside, Rubens' huge altarpieces still hang in the city where they were painted, in the places they were made for.",
      tip: "Look at the side panels of the 'Kruisafneming' (Descent from the Cross) too, and read the information boards to find out why the tower's twin was never finished.", q: "Onze-Lieve-Vrouwekathedraal Antwerpen", tags: ["rainy day"] },
    { id: "vlaeykensgang", cat: "gor", area: "merkez", title: "Find the door to the Vlaeykensgang",
      desc: "This narrow passage from 1591 links inner courtyards where shoemakers and the city's poorest once lived. Two steps from a busy street, you are in the 16th century.",
      tip: "The entrance is the ordinary-looking door at Oude Koornmarkt 16; the other end comes out on Pelgrimstraat.", q: "Vlaeykensgang Antwerpen", tags: ["free"] },
    { id: "plantin", cat: "gor", area: "merkez", title: "See the oldest printing presses in the world",
      desc: "The Museum Plantin-Moretus was both the workshop and the family home of the biggest printing house of the 16th century, and it is the first museum on the UNESCO World Heritage list. The two oldest known printing presses in the world are here.",
      tip: "Step out into the courtyard garden and take a close look at the cases of lead type in the typesetting room.", q: "Museum Plantin-Moretus Antwerpen", tags: ["rainy day"] },
    { id: "mas", cat: "gor", area: "eilandje", title: "Climb to the MAS rooftop for free",
      desc: "The red stone tower in the middle of the old docks is the museum about Antwerp's relationship with the port and the world. The glass 'boulevard' with its escalators and the rooftop viewing terrace can be visited without a ticket.",
      tip: "Go up near sunset: the cathedral on one side, the port cranes on the other. Spot the little metal hands on the facade too.", q: "MAS Museum aan de Stroom Antwerpen", tags: ["free", "rainy day"] },
    { id: "havenhuis", cat: "gor", area: "eilandje", title: "Look at the diamond of the Havenhuis",
      desc: "Zaha Hadid set a faceted glass body, like a diamond and like a ship's prow, on top of an old fire station. The port authority's headquarters nods to the port of the diamond city.",
      tip: "The inside can only be visited on a guided tour booked in advance; the best view from outside is from the opposite side of the quay.", q: "Havenhuis Antwerpen", tags: ["free"] },
    { id: "kmska", cat: "gor", area: "zuid", title: "Walk from Rubens to Ensor at the KMSKA",
      desc: "The Royal Museum of Fine Arts reopened in 2022 after an eleven-year renovation. A snow-white new museum is tucked inside the old halls, and the largest James Ensor collection in the world is here.",
      tip: "Sit on the benches in front of the giant paintings in the Rubens room, and don't skip the long white staircase in the new section.", q: "KMSKA Antwerpen", tags: ["rainy day"] },
    { id: "centraal", cat: "gor", area: "istasyon", title: "Look up in the railway cathedral",
      desc: "Locals call Antwerpen-Centraal the 'Spoorwegkathedraal' (railway cathedral): a dome from 1905, a marble hall and an iron-and-glass platform roof. Today the trains stop on several levels stacked on top of each other.",
      tip: "Go down to the lowest platform and look up through the levels to the dome; stop once at a place you normally rush through every day.", q: "Station Antwerpen-Centraal", tags: ["free", "rainy day"] },
    { id: "cogels", cat: "gor", area: "istasyon", title: "Pick your house on Cogels-Osylei",
      desc: "This street in the Zurenborg district is an open-air catalogue of the Belle Époque: Art Nouveau, neo-Gothic and neoclassical facades side by side, each more flamboyant than the next.",
      tip: "Find the four seasons houses (Lente, Zomer, Herfst, Winter) at the corner of Waterloostraat and Generaal Van Merlenstraat.", q: "Cogels-Osylei Antwerpen", tags: ["free"] },
    { id: "zimmertoren", cat: "gor", area: "cevre", title: "Decode the clock of the Zimmertoren in Lier",
      desc: "In 1930 the clockmaker Louis Zimmer fitted a medieval tower with the thirteen-dial Jubilee Clock: the time, tides, phases of the moon, zodiac signs and more on a single facade.",
      tip: "At noon, watch the figures parade on the side of the tower; then walk to the Begijnhof and along the Nete.", q: "Zimmertoren Lier" },
    { id: "doel", cat: "gor", area: "cevre", title: "Walk through the ghost village of Doel",
      desc: "In this polder village, emptied for decades because of port expansion, only a handful of people remain, and the walls of the abandoned houses are covered in street art. Behind it rise the cooling towers of the nuclear plant, and on the dyke stands a 17th-century windmill.",
      tip: "Don't enter the houses; some are still lived in. Climb up on the dyke and watch the container ships pass along the Schelde.", q: "Doel Beveren", tags: ["free"] },

    // ───────────── EAT & DRINK ─────────────
    { id: "handjes", cat: "ye", area: "merkez", title: "Eat Antwerpse handjes",
      desc: "Hand-shaped almond biscuits and chocolates are the city's official treat. The shape comes from the legend of Brabo, who cut off the giant's hand and threw it into the Schelde: the city's name is said to come from 'hand werpen' (hand throwing).",
      tip: "Philip's Biscuits on Korte Gasthuisstraat sells the biscuit version fresh; for the chocolate version, look to the chocolatiers nearby.", q: "Philip's Biscuits Korte Gasthuisstraat Antwerpen" },
    { id: "bolleke", cat: "ye", area: "zuid", title: "Drink a 'bolleke' at the brewery",
      desc: "The way to order a beer in Antwerp is to say 'een bolleke': an amber De Koninck served in a round glass. It has been brewed inside the city since 1833.",
      tip: "The brewery on Mechelsesteenweg has an interactive tour; the same courtyard also has a cheesemonger, a butcher and a chocolatier.", q: "Stadsbrouwerij De Koninck Antwerpen", tags: ["rainy day"] },
    { id: "kleinblatt", cat: "ye", area: "istasyon", title: "Stop by the Jewish quarter's bakery",
      desc: "The diamond district around the station is home to one of the largest Orthodox Jewish communities in Europe. For over a century, Kleinblatt has been making the neighbourhood's cheesecake, challah bread and cinnamon rolls.",
      tip: "Closed on Saturday (Shabbat); go before noon on Friday and the counter is at its fullest.", q: "Bakkerij Kleinblatt Provinciestraat Antwerpen" },
    { id: "anker", cat: "ye", area: "cevre", title: "Taste a Gouden Carolus in Mechelen",
      desc: "Het Anker is one of the oldest brewers in Belgium, with roots going back to the beer made by the women of the Mechelen beguinage. Gouden Carolus takes its name from the gold coin of Charles V, who grew up in Mechelen.",
      tip: "Book the brewery tour in advance; ask for a tasting board at the brasserie. About twenty minutes from Antwerpen by train.", q: "Brouwerij Het Anker Mechelen", tags: ["rainy day"] },
    { id: "vlaaikes", cat: "ye", area: "cevre", title: "Eat a Liers vlaaike in Lier",
      desc: "This palm-sized, dark, spiced little tart is made only in Lier and is a well-known local speciality. The recipe is said to be a few centuries old.",
      tip: "Look for the 'Liers vlaaike' sign at the bakeries around the Grote Markt; it is best eaten warm with a coffee.", q: "Grote Markt Lier" },

    // ───────────── DO ─────────────
    { id: "annatunnel", cat: "dene", area: "merkez", title: "Ride the wooden escalators under the Schelde",
      desc: "Opened in 1933, the Sint-Annatunnel carries pedestrians and cyclists across the river 30 metres underground. The original wooden escalators still run.",
      tip: "Enter at the building on Sint-Jansvliet and walk half a kilometre; on the Linkeroever side the city's best skyline awaits.", q: "Sint-Annatunnel Sint-Jansvliet Antwerpen", tags: ["free", "rainy day"] },
    { id: "vogelenmarkt", cat: "dene", area: "merkez", title: "Wander the Vogelenmarkt on a Sunday morning",
      desc: "Known as the bird market, it has been held on Sunday mornings for centuries: flowers, food, clothes, hardware and stallholders shouting in Antwerp dialect.",
      tip: "On and around Theaterplein, until noon. On Saturday the same square has the food-focused 'Exotische Markt'.", q: "Vogelenmarkt Theaterplein Antwerpen", tags: ["free"] },
    { id: "waterbus", cat: "dene", area: "merkez", title: "Cruise the Schelde on the Waterbus",
      desc: "The river is the reason Antwerp exists, but locals mostly see it only from the bank. The DeWaterbus leaves from in front of Het Steen and heads along the river to villages and towards the port.",
      tip: "Take your bike on the boat, hop off at a landing stage and pedal back along the river dyke.", q: "DeWaterbus Steenplein Antwerpen" },
    { id: "middelheim", cat: "dene", area: "zuid", title: "Get lost among the sculptures at Middelheim",
      desc: "An open-air sculpture museum spread across a park since 1950: hundreds of works, from Rodin to today's artists, stand among the trees, and entry is free.",
      tip: "Go by bike, and combine it with the neighbouring Nachtegalenpark and Den Brandt parks.", q: "Middelheimmuseum Antwerpen", tags: ["free"] },
    { id: "dageraad", cat: "dene", area: "istasyon", title: "Sit under the stars on Dageraadplaats",
      desc: "Zurenborg's neighbourhood square: a basketball court and playground in the middle, cafés all around. When it gets dark, lights strung across the square make an artificial starry sky.",
      tip: "Go on a warm evening; if you can't find a spot on a terrace, grab a drink and settle on the benches in the square.", q: "Dageraadplaats Antwerpen", tags: ["free"] },
    { id: "romboutstoren", cat: "dene", area: "cevre", title: "Climb the Sint-Romboutstoren in Mechelen",
      desc: "538 steps, two carillons and a giant clock mechanism on the way, and an open-air 'skywalk' at the top. This tower is why people from Mechelen are called 'Maneblussers' (moon extinguishers): in 1687 they ran to put out what they took for a fire, but was moonlight behind the mist.",
      tip: "Pick a clear day: from the top you can see the port of Antwerp and the Atomium in Brussels.", q: "Sint-Romboutstoren Mechelen" },
    { id: "kalmthout", cat: "dene", area: "cevre", title: "Walk the heath at Kalmthoutse Heide",
      desc: "A cross-border nature park of heathland, dunes and ponds stretching to the Dutch border. Half an hour north of the port city, it is a completely different landscape.",
      tip: "The heather blooms purple from mid-August to early September. You can walk in from Heide train station.", q: "Kalmthoutse Heide De Vroente Kalmthout", tags: ["free"] }
  ]
};
