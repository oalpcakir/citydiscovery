// Quests for the Middelburg region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.middelburg = {
  id: "middelburg",
  name: "Middelburg",
  subtitle: "& Zeeland",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Zeeuw at heart", "Echte Zeeuw"],
  areas: {
    merkez: "Middelburg",
    cevre: "Zeeland"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[51.469, 3.564], [51.529, 3.664]],
  coords: {
    rammekens: [51.4527, 3.6540], watersnoodmuseum: [51.6174, 3.9829], westkapellelicht: [51.5294, 3.4422],
    zierikzeetoren: [51.6503, 3.9148], oesterij: [51.4955, 4.0548], philippine: [51.2816, 3.7603],
    bolus: [51.4997, 3.6166], babbelaars: [51.5010, 3.6115], foppe: [51.4434, 3.5727],
    beuze: [51.6497, 3.9195], neeltjejans: [51.6391, 3.7158], stoomtreingoes: [51.4974, 3.8831],
    saeftinghe: [51.3430, 4.2010], vlissingenboulevard: [51.4403, 3.5723]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    merkez: { icon: "🏛️", name: "Abbey Insider" },
    cevre: { icon: "🦪", name: "Delta Diver" }
  },
  quests: [
    { id: "rammekens", cat: "gor", area: "cevre", title: "Explore Fort Rammekens near Vlissingen",
      desc: "Built in 1547 at the mouth of the Westerschelde, this squat fort near Ritthem is called the oldest coastal fortification in Western Europe. Damp casemates, grassy ramparts and wide views over passing ships.",
      tip: "It only opens on weekends from April to October, because bats hibernate inside in winter. Book ahead to be sure of getting in.", q: "Fort Rammekens, Ritthem", months: [4, 5, 6, 7, 8, 9, 10], src: ["https://www.zeeland.com/en/visit/things-to-do/8x-bijzondere-plekken-in-zeeland"] },
    { id: "watersnoodmuseum", cat: "gor", area: "cevre", title: "Step inside the caissons of the Watersnoodmuseum in Ouwerkerk",
      desc: "The museum about the 1953 flood fills four giant concrete caissons that were sunk to close the last dike breach. Personal stories, models and hands-on displays explain why Zeeland lives behind the Delta Works.",
      tip: "Walk up onto the dike behind the caissons afterwards: the creek left by the breach is still there.", q: "Watersnoodmuseum, Ouwerkerk", tags: ["rainy day"], src: ["https://www.zeeland.com/en/visit/things-to-do/8x-bijzondere-plekken-in-zeeland", "https://en.wikipedia.org/wiki/Watersnoodmuseum"] },
    { id: "westkapellelicht", cat: "gor", area: "cevre", title: "Climb the church-tower lighthouse in Westkapelle",
      desc: "'t Hoge Licht began life as a church tower; the church burned in 1831 and the tower became a lighthouse that still shines every night. From the top you see how low Westkapelle sits behind its sea dike.",
      tip: "Tickets go via the Polderhuis dike and war museum on the same street; combine both and walk to the tank on the dike.", q: "Vuurtoren 't Hoge Licht, Westkapelle", src: ["https://polderhuiswestkapelle.nl/en/lighthouse/lighthouse-t-hoge-licht"] },
    { id: "zierikzeetoren", cat: "gor", area: "cevre", title: "Look up at the unfinished Dikke Toren of Zierikzee",
      desc: "Zierikzee's 62 metre Sint-Lievensmonstertoren was meant to be far taller, but the money ran out in the 1400s. Below it, the Oude Haven with its old ships and the Zuidhavenpoort gate make one of Zeeland's prettiest harbour scenes.",
      tip: "Park at the edge of the old town; the centre is for residents. Shops are mostly shut on Sundays.", q: "Sint-Lievensmonstertoren, Zierikzee", src: ["https://dutchnews.nl/2024/04/dutch-news-destinations-zoom-on-down-or-up-to-zierikzee"] },
    { id: "oesterij", cat: "ye", area: "cevre", title: "Slurp oysters beside the oyster pits of Yerseke",
      desc: "Yerseke is Zeeland's shellfish village, and at the family-run Oesterij on the Havendijk you eat oysters right beside the 19th-century pits where they rest before sale.",
      tip: "Ask for a tour of the oyster beds first, then taste the round Zeeuwse bolle against the long Zeeuwse creuse.", q: "Oesterij, Havendijk 12, Yerseke", src: ["https://watersnoodmuseum.nl/en/the-museum/group-visits/oyster-tasting-yerseke", "https://www.zeeland.com/en/visit/drinking-and-dining/restaurants/mosselen-eten-in-zeeland"] },
    { id: "philippine", cat: "ye", area: "cevre", title: "Eat a pan of mussels in Philippine",
      desc: "This Zeeuws-Vlaanderen village lost its mussel harbour long ago but kept the restaurants, which serve around half a million kilos a year. Auberge des Moules has cooked them to the same family recipe for decades.",
      tip: "Season runs roughly July to April. Use your first empty shell as tongs, like the locals do.", q: "Auberge des Moules, Philippine", months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4], src: ["https://guide.michelin.com/nl/nl/zeeland/philippine/restaurant/auberge-des-moules", "https://www.zeeland.com/en/visit/drinking-and-dining/restaurants/mosselen-eten-in-zeeland"] },
    { id: "bolus", cat: "ye", area: "merkez", title: "Try a sticky Zeeuwse bolus in Middelburg",
      desc: "The spiral bun glazed in dark syrup and cinnamon is Zeeland's signature pastry. Bliek's version has been crowned the province's best bolus several times.",
      tip: "Eat it warm with a coffee on the Markt in front of the Gothic town hall.", q: "Bliek Meesterbakkers, Middelburg", src: ["https://www.anwb.nl/eropuit/dagje-uit/nederland/zeeland/wat-te-doen-in-middelburg"] },
    { id: "babbelaars", cat: "ye", area: "merkez", title: "Buy boterbabbelaars at Diesch in Middelburg",
      desc: "Zeeuwse babbelaars are hard butter candies, and JB Diesch has been boiling them in Middelburg since 1892. A tin makes the most Zeeland souvenir there is.",
      tip: "The shop is on the Lange Noordstraat, a short walk from the Abdij and the Zeeuws Museum.", q: "JB Diesch, Lange Noordstraat, Middelburg", src: ["https://www.anwb.nl/eropuit/dagje-uit/nederland/zeeland/wat-te-doen-in-middelburg"] },
    { id: "foppe", cat: "ye", area: "cevre", title: "Spicy kibbeling at Foppe in Vlissingen",
      desc: "A no-frills snack bar on the Bellamypark that seasons its fried fish chunks with Asian spices, a nod to Vlissingen's seafaring past.",
      tip: "Take it up to the boulevard and eat while the ships pass.", q: "Foppe, Bellamypark 8, Vlissingen", src: ["https://en.wikivoyage.org/wiki/Vlissingen"] },
    { id: "beuze", cat: "ye", area: "cevre", title: "Local oysters and fish at De Beuze in Zierikzee",
      desc: "A seafood restaurant where Zierikzee locals go for Oosterschelde oysters and fresh fish, without the touristy prices of the harbour terraces.",
      tip: "Book even on a quiet weekend; the town fills up fast.", q: "Restaurant De Beuze, Zierikzee", src: ["https://dutchnews.nl/2024/04/dutch-news-destinations-zoom-on-down-or-up-to-zierikzee"] },
    { id: "neeltjejans", cat: "dene", area: "cevre", title: "Go inside the Delta Works at Neeltje Jans",
      desc: "Deltapark Neeltje Jans sits on the artificial island in the middle of the Oosterscheldekering. See the storm barrier up close, relive the 1953 flood in the Delta Experience and take a boat onto the Oosterschelde to look for seals and porpoises.",
      tip: "The park is seasonal, roughly spring to autumn; arrive early, as some tours stop later in the day.", q: "Deltapark Neeltje Jans", months: [3, 4, 5, 6, 7, 8, 9, 10], src: ["https://www.neeltjejans.nl/en/park/", "https://en.wikipedia.org/wiki/Deltapark_Neeltje_Jans"] },
    { id: "stoomtreingoes", cat: "dene", area: "cevre", title: "Ride the steam train from Goes to Hoedekenskerke",
      desc: "A heritage line puffs through the orchards and polders of Zuid-Beveland to the Westerschelde dike at Hoedekenskerke.",
      tip: "On steam days the train only stops at Goes, Kwadendamme and Hoedekenskerke; check the running days in advance.", q: "Stoomtrein Goes-Borsele, Goes", months: [5, 6, 7, 8, 9, 10], src: ["https://en.wikipedia.org/wiki/Stoomtrein_Goes_-_Borsele", "https://www.travelextra.ie/wanderlist-zeeland-ten-must-see-attractions-and-some-off-the-beaten-track/"] },
    { id: "saeftinghe", cat: "dene", area: "cevre", title: "Walk into the Drowned Land of Saeftinghe",
      desc: "Europe's largest brackish salt marsh covers villages swallowed by the Westerschelde. Creeks fill and empty with tides of up to six metres, and harriers and bearded tits hunt over the reeds.",
      tip: "Two short trails from the visitor centre are open to everyone; the heart of the marsh is only accessible on a guided excursion.", q: "Bezoekerscentrum Verdronken Land van Saeftinghe, Emmaweg 4, Nieuw-Namen", src: ["https://birdingplaces.eu/fr/birdingplaces/netherlands/verdronken-land-van-saeftinghe"] },
    { id: "vlissingenboulevard", cat: "dene", area: "cevre", title: "Watch giant ships from the boulevard in Vlissingen",
      desc: "Ships heading for Antwerp pass the Boulevard de Ruyter perhaps closer than anywhere else in the world. Admiral Michiel de Ruyter, born here, watches from his statue.",
      tip: "Find the Belgian pilots' houses on the Spuistraat, where pilots still board the ships.", q: "Boulevard de Ruyter, Vlissingen", tags: ["free"], src: ["https://en.wikivoyage.org/wiki/Vlissingen"] }
  ]
};
