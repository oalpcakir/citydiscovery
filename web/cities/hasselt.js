// Quests for the Hasselt region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.hasselt = {
  id: "hasselt",
  name: "Hasselt",
  subtitle: "& Limburg",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Hasselaar", "Echte Limburger"],
  areas: {
    merkez: "Hasselt",
    cevre: "Limburg"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[50.901, 5.282], [50.961, 5.382]],
  coords: {
    japansetuin: [50.9342, 5.3581], teseumtongeren: [50.7806, 5.4644], apotheekmaaseik: [51.0952, 5.7914],
    mechelseheide: [50.9736, 5.6547], jenevermuseum: [50.9327, 5.3407], hasseltspeculaas: [50.9306, 5.3378],
    knapkoek: [51.0946, 5.7917], loonsestroop: [50.8033, 5.3436], aldeneyck: [51.1033, 5.8070],
    fietsendoorwater: [50.9590, 5.4030], fietsendoorbomen: [51.1540, 5.3500], bokrijk: [50.9631, 5.4031],
    cmine: [50.9833, 5.4915], antiekmarkttongeren: [50.7785, 5.4600], bloesemhaspengouw: [50.8171, 5.1764]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🍸", name: "Jenever Judge" },
    cevre: { icon: "🌸", name: "Blossom Cyclist" }
  },
  quests: [
    { id: "japansetuin", cat: "gor", area: "merkez", title: "Walk under the cherry trees of Hasselt's Japanese Garden",
      desc: "A garden built with Hasselt's Japanese twin town Itami, with a ceremonial tea house, waterfalls, stone lanterns and koi ponds. In April the cherry blossom turns it pink and the Itami Festival celebrates the season.",
      tip: "Come early in the blossom weeks to beat the crowds; in autumn the Kikumatsuri chrysanthemum festival is the quieter alternative.", q: "Japanse Tuin Hasselt", months: [4, 5, 6, 7, 8, 9, 10], src: ["https://japansetuin.hasselt.be/nl", "https://www.livetheworld.com/belgium/limburg"] },
    { id: "teseumtongeren", cat: "gor", area: "cevre", title: "Go under the basilica in Tongeren",
      desc: "Tongeren is the oldest town in Belgium, and beneath its Onze-Lieve-Vrouwebasiliek lie the traces of Roman houses and a medieval town centre. The Teseum next door shows them along with a treasury of reliquaries and choir books.",
      tip: "Book the underground archaeological visit; the Gallo-Romeins Museum is a short walk away if you want the full Roman story.", q: "Onze-Lieve-Vrouwebasiliek Tongeren", tags: ["rainy day"], src: ["http://www.brusselstimes.com/268219/tongeren-a-guide-to-belgiums-oldest-city"] },
    { id: "apotheekmaaseik", cat: "gor", area: "cevre", title: "Step into Belgium's oldest pharmacy in Maaseik",
      desc: "On the lime-shaded Markt of Maaseik, where a statue honours the Van Eyck brothers who were probably born here, an apothecary shop stayed open from 1704 to 1959. Its jars, scales and herb garden are now a museum.",
      tip: "Buy a combi ticket at the tourist office on the Markt: it also covers the archaeology and bakery museums in the same Museactron complex.", q: "Apotheekmuseum Markt Maaseik", tags: ["rainy day"], src: ["https://www.lalibre.be/regions/flandre/2023/04/02/une-escapade-a-maaseik-entre-nature-et-culture-depaysement-assure-KJFPCSUR2ZHJ7HCEDPN667SLCE/"] },
    { id: "mechelseheide", cat: "gor", area: "cevre", title: "Look out over the Mechelse Heide in the national park",
      desc: "Hoge Kempen is Flanders' only national park, and the Mechelse Heide near Maasmechelen is its classic picture: rolling purple heath, sandy paths and pine woods on the edge of the Kempen plateau.",
      tip: "Start at the Mechelse Heide entrance gate; late August is when the heather is at its most purple.", q: "Mechelse Heide Maasmechelen", tags: ["free"], src: ["https://www.nationaalparkhogekempen.be/en", "https://www.livetheworld.com/belgium/limburg"] },
    { id: "jenevermuseum", cat: "ye", area: "merkez", title: "Taste jenever where it is distilled in Hasselt",
      desc: "Hasselt jenever is a protected regional name, and the Nationaal Jenevermuseum occupies a 17th-century monastery farm that worked as a distillery for almost two centuries. The 19th-century steam distillery still produces grain jenevers.",
      tip: "End the visit with a tasting; in October the whole city celebrates the spirit at the Jeneverfeesten.", q: "Nationaal Jenevermuseum Witte Nonnenstraat Hasselt", tags: ["rainy day"], src: ["https://www.erih.net/i-want-to-go-there/site/jenevermuseum"] },
    { id: "hasseltspeculaas", cat: "ye", area: "merkez", title: "Dunk Hasselt speculaas in a Hasseltse koffie",
      desc: "In Hasselt it is called speculaas, not speculoos, and it is thicker and softer than the usual biscuit. Locals pair it with Hasseltse koffie, a strong mix of coffee extract and local jenever.",
      tip: "Bakers Cools and Bakkersdochter are known for their speculaas; Chocoladehuis Boon sells a praline with speculaas and juniper you only find in Hasselt.", q: "Grote Markt Hasselt", src: ["https://visit.hasselt.be/en/hasselt-specialities-taste-touch-of-hasselt"] },
    { id: "knapkoek", cat: "ye", area: "cevre", title: "Crunch a knapkoek in Maaseik",
      desc: "Maaseik's own sweet, crisp biscuit has been baked in town since 1648. The Maasland around it also makes the Eyckedröpke beer, named after the town's famous painters.",
      tip: "Visit on a Wednesday morning, when the weekly market fills the Markt, and pick up knapkoeken at a local bakery.", q: "Markt Maaseik", src: ["https://www.lalibre.be/regions/flandre/2023/04/02/une-escapade-a-maaseik-entre-nature-et-culture-depaysement-assure-KJFPCSUR2ZHJ7HCEDPN667SLCE/"] },
    { id: "loonsestroop", cat: "ye", area: "cevre", title: "Spread Loonse stroop in Borgloon",
      desc: "Borgloon, in the heart of the Haspengouw orchards, is known for its fruit syrup cooked from apples and pears. The town even opens the blossom season with the Loonse Stroopfeesten.",
      tip: "Buy a pot in Borgloon and eat it the local way, on a slice of bread or with cheese; combine it with a blossom ride in April.", q: "Borgloon", src: ["https://www.vrt.be/vrtnws/nl/2026/03/12/bloesems-sint-truiden-tongeren-borgloon-bilzen-hoeselt/", "https://www.discoveringbelgium.com/the-blossoms-of-haspengouw/"] },
    { id: "aldeneyck", cat: "ye", area: "cevre", title: "Sip Maasvallei wine at Aldeneyck",
      desc: "Belgium makes wine, and some of the best known comes from the Aldeneyck estate on the banks of the Maas near Maaseik. The Maasvallei's mild gravelly slopes suit white grapes surprisingly well.",
      tip: "Cycle there from Maaseik along the Maas and stop in the riverside village of Aldeneik with its old church.", q: "Wijnkasteel Aldeneyck Maaseik", src: ["https://www.livetheworld.com/belgium/limburg", "https://www.lalibre.be/regions/flandre/2023/04/02/une-escapade-a-maaseik-entre-nature-et-culture-depaysement-assure-KJFPCSUR2ZHJ7HCEDPN667SLCE/"] },
    { id: "fietsendoorwater", cat: "dene", area: "cevre", title: "Cycle through the water at Bokrijk",
      desc: "Near Genk, a sunken cycle path cuts straight through a pond in the De Wijers wetlands: about 200 metres with the water at eye level on both sides and ducks paddling past your head.",
      tip: "Follow cycle junctions 98 to 91 on the Limburg network; it is free and open all year, and Bokrijk station is the easiest start by train.", q: "Fietsen door het water Bokrijk Genk", tags: ["free"], src: ["https://www.brusselstimes.com/266466/hidden-belgium-cycle-through-the-water", "https://livetheworld.com/activities/belgium/cycling-through-water-fietsen-door-het-water"] },
    { id: "fietsendoorbomen", cat: "dene", area: "cevre", title: "Ride up into the treetops in Hechtel-Eksel",
      desc: "In the Pijnven pine forest of Bosland, a gently sloping cycle path climbs in two big loops up to ten metres high, so you pedal among the crowns of the trees.",
      tip: "Head for cycle junction 272; walkers can use it too, and it pairs well with a day of cycling through the water at Bokrijk.", q: "Fietsen door de bomen Pijnven Hechtel-Eksel", tags: ["free"], src: ["https://www.vrt.be/vrtnws/nl/2019/06/14/vanaf-nu-ook-fietsen-door-de-bomen-in-hechtel-eksel/"] },
    { id: "bokrijk", cat: "dene", area: "cevre", title: "Step back in time at Bokrijk open-air museum",
      desc: "Farmhouses, mills, chapels and whole village streets from all over Flanders were moved to the woods of Bokrijk near Genk, where costumed actors and craftspeople bring old rural life back to life.",
      tip: "Plan a full day and add the arboretum and the cycle-through-the-water path in the same domain; check the season dates before you go.", q: "Openluchtmuseum Bokrijk Genk", months: [4, 5, 6, 7, 8, 9, 10], src: ["https://www.bokrijk.be/en", "https://www.travelextra.ie/?p=42945"] },
    { id: "cmine", cat: "dene", area: "cevre", title: "Go deep down and high up at C-mine in Genk",
      desc: "The old Winterslag coal mine in Genk is now a design and culture hub. The C-mine expedition takes you through the mine's underground passages and up to the top of the headframe.",
      tip: "Afterwards, get lost in the steel Labyrinth on the square and look in on the studio of ceramist Pieter Stockmans in a former warehouse.", q: "C-mine Genk", tags: ["rainy day"], src: ["http://c-mine.be/en", "https://www.travelextra.ie/?p=42945"] },
    { id: "antiekmarkttongeren", cat: "dene", area: "cevre", title: "Hunt for treasures at Tongeren's Sunday antiques market",
      desc: "Every Sunday, around 350 stallholders and dozens of antique dealers fill the streets around the Veemarkt in Tongeren for what is often called the biggest antiques market in the Benelux.",
      tip: "Arrive early, the best finds go first; part of the market is under cover in the Julianus car park, so it works in the rain too.", q: "Antiekmarkt Veemarkt Tongeren", tags: ["free"], src: ["http://www.brusselstimes.com/268219/tongeren-a-guide-to-belgiums-oldest-city"] },
    { id: "bloesemhaspengouw", cat: "dene", area: "cevre", title: "Cycle through the Haspengouw blossom",
      desc: "In spring the orchards between Sint-Truiden and Borgloon turn white and pink with apple, pear and cherry blossom over gently rolling hills, in Belgium's biggest fruit region.",
      tip: "Rent a bike at the fietspunt at Sint-Truiden station and follow the numbered junctions towards Borgloon; check Sint-Truiden's bloesemmeter to time your trip.", q: "Station Sint-Truiden", months: [4], tags: ["free"], src: ["https://www.discoveringbelgium.com/the-blossoms-of-haspengouw/"] }
  ]
};
