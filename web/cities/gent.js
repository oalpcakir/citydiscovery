// Quests for the Gent region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, copy a file like this,
// change the id, add a <script> line to index.html and re-run tools/build_regions.py.
window.CITIES = window.CITIES || {};
window.CITIES.gent = {
  id: "gent",
  name: "Gent",
  subtitle: "& surroundings",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbourhood Regular", "Stroppendrager", "Echte Gentenaar"],
  areas: {
    merkez: "Historic centre",
    patershol: "Patershol & Prinsenhof",
    guney: "Kouter & arts quarter",
    dogu: "Portus Ganda",
    cevre: "Surroundings"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[51.025, 3.690], [51.075, 3.760]],
  coords: {
    lamgods: [51.0530, 3.7272], gravensteen: [51.0573, 3.7206], werregaren: [51.0553, 3.7246], lantaarn: [51.0569, 3.7214],
    neuzen: [51.0558, 3.7223], graslei: [51.0546, 3.7208], feesten: [51.0566, 3.7283], dullegriet: [51.0569, 3.7262],
    waterzooi: [51.0583, 3.7228], prinsenhof: [51.0583, 3.7168],
    stam: [51.0437, 3.7177], vooruit: [51.0478, 3.7277], kouter: [51.0503, 3.7241],
    baafsabdij: [51.0539, 3.7363], vaneyck: [51.0545, 3.7352], gruut: [51.0575, 3.7302],
    kwaremont: [50.7819, 3.5260], mattentaart: [50.7727, 3.8822], laarne: [51.0280, 3.8387], aalst: [50.9384, 4.0390],
    latem: [51.0056, 3.6032], liefmans: [50.8465, 3.6159]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🏰", name: "Kuip Insider" },
    patershol: { icon: "🪢", name: "Stroppendrager" },
    guney: { icon: "💐", name: "Kouter Regular" },
    dogu: { icon: "⛵", name: "Portus Ganda Skipper" },
    cevre: { icon: "🚴", name: "Flandrien" }
  },
  quests: [
    // ───────────── SEE ─────────────
    { id: "lamgods", cat: "gor", area: "merkez", title: "Find the missing panel of the Ghent Altarpiece",
      desc: "The 'Adoration of the Mystic Lamb' altarpiece, completed by the brothers Van Eyck in 1432, stands in the church it was made for, Sint-Baafskathedraal. The 'Just Judges' panel was stolen in 1934 and has never been found; what you see is a copy.",
      tip: "Tickets are timed, so book ahead. Look closely at the restored lamb's eyes, which gaze out like a human's.", q: "Sint-Baafskathedraal Gent", tags: ["rainy day"] },
    { id: "gravensteen", cat: "gor", area: "merkez", title: "Walk the ramparts of the Gravensteen",
      desc: "The 12th-century castle of the Counts of Flanders stands right in the middle of the city, moat and all. In 1949 students occupied it to protest a rise in the price of beer, and Ghent is still proud of that.",
      tip: "Don't skip the audio guide: a comedian narrates it, and it doesn't sound like a museum guide. From the ramparts, look at the line-up of the three towers.", q: "Gravensteen Gent" },
    { id: "werregaren", cat: "gor", area: "merkez", title: "Walk through the graffiti alley",
      desc: "Spraying paint on the walls of Werregarenstraat is allowed; for years the narrow passage has been the city's legal canvas, and it looks different every time you pass.",
      tip: "Between Hoogpoort and Onderstraat. Compare today's walls with the photo you took last month.", q: "Werregarenstraat Gent", tags: ["free"] },
    { id: "lantaarn", cat: "gor", area: "merkez", title: "Wait for the lamps that light up when a baby is born",
      desc: "The street lamps on Sint-Veerleplein are linked to the city's maternity wards: when a baby is born in Ghent, the parents press a button and the lamps slowly flicker on. It is Alberto Garutti's artwork 'Ai Nati Oggi'.",
      tip: "After dark, sit at a terrace on the square and keep your eyes on the lamps.", q: "Sint-Veerleplein Gent", tags: ["free"] },
    { id: "prinsenhof", cat: "gor", area: "patershol", title: "Find the man with the noose at the Prinsenhof",
      desc: "Charles V was born here in 1500; in 1540 he made the rebellious people of Ghent march with nooses around their necks. Ever since, Ghent folk have proudly called themselves 'stroppendragers' (noose carriers).",
      tip: "The only piece left of the palace is the Donkere Poort gate; the statue of the man with the noose is on a small square right nearby.", q: "Prinsenhof Gent", tags: ["free"] },
    { id: "stam", cat: "gor", area: "guney", title: "Walk over Ghent at STAM",
      desc: "In the first room of the city museum, housed in the old Bijloke abbey, a giant aerial photo of Ghent is spread across the floor: you walk on it, hunting for your own street.",
      tip: "Put on the shoe covers, find your own house first, then the city's old waterways.", q: "STAM Stadsmuseum Gent", tags: ["rainy day"] },
    { id: "baafsabdij", cat: "gor", area: "dogu", title: "Step into the ruins of Sint-Baafsabdij",
      desc: "Ghent was born around an abbey founded in the 7th century, at this point where the Leie and Schelde meet. In 1540 Charles V had the abbey of the city he was punishing torn down and a fortress built in its place; what remains is a quiet garden of ruins.",
      tip: "Open only on certain days, mostly in the warmer months; check before you go.", q: "Sint-Baafsabdij Gent", tags: ["free"] },
    { id: "laarne", cat: "gor", area: "cevre", title: "Visit the moated castle of Laarne",
      desc: "A few kilometres east of Ghent, a medieval castle surrounded by water: corner towers, a stone bridge and a famous silver collection inside.",
      tip: "The interior is open on limited days; if it's closed, the walk around the moat is worth it too.", q: "Kasteel van Laarne" },

    // ───────────── EAT & DRINK ─────────────
    { id: "neuzen", cat: "ye", area: "merkez", title: "Buy Gentse neuzen on the Groentenmarkt",
      desc: "Hard on the outside, runny inside, raspberry-flavoured purple cones: cuberdons, or in Ghent speak 'neuzekes' (little noses). They crystallise within a few weeks, so they can't be shipped far and must be eaten fresh.",
      tip: "The rivalry between the carts standing side by side on the square is known in the city as the 'nose war'. On the same square, also pick up the mustard drawn from the barrel at Tierenteyn-Verlent.", q: "Groentenmarkt Gent" },
    { id: "waterzooi", cat: "ye", area: "patershol", title: "Eat Gentse waterzooi in the Patershol",
      desc: "Ghent's own dish: a creamy, vegetable-filled pot halfway between a soup and a stew. It was originally made with fish from the Leie and Schelde; today it mostly comes with chicken.",
      tip: "Look for 'Gentse waterzooi' on the menus of the restaurants in the Patershol's narrow medieval streets; if you find a fish version, try that.", q: "Patershol Gent" },
    { id: "vooruit", cat: "ye", area: "guney", title: "Have a drink in the Vooruit café",
      desc: "A 'people's palace' built in 1913 by the socialist cooperative for workers: a ballroom, a theatre and a huge café. Today it is the arts centre VIERNULVIER, but Ghent folk still just say Vooruit.",
      tip: "Sit in the high-ceilinged café where students study, then check the evening programme.", q: "VIERNULVIER Vooruit Sint-Pietersnieuwstraat Gent", tags: ["rainy day"] },
    { id: "kouter", cat: "ye", area: "guney", title: "Oysters at the Kouter on a Sunday morning",
      desc: "The flower market on the Kouter square runs every Sunday morning. The Ghent tradition is to buy your flowers, then close out the week with oysters and a glass of bubbly, standing, at the blue kiosk.",
      tip: "De Blauwe Kiosk is on the corner of the square; it gets crowded towards noon, so go early.", q: "De Blauwe Kiosk Kouter Gent" },
    { id: "gruut", cat: "ye", area: "dogu", title: "Drink a hop-free Ghent beer",
      desc: "In the Middle Ages beer was flavoured not with hops but with a herb mix called 'gruut', and the tax on that mix made cities rich. The Gentse Gruut Stadsbrouwerij keeps the method alive inside the city.",
      tip: "Try several side by side with a tasting set; check ahead for the days it is open.", q: "Gentse Gruut Stadsbrouwerij Gent", tags: ["rainy day"] },
    { id: "mattentaart", cat: "ye", area: "cevre", title: "Eat a mattentaart in Geraardsbergen",
      desc: "This little tart of curdled milk wrapped in puff pastry can only be made in this region and has European Union geographical indication protection.",
      tip: "Buy one from the bakeries around the Markt, then climb the cobbled 'Muur' hill up to the chapel at the top.", q: "Markt Geraardsbergen" },
    { id: "liefmans", cat: "ye", area: "cevre", title: "Taste a brown beer in Oudenaarde",
      desc: "Oudenaarde's slightly sour dark beer, 'Oudenaards bruin', is a beer style in its own right. Liefmans, on the banks of the Schelde, has brewed it since the 17th century and still wraps its bottles in paper.",
      tip: "Visit the brewery by reservation; otherwise, ask for a Goudenband at a café on Oudenaarde's Markt and look at the Gothic town hall.", q: "Brouwerij Liefmans Oudenaarde" },

    // ───────────── DO ─────────────
    { id: "graslei", cat: "dene", area: "merkez", title: "Sit on the quay at the Graslei",
      desc: "The Graslei, lined with medieval guild houses, and the Korenlei opposite were the city's old port. The moment Ghent folk see the sun, they sit here with their feet dangling over the quay.",
      tip: "Bring your own drink, and find the spot on Sint-Michielsbrug where all three towers appear in the same frame.", q: "Graslei Gent", tags: ["free"] },
    { id: "feesten", cat: "dene", area: "merkez", title: "Stay up all night at the Gentse Feesten",
      desc: "Every July, for ten days, the whole historic centre turns into a stage, a street theatre and a bar. It is one of the biggest city festivals in Europe, and most of the concerts are free.",
      tip: "Its heart is Sint-Jacobs square. The last day is called 'the day of the empty wallets'; catch the Stroppendragers parade with their nooses too.", q: "Sint-Jacobs Gent", months: [7], tags: ["free"] },
    { id: "dullegriet", cat: "dene", area: "merkez", title: "Hand over your shoe for a beer",
      desc: "At Dulle Griet on the Vrijdagmarkt, the house 'Max' beer comes in a huge glass with a long wooden stand. To make sure the glass comes back, one of your shoes is hoisted to the ceiling in a basket.",
      tip: "Wear socks without holes. The giant red cannon Dulle Griet, which the café is named after, is a few steps away by the water.", q: "Dulle Griet Vrijdagmarkt Gent", tags: ["rainy day"] },
    { id: "vaneyck", cat: "dene", area: "dogu", title: "Swim at Zwembad Van Eyck",
      desc: "Opened in 1886, Van Eyck is Belgium's oldest indoor swimming pool. With its art deco hall, gallery cabins and glass roof it is a listed monument, yet still an ordinary neighbourhood pool.",
      tip: "Check the lane swimming hours ahead; on the way out, stroll around the Portus Ganda marina.", q: "Zwembad Van Eyck Gent", tags: ["rainy day"] },
    { id: "kwaremont", cat: "dene", area: "cevre", title: "Pedal up the Oude Kwaremont",
      desc: "A cobbled climb of over two kilometres where the fate of the Ronde van Vlaanderen is decided. In the Flemish Ardennes, cycling is not a sport, it is a religion.",
      tip: "Start at the Centrum Ronde van Vlaanderen in Oudenaarde: the museum, bike rental and marked routes are all there. Careful on wet stones.", q: "Oude Kwaremont Kluisbergen", tags: ["free"] },
    { id: "aalst", cat: "dene", area: "cevre", title: "Join the Aalst Carnival",
      desc: "For three days before Lent, Aalst lives by its own rules: giant floats lampooning politicians, an onion-throwing ceremony and, on Tuesday, the 'Voil Jeanetten' parade. The locals are called 'ajuinen' (onions).",
      tip: "Grab a spot early for the big Sunday parade; the date shifts each year with Easter.", q: "Grote Markt Aalst", months: [2, 3], tags: ["free"] },
    { id: "latem", cat: "dene", area: "cevre", title: "Pedal along the Leie to Latem",
      desc: "In the 1900s the bends of the Leie drew a community of painters to the village of Sint-Martens-Latem; Flemish expressionism was born in these meadows. From Ghent, the route along the river runs straight through the paintings.",
      tip: "Take a break at the Museum Dhondt-Dhaenens in the neighbouring village of Deurle; on the way back, use the other bank of the river.", q: "Sint-Martens-Latem kerk", tags: ["free"] }
  ]
};
