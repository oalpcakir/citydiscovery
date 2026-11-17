// Quests for the Mons & Charleroi region.
// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;
// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json
// and run tools/rebuild_regions.py and tools/reassign_quests.py.

window.CITIES = window.CITIES || {};
window.CITIES.mons = {
  id: "mons",
  name: "Mons & Charleroi",
  subtitle: "& Hainaut",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbour", "Hennuyer", "Vrai Hennuyer"],
  areas: {
    mons: "Mons",
    charleroi: "Charleroi",
    cevre: "Hainaut"
  },
  // Map view when the region opens (the main city) and quest positions [lat, lng].
  bounds: [[50.381, 3.907], [50.484, 4.495]],
  coords: {
    grandhornu: [50.4353, 3.8394], boisducazier: [50.3811, 4.4433], tournaicathedral: [50.6066, 3.3889],
    thuin: [50.3384, 4.2897], stfeuillien: [50.4983, 4.1273], lapintournai: [50.6060, 3.3878],
    monsmonkey: [50.4543, 3.9519], doudou: [50.4537, 3.9467], binche: [50.4108, 4.1653],
    athgiants: [50.6298, 3.7749], pairidaiza: [50.5847, 3.8872], strepythieu: [50.4781, 4.1100]
  },
  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.
  areaBadges: {
    mons: { icon: "🐒", name: "Lucky Monkey" },
    charleroi: { icon: "⛏️", name: "Pays Noir Pioneer" },
    cevre: { icon: "🎭", name: "Carnival Gille" }
  },
  quests: [
    { id: "grandhornu", cat: "gor", area: "cevre", title: "Stand in the great oval courtyard of Grand-Hornu",
      desc: "Built by Henri De Gorge between 1810 and 1830, this coal-mining complex near Mons is a showpiece of early industrial town planning, with an elegant brick courtyard and workers' houses. It is now a UNESCO site hosting exhibitions.",
      tip: "Contemporary art shows run in the old buildings; walk the surrounding streets to see the original miners' terraces.", q: "Grand-Hornu Boussu", src: ["https://en.wikipedia.org/wiki/Grand-Hornu"] },
    { id: "boisducazier", cat: "gor", area: "charleroi", title: "Remember the miners at Bois du Cazier in Marcinelle",
      desc: "On 8 August 1956 a fire at this Charleroi coal mine killed 262 men, many of them Italian immigrants. The pithead is now a moving memorial and museum, with a glass museum on the same site.",
      tip: "Afterwards climb the landscaped slag heaps behind the mine for a view over the Charleroi basin.", q: "Bois du Cazier Marcinelle", tags: ["rainy day"], src: ["https://en.wikipedia.org/wiki/Bois_du_Cazier"] },
    { id: "tournaicathedral", cat: "gor", area: "cevre", title: "Count the five towers of Tournai's cathedral",
      desc: "Notre-Dame de Tournai crowns the city with an extraordinary cluster of five bell towers over its transept. The cathedral is a UNESCO World Heritage Site and has been under careful restoration since a 1999 tornado.",
      tip: "Admire the towers from the Grand-Place, then climb Belgium's oldest belfry nearby for the full view.", q: "Cathédrale Notre-Dame de Tournai", tags: ["free"], src: ["https://en.wikipedia.org/wiki/Tournai_Cathedral"] },
    { id: "thuin", cat: "gor", area: "cevre", title: "Climb through the hanging gardens of Thuin",
      desc: "Below the ramparts of Thuin's upper town, terraced gardens and vineyards cling to the rock, linked by steep alleys and stairways. The sun-trapping walls even ripen grapes for a sweet local wine.",
      tip: "Climb up from the riverside lower town, once home to Sambre boatmen, to the UNESCO-listed belfry at the top.", q: "Jardins suspendus de Thuin", tags: ["free"], src: ["https://focusonbelgium.be/en/lifestyle/stroll-through-hanging-gardens-thuin", "https://bruxellessecrete.com/en/thuin-wallonia-brussels/"] },
    { id: "stfeuillien", cat: "ye", area: "cevre", title: "Taste a Grisette at the St-Feuillien brewery in Le Roeulx",
      desc: "The Friart family has brewed in Le Roeulx, between Mons and La Louvière, since 1873. A tour shows old equipment from 1893 next to the modern brewhouse, and ends with a tasting of their abbey beers or a light Grisette.",
      tip: "Book your tour online, as places are limited; combine it with the giant boat lift at Strépy-Thieu a few minutes away.", q: "Brasserie St-Feuillien Le Roeulx", src: ["https://visitwallonia.com/content/brasserie-saint-feuillien-le-roeulx"] },
    { id: "lapintournai", cat: "ye", area: "cevre", title: "Eat rabbit with prunes on Tournai's Lundi Perdu",
      desc: "On the 'lost Monday' after Epiphany, Tournai families gather for a rabbit supper, a tradition now recognised as oral and intangible heritage. Lapin à la tournaisienne is stewed with prunes and raisins.",
      tip: "Restaurants on the Grand-Place serve the dish beyond January too; ask for the salade tournaisienne on the side.", q: "Grand-Place Tournai", months: [1], src: ["https://www.rtbf.be/article/le-souper-du-lapin-du-lundi-perdu-chef-d-uvre-de-la-federation-wallonie-bruxelles-10834842", "https://www.rtbf.be/article/recette-de-candice-lapin-a-la-tournaisienne-10545139"] },
    { id: "monsmonkey", cat: "dene", area: "mons", title: "Stroke the lucky monkey on Mons town hall",
      desc: "A tiny iron monkey crouches by the door of the town hall on the Grand-Place of Mons, its head polished bright by passers-by. Nobody is sure where it came from, but since 1930 it has been the city's lucky charm.",
      tip: "It only works with your left hand: that is said to bring a year of happiness.", q: "Singe du Grand Garde Hôtel de Ville Mons", tags: ["free"], src: ["https://www.visitmons.be/en/que-faire/article/the-grand-guard-monkey-020939"] },
    { id: "doudou", cat: "dene", area: "mons", title: "Push the Car d'Or up the hill at the Doudou in Mons",
      desc: "At the Ducasse, the gilded Car d'Or carrying Saint Waltrude's relics must climb the steep ramp to the collegiate church in one go, with the crowd pushing behind. Then Saint George fights the dragon in the Lumeçon on the Grand-Place.",
      tip: "It happens on Trinity Sunday weekend (late May or June); stake out a spot early for the half-hour Lumeçon, as the square fills fast.", q: "Collégiale Sainte-Waudru Mons", months: [5, 6], tags: ["free"], src: ["https://en.wikipedia.org/wiki/Ducasse_de_Mons"] },
    { id: "binche", cat: "dene", area: "cevre", title: "Catch an orange from the Gilles at the Binche carnival",
      desc: "On Shrove Tuesday, hundreds of Gilles in wax masks, ostrich-plume hats and clogs dance through Binche, throwing oranges into the crowd. The carnival goes back centuries and is UNESCO-listed intangible heritage.",
      tip: "Being hit by an orange counts as an honour, so never throw one back; arrive early in the morning to see the Gilles gathering.", q: "Grand-Place Binche", months: [2, 3], tags: ["free"], src: ["https://en.wikipedia.org/wiki/Carnival_of_Binche"] },
    { id: "athgiants", cat: "dene", area: "cevre", title: "Watch the giants dance at the Ducasse d'Ath",
      desc: "On the fourth weekend of August, Ath's giants, still carried on men's backs, parade through the 'City of Giants'. Goliath, called Gouyasse, gets married on Saturday and battles little David on Sunday.",
      tip: "Outside festival time, the Maison des Géants museum shows how the giants are built; try a mastelle tart after the battle.", q: "Maison des Géants Ath", months: [8], src: ["https://visitwallonia.com/en-gb/content/ducasse-ath-when-giants-dance-city"] },
    { id: "pairidaiza", cat: "dene", area: "cevre", title: "Spend a day among the animals at Pairi Daiza",
      desc: "Built in the grounds of the old Cistercian abbey of Cambron in Brugelette, this zoo and botanical garden mixes thousands of animals with themed worlds and medieval abbey ruins.",
      tip: "It is big enough for a full day; start early and look out for the old abbey tower among the enclosures.", q: "Pairi Daiza Brugelette", src: ["https://en.wikipedia.org/wiki/Pairi_Daiza"] },
    { id: "strepythieu", cat: "dene", area: "cevre", title: "Watch boats rise 73 metres at the Strépy-Thieu lift",
      desc: "This giant boat lift on the Canal du Centre raises barges 73 metres in a few minutes, and was the tallest in the world until 2016. Nearby, the four Victorian hydraulic lifts it replaced are a UNESCO World Heritage Site.",
      tip: "Walk or cycle the old canal towpath between Thieu and Houdeng-Goegnies to see the historic lifts one after another.", q: "Ascenseur funiculaire de Strépy-Thieu", tags: ["free"], src: ["https://en.wikipedia.org/wiki/Str%C3%A9py-Thieu_boat_lift", "https://en.wikipedia.org/wiki/Canal_du_Centre_(Belgium)"] }
  ]
};
