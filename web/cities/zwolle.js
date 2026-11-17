// Zwolle ve IJssel bölgesi (Hanze şehirleri, Giethoorn, Weerribben-Wieden) görevleri.
// cat: gor | ye | dene      area: areas listesindeki anahtarlardan biri
// months: görev sadece belirli aylarda yapılabiliyorsa (1-12)
window.CITIES = window.CITIES || {};
window.CITIES.zwolle = {
  id: "zwolle",
  name: "Zwolle",
  subtitle: "& the IJssel",
  country: "Netherlands",
  levels: ["Tourist", "Newcomer", "Curious", "Local", "Zwollenaar", "Echte Blauwvinger"],
  areas: {
    merkez: "Binnenstad",
    guney: "Assendorp & South",
    ijssel: "IJssel Riverbank",
    dogu: "East & Vecht",
    cevre: "Surroundings"
  },
  // Haritanın ilk açılışta gösterdiği alan (şehir içi) ve görev konumları [enlem, boylam].
  bounds: [[52.490, 6.055], [52.545, 6.140]],
  coords: {
    peperbus: [52.5117, 6.0917], fundatie: [52.5105, 6.0927], sassenpoort: [52.5097, 6.0957], glazenengel: [52.5123, 6.0940],
    balletjes: [52.5120, 6.0947], blauwvingers: [52.5127, 6.0932], waanders: [52.5138, 6.0952], stadsgracht: [52.5141, 6.0890],
    assendorp: [52.5078, 6.1000], bevrijding: [52.5081, 6.1083],
    engelsewerk: [52.4941, 6.0690], hanzeboog: [52.4920, 6.0690],
    agnietenberg: [52.5365, 6.1265], pec: [52.5170, 6.1197],
    kampen: [52.5591, 5.9161], zutphen: [52.1398, 6.1958], deventerkoek: [52.2517, 6.1603], dickens: [52.2520, 6.1632],
    hattem: [52.4746, 6.0713], urk: [52.6633, 5.6220], giethoorn: [52.7222, 6.0898], weerribben: [52.8065, 5.9285]
  },
  // Bölge rozetleri: bölgedeki görevlerin 1/3'ü bronz, 2/3'ü gümüş, tamamı altın.
  areaBadges: {
    merkez: { icon: "🏰", name: "Hanze Wolf" },
    guney: { icon: "🏘️", name: "Assendorper" },
    ijssel: { icon: "🌊", name: "IJssel Wayfarer" },
    dogu: { icon: "🌾", name: "Vecht Wanderer" },
    cevre: { icon: "🛶", name: "Surroundings Explorer" }
  },
  quests: [
    // ---------- GÖRÜLECEK ----------
    { id: "peperbus", cat: "gor", area: "merkez", title: "Climb the Peperbus",
      desc: "Everyone calls the tower of the Onze-Lieve-Vrouwe basilica the 'Peperbus' (pepper pot) because of the shape of its dome. From the top you can see the star-shaped city moat and the IJssel plain.",
      tip: "The tower isn't open every day; check the climbing days in advance.", q: "Peperbus Zwolle" },
    { id: "fundatie", cat: "gor", area: "merkez", title: "Climb up to the 'cloud' on the Fundatie's roof",
      desc: "An egg-shaped addition covered in thousands of blue-and-white ceramic tiles was set on the roof of the neoclassical former courthouse. The giant window in this part of Museum de Fundatie looks down on the city from above.",
      tip: "See the building first from the far bank of the canal, then go up to the top floor inside.", q: "Museum de Fundatie Zwolle", tags: ["rainy day"] },
    { id: "sassenpoort", cat: "gor", area: "merkez", title: "Walk through the Sassenpoort",
      desc: "The city gate from 1409 is the grandest building left from the days when Zwolle was a rich Hanseatic city. Its pointed towers are the city's postcard view.",
      tip: "The inside can only be visited on certain days; the best view from outside is from the moat side.", q: "Sassenpoort Zwolle", tags: ["free"] },
    { id: "glazenengel", cat: "gor", area: "merkez", title: "Find the glass angel",
      desc: "The glass archangel Michael next to the Grote Kerk is the city's patron saint. Zwollenaars simply call him 'de Glazen Engel'; inside the church is the famous Schnitger organ.",
      tip: "If the church is open, go in and look at the organ; there are organ concerts in summer.", q: "Glazen Engel Grote Kerkplein Zwolle", tags: ["free"] },
    { id: "assendorp", cat: "gor", area: "guney", title: "Walk the Assendorperstraat and drop by the monastery",
      desc: "Assendorp, behind the station, is the most neighbourhood-y neighbourhood in the city, with its small independent shops and coffee places. At the end of the street stands the big Dominican monastery, still in use.",
      tip: "You can go into the monastery's church and garden when they're open.", q: "Dominicanenklooster Zwolle", tags: ["free"] },
    { id: "engelsewerk", cat: "gor", area: "ijssel", title: "Go down to the IJssel at Engelse Werk",
      desc: "An English-style park laid out in the 19th century on the city's old defence lines. Its winding paths, ponds and old trees open straight onto the IJssel dyke.",
      tip: "Climb up onto the dyke and walk along the river; when the water is high, the floodplains turn into lakes.", q: "Park het Engelse Werk Zwolle", tags: ["free"] },
    { id: "kampen", cat: "gor", area: "cevre", title: "See the cow hung up the tower in Kampen",
      desc: "According to one of the jokey stories of Kampen, the Hanseatic city on the IJssel (the Kamper uien), the townspeople hauled a cow up the tower so it could eat the grass growing on top. In summer a model cow is hung from the Nieuwe Toren.",
      tip: "If you come by train, walk into town across the bridge; that's the best view of the river front and the three city gates.", q: "Nieuwe Toren Kampen", tags: ["free"] },
    { id: "zutphen", cat: "gor", area: "cevre", title: "The chained library in Zutphen",
      desc: "In the 16th-century Librije inside the Walburgiskerk, the books are still chained to the reading desks. One of the few chained libraries in Europe to survive in its original state.",
      tip: "The Librije can only be visited with a guide or at set hours; check before you go.", q: "Librije Walburgiskerk Zutphen", tags: ["rainy day"] },

    // ---------- YENİLECEK ----------
    { id: "balletjes", cat: "ye", area: "merkez", title: "Taste Zwolse balletjes",
      desc: "Pillow-shaped hard candies made by hand to the same recipe since the 19th century. The recipe is still secret and they're sold only at the Zwolse Balletjeshuis on the Grote Kerkplein.",
      tip: "Ask for the classic flavour; the shop's old counter and jars are worth a look too.", q: "Zwolse Balletjeshuis Zwolle" },
    { id: "blauwvingers", cat: "ye", area: "merkez", title: "Pick up a box of Blauwvingers",
      desc: "Legend has it that when Zwolle sold its carillon to Kampen, the payment came in copper coins and the people counting them ended up with blue fingers. That's where the Zwollenaars' nickname 'Blauwvingers' comes from; chocolate-tipped finger biscuits carry the name too.",
      tip: "The biscuit's address is Banketbakkerij Van Orsouw on the Grote Markt.", q: "Banketbakkerij Van Orsouw Zwolle" },
    { id: "waanders", cat: "ye", area: "merkez", title: "Have coffee among the books in the Broerenkerk",
      desc: "The 15th-century Dominican church is now a bookshop called Waanders In de Broeren. You sit in the café among the shelves, under the ceiling paintings and the organ.",
      tip: "Go to the top floor: that's where you get closest to the vault paintings.", q: "Waanders In de Broeren Zwolle", tags: ["rainy day"] },
    { id: "deventerkoek", cat: "ye", area: "cevre", title: "Deventer koek in Deventer",
      desc: "Spiced, honeyed Deventer cake has been this Hanseatic city's export for centuries. It's sold slice by slice from the counter at the old cake shop on the Brink square.",
      tip: "Step into the Waag on the square and the streets of the Bergkwartier behind it too.", q: "Deventer Koekwinkel Brink Deventer" },
    { id: "hattem", cat: "ye", area: "cevre", title: "Smell the bread at the bakery museum in Hattem",
      desc: "In Hattem, a small walled town across the IJssel, the Bakkerijmuseum still bakes bread and biscuits in its old ovens. In the street, the Dijkpoort gate and a windmill fit into the same frame.",
      tip: "You can cycle over the IJssel bridge from Zwolle; check the demonstration times.", q: "Bakkerijmuseum Hattem", tags: ["rainy day"] },
    { id: "urk", cat: "ye", area: "cevre", title: "Eat fish in the harbour of Urk",
      desc: "Urk was an island until the sea around it was drained; its own dialect and fishing traditions are still alive. In the harbour you eat kibbeling or smoked fish, then walk to the lighthouse.",
      tip: "On Sundays the town is almost completely closed; go on another day.", q: "Haven Urk" },

    // ---------- DENEYİM ----------
    { id: "stadsgracht", cat: "dene", area: "merkez", title: "Go around the star moat by water",
      desc: "Zwolle's old town is ringed by a moat that keeps its star shape. Go the full circle by boat, canoe or SUP and you see the walls, the Sassenpoort and the houseboats on the Thorbeckegracht from the water.",
      tip: "Boat tours and rentals run from around the Rodetorenplein; they operate in the warm months.", q: "Rodetorenplein Zwolle", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "bevrijding", cat: "dene", area: "guney", title: "Bevrijdingsfestival on 5 May",
      desc: "On Liberation Day, Park de Wezenlanden hosts Overijssel's huge and free open-air festival. Several stages, tens of thousands of people and the flame of freedom.",
      tip: "Come by bike; the park gets very crowded in the afternoon.", q: "Park de Wezenlanden Zwolle", months: [5], tags: ["free"] },
    { id: "hanzeboog", cat: "dene", area: "ijssel", title: "Cycle across the IJssel on the Hanzeboog",
      desc: "Beside the red-arched railway bridge Hanzeboog there's a path for bikes and pedestrians. As trains pass beside you, you cross the river and head over to the Veluwe side.",
      tip: "From the far bank turn onto the dyke and carry on to Hattem.", q: "Hanzeboog Zwolle", tags: ["free"] },
    { id: "agnietenberg", cat: "dene", area: "dogu", title: "Head to the Vecht bank at Agnietenberg",
      desc: "Thomas a Kempis wrote 'De Imitatione Christi', one of the world's most widely read religious books, in the monastery here. Only the hill and the cemetery remain of the monastery; the pond right beside it and the Vecht bank are the city's summer beach.",
      tip: "Follow the Vecht dyke by bike; in summer bring swimwear.", q: "Agnietenberg Zwolle", tags: ["free"] },
    { id: "pec", cat: "dene", area: "dogu", title: "Go to a PEC Zwolle match",
      desc: "A small stadium, green-and-white scarves and familiar faces in the stands: watching the city's club PEC Zwolle is nothing like the big stadiums.",
      tip: "The stadium is a few minutes by bike from the centre; buy tickets on the club's website.", q: "PEC Zwolle stadion", months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] },
    { id: "dickens", cat: "dene", area: "cevre", title: "Dickens Festijn in Deventer",
      desc: "One weekend in December, Deventer's medieval Bergkwartier turns into 19th-century London. Hundreds of people in costume play Scrooge, Oliver Twist and the chimney sweeps.",
      tip: "Entry is free but the queue can get long; go early in the morning.", q: "Bergkerk Deventer", months: [12], tags: ["free"] },
    { id: "giethoorn", cat: "dene", area: "cevre", title: "Steer your own boat in Giethoorn",
      desc: "There are no roads in the old part of the village: reed-thatched houses sit on small islets connected by wooden bridges. In an electric 'whisper boat' or a canoe you explore the canals and the lake behind.",
      tip: "It's very crowded on summer weekends; go early on a weekday morning or out of season.", q: "Museum Giethoorn 't Olde Maat Uus", months: [4, 5, 6, 7, 8, 9, 10] },
    { id: "weerribben", cat: "dene", area: "cevre", title: "Paddle through the reeds in the Weerribben",
      desc: "Weerribben-Wieden is one of the largest lowland fen areas in north-western Europe. Narrow waterways left from peat cutting wind through the reedbeds; otters live here.",
      tip: "You can rent canoes next to the visitor centre in Ossenzijl; follow the marked routes.", q: "Bezoekerscentrum De Weerribben Ossenzijl", months: [4, 5, 6, 7, 8, 9, 10] }
  ]
};
