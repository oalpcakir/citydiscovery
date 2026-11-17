// Quests for the Leuven region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.leuven = {
  id: "leuven",
  name: "Leuven",
  subtitle: "& Flemish Brabant",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Leuvenaar", "Echte Leuvenaar"],
  areas: {
    merkez: "Leuven",
    cevre: "Hageland & surroundings"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[50.85, 4.651], [50.91, 4.75]],
  coords: {
    leuven: [50.8789, 4.7012], tervuren: [50.8309, 4.5186], oudemarkt: [50.8777, 4.7000],
    diestbegijnhof: [50.9877, 5.0613], dehoorn: [50.8873, 4.6999], hal5: [50.8833, 4.7223]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🍺", name: "Oude Markt Regular" },
    cevre: { icon: "🍇", name: "Hageland Hiker" }
  },
  quests: [
    { id: "leuven", cat: "gor", area: "merkez", title: "Count the statues on Leuven's town hall",
      desc: "The facade of the 15th-century Gothic Stadhuis is carved like lace, with 236 statues standing in its niches. It is the showpiece of a university town less than half an hour from Brussels by train.",
      tip: "Step into the Sint-Pieterskerk across the way, then walk to the square by the university library.", q: "Stadhuis Leuven", tags: ["free"] },
    { id: "tervuren", cat: "gor", area: "cevre", title: "Visit the AfricaMuseum in Tervuren",
      desc: "This palace museum was built by King Leopold II as a colonial showcase. After a long renovation it has reopened as a place that questions both Congolese history and its own past. It is where Belgium confronts its colonial legacy.",
      tip: "Hop on tram 44 from Montgomery: the ride runs through the Sonian Forest and is half the fun.", q: "AfricaMuseum Tervuren", tags: ["rainy day"] },
    { id: "oudemarkt", cat: "ye", area: "merkez", title: "Have a beer at Leuven's 'longest bar'",
      desc: "All four sides of the Oude Markt square are lined with cafés and terraces, and Leuveners call it the longest bar in the world. Stella Artois is brewed in this town.",
      tip: "Come on a sunny late afternoon; outside the student term the square is noticeably calmer.", q: "Oude Markt Leuven" },
    { id: "diestbegijnhof", cat: "gor", area: "cevre", title: "Slip through the Baroque gate of Diest's begijnhof",
      desc: "Behind a 17th-century gate topped by a Madonna lies a quiet walled village of whitewashed beguine houses, a church of Saint Catherine and an old water pump, part of the UNESCO-listed Flemish béguinages.",
      tip: "Entry is free and the lanes are always open; come early in the morning, then walk on to the Warande park and the Webbekoms Broek nature reserve next door.", q: "Begijnhof Diest", tags: ["free"], src: ["https://travel.bhushavali.com/2021/06/things-to-do-in-diest-travel-guide.html"] },
    { id: "dehoorn", cat: "ye", area: "merkez", title: "Eat among the brew kettles of the old Stella brewery in Leuven",
      desc: "De Hoorn occupies the former Stella Artois brewery, so you dine next to the old copper kettles. Order the stoverij simmered in abbey beer or the burger with a Stella dressing.",
      tip: "Grab a table on the terrace overlooking the Sluispark on a warm evening; it is a pleasant walk from the Oude Markt along the canal side of town.", q: "De Hoorn Sluisstraat Leuven", src: ["https://visitleuven.be/en/blog/beer-foodies"] },
    { id: "hal5", cat: "dene", area: "merkez", title: "Hang out at Hal 5, Leuven's reborn railway hall",
      desc: "A former railway hall just behind Leuven station has been turned into a lively hangout with a bakery, market, food stands and a bar, a local favourite that most day-trippers never find.",
      tip: "Time your visit for the monthly Camping Flamingo flea market, and try the falafel from Habibi, which Leuveners swear is the best in the country.", q: "Hal 5 Kessel-Lo Leuven", tags: ["rainy day"], src: ["https://visitleuven.be/en/blog/hidden-gems"] }
  ]
};
