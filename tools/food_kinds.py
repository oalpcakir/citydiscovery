"""Gives every eat & drink quest a `kind`, so the "Taste of" trail can be eaten in one go.

Kinds: meal (a proper sit-down dish), snack (street food, bakery, market bites), sweet (dessert, pastry,
ice cream), coffee (coffee, tea, breakfast-free cafés), drink (beer, wine, spirits, bars, meyhanes).
buildTrails() in src/1-core.js allows at most one meal, one drink, one sweet, one coffee and two snacks per
taste trail.

  python tools/food_kinds.py            # fills in quests without a kind, prints a summary
  python tools/food_kinds.py --all      # re-classifies every quest (overwrites hand fixes; use with care)
  python tools/food_kinds.py --show X   # lists the eat & drink quests of region X with their kind

A wrong guess is fixed by editing `kind` on the quest in web/cities/<region>.js; reruns keep it.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import regions_io as R

CITIES = os.path.join(os.path.dirname(HERE), "web", "cities")

# Checked in this order against the title first, then the title plus the address; the first match wins.
RULES = [
    ("drink", r"\bbeers?\b|\bbrew|brouwerij|brauerei|\bbier|\bwines?\b|winery|vineyard|wijn|\bwein|\bvins?\b|cocktail|\bbar\b|\bpub\b|"
              r"\bgin\b|jenever|genever|distill|destill|whisk|\bcider|cidre|rakı|\braki\b|meyhane|kölsch|altbier|aquavit|akvavit|"
              r"schnapps|absinth|apéro|aperitif|taproom|tap room|proeflokaal|tasting room|champagne|cellar|kneipe|weinstube|"
              r"\bale\b|ales\b|lager|pilsner|stout|winzer|cave\b|kellerei|sake|mezcal|liqueur|likör|biergarten|beer garden"),
    ("sweet", r"ice cream|gelato|dondurma|\bcakes?\b|\bpies?\b|pastr|patisserie|pâtisserie|konditor|chocolat|schokolad|waffle|wafel|gaufre|"
              r"baklava|künefe|kunefe|lokum|turkish delight|dessert|\bsweets?\b|poffertjes|pancake|pannenkoe|pfannkuchen|crêpe|crepe|"
              r"cookie|speculoos|speculaas|macaron|praline|praliné|\btarts?\b|tarte|croissant|pişmaniye|kaymak|sütlaç|profiterol|"
              r"halva|helva|krapfen|strudel|kuchen|torte|berliner|vlaai|stroopwafel|sugar|suiker|candy|marzipan|lebkuchen|printen|"
              r"läckerli|leckerli|meringue|baisers?|éclair|kanelbulle|cinnamon bun|wienerbr|danish pastr|fudge|nougat|caramel|"
              r"bonbon|bossche bol|tompouce|krentenwegge|rice pudding|sorbet|frozen yog|doughnut|donut|oliebol|churro"),
    ("coffee", r"\bcoffee|espresso|\btea\b|\bteas\b|tea ?room|tea house|teahouse|\bçay\b|kahve|koffie|kaffee|\bfika\b|roaster|rösterei|"
               r"brûlerie|salon de thé|teestube"),
    ("snack", r"street food|\bfries\b|frites|friet|patat|herring|haring|kibbeling|simit|börek|borek|gözleme|kumpir|kokoreç|kokorec|midye|"
              r"balık ekmek|balik ekmek|fish sandwich|sandwich|currywurst|bratwurst|wurst|sausage|pretzel|brezel|bitterbal|kroket|"
              r"croquette|hot ?dog|pølse|polse|\bmarket\b|markt|marché|food hall|foodhal|market hall|cheese|kaas|käse|fromage|"
              r"bakery|bakker|bäckerei|boulangerie|\bbread\b|\bbrood|smørrebrød|smorrebrod|\bsnacks?\b|kebab stand|döner|doner|"
              r"lahmacun|tantuni|çiğ köfte|cig kofte|falafel|empanada|crêperie|flammkuchen|tarte flambée|socca|panisse|"
              r"pan bagnat|frikandel|kapsalon|worstenbroo|saucisson|charcuterie|deli\b|delicatessen|oysters?|huîtres|"
              r"\bpizza slice|quiche|pide|açma|acma|poğaça|pogaca|street stall|food truck|food market|halle")
]
RULES[0] = ("drink", RULES[0][1] + r"|have a drink|for a drink|\bdrinks\b")
RULES[1] = ("sweet", RULES[1][1] + r"|muhallebi|tavuk göğsü|pudding|\bboza\b|salep|sahlep|lokma|tulumba")
COMPILED = [(k, re.compile(p, re.I)) for k, p in RULES]
# A title that clearly names a sit-down meal stays a meal, whatever the address says.
MEAL = re.compile(r"\b(dine|dinner|lunch|brunch|breakfast|restaurant|lokanta|bistro|brasserie|tasting menu)\b", re.I)


def classify(q):
    for kind, rx in COMPILED:
        if rx.search(q["title"]):
            return kind
    if MEAL.search(q["title"]):
        return "meal"
    for kind, rx in COMPILED:
        if rx.search(q.get("q", "")):
            return kind
    return "meal"


def main():
    redo = "--all" in sys.argv
    show = sys.argv[sys.argv.index("--show") + 1] if "--show" in sys.argv else None
    totals, changed_files = {}, 0
    for fn in sorted(os.listdir(CITIES)):
        if not fn.endswith(".js"):
            continue
        path = os.path.join(CITIES, fn)
        c = R.load(path)
        changed = False
        for q in c["quests"]:
            if q["cat"] != "ye":
                continue
            if redo or not q.get("kind"):
                k = classify(q)
                if q.get("kind") != k:
                    q["kind"] = k
                    changed = True
            totals[q["kind"]] = totals.get(q["kind"], 0) + 1
            if show == c["id"]:
                print("%-6s %s" % (q["kind"], q["title"]))
        if changed and not show:
            R.dump(path, c)
            changed_files += 1
    if not show:
        print("kinds:", totals, "| files written:", changed_files)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
