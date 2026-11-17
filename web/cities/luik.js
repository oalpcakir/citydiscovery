// Liège ve Ardenler görevleri (Namur, Dinant, Spa, Durbuy, Hautes Fagnes, Bouillon, Han-sur-Lesse dahil).
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.luik = {
  id: "luik",
  name: "Liège",
  subtitle: "& the Ardennes",
  country: "Belgium",
  levels: ["Tourist", "Newcomer", "Curious", "Neighbourhood Regular", "Liégeois", "Vrai Tchantchès"],
  areas: {
    merkez: "Centre",
    tepeler: "Hors-Château & Coteaux",
    outremeuse: "Outremeuse",
    guillemins: "Guillemins & Boverie",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[50.615, 5.545], [50.660, 5.600]],
  coords: {
    perron: [50.6456, 5.5741], boulets: [50.6458, 5.5747], gaufre: [50.6463, 5.5752], peket: [50.6451, 5.5753],
    batte: [50.6421, 5.5771], lacquemant: [50.6365, 5.5665],
    bueren: [50.6478, 5.5771], nocturne: [50.6484, 5.5825], fonts: [50.6481, 5.5826],
    tchantches: [50.6392, 5.5814], aout: [50.6398, 5.5845],
    guillemins: [50.6244, 5.5666], boverie: [50.6282, 5.5765],
    namur: [50.4597, 4.8630], couque: [50.2588, 4.9117], spa: [50.4923, 5.8655], durbuy: [50.3523, 5.4563],
    fagnes: [50.5013, 6.0932], bouillon: [49.7933, 5.0647], han: [50.1209, 5.1926], blegny: [50.6862, 5.7235]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🧇", name: "Cité Ardente" },
    tepeler: { icon: "🪜", name: "Bueren Conqueror" },
    outremeuse: { icon: "🎭", name: "Friend of Tchantchès" },
    guillemins: { icon: "🚄", name: "Meuse Traveller" },
    cevre: { icon: "🌲", name: "Ardennes Explorer" }
  },
  quests: [
    // ───────────── GÖRÜLECEK ─────────────
    { id: "perron", cat: "gor", area: "merkez", title: "Stop in front of Le Perron",
      desc: "The column rising above the fountain on Place du Marché is a symbol of liberty from the days when Liège was, for centuries, an independent state ruled by a prince-bishop. It is on the city's coat of arms too.",
      tip: "When Charles the Bold punished the city in 1468, he had the column pulled out and carried off to Bruges; also glance into the courtyard of the Prince-Bishops' Palace right behind it.", q: "Le Perron Place du Marché Liège", tags: ["free"] },
    { id: "fonts", cat: "gor", area: "tepeler", title: "See the baptismal font of Saint-Barthélemy",
      desc: "Cast in one piece of brass in the 12th century, the baptismal font is regarded as a masterpiece of medieval Meuse art and stands on the backs of small oxen. It is also called one of the seven wonders of Belgium.",
      tip: "The church's red-and-white painted exterior is also one of the city's most photogenic buildings; come on foot along Hors-Château street.", q: "Collégiale Saint-Barthélemy Liège", tags: ["rainy day"] },
    { id: "tchantches", cat: "gor", area: "outremeuse", title: "Meet Tchantchès",
      desc: "With his huge nose and blue apron, stubborn but golden-hearted, the puppet Tchantchès is the symbol of the true Liégeois. According to legend he was born in Outremeuse, between two paving stones.",
      tip: "At the Musée Tchantchès, traditional rod-puppet shows run seasonally, in French and Walloon; check the schedule ahead.", q: "Musée Tchantchès Liège", tags: ["rainy day"] },
    { id: "guillemins", cat: "gor", area: "guillemins", title: "Walk under the Guillemins station",
      desc: "Designed by Santiago Calatrava, the station has no facade: a giant white dome of steel and glass sweeps down over the platforms like a wave. The high-speed trains pass through here.",
      tip: "Look down at the station from above using the footbridge up the hill at the back; on a sunny day the shadows are a show of their own.", q: "Gare de Liège-Guillemins", tags: ["free", "rainy day"] },
    { id: "boverie", cat: "gor", area: "guillemins", title: "Cross the footbridge to La Boverie",
      desc: "Leave the station and cross the Meuse on the 'La Belle Liégeoise' footbridge, and you find yourself on an island in the middle of the river, inside a park. The palace left over from the 1905 World's Fair houses the city's fine arts museum.",
      tip: "Even if you skip the museum, walk to the rose garden at the end of the park and out to the riverbank.", q: "La Boverie Liège", tags: ["free"] },
    { id: "namur", cat: "gor", area: "cevre", title: "Look at two rivers from the Namur citadel",
      desc: "The citadel on the rock where the Sambre meets the Meuse is among the largest in Europe. Because of its kilometres of underground galleries, Napoleon is said to have called it the 'termite mound of Europe'.",
      tip: "Take the cable car up from the town centre and walk down; find the golden turtle statue on the ramparts.", q: "Citadelle de Namur" },
    { id: "durbuy", cat: "gor", area: "cevre", title: "Get lost in the stone streets of Durbuy",
      desc: "Durbuy, in a bend of the Ourthe river, calls itself 'the smallest city in the world' on the strength of the city title it received in the 14th century. A few cobbled streets, a castle and a giant rock curling above it.",
      tip: "Very crowded on weekends; go on a weekday or in winter. Also stop by the park of topiary trees.", q: "Durbuy Vieille Ville" },
    { id: "bouillon", cat: "gor", area: "cevre", title: "Walk the ramparts of Bouillon castle",
      desc: "Built on a narrow bend of the Semois river, the castle belonged to Godefroy de Bouillon, leader of the First Crusade. To raise money for the expedition, he handed it over to the prince-bishop of Liège.",
      tip: "In season there is a bird-of-prey show in the courtyard; see the whole castle from the hill across the town.", q: "Château de Bouillon" },

    // ───────────── YENİLECEK ─────────────
    { id: "gaufre", cat: "ye", area: "merkez", title: "Eat a hot Liège waffle",
      desc: "A real gaufre de Liège is made from a dense, yeasted dough; the big pearl sugar inside melts and caramelises on the iron. It is eaten by hand, with nothing on top.",
      tip: "Try the cinnamon one at Une Gaufrette Saperlipopette on Rue des Mineurs; if there is a queue, you're in the right place.", q: "Une Gaufrette Saperlipopette Liège" },
    { id: "boulets", cat: "ye", area: "merkez", title: "Order boulets à la liégeoise",
      desc: "Two big meatballs, frites and a dark sweet-and-sour sauce: the city's national dish. The 'sauce lapin' is named not after a rabbit but after a Madame Lapin, and it contains sirop de Liège, an apple-and-pear syrup.",
      tip: "Most brasseries around Place du Marché have 'boulets-frites' on the menu; ask for apple purée on the side.", q: "Place du Marché Liège", tags: ["rainy day"] },
    { id: "peket", cat: "ye", area: "merkez", title: "Taste pékèt at the Maison du Pékèt",
      desc: "Pékèt is Wallonia's juniper-flavoured spirit; in Liège it is drunk from small glasses, plain or in dozens of fruit flavours. The Maison du Pékèt, in old stone houses, is the city's address for it.",
      tip: "Right behind the town hall. Try the plain one first, then a fruity one.", q: "La Maison du Peket Liège", tags: ["rainy day"] },
    { id: "lacquemant", cat: "ye", area: "merkez", title: "Eat a lacquemant at the Foire d'octobre",
      desc: "One of the country's oldest fairs sets up along Boulevard d'Avroy for weeks every autumn. The fair's treat is the lacquemant: a thin wafer split open and filled with orange-blossom syrup.",
      tip: "It runs from early October to mid-November. The syrup drips, so take extra napkins.", q: "Foire d'octobre Boulevard d'Avroy Liège", months: [10, 11] },
    { id: "couque", cat: "ye", area: "cevre", title: "Buy a couque in Dinant",
      desc: "Couque de Dinant is made of just flour and honey, shaped in carved wooden moulds, and is rock hard. You don't bite it: you break off small pieces and let them melt in your mouth.",
      tip: "Look at the moulds in the window of Maison Jacobs on Rue Grande. Then head up to the house of Adolphe Sax, inventor of the saxophone, and the citadel on the cliff.", q: "Couques de Dinant Jacobs Dinant" },

    // ───────────── DENEYİM ─────────────
    { id: "bueren", cat: "dene", area: "tepeler", title: "Climb the 374 steps of the Montagne de Bueren",
      desc: "Not a mountain but a staircase that shoots straight up to the sky: it was built in the 19th century so that soldiers at the citadel could get down to the city quickly. People still sit on both sides of the steps.",
      tip: "At the top turn left and come down through the terraces along the paths of the Coteaux de la Citadelle.", q: "Montagne de Bueren Liège", tags: ["free"] },
    { id: "nocturne", cat: "dene", area: "tepeler", title: "Nocturne des Coteaux by candlelight",
      desc: "On the first Saturday evening of October, the Bueren steps, the dead-end alleys of Hors-Château and the gardens on the slope are lit with thousands of candles. The city's normally closed courtyards are open that night.",
      tip: "It gets very crowded; come early and start from the side alleys (impasses) instead of the main staircase.", q: "Hors-Château Liège", months: [10], tags: ["free"] },
    { id: "batte", cat: "dene", area: "merkez", title: "Walk La Batte from end to end on a Sunday morning",
      desc: "La Batte, stretching along the Meuse quay, is one of the oldest and longest markets in the country: cheese, chickens, fabric, books, live animals. Some people come even from the Netherlands and Germany.",
      tip: "It sets up on Sunday mornings and packs up in the afternoon. Grab something hot to eat in a paper cone and walk along the river side.", q: "Marché de la Batte Liège", tags: ["free"] },
    { id: "aout", cat: "dene", area: "outremeuse", title: "Cross over to Outremeuse on 15 August",
      desc: "The neighbourhood on the far bank of the river has declared itself the 'Free Republic of Outremeuse' and celebrates it on 15 August: a Black Madonna procession, giant puppets, street concerts and plenty of pékèt.",
      tip: "Don't miss 'Matî l'Ohê' the next day, the mock funeral at which a ham bone is buried.", q: "Rue Puits-en-Sock Liège", months: [8], tags: ["free"] },
    { id: "spa", cat: "dene", area: "cevre", title: "Drink water at the source in Spa",
      desc: "Every 'spa' in the world takes its name from this Ardennes town, which is on the UNESCO list together with Europe's great spa towns. The Pouhon Pierre le Grand spring is named after Peter the Great, the Russian tsar who came here seeking a cure.",
      tip: "Be ready for the taste of the iron-rich water. Take the funicular up to the thermal pools on the hill, or do the spring walk in the forest.", q: "Pouhon Pierre le Grand Spa" },
    { id: "fagnes", cat: "dene", area: "cevre", title: "Walk the boardwalk in the Hautes Fagnes",
      desc: "The roof of Belgium: peat bogs, mist and an empty plateau stretching to the horizon. The country's highest point, the Signal de Botrange, is at 694 metres, and wooden walkways cross the bog.",
      tip: "It is the first place to hold snow in winter. When there is a fire risk a red flag goes up and the trails close; check before setting out.", q: "Signal de Botrange", tags: ["free"] },
    { id: "han", cat: "dene", area: "cevre", title: "Take the old tram to the Han caves",
      desc: "At Han-sur-Lesse the river Lesse enters a hill, vanishes and comes out the other side; in between lies one of Europe's most impressive cave systems. A century-old tram leaving from the village takes you to the entrance.",
      tip: "It is cool inside all year round, so bring a layer. Leave time for the wildlife park, which is visited on the same ticket.", q: "Grottes de Han Han-sur-Lesse", tags: ["rainy day"] },
    { id: "blegny", cat: "dene", area: "cevre", title: "Go down the mine at Blegny-Mine",
      desc: "It was coal that made Liège an industrial giant. The colliery at Blegny is one of the four Walloon mining sites on the UNESCO list, and one of the rare places where visitors can go down by cage into real galleries.",
      tip: "Tours are guided and timed, so book ahead. It is cool and damp underground; wear closed shoes.", q: "Blegny-Mine", tags: ["rainy day"] }
  ]
};
